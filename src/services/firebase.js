/**
 * Firebase Configuration
 * 
 * This file initializes Firebase services for the application.
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIwDcu7lMAD5bSq8UnfIaZrQfL751i5gg",
  authDomain: "course-recommendation-ap-55126.firebaseapp.com",
  projectId: "course-recommendation-ap-55126",
  storageBucket: "course-recommendation-ap-55126.firebasestorage.app",
  messagingSenderId: "369208040208",
  appId: "1:369208040208:web:d8e63ec63e6e1419ec2395"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
