/**
 * Seed Service
 * 
 * Utility to seed Firestore with initial course data.
 * Run this once after setting up Firebase to populate the database.
 */

import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import coursesData from '../data/courses.json';

/**
 * Seed courses to Firestore
 * This function checks if courses already exist and only adds new ones.
 */
export async function seedCourses() {
  try {
    
    const coursesCollection = collection(db, 'courses');
    
    // Check existing courses
    const existingSnapshot = await getDocs(coursesCollection);
    const existingIds = new Set(existingSnapshot.docs.map(doc => doc.id));
    
    let added = 0;
    let skipped = 0;
    
    for (const course of coursesData) {
      if (existingIds.has(course.id)) {
        skipped++;
        continue;
      }
      
      // Use the course.id as the document ID for consistency
      const docRef = doc(db, 'courses', course.id);
      await setDoc(docRef, {
        title: course.title,
        description: course.description,
        platform: course.platform,
        externalUrl: course.externalUrl,
        instructor: course.instructor,
        technologies: course.technologies,
        difficulty: course.difficulty,
        depth: course.depth,
        durationHours: course.durationHours,
        thumbnailUrl: course.thumbnailUrl
      });
      
      added++;
    }
    
    return { added, skipped };
  } catch (error) {
    console.error('Error seeding courses:', error);
    throw error;
  }
}

/**
 * Clear all courses from Firestore
 * USE WITH CAUTION - this deletes all course data
 */
export async function clearCourses() {
  try {
    
    const coursesCollection = collection(db, 'courses');
    const snapshot = await getDocs(coursesCollection);
    
    let deleted = 0;
    for (const docSnapshot of snapshot.docs) {
      await docSnapshot.ref.delete();
      deleted++;
    }
    
    return { deleted };
  } catch (error) {
    console.error('Error clearing courses:', error);
    throw error;
  }
}

