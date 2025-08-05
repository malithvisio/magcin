'use client';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  onAuthChange,
  signInUser,
  signUpUser,
  signOutUser,
} from '../util/firebase-utils';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  isRootUser?: boolean;
  rootUserId?: string; // Add rootUserId for multi-tenant filtering
  companyId?: string;
  tenantId?: string;
  subscriptionPlan?: string;
  companyName?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (userData: User) => void;
  logout: () => void;
  firebaseLogin: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  firebaseSignUp: (
    email: string,
    password: string,
    userData: any
  ) => Promise<{ success: boolean; error?: string }>;
  firebaseLogout: () => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  isAdmin: boolean;
  isRootUser: boolean;
  rootUserId: string | null; // Add rootUserId to context
  companyId: string | null;
  tenantId: string | null;
  mounted: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to get user from localStorage synchronously
function getUserFromStorage(): User | null {
  if (typeof window === 'undefined') return null;

  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    localStorage.removeItem('user');
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize user state synchronously from localStorage if available
  const [user, setUser] = useState<User | null>(getUserFromStorage);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Only run this effect if we haven't already loaded the user synchronously
    if (!user && typeof window !== 'undefined') {
      setIsLoading(true);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    }
  }, [user]);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthChange(firebaseUser => {
      setFirebaseUser(firebaseUser);

      // If Firebase user exists but no local user, try to get user data from Firestore
      if (firebaseUser && !user) {
        // You can add logic here to fetch user data from Firestore
        // and convert it to your User interface
        console.log('Firebase user authenticated:', firebaseUser.email);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const firebaseLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await signInUser(email, password);
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'Login failed' };
    }
  };

  const firebaseSignUp = async (
    email: string,
    password: string,
    userData: any
  ) => {
    setIsLoading(true);
    try {
      const result = await signUpUser(email, password, userData);
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'Sign up failed' };
    }
  };

  const firebaseLogout = async () => {
    setIsLoading(true);
    try {
      const result = await signOutUser();
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'Logout failed' };
    }
  };

  // Consider user as admin if they have admin, root_user role OR no role field (backward compatibility)
  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'root_user' ||
    user?.role === 'super_admin' ||
    user?.role === undefined;

  // Check if user is a root user
  const isRootUser = user?.isRootUser === true || user?.role === 'root_user';

  // Get company and tenant IDs for multi-tenant filtering
  const companyId = user?.companyId || null;
  const tenantId = user?.tenantId || null;
  const rootUserId = user?.rootUserId || null; // Add rootUserId

  const value = {
    user,
    firebaseUser,
    login,
    logout,
    firebaseLogin,
    firebaseSignUp,
    firebaseLogout,
    isLoading,
    isAdmin,
    isRootUser,
    rootUserId,
    companyId,
    tenantId,
    mounted,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
