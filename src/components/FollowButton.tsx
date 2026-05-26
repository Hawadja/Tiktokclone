// src/components/FollowButton.tsx

import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { toggleFollow, isFollowing } from '../services/userService';
import { createNotification } from '../services/notificationService';
import { useAuthStore } from '../store/authStore';

interface FollowButtonProps {
  targetUid: string;
  size?: 'small' | 'large';
  onFollowChange?: (isFollowing: boolean) => void;
}

const FollowButton = ({
  targetUid,
  size = 'large',
  onFollowChange,
}: FollowButtonProps) => {
  const { user } = useAuthStore();
  const [following, setFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // ─── Vérifier le statut au montage ───────────────────────────────────
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user || user.uid === targetUid) {
        setIsChecking(false);
        return;
      }
      try {
        const status = await isFollowing(user.uid, targetUid);
        setFollowing(status);
      } catch {
        // silencieux
      } finally {
        setIsChecking(false);
      }
    };

    checkFollowStatus();
  }, [targetUid, user]);

  // ─── Ne pas afficher si c'est son propre profil ───────────────────────
  if (!user || user.uid === targetUid) return null;

  // ─── Toggle follow ────────────────────────────────────────────────────
  const handlePress = async () => {
    if (isLoading) return;
    setIsLoading(true);

    // Optimiste
    const prevFollowing = following;
    setFollowing(!prevFollowing);

    try {
      const isNowFollowing = await toggleFollow(user.uid, targetUid);

      if (isNowFollowing) {
        await createNotification(targetUid, user.uid, 'follow');
      }

      setFollowing(isNowFollowing);
      onFollowChange?.(isNowFollowing);
    } catch {
      // Rollback
      setFollowing(prevFollowing);
    } finally {
      setIsLoading(false);
    }
  };

  const isSmall = size === 'small';

  if (isChecking) {
    return (
      <ActivityIndicator
        color="#fe2c55"
        size="small"
        style={styles.loader}
      />
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        following ? styles.followingButton : styles.followButton,
        isSmall && styles.buttonSmall,
      ]}
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.8}>
      {isLoading ? (
        <ActivityIndicator
          color={following ? '#fff' : '#fff'}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            following ? styles.followingText : styles.followText,
            isSmall && styles.buttonTextSmall,
          ]}>
          {following ? 'Suivi ✓' : 'Suivre'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  loader: {
    padding: 8,
  },
  button: {
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  buttonSmall: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    minWidth: 70,
  },
  followButton: {
    backgroundColor: '#fe2c55',
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#444',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  buttonTextSmall: {
    fontSize: 12,
  },
  followText: {
    color: '#fff',
  },
  followingText: {
    color: '#aaa',
  },
});

export default FollowButton;