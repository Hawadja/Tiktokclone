// src/store/feedStore.ts

import { create } from 'zustand';
import { DocumentSnapshot } from 'firebase/firestore';
import {
  getFeedVideos,
  incrementViews,
  deleteVideo,
} from '../services/videoService';
import {
  toggleLike,
  isVideoLiked,
} from '../services/likeService';
import { createNotification } from '../services/notificationService';
import { Video } from '../types';

// ─── State Interface ──────────────────────────────────────────────────────────

interface FeedState {
  videos: Video[];
  likedVideos: Record<string, boolean>;
  isLoading: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
  error: string | null;
  lastDoc: DocumentSnapshot | null;
  currentIndex: number;

  // Actions
  loadFeed: () => Promise<void>;
  loadMoreVideos: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  toggleLikeAction: (videoId: string, uid: string, videoOwnerId: string) => Promise<void>;
  checkIsLiked: (videoId: string, uid: string) => Promise<void>;
  incrementViewsAction: (videoId: string) => Promise<void>;
  deleteVideoAction: (videoId: string, uid: string, videoUrl: string) => Promise<void>;
  setCurrentIndex: (index: number) => void;
  clearError: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useFeedStore = create<FeedState>((set, get) => ({
  videos: [],
  likedVideos: {},
  isLoading: false,
  isRefreshing: false,
  hasMore: true,
  error: null,
  lastDoc: null,
  currentIndex: 0,

  // ─── Charger le feed initial ───────────────────────────────────────────
  loadFeed: async () => {
    const { isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const { videos, lastDoc } = await getFeedVideos(10);
      set({
        videos,
        lastDoc,
        hasMore: videos.length === 10,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Erreur lors du chargement du feed.',
        isLoading: false,
      });
    }
  },

  // ─── Charger plus de vidéos (pagination) ──────────────────────────────
  loadMoreVideos: async () => {
    const { isLoading, hasMore, lastDoc, videos } = get();
    if (isLoading || !hasMore || !lastDoc) return;

    set({ isLoading: true, error: null });

    try {
      const result = await getFeedVideos(10, lastDoc);
      set({
        videos: [...videos, ...result.videos],
        lastDoc: result.lastDoc,
        hasMore: result.videos.length === 10,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Erreur lors du chargement.',
        isLoading: false,
      });
    }
  },

  // ─── Rafraîchir le feed ────────────────────────────────────────────────
  refreshFeed: async () => {
    set({ isRefreshing: true, error: null, lastDoc: null, hasMore: true });

    try {
      const { videos, lastDoc } = await getFeedVideos(10);
      set({
        videos,
        lastDoc,
        hasMore: videos.length === 10,
        isRefreshing: false,
        likedVideos: {},
        currentIndex: 0,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Erreur lors du rafraîchissement.',
        isRefreshing: false,
      });
    }
  },

  // ─── Toggle like ───────────────────────────────────────────────────────
  toggleLikeAction: async (
    videoId: string,
    uid: string,
    videoOwnerId: string
  ) => {
    const { likedVideos, videos } = get();
    const wasLiked = likedVideos[videoId] ?? false;

    // Mise à jour optimiste immédiate
    set({
      likedVideos: { ...likedVideos, [videoId]: !wasLiked },
      videos: videos.map((v) =>
        v.videoId === videoId
          ? { ...v, likesCount: v.likesCount + (wasLiked ? -1 : 1) }
          : v
      ),
    });

    try {
      const isNowLiked = await toggleLike(videoId, uid);

      if (isNowLiked) {
        await createNotification(videoOwnerId, uid, 'like', videoId);
      }
    } catch (error: any) {
      // Rollback en cas d'erreur
      set({
        likedVideos: { ...likedVideos, [videoId]: wasLiked },
        videos: videos.map((v) =>
          v.videoId === videoId
            ? { ...v, likesCount: v.likesCount + (wasLiked ? 1 : -1) }
            : v
        ),
        error: error.message,
      });
    }
  },

  // ─── Vérifier si une vidéo est likée ──────────────────────────────────
  checkIsLiked: async (videoId: string, uid: string) => {
    try {
      const liked = await isVideoLiked(videoId, uid);
      set((state) => ({
        likedVideos: { ...state.likedVideos, [videoId]: liked },
      }));
    } catch {
      // silencieux
    }
  },

  // ─── Incrémenter les vues ──────────────────────────────────────────────
  incrementViewsAction: async (videoId: string) => {
    try {
      await incrementViews(videoId);
      set((state) => ({
        videos: state.videos.map((v) =>
          v.videoId === videoId
            ? { ...v, viewsCount: v.viewsCount + 1 }
            : v
        ),
      }));
    } catch {
      // silencieux
    }
  },

  // ─── Supprimer une vidéo ───────────────────────────────────────────────
  deleteVideoAction: async (
    videoId: string,
    uid: string,
    videoUrl: string
  ) => {
    try {
      await deleteVideo(videoId, uid, videoUrl);
      set((state) => ({
        videos: state.videos.filter((v) => v.videoId !== videoId),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // ─── Mettre à jour l'index courant ─────────────────────────────────────
  setCurrentIndex: (index: number) => set({ currentIndex: index }),

  // ─── Effacer l'erreur ──────────────────────────────────────────────────
  clearError: () => set({ error: null }),
}));