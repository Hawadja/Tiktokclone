// src/types/index.ts

export interface User {
  uid: string;
  username: string;
  email: string;
  bio: string;
  avatarUrl: string;
  followersCount: number;
  followingCount: number;
  videosCount: number;
  createdAt: Date;
}

export interface Video {
  videoId: string;
  uid: string;
  user?: User;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: Date;
}

export interface Comment {
  commentId: string;
  videoId: string;
  uid: string;
  user?: User;
  text: string;
  createdAt: Date;
}

export interface Like {
  likeId: string;
  videoId: string;
  uid: string;
  createdAt: Date;
}

export interface Follow {
  followId: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export type NotificationType = 'like' | 'comment' | 'follow';

export interface Notification {
  notifId: string;
  toUid: string;
  fromUid: string;
  fromUser?: User;
  type: NotificationType;
  videoId?: string;
  read: boolean;
  createdAt: Date;
}

export interface Message {
  msgId: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: Date;
}

export interface Chat {
  chatId: string;
  participants: string[];
  lastMessage?: string;
  updatedAt: Date;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Discover: undefined;
  Upload: undefined;
  Profile: undefined;
  Notifications: undefined;
};