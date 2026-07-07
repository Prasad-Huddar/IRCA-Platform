/**
 * ============================================================================
 * Authentication Service - IRCA Platform Mobile
 * ============================================================================
 * Custom authentication service matching Web App logic (Manual Hashing + RPC)
 * ============================================================================
 */

import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
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
// Helper Functions
// ============================================================================

const SESSION_KEY = 'auth_session';

async function storeSession(user: User, token: string): Promise<void> {
  try {
    const session = {
      user,
      token,
      expires_at: calculateSessionExpiration(true) // Default to long session on mobile
    };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error storing session:', error);
  }
}

async function getStoredSession(): Promise<Session | null> {
  try {
    const sessionData = await AsyncStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;

    const session: Session = JSON.parse(sessionData);
    if (new Date(session.expires_at) < new Date()) {
      await clearStoredSession();
      return null;
    }
    return session;
  } catch (error) {
    console.error('Error getting stored session:', error);
    return null;
  }
}

async function clearStoredSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Error clearing stored session:', error);
  }
}

/**
 * Generate random bytes using React Native's crypto polyfill
 */
function getRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto.getRandomValues
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return array;
}

/**
 * Hash password using PBKDF2 (CryptoJS)
 * Matches Web App: PBKDF2, SHA-256, 100000 iterations, 32 bytes (256 bits)
 */
function hashPassword(password: string): string {
  // Generate random salt (16 bytes) using React Native compatible method
  const saltBytes = getRandomBytes(16);
  const saltHexArray = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0'));
  const saltHex = saltHexArray.join('');

  // Convert salt to CryptoJS WordArray
  const salt = CryptoJS.enc.Hex.parse(saltHex);

  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32, // 256 bits
    iterations: 5000,
    hasher: CryptoJS.algo.SHA256
  });

  const hashHex = hash.toString(CryptoJS.enc.Hex);

  return `${saltHex}:${hashHex}`;
}

/**
 * Verify password using PBKDF2 (CryptoJS)
 */
function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;

  const [saltHex, hashHex] = storedHash.split(':');

  // Create salt WordArray from hex string
  const salt = CryptoJS.enc.Hex.parse(saltHex);

  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 5000,
    hasher: CryptoJS.algo.SHA256
  });

  const computedHashHex = hash.toString(CryptoJS.enc.Hex);

  return computedHashHex === hashHex;
}

// ============================================================================
// Authentication Functions
// ============================================================================

export async function registerUser(userData: z.infer<typeof RegisterSchema>): Promise<AuthResponse> {
  try {
    const userExistsResponse = await checkUserExists(userData.email);
    if (!userExistsResponse.success) {
      return { success: false, message: 'Error checking user existence', error: userExistsResponse.error };
    }
    if (userExistsResponse.data?.exists) {
      return { success: false, message: 'User with this email already exists', error: 'EMAIL_ALREADY_EXISTS' };
    }

    // Hash password
    const passwordHash = hashPassword(userData.password);
    const verificationToken = generateVerificationToken();

    const createUserResponse = await createUser({
      email: userData.email,
      password_hash: passwordHash,
      verification_token: verificationToken
    });

    if (!createUserResponse.success) {
      return { success: false, message: 'Failed to create user account', error: createUserResponse.error };
    }

    await createUserProfile(createUserResponse.data?.userId || '', {
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone
    });

    const user: User = {
      id: createUserResponse.data?.userId || '',
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      is_verified: false,
      created_at: new Date().toISOString()
    };

    // Auto login after registration (Simulated)
    const sessionToken = generateSessionToken();
    await storeSession(user, sessionToken);

    return {
      success: true,
      message: 'Registration successful!',
      user,
      token: sessionToken
    };

  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'An unexpected error occurred', error: String(error) };
  }
}

export async function loginUser(credentials: z.infer<typeof LoginSchema>): Promise<AuthResponse> {
  try {
    const userResponse = await getUserByEmail(credentials.email);

    if (!userResponse.success || !userResponse.data) {
      return { success: false, message: 'Invalid email or password', error: 'INVALID_CREDENTIALS' };
    }

    const user = userResponse.data;

    if (!user.is_active) {
      return { success: false, message: 'Your account has been deactivated', error: 'ACCOUNT_DEACTIVATED' };
    }

    const isPasswordValid = verifyPassword(credentials.password, user.password_hash);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email or password', error: 'INVALID_CREDENTIALS' };
    }

    const sessionToken = generateSessionToken();
    const expiresAt = calculateSessionExpiration(credentials.remember_me);

    await createUserSession({
      user_id: user.id,
      session_token: sessionToken,
      expires_at: expiresAt,
      ip_address: '0.0.0.0', // Mobile IP placehodler
      user_agent: 'mobile-app'
    });

    await updateUserLastLogin(user.id);
    const profileResponse = await getUserProfile(user.id);

    const fullUser: User = {
      id: user.id,
      email: user.email,
      first_name: profileResponse.data?.first_name || '',
      last_name: profileResponse.data?.last_name || '',
      phone: profileResponse.data?.phone,
      is_verified: user.is_verified,
      created_at: user.created_at,
      last_login: new Date().toISOString()
    };

    await storeSession(fullUser, sessionToken);

    return {
      success: true,
      message: 'Login successful',
      user: fullUser,
      token: sessionToken
    };

  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An unexpected error occurred', error: String(error) };
  }
}

export async function logoutUser(): Promise<AuthResponse> {
  try {
    const session = await getStoredSession();
    if (session) {
      await invalidateSession(session.token);
    }
    await clearStoredSession();
    return { success: true, message: 'Logout successful' };
  } catch (error) {
    return { success: false, message: 'Logout failed', error: String(error) };
  }
}

export async function verifySession(): Promise<AuthResponse> {
  try {
    const session = await getStoredSession();
    if (!session) return { success: false, message: 'No active session', error: 'NO_SESSION' };

    // In a real app, you might want to validate with the server here too
    // For now, we trust the stored session if not expired
    const serverSessionRes = await getSessionByToken(session.token);
    if (!serverSessionRes.success) {
      await clearStoredSession();
      return { success: false, message: 'Session expired/invalid', error: 'INVALID_SESSION' };
    }

    return {
      success: true,
      message: 'Session valid',
      user: session.user,
      token: session.token
    };

  } catch (error) {
    return { success: false, message: 'Session verification error', error: String(error) };
  }
}

// Backward compatibility alias
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getStoredSession();
  return !!session;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const session = await getStoredSession();
  return session ? session.user : null;
};

// Aliases
export const login = loginUser;
export const register = registerUser;
export const logout = logoutUser;
export const checkSession = verifySession;
