/**
 * CourseDetails Page
 * 
 * Displays detailed information about a single course.
 * Allows authenticated users to rate and favorite courses.
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourse } from '../../hooks/useCourses';
import { useAuth } from '../../hooks/useAuth';
import { useFavorites } from '../../context/FavoritesContext';
import { userService } from '../../services/userService';
import { Button, Card, Loader, EmptyState, Modal } from '../../components';
import { RatingForm } from './RatingForm';
import styles from './CourseDetails.module.css';

export function CourseDetails() {
  const { id } = useParams();
  const { course, loading, error } = useCourse(id);
  const { user, isAuthenticated } = useAuth();
  const { incrementCount, decrementCount } = useFavorites();
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [userEvaluation, setUserEvaluation] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch favorite status and evaluations
  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      // Fetch evaluations for this course
      const courseEvaluations = await userService.getCourseEvaluations(id);
      setEvaluations(courseEvaluations);

      // If user is authenticated, check favorite status and user's evaluation
      if (user) {
        const favoriteStatus = await userService.isFavorite(user.uid, id);
        setIsFavorite(favoriteStatus);

        const existingEvaluation = await userService.getUserEvaluation(user.uid, id);
        setUserEvaluation(existingEvaluation);

        // Track view
        await userService.trackView(user.uid, id);
      }
    }

    fetchData();
  }, [id, user]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    setFavoriteLoading(true);
    setHeartAnimating(true);
    
    try {
      if (isFavorite) {
        await userService.removeFavorite(user.uid, id);
        setIsFavorite(false);
        decrementCount(); // Update header badge immediately
      } else {
        await userService.addFavorite(user.uid, id);
        setIsFavorite(true);
        incrementCount(); // Update header badge immediately
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setFavoriteLoading(false);
      setTimeout(() => setHeartAnimating(false), 300);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  const handleRateClick = () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async (ratingData) => {
    await userService.saveEvaluation(user.uid, id, ratingData);
    
    // Refresh evaluations
    const updatedEvaluations = await userService.getCourseEvaluations(id);
    setEvaluations(updatedEvaluations);
    
    // Update user's evaluation
    const updatedUserEval = await userService.getUserEvaluation(user.uid, id);
    setUserEvaluation(updatedUserEval);
    
    setShowRatingModal(false);
  };

  // Calculate average ratings
  const averageRatings = calculateAverageRatings(evaluations);

  if (loading) {
    return <Loader centered text="Loading course..." />;
  }

  if (error || !course) {
    return (
      <EmptyState
        icon={<EmptyState.BookIcon />}
        title="Course not found"
        message="The course you're looking for doesn't exist or has been removed."
        action={<Link to="/"><Button>Browse Courses</Button></Link>}
      />
    );
  }

  return (
    <div className={styles.courseDetails}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link to="/" className={styles.breadcrumbLink}>Discover</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{course.title}</span>
      </nav>

      <div className={styles.content}>
        {/* Main Content */}
        <div className={styles.mainSection}>
          {/* Course Header */}
          <div className={styles.courseHeader}>
            <div className={styles.courseMeta}>
              <span className={styles.platform}>{course.platform}</span>
              <span className={`${styles.difficulty} ${styles[`difficulty${capitalize(course.difficulty)}`]}`}>
                {course.difficulty}
              </span>
            </div>
            <h1 className={styles.title}>{course.title}</h1>
            <p className={styles.instructor}>by {course.instructor}</p>
          </div>

          {/* Course Image */}
          {course.thumbnailUrl && (
            <div className={styles.imageWrapper}>
              <img src={course.thumbnailUrl} alt={course.title} className={styles.image} />
            </div>
          )}

          {/* Description */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>About this course</h2>
            <p className={styles.description}>{course.description}</p>
          </section>

          {/* Technologies */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Technologies covered</h2>
            <div className={styles.technologies}>
              {course.technologies.map(tech => (
                <span key={tech} className={styles.techBadge}>{tech}</span>
              ))}
            </div>
          </section>

          {/* Ratings Section */}
          <section className={styles.section}>
            <div className={styles.ratingsHeader}>
              <h2 className={styles.sectionTitle}>Course Ratings</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRateClick}
              >
                {userEvaluation ? 'Update Rating' : 'Rate Course'}
              </Button>
            </div>

            {evaluations.length > 0 ? (
              <div className={styles.ratingsGrid}>
                <RatingDisplay label="Quality" value={averageRatings.quality} />
                <RatingDisplay label="Clarity" value={averageRatings.clarity} />
                <RatingDisplay label="Difficulty" value={averageRatings.difficulty} />
                <RatingDisplay label="Depth" value={averageRatings.depth} />
                <RatingDisplay label="Duration Satisfaction" value={averageRatings.durationSatisfaction} />
              </div>
            ) : (
              <p className={styles.noRatings}>No ratings yet. Be the first to rate this course!</p>
            )}

            {evaluations.length > 0 && (
              <p className={styles.ratingCount}>Based on {evaluations.length} rating{evaluations.length !== 1 ? 's' : ''}</p>
            )}

            {/* User Reviews with Comments */}
            {evaluations.filter(e => e.comment).length > 0 && (
              <div className={styles.reviewsSection}>
                <h3 className={styles.reviewsTitle}>
                  Reviews ({evaluations.filter(e => e.comment).length})
                </h3>
                <div className={styles.reviewsList}>
                  {evaluations.filter(e => e.comment).map((evaluation) => {
                    const avgScore = (
                      (evaluation.quality || 0) +
                      (evaluation.clarity || 0) +
                      (evaluation.depth || 0) +
                      (evaluation.durationSatisfaction || 0)
                    ) / 4;
                    
                    return (
                      <div key={evaluation.id} className={styles.reviewCard}>
                        <div className={styles.reviewHeader}>
                          <span className={styles.reviewScore}>⭐ {avgScore.toFixed(1)}</span>
                          {evaluation.createdAt && (
                            <span className={styles.reviewDate}>
                              {new Date(evaluation.createdAt.toDate()).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className={styles.reviewComment}>{evaluation.comment}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <Card padding="lg" className={styles.actionCard}>
            <div className={styles.courseStats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{course.durationHours}h</span>
                <span className={styles.statLabel}>Duration</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{capitalize(course.depth)}</span>
                <span className={styles.statLabel}>Depth</span>
              </div>
            </div>

            <div className={styles.actions}>
              <Button
                variant="primary"
                fullWidth
                onClick={() => window.open(course.externalUrl, '_blank')}
              >
                <span className={styles.externalLink}>
                  View on {course.platform}
                  <span className={styles.externalIcon}>↗</span>
                </span>
              </Button>
              <Button
                variant={isFavorite ? 'secondary' : 'outline'}
                fullWidth
                onClick={handleFavoriteToggle}
                loading={favoriteLoading}
                className={heartAnimating ? styles.heartAnimating : ''}
              >
                <span className={`${styles.heartIcon} ${isFavorite ? styles.heartFilled : ''}`}>
                  {isFavorite ? '❤️' : '🤍'}
                </span>
                {isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={handleShare}
              >
                {copied ? '✓ Link Copied!' : '🔗 Share Course'}
              </Button>
            </div>
          </Card>
        </aside>
      </div>

      {/* Rating Modal */}
      <Modal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        title={userEvaluation ? 'Update Your Rating' : 'Rate This Course'}
        size="md"
      >
        <RatingForm
          initialValues={userEvaluation}
          onSubmit={handleRatingSubmit}
          onCancel={() => setShowRatingModal(false)}
        />
      </Modal>

      {/* Auth Prompt Modal */}
      <Modal
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        title="Sign in required"
        size="sm"
      >
        <p>Please sign in to save favorites and rate courses.</p>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setShowAuthPrompt(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

/**
 * RatingDisplay - Shows a single rating metric
 */
function RatingDisplay({ label, value }) {
  const percentage = (value / 5) * 100;
  
  return (
    <div className={styles.ratingItem}>
      <div className={styles.ratingLabel}>{label}</div>
      <div className={styles.ratingBar}>
        <div className={styles.ratingFill} style={{ width: `${percentage}%` }} />
      </div>
      <div className={styles.ratingValue}>{value.toFixed(1)}</div>
    </div>
  );
}

/**
 * Calculate average ratings from evaluations
 */
function calculateAverageRatings(evaluations) {
  if (evaluations.length === 0) {
    return { quality: 0, clarity: 0, difficulty: 0, depth: 0, durationSatisfaction: 0 };
  }

  const totals = evaluations.reduce((acc, eval_) => ({
    quality: acc.quality + (eval_.quality || 0),
    clarity: acc.clarity + (eval_.clarity || 0),
    difficulty: acc.difficulty + (eval_.difficulty || 0),
    depth: acc.depth + (eval_.depth || 0),
    durationSatisfaction: acc.durationSatisfaction + (eval_.durationSatisfaction || 0)
  }), { quality: 0, clarity: 0, difficulty: 0, depth: 0, durationSatisfaction: 0 });

  const count = evaluations.length;
  return {
    quality: totals.quality / count,
    clarity: totals.clarity / count,
    difficulty: totals.difficulty / count,
    depth: totals.depth / count,
    durationSatisfaction: totals.durationSatisfaction / count
  };
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

