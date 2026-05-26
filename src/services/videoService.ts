// src/services/videoService.ts

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  updateDoc,
  increment,
  serverTimestamp,
  DocumentSnapshot,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from '../../firebase.config';
import { Video } from '../types';

// ─── Upload vidéo vers Firebase Storage ──────────────────────────────────────

export const uploadVideo = async (
  localUri: string,
  uid: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const response = await fetch(localUri);
  const blob = await response.blob();

  const filename = `videos/${uid}/${Date.now()}.mp4`;
  const storageRef = ref(storage, filename);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(progress));
      },
      (error) => reject(error),
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadUrl);
      }
    );
  });
};

// ─── Créer un document vidéo dans Firestore ───────────────────────────────────

export const createVideo = async (
  uid: string,
  videoUrl: string,
  caption: string,
  tags: string[]
): Promise<Video> => {
  const videoData = {
    uid,
    videoUrl,
    thumbnailUrl: '',
    caption,
    tags,
    likesCount: 0,
    commentsCount: 0,
    viewsCount: 0,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'videos'), videoData);

  await updateDoc(doc(db, 'users', uid), {
    videosCount: increment(1),
  });

  return {
    videoId: docRef.id,
    uid,
    videoUrl,
    thumbnailUrl: '',
    caption,
    tags,
    likesCount: 0,
    commentsCount: 0,
    viewsCount: 0,
    createdAt: new Date(),
  };
};

// ─── Récupérer le feed (pagination) ──────────────────────────────────────────

export const getFeedVideos = async (
  pageSize: number = 10,
  lastDoc?: DocumentSnapshot
): Promise<{ videos: Video[]; lastDoc: DocumentSnapshot | null }> => {
  let feedQuery = query(
    collection(db, 'videos'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (lastDoc) {
    feedQuery = query(
      collection(db, 'videos'),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(pageSize)
    );
  }

  const snapshot = await getDocs(feedQuery);

  if (snapshot.empty) {
    return { videos: [], lastDoc: null };
  }

  const videos: Video[] = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      videoId: d.id,
      uid: data.uid,
      videoUrl: data.videoUrl,
      thumbnailUrl: data.thumbnailUrl,
      caption: data.caption,
      tags: data.tags || [],
      likesCount: data.likesCount,
      commentsCount: data.commentsCount,
      viewsCount: data.viewsCount,
      createdAt: data.createdAt?.toDate(),
    };
  });

  const lastVisible = snapshot.docs[snapshot.docs.length - 1];

  return { videos, lastDoc: lastVisible };
};

// ─── Récupérer les vidéos d'un utilisateur ───────────────────────────────────

export const getUserVideos = async (uid: string): Promise<Video[]> => {
  const userVideosQuery = query(
    collection(db, 'videos'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(userVideosQuery);

  const videos: Video[] = snapshot.docs
    .filter((d) => d.data().uid === uid)
    .map((d) => {
      const data = d.data();
      return {
        videoId: d.id,
        uid: data.uid,
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl,
        caption: data.caption,
        tags: data.tags || [],
        likesCount: data.likesCount,
        commentsCount: data.commentsCount,
        viewsCount: data.viewsCount,
        createdAt: data.createdAt?.toDate(),
      };
    });

  return videos;
};

// ─── Récupérer une vidéo par son ID ──────────────────────────────────────────

export const getVideoById = async (videoId: string): Promise<Video | null> => {
  const videoDoc = await getDoc(doc(db, 'videos', videoId));

  if (!videoDoc.exists()) return null;

  const data = videoDoc.data();

  return {
    videoId: videoDoc.id,
    uid: data.uid,
    videoUrl: data.videoUrl,
    thumbnailUrl: data.thumbnailUrl,
    caption: data.caption,
    tags: data.tags || [],
    likesCount: data.likesCount,
    commentsCount: data.commentsCount,
    viewsCount: data.viewsCount,
    createdAt: data.createdAt?.toDate(),
  };
};

// ─── Incrémenter les vues ─────────────────────────────────────────────────────

export const incrementViews = async (videoId: string): Promise<void> => {
  await updateDoc(doc(db, 'videos', videoId), {
    viewsCount: increment(1),
  });
};

// ─── Supprimer une vidéo ──────────────────────────────────────────────────────

export const deleteVideo = async (
  videoId: string,
  uid: string,
  videoUrl: string
): Promise<void> => {
  await deleteDoc(doc(db, 'videos', videoId));

  try {
    const videoRef = ref(storage, videoUrl);
    await deleteObject(videoRef);
  } catch {
    // Le fichier Storage peut déjà être supprimé
  }

  await updateDoc(doc(db, 'users', uid), {
    videosCount: increment(-1),
  });
};