/**
 * Course Service
 * 
 * Service layer for course-related Firestore operations.
 * Handles CRUD operations for courses collection.
 * 
 * Falls back to local data if Firebase is not configured or encounters errors.
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import localCourses from '../data/courses.json';

// Collection reference
const coursesCollection = collection(db, 'courses');

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  try {
    // Check if the Firebase config has real values (not placeholder)
    return db && !db._databaseId?.projectId?.includes('YOUR_PROJECT_ID');
  } catch {
    return false;
  }
};

export const courseService = {
  /**
   * Get all courses
   * Falls back to local JSON data if Firebase is not configured
   * @returns {Promise<Array>} Array of course objects
   */
  async getAllCourses() {
    try {
      // Try to fetch from Firestore first
      const snapshot = await getDocs(coursesCollection);
      
      // If we got courses from Firestore, return them
      if (snapshot.docs.length > 0) {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }
      
      // Otherwise, fall back to local data
      
      return localCourses;
    } catch (error) {
      // If there's an error (e.g., Firebase not configured), use local data
      
      return localCourses;
    }
  },

  /**
   * Get a single course by ID
   * Falls back to local JSON data if Firebase is not configured
   * @param {string} courseId - The course document ID
   * @returns {Promise<Object|null>} Course object or null if not found
   */
  async getCourseById(courseId) {
    try {
      const docRef = doc(db, 'courses', courseId);
      const snapshot = await getDoc(docRef);
      
      if (snapshot.exists()) {
        return {
          id: snapshot.id,
          ...snapshot.data()
        };
      }
      
      // Fall back to local data
      const localCourse = localCourses.find(c => c.id === courseId);
      return localCourse || null;
    } catch (error) {
      // If there's an error, try local data
      
      const localCourse = localCourses.find(c => c.id === courseId);
      return localCourse || null;
    }
  },

  /**
   * Get courses by technology
   * @param {string} technology - Technology name to filter by
   * @returns {Promise<Array>} Array of matching courses
   */
  async getCoursesByTechnology(technology) {
    const q = query(
      coursesCollection,
      where('technologies', 'array-contains', technology)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  /**
   * Get courses by difficulty
   * @param {string} difficulty - Difficulty level (beginner, intermediate, advanced)
   * @returns {Promise<Array>} Array of matching courses
   */
  async getCoursesByDifficulty(difficulty) {
    const q = query(
      coursesCollection,
      where('difficulty', '==', difficulty)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  /**
   * Get courses by platform
   * @param {string} platform - Platform name (Udemy, Coursera, etc.)
   * @returns {Promise<Array>} Array of matching courses
   */
  async getCoursesByPlatform(platform) {
    const q = query(
      coursesCollection,
      where('platform', '==', platform)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
};

