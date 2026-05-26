// src/components/UserAvatar.tsx

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { User } from '../types';

interface UserAvatarProps {
  user: Partial<User>;
  size?: number;
  onPress?: () => void;
  showBorder?: boolean;
}

const UserAvatar = ({
  user,
  size = 44,
  onPress,
  showBorder = false,
}: UserAvatarProps) => {
  const borderRadius = size / 2;
  const fontSize = size * 0.4;

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius,
    borderWidth: showBorder ? 2 : 0,
    borderColor: '#fe2c55',
  };

  const content = user.avatarUrl ? (
    <Image
      source={{ uri: user.avatarUrl }}
      style={[styles.image, avatarStyle]}
    />
  ) : (
    <View style={[styles.placeholder, avatarStyle, { backgroundColor: '#1a1a1a' }]}>
      <Text style={[styles.placeholderText, { fontSize }]}>
        {user.username?.[0]?.toUpperCase() || '?'}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#fe2c55',
    fontWeight: '700',
  },
});

export default UserAvatar;