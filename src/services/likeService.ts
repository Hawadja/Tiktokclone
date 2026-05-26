// src/services/likeService.ts

import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import { Like } from '../types';

// ─── Liker une vidéo ──────────────────────────────────────────────────────────

export const likeVideo = async (
  videoId: string,
  uid: string
): Promise<void> => {
  const likeId = `${uid}_${videoId}`;
  const likeRef = doc(db, 'likes', likeId);

  const like: Omit<Like, 'likeId'> = {
    videoId,
    uid,
    createdAt: new Date(),
  };

  await setDoc(likeRef, {
    ...like,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'videos', videoId), {
    likesCount: increment(1),
  });
};

// ─── Unliker une vidéo ────────────────────────────────────────────────────────

export const unlikeVideo = async (
  videoId: string,
  uid: string
): Promise<void> => {
  const likeId = `${uid}_${videoId}`;
  const likeRef = doc(db, 'likes', likeId);

  await deleteDoc(likeRef);

  await updateDoc(doc(db, 'videos', videoId), {
    likesCount: increment(-1),
  });
};

// ─── Vérifier si l'utilisateur a liké une vidéo ───────────────────────────────

export const isVideoLiked = async (
  videoId: string,
  uid: string
): Promise<boolean> => {
  const likeId = `${uid}_${videoId}`;
  const likeDoc = await getDoc(doc(db, 'likes', likeId));
  return likeDoc.exists();
};

// ─── Toggle like (like/unlike en une seule fonction) ─────────────────────────

export const toggleLike = async (
  videoId: string,
  uid: string
): Promise<boolean> => {
  const liked = await isVideoLiked(videoId, uid);

  if (liked) {
    await unlikeVideo(videoId, uid);
    return false;
  } else {
    await likeVideo(videoId, uid);
    return true;
  }
};