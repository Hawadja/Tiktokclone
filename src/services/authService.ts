// src/services/authService.ts

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  UserCredential,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../../firebase.config';
import { User } from '../types';

// ─── Register ───────────────────────────────────────────────────────────────

export const register = async (
  email: string,
  password: string,
  username: string
): Promise<User> => {
  const credential: UserCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await updateProfile(credential.user, {
    displayName: username,
  });

  const newUser: User = {
    uid: credential.user.uid,
    username,
    email,
    bio: '',
    avatarUrl: '',
    followersCount: 0,
    followingCount: 0,
    videosCount: 0,
    createdAt: new Date(),
  };

  await setDoc(doc(db, 'users', credential.user.uid), {
    ...newUser,
    createdAt: serverTimestamp(),
  });

  return newUser;
};

// ─── Login ───────────────────────────────────────────────────────────────────

export const login = async (
  email: string,
  password: string
): Promise<User> => {
  const credential: UserCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  const userDoc = await getDoc(doc(db, 'users', credential.user.uid));

  if (!userDoc.exists()) {
    throw new Error('Utilisateur introuvable dans Firestore.');
  }

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

// ─── Logout ──────────────────────────────────────────────────────────────────

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

// ─── Get current user profile ────────────────────────────────────────────────

export const getCurrentUserProfile = async (): Promise<User | null> => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return null;
  }

  const userDoc = await getDoc(doc(db, 'users', currentUser.uid));

  if (!userDoc.exists()) {
    return null;
  }

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