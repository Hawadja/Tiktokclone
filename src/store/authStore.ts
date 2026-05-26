
// src/store/authStore.ts

import { create } from 'zustand';
import {
  login,
  register,
  logout,
  getCurrentUserProfile,
} from '../services/authService';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  loginAction: (email: string, password: string) => Promise<void>;
  registerAction: (email: string, password: string, username: string) => Promise<void>;
  logoutAction: () => Promise<void>;
  clearError: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  loginAction: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await login(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Erreur de connexion.', isLoading: false });
    }
  },

  registerAction: async (email, password, username) => {
    set({ isLoading: true, error: null });
    try {
      const user = await register(email, password, username);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || "Erreur lors de l'inscription.", isLoading: false });
    }
  },

  logoutAction: async () => {
    set({ isLoading: true, error: null });
    try {
      await logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Erreur de déconnexion.', isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  initAuth: () => {
    set({ isLoading: true });

    // Import après que Firebase soit initialisé
    setTimeout(async () => {
      try {
        const { onAuthStateChanged } = await import('firebase/auth');
        const { auth } = await import('../firebase.config' as any);

        onAuthStateChanged(auth, async (firebaseUser: any) => {
          if (firebaseUser) {
            try {
              const userProfile = await getCurrentUserProfile();
              set({ user: userProfile, isAuthenticated: true, isLoading: false });
            } catch {
              set({ user: null, isAuthenticated: false, isLoading: false });
            }
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        });
      } catch (e) {
        set({ isLoading: false });
      }
    }, 500);
  },
}));


// src/store/authStore.ts

/*import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase.config';
import {
  login,
  register,
  logout,
  getCurrentUserProfile,
} from '../services/authService';
import { User } from '../types';

// ─── State Interface ──────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  loginAction: (email: string, password: string) => Promise<void>;
  registerAction: (email: string, password: string, username: string) => Promise<void>;
  logoutAction: () => Promise<void>;
  clearError: () => void;
  initAuth: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  // ─── Login ────────────────────────────────────────────────────────────
  loginAction: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await login(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Erreur de connexion.',
        isLoading: false,
      });
    }
  },

  // ─── Register ─────────────────────────────────────────────────────────
  registerAction: async (email: string, password: string, username: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await register(email, password, username);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Erreur lors de l'inscription.",
        isLoading: false,
      });
    }
  },

  // ─── Logout ───────────────────────────────────────────────────────────
  logoutAction: async () => {
    set({ isLoading: true, error: null });
    try {
      await logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Erreur de déconnexion.',
        isLoading: false,
      });
    }
  },

  // ─── Clear Error ──────────────────────────────────────────────────────
  clearError: () => set({ error: null }),

  // ─── Init Auth (écoute Firebase Auth) ────────────────────────────────
  initAuth: () => {
    set({ isLoading: true });
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await getCurrentUserProfile();
        set({
          user: userProfile,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });
  },
}));*/