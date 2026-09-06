import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);
const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
const emulatorHost = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST ?? '127.0.0.1';
const emulatorPort = Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT ?? '8080');

export const firebaseEnabled = hasFirebaseConfig;
export const firebaseMode = hasFirebaseConfig ? (useEmulator ? 'emulator' : 'live') : 'sample';

export const firebaseApp = hasFirebaseConfig
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const firestore = firebaseApp ? getFirestore(firebaseApp) : null;

let emulatorConnected = false;

if (firestore && useEmulator && !emulatorConnected) {
  connectFirestoreEmulator(firestore, emulatorHost, emulatorPort);
  emulatorConnected = true;
}
