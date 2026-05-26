// src/components/VideoCard.tsx

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import { Video as VideoType } from '../types';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Props ────────────────────────────────────────────────────────────────────

interface VideoCardProps {
  video: VideoType;
  isActive: boolean;
  isLiked: boolean;
  onLike: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const VideoCard = ({ video, isActive, isLiked, onLike }: VideoCardProps) => {
  const videoRef = useRef<VideoRef>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // ─── Pause/play selon visibilité ────────────────────────────────────
  useEffect(() => {
    if (!isActive) {
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
  }, [isActive]);

  // ─── Tap pour pause/play ────────────────────────────────────────────
  const handleVideoPress = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <View style={styles.container}>

      {/* Lecteur vidéo */}
      <TouchableOpacity
        style={styles.videoWrapper}
        onPress={handleVideoPress}
        activeOpacity={1}>
        <Video
          ref={videoRef}
          source={{ uri: video.videoUrl }}
          style={styles.video}
          resizeMode="cover"
          repeat
          paused={isPaused || !isActive}
          onBuffer={({ isBuffering: buf }) => setIsBuffering(buf)}
          onError={() => setIsBuffering(false)}
          ignoreSilentSwitch="obey"
          playInBackground={false}
          playWhenInactive={false}
        />

        {/* Spinner buffering */}
        {isBuffering && (
          <View style={styles.bufferingContainer}>
            <ActivityIndicator color="#fff" size="large" />
          </View>
        )}

        {/* Icône pause */}
        {isPaused && !isBuffering && (
          <View style={styles.pauseIconContainer}>
            <Text style={styles.pauseIcon}>⏸</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Infos vidéo (bas gauche) */}
      <View style={styles.infoContainer}>
        <Text style={styles.username}>@{video.uid}</Text>
        <Text style={styles.caption} numberOfLines={2}>
          {video.caption}
        </Text>
        {video.tags.length > 0 && (
          <Text style={styles.tags}>
            {video.tags.map((tag) => `#${tag}`).join(' ')}
          </Text>
        )}
      </View>

      {/* Actions (droite) */}
      <View style={styles.actionsContainer}>

        {/* Like */}
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <Text style={styles.actionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
          <Text style={styles.actionCount}>
            {video.likesCount > 999
              ? `${(video.likesCount / 1000).toFixed(1)}k`
              : video.likesCount}
          </Text>
        </TouchableOpacity>

        {/* Commentaires */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>
            {video.commentsCount > 999
              ? `${(video.commentsCount / 1000).toFixed(1)}k`
              : video.commentsCount}
          </Text>
        </TouchableOpacity>

        {/* Partage */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>↗️</Text>
          <Text style={styles.actionCount}>Partager</Text>
        </TouchableOpacity>

        {/* Vues */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>👁</Text>
          <Text style={styles.actionCount}>
            {video.viewsCount > 999
              ? `${(video.viewsCount / 1000).toFixed(1)}k`
              : video.viewsCount}
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    backgroundColor: '#000',
  },
  videoWrapper: {
    flex: 1,
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bufferingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  pauseIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseIcon: {
    fontSize: 60,
    opacity: 0.8,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 90,
  },
  username: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  caption: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tags: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionsContainer: {
    position: 'absolute',
    right: 12,
    bottom: 100,
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
  },
  actionCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export default VideoCard;