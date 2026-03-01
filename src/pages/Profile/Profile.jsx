/**
 * Profile Page
 * 
 * Allows users to manage their profile and preferences.
 * Protected route - requires authentication.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { courseService } from '../../services/courseService';
import { Button, Input, Select, Card, Loader, Modal } from '../../components';
import styles from './Profile.module.css';

// Available options for preferences - all 121 technologies from courses
const TECHNOLOGY_OPTIONS = [
  { value: '.NET', label: '.NET' },
  { value: 'AWS', label: 'AWS' },
  { value: 'After Effects', label: 'After Effects' },
  { value: 'Agile', label: 'Agile' },
  { value: 'Airflow', label: 'Airflow' },
  { value: 'Android', label: 'Android' },
  { value: 'Angular', label: 'Angular' },
  { value: 'Ansible', label: 'Ansible' },
  { value: 'Azure', label: 'Azure' },
  { value: 'Bash', label: 'Bash' },
  { value: 'Blender', label: 'Blender' },
  { value: 'Blockchain', label: 'Blockchain' },
  { value: 'Bootstrap', label: 'Bootstrap' },
  { value: 'C#', label: 'C#' },
  { value: 'C++', label: 'C++' },
  { value: 'CSS', label: 'CSS' },
  { value: 'Cypress', label: 'Cypress' },
  { value: 'Dart', label: 'Dart' },
  { value: 'Databricks', label: 'Databricks' },
  { value: 'DevOps', label: 'DevOps' },
  { value: 'Django', label: 'Django' },
  { value: 'Docker', label: 'Docker' },
  { value: 'Elasticsearch', label: 'Elasticsearch' },
  { value: 'Ethereum', label: 'Ethereum' },
  { value: 'Excel', label: 'Excel' },
  { value: 'Express', label: 'Express' },
  { value: 'FastAPI', label: 'FastAPI' },
  { value: 'Figma', label: 'Figma' },
  { value: 'Firebase', label: 'Firebase' },
  { value: 'Flask', label: 'Flask' },
  { value: 'Flutter', label: 'Flutter' },
  { value: 'GCP', label: 'GCP' },
  { value: 'Git', label: 'Git' },
  { value: 'GitHub', label: 'GitHub' },
  { value: 'Go', label: 'Go' },
  { value: 'Google Analytics', label: 'Google Analytics' },
  { value: 'Grafana', label: 'Grafana' },
  { value: 'GraphQL', label: 'GraphQL' },
  { value: 'HTML', label: 'HTML' },
  { value: 'Hibernate', label: 'Hibernate' },
  { value: 'Illustrator', label: 'Illustrator' },
  { value: 'JWT', label: 'JWT' },
  { value: 'Java', label: 'Java' },
  { value: 'JavaScript', label: 'JavaScript' },
  { value: 'Jenkins', label: 'Jenkins' },
  { value: 'Jest', label: 'Jest' },
  { value: 'Jira', label: 'Jira' },
  { value: 'Kafka', label: 'Kafka' },
  { value: 'Kotlin', label: 'Kotlin' },
  { value: 'Kubernetes', label: 'Kubernetes' },
  { value: 'LLMs', label: 'LLMs' },
  { value: 'LangChain', label: 'LangChain' },
  { value: 'Laravel', label: 'Laravel' },
  { value: 'Linux', label: 'Linux' },
  { value: 'Matplotlib', label: 'Matplotlib' },
  { value: 'MongoDB', label: 'MongoDB' },
  { value: 'MySQL', label: 'MySQL' },
  { value: 'NGINX', label: 'NGINX' },
  { value: 'NLTK', label: 'NLTK' },
  { value: 'NestJS', label: 'NestJS' },
  { value: 'Networking', label: 'Networking' },
  { value: 'Next.js', label: 'Next.js' },
  { value: 'Node.js', label: 'Node.js' },
  { value: 'NumPy', label: 'NumPy' },
  { value: 'Nuxt.js', label: 'Nuxt.js' },
  { value: 'OAuth', label: 'OAuth' },
  { value: 'OpenAI', label: 'OpenAI' },
  { value: 'OpenCV', label: 'OpenCV' },
  { value: 'PHP', label: 'PHP' },
  { value: 'Pandas', label: 'Pandas' },
  { value: 'Photoshop', label: 'Photoshop' },
  { value: 'Playwright', label: 'Playwright' },
  { value: 'PostgreSQL', label: 'PostgreSQL' },
  { value: 'Postman', label: 'Postman' },
  { value: 'Power BI', label: 'Power BI' },
  { value: 'Premiere Pro', label: 'Premiere Pro' },
  { value: 'Prisma', label: 'Prisma' },
  { value: 'Prometheus', label: 'Prometheus' },
  { value: 'Puppet', label: 'Puppet' },
  { value: 'PyTorch', label: 'PyTorch' },
  { value: 'Python', label: 'Python' },
  { value: 'REST API', label: 'REST API' },
  { value: 'RabbitMQ', label: 'RabbitMQ' },
  { value: 'React', label: 'React' },
  { value: 'React Native', label: 'React Native' },
  { value: 'Redis', label: 'Redis' },
  { value: 'Redux', label: 'Redux' },
  { value: 'Rust', label: 'Rust' },
  { value: 'RxJS', label: 'RxJS' },
  { value: 'SEO', label: 'SEO' },
  { value: 'SQL', label: 'SQL' },
  { value: 'SQL Server', label: 'SQL Server' },
  { value: 'Sass', label: 'Sass' },
  { value: 'Scala', label: 'Scala' },
  { value: 'Scrapy', label: 'Scrapy' },
  { value: 'Selenium', label: 'Selenium' },
  { value: 'Shopify', label: 'Shopify' },
  { value: 'Snowflake', label: 'Snowflake' },
  { value: 'Solidity', label: 'Solidity' },
  { value: 'Spark', label: 'Spark' },
  { value: 'Spring', label: 'Spring' },
  { value: 'Supabase', label: 'Supabase' },
  { value: 'Svelte', label: 'Svelte' },
  { value: 'Swift', label: 'Swift' },
  { value: 'System Design', label: 'System Design' },
  { value: 'Tableau', label: 'Tableau' },
  { value: 'Tailwind CSS', label: 'Tailwind CSS' },
  { value: 'TensorFlow', label: 'TensorFlow' },
  { value: 'Terraform', label: 'Terraform' },
  { value: 'Three.js', label: 'Three.js' },
  { value: 'TypeScript', label: 'TypeScript' },
  { value: 'Unity', label: 'Unity' },
  { value: 'Unreal Engine', label: 'Unreal Engine' },
  { value: 'VBA', label: 'VBA' },
  { value: 'Vue', label: 'Vue' },
  { value: 'Vuex', label: 'Vuex' },
  { value: 'WebGL', label: 'WebGL' },
  { value: 'WebSockets', label: 'WebSockets' },
  { value: 'WordPress', label: 'WordPress' },
  { value: 'dbt', label: 'dbt' },
  { value: 'iOS', label: 'iOS' }
];

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner - I\'m just starting out' },
  { value: 'intermediate', label: 'Intermediate - I have some experience' },
  { value: 'advanced', label: 'Advanced - I want deep technical content' }
];

const DEPTH_OPTIONS = [
  { value: 'overview', label: 'Overview - Quick introduction' },
  { value: 'standard', label: 'Standard - Balanced coverage' },
  { value: 'comprehensive', label: 'Comprehensive - In-depth learning' }
];

const DURATION_OPTIONS = [
  { value: 'short', label: 'Short - Under 5 hours' },
  { value: 'medium', label: 'Medium - 5 to 20 hours' },
  { value: 'long', label: 'Long - Over 20 hours' }
];

export function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [myRatings, setMyRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // rating to delete
  const [deleting, setDeleting] = useState(false);
  
  const [preferences, setPreferences] = useState({
    technologies: [],
    difficulty: '',
    depth: '',
    duration: ''
  });

  // Fetch existing preferences
  useEffect(() => {
    async function fetchPreferences() {
      if (!user) return;
      
      try {
        const data = await userService.getPreferences(user.uid);
        if (data) {
          setPreferences({
            technologies: data.technologies || [],
            difficulty: data.difficulty || '',
            depth: data.depth || '',
            duration: data.duration || ''
          });
        }
      } catch (err) {
        console.error('Error fetching preferences:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPreferences();
  }, [user]);

  // Fetch user's ratings
  useEffect(() => {
    async function fetchMyRatings() {
      if (!user) return;
      
      try {
        setRatingsLoading(true);
        const evaluations = await userService.getUserEvaluations(user.uid);
        
        // Fetch course details for each evaluation
        const ratingsWithCourses = await Promise.all(
          evaluations.map(async (evaluation) => {
            const course = await courseService.getCourseById(evaluation.courseId);
            if (!course) return null;
            
            // Calculate average of user's ratings
            const avgRating = (
              (evaluation.quality || 0) +
              (evaluation.clarity || 0) +
              (evaluation.depth || 0) +
              (evaluation.durationSatisfaction || 0)
            ) / 4;
            
            return {
              ...evaluation,
              course,
              avgRating: avgRating.toFixed(1)
            };
          })
        );
        
        setMyRatings(ratingsWithCourses.filter(Boolean));
      } catch (err) {
        console.error('Error fetching ratings:', err);
      } finally {
        setRatingsLoading(false);
      }
    }

    fetchMyRatings();
  }, [user]);

  // Delete rating handler
  const handleDeleteRating = async () => {
    if (!deleteConfirm) return;
    
    setDeleting(true);
    try {
      await userService.deleteEvaluation(deleteConfirm.id);
      setMyRatings(prev => prev.filter(r => r.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting rating:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleTechnologyChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setPreferences(prev => ({ ...prev, technologies: selected }));
  };

  const handleChange = (field) => (e) => {
    setPreferences(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await userService.savePreferences(user.uid, preferences);
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
    } catch (err) {
      console.error('Error saving preferences:', err);
      setMessage({ type: 'error', text: 'Failed to save preferences. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const isPreferencesComplete = 
    preferences.technologies.length > 0 &&
    preferences.difficulty &&
    preferences.depth &&
    preferences.duration;

  if (loading) {
    return <Loader centered text="Loading profile..." />;
  }

  return (
    <div className={styles.profile}>
      <div className={styles.header}>
        <h1 className={styles.title}>Profile & Preferences</h1>
        <p className={styles.subtitle}>
          Customize your preferences to get personalized course recommendations
        </p>
      </div>

      <div className={styles.content}>
        {/* User Info Section */}
        <Card padding="lg" className={styles.section}>
          <h2 className={styles.sectionTitle}>Account Information</h2>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{user?.displayName || 'User'}</p>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* Preferences Form */}
        <Card padding="lg" className={styles.section}>
          <h2 className={styles.sectionTitle}>Learning Preferences</h2>
          <p className={styles.sectionDescription}>
            Tell us about your learning preferences to receive better course recommendations.
          </p>

          <form onSubmit={handleSave} className={styles.form}>
            {/* Technologies */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Technologies of Interest
                <span className={styles.hint}>Hold Ctrl/Cmd to select multiple</span>
              </label>
              <select
                multiple
                value={preferences.technologies}
                onChange={handleTechnologyChange}
                className={styles.multiSelect}
              >
                {TECHNOLOGY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {preferences.technologies.length > 0 && (
                <div className={styles.selectedTags}>
                  {preferences.technologies.map(tech => (
                    <span key={tech} className={styles.tag}>{tech}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Difficulty */}
            <Select
              label="Preferred Difficulty Level"
              options={DIFFICULTY_OPTIONS}
              value={preferences.difficulty}
              onChange={handleChange('difficulty')}
              placeholder="Select your preferred difficulty"
            />

            {/* Depth */}
            <Select
              label="Content Depth"
              options={DEPTH_OPTIONS}
              value={preferences.depth}
              onChange={handleChange('depth')}
              placeholder="Select content depth preference"
            />

            {/* Duration */}
            <Select
              label="Preferred Course Duration"
              options={DURATION_OPTIONS}
              value={preferences.duration}
              onChange={handleChange('duration')}
              placeholder="Select preferred duration"
            />

            {message.text && (
              <div className={`${styles.message} ${styles[message.type]}`}>
                {message.text}
              </div>
            )}

            <div className={styles.formActions}>
              <Button 
                type="submit" 
                variant="primary" 
                loading={saving}
                disabled={!isPreferencesComplete}
              >
                Save Preferences
              </Button>
              {!isPreferencesComplete && (
                <p className={styles.incomplete}>
                  Please complete all preferences to enable recommendations
                </p>
              )}
            </div>
          </form>
        </Card>

        {/* Recommendations Status */}
        <Card padding="lg" className={styles.section}>
          <h2 className={styles.sectionTitle}>Recommendation Status</h2>
          {isPreferencesComplete ? (
            <div className={styles.statusComplete}>
              <span className={styles.statusIcon}>✓</span>
              <div>
                <p className={styles.statusTitle}>You're all set!</p>
                <p className={styles.statusText}>
                  Your preferences are configured. Visit the <strong>For You</strong> page to see personalized recommendations.
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.statusIncomplete}>
              <span className={styles.statusIcon}>!</span>
              <div>
                <p className={styles.statusTitle}>Complete your preferences</p>
                <p className={styles.statusText}>
                  Fill in all preferences above to unlock personalized course recommendations.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* My Ratings Section */}
        <Card padding="lg" className={styles.section}>
          <div className={styles.ratingsHeader}>
            <h2 className={styles.sectionTitle}>
              My Ratings {myRatings.length > 0 && `(${myRatings.length})`}
            </h2>
          </div>
          
          {ratingsLoading ? (
            <div className={styles.ratingsLoading}>Loading your ratings...</div>
          ) : myRatings.length > 0 ? (
            <div className={styles.ratingsList}>
              {myRatings.map((rating) => (
                <div key={rating.id} className={styles.ratingCard}>
                  <div 
                    className={styles.ratingClickable}
                    onClick={() => navigate(`/course/${rating.courseId}`)}
                  >
                    <div className={styles.ratingCourseInfo}>
                      {rating.course.thumbnailUrl && (
                        <img 
                          src={rating.course.thumbnailUrl} 
                          alt="" 
                          className={styles.ratingThumbnail}
                        />
                      )}
                      <div className={styles.ratingCourseDetails}>
                        <h4 className={styles.ratingCourseTitle}>{rating.course.title}</h4>
                        <p className={styles.ratingCourseMeta}>
                          {rating.course.platform} • {rating.course.instructor}
                        </p>
                      </div>
                    </div>
                    <div className={styles.ratingScores}>
                      <div className={styles.ratingAvg}>
                        <span className={styles.ratingAvgValue}>⭐ {rating.avgRating}</span>
                        <span className={styles.ratingAvgLabel}>avg</span>
                      </div>
                      <div className={styles.ratingBreakdown}>
                        <span>Quality: {rating.quality || '-'}</span>
                        <span>Clarity: {rating.clarity || '-'}</span>
                        <span>Depth: {rating.depth || '-'}</span>
                        <span>Duration: {rating.durationSatisfaction || '-'}</span>
                      </div>
                    </div>
                  </div>
                  {rating.comment && (
                    <div className={styles.ratingComment}>
                      <span className={styles.ratingCommentLabel}>Your review:</span>
                      <p className={styles.ratingCommentText}>"{rating.comment}"</p>
                    </div>
                  )}
                  <div className={styles.ratingActions}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/course/${rating.courseId}`);
                      }}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={styles.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(rating);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noRatings}>
              <p className={styles.noRatingsText}>
                You haven't rated any courses yet.
              </p>
              <p className={styles.noRatingsHint}>
                Browse courses and share your feedback to help other learners!
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                Discover Courses
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Rating"
        size="sm"
      >
        <p className={styles.deleteConfirmText}>
          Are you sure you want to delete your rating for <strong>{deleteConfirm?.course?.title}</strong>?
        </p>
        <p className={styles.deleteConfirmHint}>
          This will remove your review and it will no longer influence your recommendations.
        </p>
        <div className={styles.deleteConfirmActions}>
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleDeleteRating}
            loading={deleting}
            className={styles.deleteConfirmBtn}
          >
            Delete Rating
          </Button>
        </div>
      </Modal>
    </div>
  );
}

