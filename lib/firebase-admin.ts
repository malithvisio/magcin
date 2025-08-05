import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
const firebaseAdminConfig = {
  credential: cert({
    projectId: 'visiotourism',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
};

// Initialize the app if it hasn't been initialized
if (!getApps().length) {
  initializeApp(firebaseAdminConfig);
}

export const auth = getAuth();
