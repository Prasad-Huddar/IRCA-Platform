/**
 * ============================================================================
 * Authentication Service - IRCA Platform
 * ============================================================================
 * Comprehensive authentication service for user registration, login, and session management
 * ============================================================================
 */

import { supabase } from '../lib/supabaseClient';
import { z } from 'zod';
import {
  checkUserExists,
  createUser,
  createUserProfile,
  getUserByEmail,
  getUserById,
  getUserProfile,
  createUserSession,
  getSessionByToken,
  invalidateSession,
  updateUserLastLogin,
  calculateSessionExpiration,
  generateVerificationToken,
  generateSessionToken
} from './apiService';

// ============================================================================
// Type Definitions
// ============================================================================

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  error?: string;
}

export interface Session {
  user: User;
  token: string;
  expires_at: string;
}

// ============================================================================
// Validation Schemas
// ============================================================================

export const RegisterSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirm_password: z.string(),
  phone: z.string().optional(),
  terms_accepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  })
}).refine(data => data.password === data.confirm_password, {
  path: ['confirm_password'],
  message: 'Passwords do not match'
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  remember_me: z.boolean().optional()
});

// ============================================================================
// Authentication Functions
// ============================================================================

/**
 * Register a new user
 */
export async function registerUser(userData: z.infer<typeof RegisterSchema>): Promise<AuthResponse> {
  try {
    // Check if user already exists using API
    const userExistsResponse = await checkUserExists(userData.email);

    if (!userExistsResponse.success) {
      return {
        success: false,
        message: 'Error checking user existence',
        error: userExistsResponse.error || 'USER_CHECK_FAILED'
      };
    }

    if (userExistsResponse.data?.exists) {
      return {
        success: false,
        message: 'User with this email already exists',
        error: 'EMAIL_ALREADY_EXISTS'
      };
    }

    // Hash password using Web Crypto API (browser-compatible)
    const passwordHash = await hashPassword(userData.password);
    const verificationToken = generateVerificationToken();

    // Create user record using API (custom auth system)
    const createUserResponse = await createUser({
      email: userData.email,
      password_hash: passwordHash,
      verification_token: verificationToken
    });

    if (!createUserResponse.success) {
      console.error('Error creating user:', createUserResponse.error);
      return {
        success: false,
        message: 'Failed to create user account',
        error: createUserResponse.error || 'USER_CREATION_FAILED'
      };
    }

    // Create user profile using API
    const createProfileResponse = await createUserProfile(createUserResponse.data?.userId || '', {
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone
    });

    if (!createProfileResponse.success) {
      console.error('Error creating user profile:', createProfileResponse.error);
      return {
        success: false,
        message: 'Failed to create user profile',
        error: createProfileResponse.error || 'PROFILE_CREATION_FAILED'
      };
    }

    // Initialize sobriety tracker automatically
    const { initializeSobrietyTracker } = await import('./profileTrackerService');
    await initializeSobrietyTracker(createUserResponse.data?.userId || '');

    return {
      success: true,
      message: 'Registration successful! Please check your email for verification.',
      user: {
        id: createUserResponse.data?.userId || '',
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        is_verified: false,
        created_at: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred during registration',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    };
  }
}

/**
 * Login user
 */
export async function loginUser(credentials: z.infer<typeof LoginSchema>): Promise<AuthResponse> {
  try {
    // Get user by email using API
    const userResponse = await getUserByEmail(credentials.email);

    if (!userResponse.success || !userResponse.data) {
      // Generic error message for security
      return {
        success: false,
        message: 'Invalid email or password',
        error: userResponse.error || 'INVALID_CREDENTIALS'
      };
    }

    const user = userResponse.data;

    // Check if user is active
    if (!user.is_active) {
      return {
        success: false,
        message: 'Your account has been deactivated',
        error: 'ACCOUNT_DEACTIVATED'
      };
    }

    // Verify password using Web Crypto API
    const isPasswordValid = await verifyPassword(credentials.password, user.password_hash);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      };
    }

    // Generate session token and expiration
    const sessionToken = generateSessionToken();
    const expiresAt = calculateSessionExpiration(credentials.remember_me || false);

    // Create session using API
    const sessionResponse = await createUserSession({
      user_id: user.id,
      session_token: sessionToken,
      expires_at: expiresAt,
      ip_address: '0.0.0.0', // Would be set from request in real implementation
      user_agent: 'web' // Would be set from request headers
    });

    if (!sessionResponse.success) {
      console.error('Error creating session:', sessionResponse.error);
      return {
        success: false,
        message: 'Failed to create session',
        error: sessionResponse.error || 'SESSION_CREATION_FAILED'
      };
    }

    // Update last login using API
    await updateUserLastLogin(user.id);

    // Get user profile using API
    const profileResponse = await getUserProfile(user.id);

    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        first_name: profileResponse.data?.first_name || '',
        last_name: profileResponse.data?.last_name || '',
        phone: profileResponse.data?.phone,
        is_verified: user.is_verified,
        created_at: user.created_at,
        last_login: new Date().toISOString()
      },
      token: sessionToken
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred during login',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    };
  }
}

/**
 * Logout user
 */
export async function logoutUser(token: string): Promise<AuthResponse> {
  try {
    // Invalidate session using API
    const result = await invalidateSession(token);

    if (!result.success) {
      console.error('Error invalidating session:', result.error);
      return {
        success: false,
        message: 'Failed to logout',
        error: result.error || 'LOGOUT_FAILED'
      };
    }

    return {
      success: true,
      message: 'Logout successful'
    };

  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred during logout',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    };
  }
}

/**
 * Verify user session
 */
export async function verifySession(token: string): Promise<AuthResponse> {
  try {
    // Get session by token using API
    const sessionResponse = await getSessionByToken(token);

    if (!sessionResponse.success || !sessionResponse.data) {
      return {
        success: false,
        message: 'Invalid or expired session',
        error: sessionResponse.error || 'INVALID_SESSION'
      };
    }

    const session = sessionResponse.data;

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      return {
        success: false,
        message: 'Session expired',
        error: 'SESSION_EXPIRED'
      };
    }

    // Get user by ID using API
    const userResponse = await getUserById(session.user_id);

    if (!userResponse.success || !userResponse.data) {
      return {
        success: false,
        message: 'Failed to get user data',
        error: userResponse.error || 'USER_FETCH_FAILED'
      };
    }

    // Get user profile for additional details
    const profileResponse = await getUserProfile(session.user_id);

    if (!profileResponse.success) {
      return {
        success: false,
        message: 'Failed to get user profile',
        error: profileResponse.error || 'PROFILE_FETCH_FAILED'
      };
    }

    const result = {
      success: true,
      message: 'Session valid',
      user: {
        id: session.user_id,
        email: userResponse.data.email,
        first_name: profileResponse.data?.first_name || '',
        last_name: profileResponse.data?.last_name || '',
        phone: profileResponse.data?.phone,
        is_verified: userResponse.data.is_verified,
        created_at: userResponse.data.created_at,
        last_login: new Date().toISOString()
      },
      token: session.session_token
    };
    
    return result;

  } catch (error) {
    console.error('Session verification error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred during session verification',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    };
  }
}

/**
 * Hash password using PBKDF2 (browser-compatible)
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

  return `${saltHex}:${hashHex}`;
}

/**
 * Verify password using PBKDF2
 */
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(':');
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  const computedHashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return computedHashHex === hashHex;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  // In a real implementation, this would check localStorage or cookies
  // For now, we'll return false as we don't have session persistence yet
  return false;
}

/**
 * Get current user from session
 */
export async function getCurrentUser(): Promise<User | null> {
  // In a real implementation, this would get user from session storage
  // For now, return null
  return null;
}