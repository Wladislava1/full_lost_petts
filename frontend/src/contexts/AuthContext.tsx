import React, { createContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { User, AuthContextType } from '../types/auth';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const profileData = await apiService.getProfile();
        setUser({
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          role: profileData.role,
        });
      } catch (error) {
        console.error('Ошибка проверки токена', error);
        localStorage.removeItem('access_token');
        setUser(null);
      }
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await apiService.login(email, password);
      localStorage.setItem('access_token', result.access_token);
      await checkAuth(); 
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, passwordRepeat: string) => {
    setLoading(true);
    try {
      const result = await apiService.register(name, email, password, passwordRepeat);
      localStorage.setItem('access_token', result.access_token);
      await checkAuth();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};