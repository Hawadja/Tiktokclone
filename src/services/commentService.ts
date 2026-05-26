// src/services/commentService.ts

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  updateDoc,
  increment,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import { Comment } from '../types';

// ─── Ajouter un commentaire ───────────────────────────────────────────────────

export const addComment = async (
  videoId: string,
  uid: string,
  text: string
): Promise<Comment> => {
  if (!text.trim()) {
    throw new Error('Le commentaire ne peut pas être vide.');
  }

  const commentData = {
    videoId,
    uid,
    text: text.trim(),
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'comments'), commentData);

  await updateDoc(doc(db, 'videos', videoId), {
    commentsCount: increment(1),
  });

  return {
    commentId: docRef.id,
    videoId,
    uid,
    text: text.trim(),
    createdAt: new Date(),
  };
};

// ─── Récupérer les commentaires d'une vidéo ───────────────────────────────────

export const getComments = async (videoId: string): Promise<Comment[]> => {
  const commentsQuery = query(
    collection(db, 'comments'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(commentsQuery);

  const comments: Comment[] = snapshot.docs
    .filter((d) => d.data().videoId === videoId)
    .map((d) => {
      const data = d.data();
      return {
        commentId: d.id,
        videoId: data.videoId,
        uid: data.uid,
        text: data.text,
        createdAt: data.createdAt?.toDate(),
      };
    });

  return comments;
};

// ─── Supprimer un commentaire ─────────────────────────────────────────────────

export const deleteComment = async (
  commentId: string,
  videoId: string,
  uid: string
): Promise<void> => {
  const commentRef = doc(db, 'comments', commentId);
  const commentDoc = await getDoc(commentRef);

  if (!commentDoc.exists()) {
    throw new Error('Commentaire introuvable.');
  }

  if (commentDoc.data().uid !== uid) {
    throw new Error('Vous ne pouvez supprimer que vos propres commentaires.');
  }

  await deleteDoc(commentRef);

  await updateDoc(doc(db, 'videos', videoId), {
    commentsCount: increment(-1),
  });
};