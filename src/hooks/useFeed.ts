// src/hooks/useFeed.ts

import { useEffect } from 'react';
import { useFeedStore } from '../store/feedStore';
import { useAuthStore } from '../store/authStore';

export const useFeed = () => {
  const {
    videos,
    likedVideos,
    isLoading,
    isRefreshing,
    hasMore,
    error,
    currentIndex,
    loadFeed,
    loadMoreVideos,
    refreshFeed,
    toggleLikeAction,
    checkIsLiked,
    incrementViewsAction,
    deleteVideoAction,
    setCurrentIndex,
    clearError,
  } = useFeedStore();

  const { user } = useAuthStore();

  // Charger le feed au montage
  useEffect(() => {
    if (videos.length === 0) {
      loadFeed();
    }
  }, []);

  // Vérifier les likes quand les vidéos chargent
  useEffect(() => {
    if (!user || videos.length === 0) return;
    videos.forEach((video) => {
      if (likedVideos[video.videoId] === undefined) {
        checkIsLiked(video.videoId, user.uid);
      }
    });
  }, [videos, user]);

  const handleLike = async (videoId: string, videoOwnerId: string) => {
    if (!user) return;
    await toggleLikeAction(videoId, user.uid, videoOwnerId);
  };

  const handleDelete = async (videoId: string, videoUrl: string) => {
    if (!user) return;
    await deleteVideoAction(videoId, user.uid, videoUrl);
  };

  const handleView = async (videoId: string) => {
    await incrementViewsAction(videoId);
  };

  return {
    videos,
    likedVideos,
    isLoading,
    isRefreshing,
    hasMore,
    error,
    currentIndex,
    loadFeed,
    loadMoreVideos,
    refreshFeed,
    setCurrentIndex,
    clearError,
    handleLike,
    handleDelete,
    handleView,
  };
};