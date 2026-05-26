// src/screens/feed/FeedScreen.tsx

import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  ViewToken,
} from 'react-native';
import { useFeedStore } from '../../store/feedStore';
import { useAuthStore } from '../../store/authStore';
import VideoCard from '../../components/VideoCard';
import { Video } from '../../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Component ────────────────────────────────────────────────────────────────

const FeedScreen = () => {
  const {
    videos,
    isLoading,
    isRefreshing,
    hasMore,
    likedVideos,
    currentIndex,
    loadFeed,
    loadMoreVideos,
    refreshFeed,
    toggleLikeAction,
    checkIsLiked,
    incrementViewsAction,
    setCurrentIndex,
  } = useFeedStore();

  const { user } = useAuthStore();

  const flatListRef = useRef<FlatList>(null);
  const viewedVideos = useRef<Set<string>>(new Set());

  // ─── Charger le feed au montage ──────────────────────────────────────
  useEffect(() => {
    loadFeed();
  }, []);

  // ─── Vérifier les likes au chargement des vidéos ─────────────────────
  useEffect(() => {
    if (!user || videos.length === 0) return;

    videos.forEach((video) => {
      if (likedVideos[video.videoId] === undefined) {
        checkIsLiked(video.videoId, user.uid);
      }
    });
  }, [videos, user]);

  // ─── Détecter la vidéo visible (viewability) ─────────────────────────
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length === 0) return;

      const visibleItem = viewableItems[0];
      const video = visibleItem.item as Video;
      const index = visibleItem.index ?? 0;

      setCurrentIndex(index);

      // Incrémenter les vues une seule fois par vidéo par session
      if (!viewedVideos.current.has(video.videoId)) {
        viewedVideos.current.add(video.videoId);
        incrementViewsAction(video.videoId);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  });

  // ─── Rendu de chaque vidéo ────────────────────────────────────────────
  const renderVideo = useCallback(
    ({ item, index }: { item: Video; index: number }) => {
      const isActive = index === currentIndex;
      const isLiked = likedVideos[item.videoId] ?? false;

      return (
        <VideoCard
          video={item}
          isActive={isActive}
          isLiked={isLiked}
          onLike={() => {
            if (!user) return;
            toggleLikeAction(item.videoId, user.uid, item.uid);
          }}
        />
      );
    },
    [currentIndex, likedVideos, user]
  );

  // ─── Clé unique pour chaque item ──────────────────────────────────────
  const keyExtractor = useCallback(
    (item: Video) => item.videoId,
    []
  );

  // ─── Footer : spinner de pagination ───────────────────────────────────
  const renderFooter = useCallback(() => {
    if (!isLoading || videos.length === 0) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color="#fe2c55" size="small" />
      </View>
    );
  }, [isLoading, videos.length]);

  // ─── Chargement initial ───────────────────────────────────────────────
  if (isLoading && videos.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#fe2c55" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderVideo}
        keyExtractor={keyExtractor}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        onEndReached={() => {
          if (hasMore) loadMoreVideos();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshFeed}
            tintColor="#fe2c55"
          />
        }
        removeClippedSubviews
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoader: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FeedScreen;