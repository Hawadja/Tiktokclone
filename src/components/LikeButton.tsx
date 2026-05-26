// src/components/LikeButton.tsx

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';

interface LikeButtonProps {
  isLiked: boolean;
  likesCount: number;
  onLike: () => void;
  size?: 'small' | 'large';
}

const LikeButton = ({
  isLiked,
  likesCount,
  onLike,
  size = 'large',
}: LikeButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Animation bounce
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.4,
        useNativeDriver: true,
        speed: 50,
        bounciness: 10,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 5,
      }),
    ]).start();

    onLike();
  };

  const isSmall = size === 'small';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}>
      <Animated.Text
        style={[
          styles.icon,
          isSmall ? styles.iconSmall : styles.iconLarge,
          { transform: [{ scale: scaleAnim }] },
        ]}>
        {isLiked ? '❤️' : '🤍'}
      </Animated.Text>
      <Text
        style={[
          styles.count,
          isSmall ? styles.countSmall : styles.countLarge,
        ]}>
        {likesCount > 999
          ? `${(likesCount / 1000).toFixed(1)}k`
          : likesCount}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  icon: {},
  iconLarge: {
    fontSize: 32,
  },
  iconSmall: {
    fontSize: 22,
  },
  count: {
    color: '#fff',
    fontWeight: '600',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  countLarge: {
    fontSize: 12,
  },
  countSmall: {
    fontSize: 11,
  },
});

export default LikeButton;