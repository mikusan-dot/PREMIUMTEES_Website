import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

// Load env vars from project root (.env) BEFORE any Firebase init runs.
// This file is imported (and initFirebase called) by app.js at module load time,
// so dotenv must run first here.
const __dirname = dirname(fileURLToPath(import.meta.url)); // .../server/src/config
dotenv.config({ path: resolve(__dirname, '../../../.env') }); // project root .env

let initialized = false;

export const initFirebase = () => {
  if (initialized) return;
  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
    FIREBASE_STORAGE_BUCKET,
  } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    if (process.env.DEV_MODE === 'true') {
      console.warn('[DEV_MODE] Firebase credentials not found — running in dev fallback mode.');
      initialized = true;
      return;
    }
    throw new Error('Missing Firebase Admin SDK credentials. See .env.example');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    storageBucket: FIREBASE_STORAGE_BUCKET,
  });
  initialized = true;
};

export const getFirestore = () => {
  if (!initialized) initFirebase();
  if (process.env.DEV_MODE === 'true') return null;
  return admin.firestore();
};

export const getAuth = () => {
  if (!initialized) initFirebase();
  if (process.env.DEV_MODE === 'true') return null;
  return admin.auth();
};

export { admin };
