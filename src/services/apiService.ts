/**
 * ============================================================================
 * API Service - IRCA Platform Backend Integration
 * ============================================================================
 * Handles all backend API calls to Supabase for authentication and data operations
 * ============================================================================
 */

import { supabase, supabaseAdmin } from '../lib/supabaseClient';
import { z } from 'zod';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode?: number;
}

// ============================================================================
// Authentication API Functions
// ============================================================================

/**
 * Check if user email already exists
 */
/**
 * Check if user email already exists
 */
export async function checkUserExists(email: string): Promise<ApiResponse<{ exists: boolean }>> {
  try {
    // Use secure RPC function to check existence without exposing table access
    const { data, error } = await supabase
      .rpc('check_email_exists', { email_to_check: email });

    if (error) {
      console.error('RPC check_email_exists error:', error);
      // Fallback to direct query if RPC fails (though likely will fail due to RLS if RPC missing)
      return {
        success: false,
        message: 'Error checking user existence',
        error: error.message,
        statusCode: 500
      };
    }

    return {
      success: true,
      message: 'User check completed',
      data: { exists: !!data }
    };

  } catch (error) {
    console.error('User existence check error:', error);
    return {
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      statusCode: 500
    };
  }
}

/**
 * Create new user in database
 */
export async function createUser(userData: {
  email: string;
  password_hash: string;
  verification_token: string;
}): Promise<ApiResponse<{ userId: string }>> {
  try {
    // Use RPC function to create user (Bypasses RLS)
    const { data, error } = await supabase
      .rpc('create_new_user', {
        email_input: userData.email,
        password_hash_input: userData.password_hash,
        verification_token_input: userData.verification_token
      });

    if (error) {
      console.error('RPC create_new_user error:', error);
      return {
        success: false,
        message: 'Failed to create user',
        error: error.message,
        statusCode: 500
      };
    }

    // RPC returns the UUID directly
    return {
      success: true,
      message: 'User created successfully',
      data: { userId: data }
    };

  } catch (error) {
    console.error('User creation error:', error);
    return {
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      statusCode: 500
    };
  }
}

/**
 * Create user profile
 */
export async function createUserProfile(userId: string, profileData: {
  first_name: string;
  last_name: string;
  phone?: string;
}): Promise<ApiResponse> {
  try {
    const { error } = await supabase
      .rpc('create_user_profile', {
        user_id_input: userId,
        first_name_input: profileData.first_name,
        last_name_input: profileData.last_name,
        phone_input: profileData.phone || null
      });

    if (error) {
      console.error('RPC create_user_profile error:', error);
      return {
        success: false,
        message: 'Failed to create user profile',
        error: error.message,
        statusCode: 500
      };
    }

    return {
      success: true,
      message: 'User profile created successfully'
    };

  } catch (error) {
    console.error('Profile creation error:', error);
    return {
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      statusCode: 500
    };
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<ApiResponse<{
  id: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}>> {
  try {
    // We must use RPC because RLS prevents 'anon' from SELECTing on end_users
    // The 'get_user_by_email' function is SECURITY DEFINER (runs as admin)
    const { data, error } = await supabase
      .rpc('get_user_by_email', { email_input: email });

    if (error) {
      console.error('RPC get_user_by_email error:', error);
      return {
        success: false,
        message: 'Error fetching user',
        error: error.message,
        statusCode: 500
      };
    }

    // RPC returns an array, we expect a single user
    const user = data && data.length > 0 ? data[0] : null;

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
        statusCode: 404
      };
    }

    return {
      success: true,
      message: 'User retrieved successfully',
      data: user
    };

  } catch (error) {
    console.error('Get user error:', error);
    return {
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      statusCode: 500
    };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<ApiResponse<{
  id: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}>> {
  try {
    // Try direct query first since RPC might not exist
    const { data, error } = await supabase
      .from('end_users')
      .select('id, email, password_hash, is_active, is_verified, created_at')
      .eq('id', userId)
      .single();

    if (!error && data) {
      return {
        success: true,
        message: 'User retrieved successfully',
        data: data
      };
    }

    // Fallback to RPC if it exists
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_user_by_id', { user_id_input: userId });

    if (rpcError) {
      console.error('RPC get_user_by_id error:', rpcError);
      return {
        success: false,
        message: 'Error fetching user',
        error: rpcError.message,
        statusCode: 500
      };
    }

    // RPC returns an array, we expect a single user
    const user = rpcData && rpcData.length > 0 ? rpcData[0] : null;

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
        statusCode: 404
      };
    }

    return {
      success: true,
      message: 'User retrieved successfully',
      data: user
    };

  } catch (error) {
    console.error('Get user error:', error);
    return {
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      statusCode: 500
    };
  }
}

/**
 * Get user profile by user ID
 */
export async function getUserProfile(userId: string): Promise<ApiResponse<{
  first_name: string;
  last_name: string;
  phone?: string;
}>> {
  try {
    // Use RPC to bypass RLS
    const { data, error } = await supabase
      .rpc('get_user_profile_secure', { user_id_input: userId });

    if (error) {
      console.error('RPC get_user_profile_secure error:', error);
      return {
        success: false,
        message: 'Error fetching user profile',
        error: error.message,
        statusCode: 500
      };
    }

    // RPC returns an array
    const profile = data && data.length > 0 ? data[0] : null;

    if (!profile) {
      return {
        success: false, // Or true with null data if that's expected
        message: 'Profile not found',
        statusCode: 404
      };
    }

    return {
      success: true,
      message: 'User profile retrieved successfully',
      data: profile
    };

  } catch (error) {
    console.error('Get user profile error:', error);
    return {
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      statusCode: 500
    };
  }
}

/**
 * Create user session
 */
export async function createUserSession(sessionData: {
  user_id: string;
  session_token: string;
  expires_at: string;
  ip_address: string;
  user_agent: string;
}): Promise<ApiResponse<{ sessionId: string }>> {
  try {
    const { data, error } = await supabase
      .rpc('create_user_session', {
        user_id_input: sessionData.user_id,
        session_token_input: sessionData.session_token,
        expires_at_input: sessionData.expires_at,
        ip_address_input: sessionData.ip_address,
        user_agent_input: sessionData.user_agent
      });

    if (error) {
      console.error('RPC create_user_session error:', error);
      return {
        success: false,
        message: 'Failed to create session',
        error: error.message,
        statusCode: 500
      };
    }

    return {
      success: true,
      message: 'Session created successfully',
      data: { sessionId: data }
    };

  } catch (error) {
    console.error('Session creation error:', error);
    return {
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      statusCode: 500
    };
  }
}

/**
 * Get session by token
 */
export async function getSessionByToken(token: string): Promise<ApiResponse<{
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  is_active: boolean;
}>> {
  try {
    // Try direct query first (might work if RLS allows it)
    const { data, error } = await supabase
      .from('user_sessions')
      .select('id, user_id, session_token, expires_at, is_active')
      .eq('session_token', token)
      .eq('is_active', true)
      .single();

    if (!error && data) {
      return {
        success: true,
        message: 'Session retrieved successfully',
        data: data
      };
    }

    // If direct query fails, try to create a simple workaround
    // For now, we'll use a basic approach without RPC
    console.log('⚠️ Direct query failed, trying alternative approach');
    
    return {
      success: false,
      message: 'Session not found or expired',
      error: 'SESSION_NOT_FOUND',
      statusCode: 404
    };

  } catch (error) {
    console.error('Get session error:', error);
    return {
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      statusCode: 500
    };
  }
}

/**
 * Invalidate session (logout)
 */
export async function invalidateSession(token: string): Promise<ApiResponse> {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({
        is_active: false
      })
      .eq('session_token', token);

    if (error) {
      console.error('Session invalidation error:', error);
      return {
        success: false,
        message: 'Failed to invalidate session',
        error: error.message,
        statusCode: 500
      };
    }

    return {
      success: true,
      message: 'Session invalidated successfully'
    };

  } catch (error) {
    console.error('Session invalidation error:', error);
    return {
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      statusCode: 500
    };
  }
}

/**
 * Update user last login
 */
export async function updateUserLastLogin(userId: string): Promise<ApiResponse> {
  try {
    const { error } = await supabase
      .rpc('update_user_last_login', { user_id_input: userId });

    if (error) {
      console.error('RPC update_user_last_login error:', error);
      return {
        success: false,
        message: 'Failed to update last login',
        error: error.message,
        statusCode: 500
      };
    }

    return {
      success: true,
      message: 'Last login updated successfully'
    };

  } catch (error) {
    console.error('Update last login error:', error);
    return {
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      statusCode: 500
    };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate verification token
 */
export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Generate session token
 */
export function generateSessionToken(): string {
  return Math.random().toString(36).substring(2, 30) + Math.random().toString(36).substring(2, 30);
}

/**
 * Calculate session expiration
 */
export function calculateSessionExpiration(rememberMe: boolean = false): string {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Always 7 days for better user experience
  return expiresAt.toISOString();
}