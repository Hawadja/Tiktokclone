// src/store/profileStore.ts

import { create } from 'zustand';
import {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  toggleFollow,
  isFollowing,
  getFollowers,
  getFollowing,
} from '../services/userService';
import { getUserVideos } from '../services/videoService';
import { createNotification } from '../services/notificationService';
import { User, Video } from '../types';

// ─── State Interface ──────────────────────────────────────────────────────────

interface ProfileState {
  profile: User | null;
  videos: Video[];
  followers: User[];
  following: User[];
  isFollowingUser: boolean;
  isLoading: boolean;
  isUploadingAvatar: boolean;
  avatarUploadProgress: number;
  error: string | null;

  // Actions
  loadProfile: (uid: string) => Promise<void>;
  loadUserVideos: (uid: string) => Promise<void>;
  loadFollowers: (uid: string) => Promise<void>;
  loadFollowing: (uid: string) => Promise<void>;
  updateProfileAction: (
    uid: string,
    updates: Partial<Pick<User, 'username' | 'bio' | 'avatarUrl'>>
  ) => Promise<void>;
  uploadAvatarAction: (uid: string, localUri: string) => Promise<void>;
  toggleFollowAction: (
    followerId: string,
    followingId: string
  ) => Promise<void>;
  checkIsFollowing: (followerId: string, followingId: string) => Promise<void>;
  clearError: () => void;
  resetProfile: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  videos: [],
  followers: [],
  following: [],
  isFollowingUser: false,
  isLoading: false,
  isUploadingAvatar: false,
  avatarUploadProgress: 0,
  error: null,

  // ─── Charger un profil ─────────────────────────────────────────────────
  loadProfile: async (uid: string) => {
    set({ isLoading: true, error: null });

    try {
      const profile = await getUserProfile(uid);
      set({ profile, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Erreur lors du chargement du profil.',
        isLoading: false,
      });
    }
  },

  // ─── Charger les vidéos d'un utilisateur ──────────────────────────────
  loadUserVideos: async (uid: string) => {
    try {
      const videos = await getUserVideos(uid);
      set({ videos });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // ─── Charger les followers ─────────────────────────────────────────────
  loadFollowers: async (uid: string) => {
    try {
      const followers = await getFollowers(uid);
      set({ followers });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // ─── Charger les following ─────────────────────────────────────────────
  loadFollowing: async (uid: string) => {
    try {
      const following = await getFollowing(uid);
      set({ following });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // ─── Mettre à jour le profil ───────────────────────────────────────────
  updateProfileAction: async (uid, updates) => {
    set({ isLoading: true, error: null });

    try {
      await updateUserProfile(uid, updates);
      set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : null,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Erreur lors de la mise à jour du profil.',
        isLoading: false,
      });
    }
  },

  // ─── Upload avatar ─────────────────────────────────────────────────────
  uploadAvatarAction: async (uid: string, localUri: string) => {
    set({ isUploadingAvatar: true, avatarUploadProgress: 0, error: null });

    try {
      const avatarUrl = await uploadAvatar(uid, localUri, (progress) => {
        set({ avatarUploadProgress: progress });
      });

      set((state) => ({
        profile: state.profile ? { ...state.profile, avatarUrl } : null,
        isUploadingAvatar: false,
        avatarUploadProgress: 100,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Erreur lors de l'upload de l'avatar.",
        isUploadingAvatar: false,
        avatarUploadProgress: 0,
      });
    }
  },

  // ─── Toggle follow avec mise à jour optimiste ──────────────────────────
  toggleFollowAction: async (followerId: string, followingId: string) => {
    const { isFollowingUser, profile } = get();

    // Mise à jour optimiste immédiate
    set({
      isFollowingUser: !isFollowingUser,
      profile: profile
        ? {
            ...profile,
            followersCount:
              profile.followersCount + (isFollowingUser ? -1 : 1),
          }
        : null,
    });

    try {
      const isNowFollowing = await toggleFollow(followerId, followingId);

      if (isNowFollowing) {
        await createNotification(followingId, followerId, 'follow');
      }
    } catch (error: any) {
      // Rollback en cas d'erreur
      set({
        isFollowingUser,
        profile: profile
          ? {
              ...profile,
              followersCount:
                profile.followersCount + (isFollowingUser ? 1 : -1),
            }
          : null,
        error: error.message,
      });
    }
  },

  // ─── Vérifier si on suit un utilisateur ───────────────────────────────
  checkIsFollowing: async (followerId: string, followingId: string) => {
    try {
      const following = await isFollowing(followerId, followingId);
      set({ isFollowingUser: following });
    } catch {
      // silencieux
    }
  },

  // ─── Effacer l'erreur ──────────────────────────────────────────────────
  clearError: () => set({ error: null }),

  // ─── Réinitialiser le profil ───────────────────────────────────────────
  resetProfile: () =>
    set({
      profile: null,
      videos: [],
      followers: [],
      following: [],
      isFollowingUser: false,
      isLoading: false,
      error: null,
    }),
}));