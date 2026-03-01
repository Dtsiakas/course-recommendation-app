/**
 * Recommendations Page
 * 
 * Displays personalized course recommendations based on user preferences
 * and interaction history. Shows explainable recommendation reasons.
 * 
 * Protected route - requires authentication.
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCourses } from '../../hooks/useCourses';
import { userService } from '../../services/userService';
import { getRecommendedCourses } from '../../utils/recommendationEngine';
import { Button, Card, Loader, EmptyState } from '../../components';
import styles from './Recommendations.module.css';

export function Recommendations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courses, loading: coursesLoading } = useCourses();
  
  const [recommendations, setRecommendations] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState({});

  // Fetch preferences and calculate recommendations
  useEffect(() => {
    async function fetchDataAndCalculate() {
      if (!user || coursesLoading) return;

      try {
        setLoading(true);

        // Fetch user preferences
        const prefs = await userService.getPreferences(user.uid);
        setPreferences(prefs);

        if (!prefs || !isPreferencesComplete(prefs)) {
          setLoading(false);
          return;
        }

        // Fetch user interactions
        const [favorites, evaluations, views] = await Promise.all([
          userService.getFavorites(user.uid),
          userService.getUserEvaluations(user.uid),
          userService.getViewHistory(user.uid)
        ]);

        // Enrich favorites and evaluations with course technologies
        const enrichedFavorites = await Promise.all(
          favorites.map(async (fav) => {
            const course = courses.find(c => c.id === fav.courseId);
            return course ? { ...fav, technologies: course.technologies } : fav;
          })
        );

        const enrichedEvaluations = await Promise.all(
          evaluations.map(async (eval_) => {
            const course = courses.find(c => c.id === eval_.courseId);
            return course ? { ...eval_, technologies: course.technologies } : eval_;
          })
        );

        const interactions = {
          favorites: enrichedFavorites,
          evaluations: enrichedEvaluations,
          views
        };

        // Calculate recommendations
        const recommended = getRecommendedCourses(courses, prefs, interactions, 15);
        setRecommendations(recommended);
      } catch (err) {
        console.error('Error calculating recommendations:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDataAndCalculate();
  }, [user, courses, coursesLoading]);

  const toggleBreakdown = (courseId) => {
    setShowBreakdown(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const isPreferencesComplete = (prefs) => {
    return prefs &&
      prefs.technologies?.length > 0 &&
      prefs.difficulty &&
      prefs.depth &&
      prefs.duration;
  };

  if (loading || coursesLoading) {
    return <Loader centered text="Calculating your recommendations..." />;
  }

  // Check if preferences are set
  if (!preferences || !isPreferencesComplete(preferences)) {
    return (
      <div className={styles.recommendations}>
        <div className={styles.header}>
          <h1 className={styles.title}>For You</h1>
        </div>
        <EmptyState
          icon={<EmptyState.StarIcon />}
          title="Set up your preferences first"
          message="To get personalized recommendations, please complete your learning preferences in your profile."
          action={
            <Button variant="primary" onClick={() => navigate('/profile')}>
              Set Preferences
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.recommendations}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Recommended For You</h1>
          <p className={styles.subtitle}>
            Personalized course suggestions based on your preferences and activity
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
          Edit Preferences
        </Button>
      </div>

      {/* Preferences Summary */}
      <div className={styles.preferencesSummary}>
        <h3 className={styles.summaryTitle}>Your Preferences</h3>
        <div className={styles.preferencesTags}>
          {preferences.technologies.map(tech => (
            <span key={tech} className={styles.prefTag}>{tech}</span>
          ))}
          <span className={styles.prefTag}>{preferences.difficulty}</span>
          <span className={styles.prefTag}>{preferences.depth}</span>
          <span className={styles.prefTag}>{preferences.duration} duration</span>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <div className={styles.recommendationList}>
          {recommendations.map((course, index) => (
            <Card key={course.id} padding="none" className={styles.recommendationCard}>
              <div className={styles.cardContent}>
                {/* Rank Badge */}
                <div className={styles.rank}>
                  #{index + 1}
                </div>

                {/* Course Image */}
                {course.thumbnailUrl && (
                  <div 
                    className={styles.thumbnail}
                    onClick={() => handleCourseClick(course.id)}
                  >
                    <img src={course.thumbnailUrl} alt={course.title} />
                  </div>
                )}

                {/* Course Info */}
                <div className={styles.courseInfo}>
                  <div className={styles.scoreSection}>
                    <div className={styles.scoreCircle}>
                      <span className={styles.scoreValue}>{course.recommendationScore}</span>
                      <span className={styles.scoreLabel}>match</span>
                    </div>
                  </div>

                  <div className={styles.courseDetails}>
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

                    {/* Explanation */}
                    <div className={styles.explanation}>
                      <p 
                        className={styles.explanationText}
                        dangerouslySetInnerHTML={{ 
                          __html: course.explanation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        }}
                      />
                    </div>

                    {/* Technologies */}
                    <div className={styles.technologies}>
                      {course.technologies.map(tech => {
                        const isMatched = preferences.technologies.some(
                          p => p.toLowerCase() === tech.toLowerCase()
                        );
                        return (
                          <span 
                            key={tech} 
                            className={`${styles.techBadge} ${isMatched ? styles.techMatched : ''}`}
                          >
                            {tech}
                          </span>
                        );
                      })}
                    </div>

                    {/* Score Breakdown Toggle */}
                    <button 
                      className={styles.breakdownToggle}
                      onClick={() => toggleBreakdown(course.id)}
                    >
                      {showBreakdown[course.id] ? 'Hide' : 'Show'} score breakdown
                    </button>

                    {/* Score Breakdown */}
                    {showBreakdown[course.id] && (
                      <div className={styles.breakdown}>
                        <BreakdownItem 
                          label="Technology Match" 
                          score={course.breakdown.technology.score}
                          maxScore={course.breakdown.technology.maxScore}
                          reason={course.breakdown.technology.reason}
                        />
                        <BreakdownItem 
                          label="Difficulty Match" 
                          score={course.breakdown.difficulty.score}
                          maxScore={course.breakdown.difficulty.maxScore}
                          reason={course.breakdown.difficulty.reason}
                        />
                        <BreakdownItem 
                          label="Depth Match" 
                          score={course.breakdown.depth.score}
                          maxScore={course.breakdown.depth.maxScore}
                          reason={course.breakdown.depth.reason}
                        />
                        <BreakdownItem 
                          label="Duration Match" 
                          score={course.breakdown.duration.score}
                          maxScore={course.breakdown.duration.maxScore}
                          reason={course.breakdown.duration.reason}
                        />
                        <BreakdownItem 
                          label="Interaction Boost" 
                          score={course.breakdown.interaction.score}
                          maxScore={course.breakdown.interaction.maxScore}
                          reason={course.breakdown.interaction.reason}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className={styles.cardActions}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleCourseClick(course.id)}
                  >
                    View Course
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<EmptyState.SearchIcon />}
          title="No matching courses found"
          message="We couldn't find courses that match your preferences. Try adjusting your preferences or browse all courses."
          action={
            <div className={styles.emptyActions}>
              <Button variant="outline" onClick={() => navigate('/profile')}>
                Adjust Preferences
              </Button>
              <Button variant="primary" onClick={() => navigate('/')}>
                Browse All Courses
              </Button>
            </div>
          }
        />
      )}
    </div>
  );
}

/**
 * BreakdownItem - Single score breakdown row
 */
function BreakdownItem({ label, score, maxScore, reason }) {
  const percentage = (score / maxScore) * 100;
  
  return (
    <div className={styles.breakdownItem}>
      <div className={styles.breakdownHeader}>
        <span className={styles.breakdownLabel}>{label}</span>
        <span className={styles.breakdownScore}>{score}/{maxScore}</span>
      </div>
      <div className={styles.breakdownBar}>
        <div 
          className={styles.breakdownFill} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className={styles.breakdownReason}>{reason}</p>
    </div>
  );
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

