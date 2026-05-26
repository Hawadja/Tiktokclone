// firebase.config.ts

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'fake-api-key',
  authDomain: 'localhost',
  projectId: 'tiktokclone-46729',
  storageBucket: 'tiktokclone-46729.appspot.com',
  messagingSenderId: '935775208823',
  appId: '1:935775208823:android:c635754557191b00ca0d72',
};

// Initialise une seule fois
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}

const app = getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Connecte les émulateurs une seule fois
if (__DEV__) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (e) {
    // Déjà connecté
  }
}

export { auth, db };
export default app;




// firebase.config.ts

/*import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  connectAuthEmulator,
  // @ts-ignore
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'fake-api-key"AIzaSyAFbNgkb-aKGzHFAzv3TEsphRXpT8wX8T0',
  authDomain: 'localhost',
  projectId: 'tiktokclone-46729',
  storageBucket: 'tiktokclone-46729.appspot.com',
  messagingSenderId: '935775208823',
  appId: '1:935775208823:android:c635754557191b00ca0d72',
};

// Evite la double initialisation
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth avec persistance AsyncStorage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

// Emulateurs locaux
if (__DEV__) {
  connectAuthEmulator(auth, 'http://localhost:9099', {
    disableWarnings: true,
  });
  connectFirestoreEmulator(db, 'localhost', 8080);
}

export default app;*/


// firebase.config.ts

/*import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAFbNgkb-aKGzHFAzv3TEsphRXpT8wX8T0",
  authDomain: "localhost",
  projectId: "tiktokclone-46729",
  storageBucket: "tiktokclone-46729.appspot.com",
  messagingSenderId: "935775208823",
  appId: "1:935775208823:android:c635754557191b00ca0d72"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

if (__DEV__) {
  connectAuthEmulator(auth, 'http://localhost:9099', {
    disableWarnings: true,
  });
  connectFirestoreEmulator(db, 'localhost', 8080);
}

export default app;*/
