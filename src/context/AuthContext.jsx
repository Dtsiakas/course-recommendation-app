/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the application.
 * Uses Firebase Authentication for user management.
 */

import { createContext, useState, useEffect, useCallback } from 'react';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || userData.displayName || null,
          ...userData
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign up with email and password
  const signUp = useCallback(async (email, password, displayName = '') => {
    setError(null);
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      if (displayName) {
        await updateProfile(firebaseUser, { displayName });
      }
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email: firebaseUser.email,
        displayName: displayName || null,
        createdAt: serverTimestamp()
      });

      return { success: true };
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email, password) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (err) {
      setError('Failed to sign out. Please try again.');
      return { success: false, error: err.message };
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Helper function to convert Firebase error codes to user-friendly messages
 */
function getAuthErrorMessage(code) {
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Email/password sign in is not enabled.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/invalid-credential': 'Invalid email or password.'
  };

  return errorMessages[code] || 'An error occurred. Please try again.';
}

