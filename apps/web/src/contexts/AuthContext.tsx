"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  User,
  getCurrentUser,
  emailLogin,
  emailRegister,
  logout as apiLogout,
  getStoredToken,
  setStoredToken,
  clearStoredTokens,
} from '@/lib/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; user?: User | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; user?: User | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setTokenDirectly: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token and load user on mount
  const checkSession = useCallback(async () => {
    try {
      const storedToken = getStoredToken();
      if (storedToken) {
        setToken(storedToken);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Failed to check session:', error);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const refreshUser = useCallback(async () => {
    const storedToken = getStoredToken();
    if (storedToken) {
      setToken(storedToken);
    }

    const currentUser = await getCurrentUser();
    setUser(currentUser);
    if (!currentUser) {
      setToken(null);
    }
  }, []);

  const setTokenDirectly = useCallback((newToken: string) => {
    setStoredToken(newToken);
    setToken(newToken);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await emailLogin(email, password);

      if (!result.success) {
        return { error: new Error(result.error || 'Login failed') };
      }

      if (result.access_token) {
        setToken(result.access_token);
      }

      let loggedInUser: User | null = null;
      if (result.user) {
        loggedInUser = result.user;
        setUser(result.user);
      } else {
        loggedInUser = await getCurrentUser();
        setUser(loggedInUser);
      }

      return { error: null, user: loggedInUser };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const result = await emailRegister(email, password);

      if (!result.success) {
        return { error: new Error(result.error || 'Registration failed') };
      }

      // After successful registration, automatically log in
      let registeredUser: User | null = null;
      const loginResult = await emailLogin(email, password);
      if (loginResult.success) {
        if (loginResult.access_token) {
          setToken(loginResult.access_token);
        }
        if (loginResult.user) {
          registeredUser = loginResult.user;
          setUser(loginResult.user);
        } else {
          registeredUser = await getCurrentUser();
          setUser(registeredUser);
        }
      }

      return { error: null, user: registeredUser };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearStoredTokens();
      setUser(null);
      setToken(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        signIn,
        signUp,
        signOut,
        loading,
        refreshUser,
        setTokenDirectly,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return {
      user: null,
      token: null,
      signIn: async () => ({ error: new Error('AuthProvider not found') }),
      signUp: async () => ({ error: new Error('AuthProvider not found') }),
      signOut: async () => {},
      loading: true,
      refreshUser: async () => {},
      setTokenDirectly: () => {},
    };
  }
  return context;
}

export type { User } from '@/lib/authApi';
