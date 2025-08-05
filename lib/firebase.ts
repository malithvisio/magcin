// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCkfMbA_6RuEveoxZ8cMELw0-8_KaKLBmU',
  authDomain: 'visiotourism.firebaseapp.com',
  projectId: 'visiotourism',
  storageBucket: 'visiotourism.firebasestorage.app',
  messagingSenderId: '652765926968',
  appId: '1:652765926968:web:c7e23de4f5f51ef60cb8cd',
  measurementId: 'G-G9YSE3GVNN',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics only on client side
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics, auth, db, storage };
export default app;
