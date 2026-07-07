/**
 * ============================================================================
 * Auth Context - IRCA Platform Mobile
 * ============================================================================
 * Authentication context provider for managing user authentication state
 * ============================================================================
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  verifySession, 
  isAuthenticated as isUserAuthenticated,
  getCurrentUser as getCurrentUserFromService,
  User,
  AuthResponse 
} from '../services/authService';

// ============================================================================
// Context Interface
// ============================================================================

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string, remember_me?: boolean) => Promise<AuthResponse>;
  register: (data: any) => Promise<AuthResponse>;
  logout: () => Promise<AuthResponse>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

// ============================================================================
// Create Context
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUserFromService();
      
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth status check error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string, remember_me = false): Promise<AuthResponse> => {
    try {
      setError(null);
      setIsLoading(true);

      const result = await loginUser({ email, password, remember_me });

      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setError(result.error || 'Login failed');
      }

      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during login';
      setError(errorMessage);
      setUser(null);
      setIsAuthenticated(false);
      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: any): Promise<AuthResponse> => {
    try {
      setError(null);
      setIsLoading(true);

      const result = await registerUser(data);

      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setError(result.error || 'Registration failed');
      }

      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during registration';
      setError(errorMessage);
      setUser(null);
      setIsAuthenticated(false);
      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async (): Promise<AuthResponse> => {
    try {
      setError(null);
      setIsLoading(true);

      const result = await logoutUser();

      if (result.success) {
        setUser(null);
        setIsAuthenticated(false);
      } else {
        setError(result.error || 'Logout failed');
      }

      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred during logout';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const refreshUser = async () => {
    await checkAuthStatus();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================================
// Hook for using Auth Context
// ============================================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// ============================================================================
// Export Context
// ============================================================================

export default AuthContext;
