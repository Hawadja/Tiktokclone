// src/services/userService.ts

import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { db, storage } from '../../firebase.config';
import { User, Follow } from '../types';

// ─── Récupérer un profil utilisateur ─────────────────────────────────────────

export const getUserProfile = async (uid: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', uid));

  if (!userDoc.exists()) return null;

  const data = userDoc.data();

  return {
    uid: data.uid,
    username: data.username,
    email: data.email,
    bio: data.bio,
    avatarUrl: data.avatarUrl,
    followersCount: data.followersCount,
    followingCount: data.followingCount,
    videosCount: data.videosCount,
    createdAt: data.createdAt?.toDate(),
  };
};

// ─── Mettre à jour le profil ──────────────────────────────────────────────────

export const updateUserProfile = async (
  uid: string,
  updates: Partial<Pick<User, 'username' | 'bio' | 'avatarUrl'>>
): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), {
    ...updates,
  });
};

// ─── Upload avatar ────────────────────────────────────────────────────────────

export const uploadAvatar = async (
  uid: string,
  localUri: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const response = await fetch(localUri);
  const blob = await response.blob();

  const filename = `avatars/${uid}/avatar.jpg`;
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

        await updateDoc(doc(db, 'users', uid), {
          avatarUrl: downloadUrl,
        });

        resolve(downloadUrl);
      }
    );
  });
};

// ─── Rechercher des utilisateurs ──────────────────────────────────────────────

export const searchUsers = async (searchText: string): Promise<User[]> => {
  if (!searchText.trim()) return [];

  const usersQuery = query(
    collection(db, 'users'),
    where('username', '>=', searchText.toLowerCase()),
    where('username', '<=', searchText.toLowerCase() + '\uf8ff')
  );

  const snapshot = await getDocs(usersQuery);

  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      uid: data.uid,
      username: data.username,
      email: data.email,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      followersCount: data.followersCount,
      followingCount: data.followingCount,
      videosCount: data.videosCount,
      createdAt: data.createdAt?.toDate(),
    };
  });
};

// ─── Suivre un utilisateur ────────────────────────────────────────────────────

export const followUser = async (
  followerId: string,
  followingId: string
): Promise<void> => {
  if (followerId === followingId) {
    throw new Error('Vous ne pouvez pas vous suivre vous-même.');
  }

  const followId = `${followerId}_${followingId}`;

  const follow: Omit<Follow, 'followId'> = {
    followerId,
    followingId,
    createdAt: new Date(),
  };

  await setDoc(doc(db, 'follows', followId), {
    ...follow,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'users', followerId), {
    followingCount: increment(1),
  });

  await updateDoc(doc(db, 'users', followingId), {
    followersCount: increment(1),
  });
};

// ─── Ne plus suivre un utilisateur ───────────────────────────────────────────

export const unfollowUser = async (
  followerId: string,
  followingId: string
): Promise<void> => {
  const followId = `${followerId}_${followingId}`;

  await deleteDoc(doc(db, 'follows', followId));

  await updateDoc(doc(db, 'users', followerId), {
    followingCount: increment(-1),
  });

  await updateDoc(doc(db, 'users', followingId), {
    followersCount: increment(-1),
  });
};

// ─── Vérifier si on suit un utilisateur ──────────────────────────────────────

export const isFollowing = async (
  followerId: string,
  followingId: string
): Promise<boolean> => {
  const followId = `${followerId}_${followingId}`;
  const followDoc = await getDoc(doc(db, 'follows', followId));
  return followDoc.exists();
};

// ─── Toggle follow ────────────────────────────────────────────────────────────

export const toggleFollow = async (
  followerId: string,
  followingId: string
): Promise<boolean> => {
  const following = await isFollowing(followerId, followingId);

  if (following) {
    await unfollowUser(followerId, followingId);
    return false;
  } else {
    await followUser(followerId, followingId);
    return true;
  }
};

// ─── Récupérer les followers ──────────────────────────────────────────────────

export const getFollowers = async (uid: string): Promise<User[]> => {
  const followsQuery = query(
    collection(db, 'follows'),
    where('followingId', '==', uid)
  );

  const snapshot = await getDocs(followsQuery);

  const followers = await Promise.all(
    snapshot.docs.map(async (d) => {
      const followerId = d.data().followerId;
      return await getUserProfile(followerId);
    })
  );

  return followers.filter((u): u is User => u !== null);
};

// ─── Récupérer les following ──────────────────────────────────────────────────

export const getFollowing = async (uid: string): Promise<User[]> => {
  const followsQuery = query(
    collection(db, 'follows'),
    where('followerId', '==', uid)
  );

  const snapshot = await getDocs(followsQuery);

  const following = await Promise.all(
    snapshot.docs.map(async (d) => {
      const followingId = d.data().followingId;
      return await getUserProfile(followingId);
    })
  );

  return following.filter((u): u is User => u !== null);
};