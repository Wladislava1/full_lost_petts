import React, { useState, useEffect, type ReactNode } from 'react';
import { apiService } from '../services/api';
import type { AuthContextType, User } from '../types/auth';
import { AuthContext } from './auth-context';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      apiService.getProfile()
        .then(userData => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('access_token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiService.login(email, password);
    localStorage.setItem('access_token', response.access_token);
    const userData = await apiService.getProfile();
    setUser(userData);
  };

  const register = async (name: string, email: string, password: string, passwordRepeat: string) => {
    try {
      const response = await apiService.register(name, email, password, passwordRepeat);
      console.log('Register response:', response);

      localStorage.setItem('access_token', response.access_token);
      setUser(response.user);

    } catch (error: unknown) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};