/**
 * User Service
 * 
 * Service layer for user-related Firestore operations.
 * Handles user preferences, favorites, and evaluations.
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

export const userService = {
  // ==================== PREFERENCES ====================

  /**
   * Get user preferences
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User preferences or null
   */
  async getPreferences(userId) {
    const docRef = doc(db, 'preferences', userId);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data();
  },

  /**
   * Save user preferences
   * @param {string} userId - User ID
   * @param {Object} preferences - Preferences object
   */
  async savePreferences(userId, preferences) {
    const docRef = doc(db, 'preferences', userId);
    await setDoc(docRef, {
      ...preferences,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  // ==================== FAVORITES ====================

  /**
   * Get user's favorite courses
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of favorite course IDs
   */
  async getFavorites(userId) {
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  /**
   * Add course to favorites
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   */
  async addFavorite(userId, courseId) {
    // Check if already favorited
    const existing = await this.isFavorite(userId, courseId);
    if (existing) return;

    await addDoc(collection(db, 'favorites'), {
      userId,
      courseId,
      addedAt: serverTimestamp()
    });
  },

  /**
   * Remove course from favorites
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   */
  async removeFavorite(userId, courseId) {
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );
    const snapshot = await getDocs(q);
    
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
    }
  },

  /**
   * Check if course is favorited by user
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @returns {Promise<boolean>}
   */
  async isFavorite(userId, courseId) {
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  },

  // ==================== EVALUATIONS ====================

  /**
   * Get evaluations for a course
   * @param {string} courseId - Course ID
   * @returns {Promise<Array>} Array of evaluations
   */
  async getCourseEvaluations(courseId) {
    const q = query(
      collection(db, 'evaluations'),
      where('courseId', '==', courseId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  /**
   * Get user's evaluation for a specific course
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @returns {Promise<Object|null>} Evaluation or null
   */
  async getUserEvaluation(userId, courseId) {
    const q = query(
      collection(db, 'evaluations'),
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  },

  /**
   * Get all evaluations by a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of evaluations
   */
  async getUserEvaluations(userId) {
    const q = query(
      collection(db, 'evaluations'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  /**
   * Add or update an evaluation
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @param {Object} evaluation - Evaluation data
   */
  async saveEvaluation(userId, courseId, evaluation) {
    // Check if user already has an evaluation for this course
    const existing = await this.getUserEvaluation(userId, courseId);
    
    if (existing) {
      // Update existing evaluation
      const docRef = doc(db, 'evaluations', existing.id);
      await updateDoc(docRef, {
        ...evaluation,
        updatedAt: serverTimestamp()
      });
    } else {
      // Create new evaluation
      await addDoc(collection(db, 'evaluations'), {
        userId,
        courseId,
        ...evaluation,
        createdAt: serverTimestamp()
      });
    }
  },

  /**
   * Delete an evaluation
   * @param {string} evaluationId - Evaluation document ID
   */
  async deleteEvaluation(evaluationId) {
    await deleteDoc(doc(db, 'evaluations', evaluationId));
  },

  // ==================== VIEWS ====================

  /**
   * Track a course view
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   */
  async trackView(userId, courseId) {
    await addDoc(collection(db, 'views'), {
      userId,
      courseId,
      viewedAt: serverTimestamp()
    });
  },

  /**
   * Get user's view history
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of viewed course IDs
   */
  async getViewHistory(userId) {
    const q = query(
      collection(db, 'views'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
};

