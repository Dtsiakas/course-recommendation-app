/**
 * useCourses Hook
 * 
 * Custom hook for fetching and managing courses data.
 * Returns courses array, loading state, and error state.
 */

import { useState, useEffect } from 'react';
import { courseService } from '../services/courseService';

export function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        setError(null);
        const data = await courseService.getAllCourses();
        setCourses(data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  return { courses, loading, error };
}

/**
 * useCourse Hook
 * 
 * Custom hook for fetching a single course by ID.
 */
export function useCourse(courseId) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCourse() {
      if (!courseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await courseService.getCourseById(courseId);
        setCourse(data);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [courseId]);

  return { course, loading, error };
}

