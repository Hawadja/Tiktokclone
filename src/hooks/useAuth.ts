// src/hooks/useAuth.ts

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const {
    user,
    isLoading,
    isAuthenticated,
    error,
    loginAction,
    registerAction,
    logoutAction,
    clearError,
    initAuth,
  } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login: loginAction,
    register: registerAction,
    logout: logoutAction,
    clearError,
  };
};