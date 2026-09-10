import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoragedUser() {
      const storedToken = localStorage.getItem('@CentralFinancas:token');

      if (storedToken) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem('@CentralFinancas:token');
          setUser(null);
        }
      }

      setLoading(false);
    }

    loadStoragedUser();
  }, []);

  function signIn(token: string, userData: User) {
    localStorage.setItem('@CentralFinancas:token', token);
    setUser(userData);
  }

  function signOut() {
    localStorage.removeItem('@CentralFinancas:token');
    setUser(null);
  }

  function updateUser(userData: User) {
    setUser(userData);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}