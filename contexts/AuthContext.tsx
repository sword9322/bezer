'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  loading: boolean;
  userRole: string | null;
  isAdmin: boolean;
  isManager: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Get the ID token and set it in a cookie
        const token = await user.getIdToken();
        const tokenResult = await user.getIdTokenResult();
        const role = tokenResult.claims.role as string || 'user';
        setUserRole(role);
        document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Strict`;
      } else {
        setUserRole(null);
        // Clear the token cookie when user is not authenticated
        document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Strict`;
      router.push('/');
    } catch (error: any) {
      let message = 'Erro ao fazer login';
      
      switch (error.code) {
        case 'auth/invalid-email':
          message = 'Email inválido';
          break;
        case 'auth/user-disabled':
          message = 'Usuário desativado';
          break;
        case 'auth/user-not-found':
          message = 'Usuário não encontrado';
          break;
        case 'auth/wrong-password':
          message = 'Senha incorreta';
          break;
      }
      
      throw new Error(message);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      let message = 'Erro ao criar conta';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Este email já está em uso';
          break;
        case 'auth/invalid-email':
          message = 'Email inválido';
          break;
        case 'auth/operation-not-allowed':
          message = 'Operação não permitida';
          break;
        case 'auth/weak-password':
          message = 'A senha deve ter pelo menos 6 caracteres';
          break;
      }
      
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.push('/login');
    } catch (error) {
      throw new Error('Erro ao fazer logout');
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      let message = 'Erro ao criar conta';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Este email já está em uso';
          break;
        case 'auth/invalid-email':
          message = 'Email inválido';
          break;
        case 'auth/operation-not-allowed':
          message = 'Operação não permitida';
          break;
        case 'auth/weak-password':
          message = 'A senha deve ter pelo menos 6 caracteres';
          break;
      }
      
      throw new Error(message);
    }
  };

  const deleteAccount = async () => {
    if (user) {
      await user.delete()
    }
  }

  const value = {
    currentUser: user,
    user,
    loading,
    userRole,
    isAdmin: userRole === 'admin',
    isManager: userRole === 'manager',
    login,
    register,
    logout,
    signup,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 