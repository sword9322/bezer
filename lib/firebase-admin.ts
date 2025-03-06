import { AppOptions, cert, getApps, initializeApp } from 'firebase-admin/app';

const options: AppOptions = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
};

// Inicializa o Firebase Admin apenas uma vez
export function getFirebaseAdminApp() {
  if (!getApps().length) {
    return initializeApp(options);
  }
  return getApps()[0];
} 