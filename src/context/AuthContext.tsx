/**
 * ============================================================================
 * Authentication Context - IRCA Platform
 * ============================================================================
 * React context for managing authentication state and providing auth-related functions
 * ============================================================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  registerUser,
  loginUser,
  logoutUser,
  verifySession,
  AuthResponse,
  User
} from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  register: (userData: any) => Promise<AuthResponse>;
  login: (credentials: any) => Promise<AuthResponse>;
  logout: () => Promise<AuthResponse>;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check for existing session on initial load
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        // Check localStorage for token and user data
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        
        if (storedToken && storedUser) {
          // First restore user data from localStorage for immediate UI update
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setToken(storedToken);
          } catch (parseError) {
            console.error('Error parsing stored user data:', parseError);
          }
          
          // TEMPORARY: Skip server verification due to RLS issues
          // This allows localStorage persistence to work while we fix database permissions
          
          // TODO: Re-enable server verification when RLS is fixed
          /*
          // Then verify session with server
          const result = await verifySession(storedToken);
          
          if (result.success && result.user && result.token) {
            // Update user data with fresh data from server
            setUser(result.user);
            setToken(result.token);
            localStorage.setItem('authUser', JSON.stringify(result.user));
          } else {
            // Clear invalid session
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            setUser(null);
            setToken(null);
          }
          */
        }
      } catch (err) {
        console.error('Session verification error:', err);
        // Clear any corrupted data
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  // Persist token and user data to localStorage when they change
  useEffect(() => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('authUser');
    }
  }, [user]);

  const register = async (userData: any): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await registerUser(userData);

      if (result.success && result.user) {
        // Auto-login after successful registration
        const loginResult = await loginUser({
          email: userData.email,
          password: userData.password
        });

        if (loginResult.success && loginResult.user && loginResult.token) {
          setUser(loginResult.user);
          setToken(loginResult.token);
          navigate('/');
        }

        return loginResult;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Registration failed',
        error: 'REGISTRATION_ERROR'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: any): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginUser(credentials);

      if (result.success && result.user && result.token) {
        setUser(result.user);
        setToken(result.token);

        // Redirect based on user role or previous location
        navigate('/');
      } else {
        setError(result.message);
      }

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Login failed',
        error: 'LOGIN_ERROR'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      let result: AuthResponse = {
        success: true,
        message: 'Logout successful'
      };

      if (token) {
        result = await logoutUser(token);
      }

      // Clear local state
      setUser(null);
      setToken(null);

      // Redirect to home page
      navigate('/');

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Logout failed',
        error: 'LOGOUT_ERROR'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = async (): Promise<boolean> => {
    try {
      if (token) {
        const result = await verifySession(token);
        if (result.success && result.user && result.token) {
          setUser(result.user);
          setToken(result.token);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Auth check error:', err);
      return false;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        register,
        login,
        logout,
        checkAuth,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Custom hook for protected routes
export const useProtectedRoute = () => {
  const { user, isLoading, checkAuth } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        const authenticated = await checkAuth();
        setIsAuthenticated(authenticated);

        if (!authenticated && !isLoading) {
          // Redirect to login page if not authenticated
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Protected route verification error:', err);
        navigate('/login', { replace: true });
      } finally {
        setIsChecking(false);
      }
    };

    if (!user) {
      verifyAuthentication();
    } else {
      setIsAuthenticated(true);
      setIsChecking(false);
    }
  }, [user, isLoading, checkAuth, navigate]);

  return { isAuthenticated, isChecking };
};