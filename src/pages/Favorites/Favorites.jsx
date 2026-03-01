/**
 * Favorites Page
 * 
 * Displays user's saved favorite courses.
 * Protected route - requires authentication.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFavorites } from '../../context/FavoritesContext';
import { userService } from '../../services/userService';
import { courseService } from '../../services/courseService';
import { Button, Card, Loader, EmptyState } from '../../components';
import styles from './Favorites.module.css';

export function Favorites() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { decrementCount } = useFavorites();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  // Fetch favorites with course details
  useEffect(() => {
    async function fetchFavorites() {
      if (!user) return;

      try {
        setLoading(true);
        
        // Get user's favorites
        const favoritesData = await userService.getFavorites(user.uid);
        
        // Fetch course details for each favorite
        const coursesWithDetails = await Promise.all(
          favoritesData.map(async (fav) => {
            const course = await courseService.getCourseById(fav.courseId);
            return course ? { ...course, favoriteId: fav.id, addedAt: fav.addedAt } : null;
          })
        );

        // Filter out null values (deleted courses)
        setFavorites(coursesWithDetails.filter(Boolean));
      } catch (err) {
        console.error('Error fetching favorites:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [user]);

  const handleRemoveFavorite = async (courseId) => {
    setRemovingId(courseId);
    try {
      await userService.removeFavorite(user.uid, courseId);
      setFavorites(prev => prev.filter(course => course.id !== courseId));
      decrementCount(); // Update header badge immediately
    } catch (err) {
      console.error('Error removing favorite:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  if (loading) {
    return <Loader centered text="Loading favorites..." />;
  }

  return (
    <div className={styles.favorites}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Favorites</h1>
        <p className={styles.subtitle}>
          Courses you've saved for later
        </p>
      </div>

      {favorites.length > 0 ? (
        <>
          <div className={styles.count}>
            {favorites.length} saved {favorites.length === 1 ? 'course' : 'courses'}
          </div>

          <div className={styles.courseList}>
            {favorites.map(course => (
              <Card key={course.id} padding="none" className={styles.courseCard}>
                <div className={styles.cardContent}>
                  {course.thumbnailUrl && (
                    <div 
                      className={styles.thumbnail}
                      onClick={() => handleCourseClick(course.id)}
                    >
                      <img src={course.thumbnailUrl} alt={course.title} />
                    </div>
                  )}
                  
                  <div className={styles.courseInfo}>
                    <div className={styles.courseMeta}>
                      <span className={styles.platform}>{course.platform}</span>
                      <span className={`${styles.difficulty} ${styles[`difficulty${capitalize(course.difficulty)}`]}`}>
                        {course.difficulty}
                      </span>
                    </div>
                    
                    <h3 
                      className={styles.courseTitle}
                      onClick={() => handleCourseClick(course.id)}
                    >
                      {course.title}
                    </h3>
                    
                    <p className={styles.instructor}>by {course.instructor}</p>
                    
                    <div className={styles.technologies}>
                      {course.technologies.slice(0, 4).map(tech => (
                        <span key={tech} className={styles.techBadge}>{tech}</span>
                      ))}
                    </div>
                    
                    <div className={styles.courseStats}>
                      <span>{course.durationHours}h</span>
                      <span>•</span>
                      <span>{course.depth}</span>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleCourseClick(course.id)}
                    >
                      View Course
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFavorite(course.id)}
                      loading={removingId === course.id}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={<EmptyState.HeartIcon />}
          title="No favorites yet"
          message="Browse courses and click the heart icon to save them here for later."
          action={
            <Button variant="primary" onClick={() => navigate('/')}>
              Discover Courses
            </Button>
          }
        />
      )}
    </div>
  );
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

