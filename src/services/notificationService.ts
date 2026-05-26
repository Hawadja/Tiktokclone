// src/services/notificationService.ts

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import { Notification, NotificationType } from '../types';

// ─── Créer une notification ───────────────────────────────────────────────────

export const createNotification = async (
  toUid: string,
  fromUid: string,
  type: NotificationType,
  videoId?: string
): Promise<void> => {
  if (toUid === fromUid) return;

  const notifData = {
    toUid,
    fromUid,
    type,
    videoId: videoId || null,
    read: false,
    createdAt: serverTimestamp(),
  };

  await addDoc(collection(db, 'notifications'), notifData);
};

// ─── Récupérer les notifications d'un utilisateur ────────────────────────────

export const getNotifications = async (
  uid: string
): Promise<Notification[]> => {
  const notifsQuery = query(
    collection(db, 'notifications'),
    where('toUid', '==', uid),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(notifsQuery);

  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      notifId: d.id,
      toUid: data.toUid,
      fromUid: data.fromUid,
      type: data.type as NotificationType,
      videoId: data.videoId,
      read: data.read,
      createdAt: data.createdAt?.toDate(),
    };
  });
};

// ─── Marquer une notification comme lue ──────────────────────────────────────

export const markAsRead = async (notifId: string): Promise<void> => {
  await updateDoc(doc(db, 'notifications', notifId), {
    read: true,
  });
};

// ─── Marquer toutes les notifications comme lues ─────────────────────────────

export const markAllAsRead = async (uid: string): Promise<void> => {
  const notifsQuery = query(
    collection(db, 'notifications'),
    where('toUid', '==', uid),
    where('read', '==', false)
  );

  const snapshot = await getDocs(notifsQuery);

  if (snapshot.empty) return;

  const batch = writeBatch(db);

  snapshot.docs.forEach((d) => {
    batch.update(d.ref, { read: true });
  });

  await batch.commit();
};

// ─── Compter les notifications non lues ──────────────────────────────────────

export const getUnreadCount = async (uid: string): Promise<number> => {
  const notifsQuery = query(
    collection(db, 'notifications'),
    where('toUid', '==', uid),
    where('read', '==', false)
  );

  const snapshot = await getDocs(notifsQuery);
  return snapshot.size;
};

// ─── Supprimer une notification ───────────────────────────────────────────────

export const deleteNotification = async (notifId: string): Promise<void> => {
  await deleteDoc(doc(db, 'notifications', notifId));
};

// ─── Supprimer toutes les notifications d'un utilisateur ─────────────────────

export const deleteAllNotifications = async (uid: string): Promise<void> => {
  const notifsQuery = query(
    collection(db, 'notifications'),
    where('toUid', '==', uid)
  );

  const snapshot = await getDocs(notifsQuery);

  if (snapshot.empty) return;

  const batch = writeBatch(db);

  snapshot.docs.forEach((d) => {
    batch.delete(d.ref);
  });

  await batch.commit();
};