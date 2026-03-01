/**
 * RatingForm Component
 * 
 * Form for rating a course on multiple criteria.
 */

import { useState } from 'react';
import { Button } from '../../components';
import styles from './RatingForm.module.css';

const RATING_CRITERIA = [
  { key: 'quality', label: 'Overall Quality', description: 'How would you rate the overall quality of this course?' },
  { key: 'clarity', label: 'Clarity', description: 'How clear and easy to understand was the content?' },
  { key: 'difficulty', label: 'Difficulty Accuracy', description: 'Did the actual difficulty match the stated level?' },
  { key: 'depth', label: 'Depth of Content', description: 'How thorough and comprehensive was the material?' },
  { key: 'durationSatisfaction', label: 'Duration Value', description: 'Was the course length appropriate for the content?' }
];

export function RatingForm({ initialValues, onSubmit, onCancel }) {
  const [ratings, setRatings] = useState({
    quality: initialValues?.quality || 0,
    clarity: initialValues?.clarity || 0,
    difficulty: initialValues?.difficulty || 0,
    depth: initialValues?.depth || 0,
    durationSatisfaction: initialValues?.durationSatisfaction || 0
  });
  const [comment, setComment] = useState(initialValues?.comment || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRatingChange = (key, value) => {
    setRatings(prev => ({ ...prev, [key]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that all ratings are set
    const unrated = RATING_CRITERIA.filter(c => ratings[c.key] === 0);
    if (unrated.length > 0) {
      setError('Please rate all criteria before submitting.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ ...ratings, comment });
    } catch (err) {
      setError('Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {RATING_CRITERIA.map(criteria => (
        <div key={criteria.key} className={styles.criteriaGroup}>
          <div className={styles.criteriaHeader}>
            <span className={styles.criteriaLabel}>{criteria.label}</span>
            <span className={styles.criteriaValue}>
              {ratings[criteria.key] > 0 ? ratings[criteria.key] : '-'}
            </span>
          </div>
          <p className={styles.criteriaDescription}>{criteria.description}</p>
          <div className={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(value => (
              <button
                key={value}
                type="button"
                className={`${styles.star} ${value <= ratings[criteria.key] ? styles.starActive : ''}`}
                onClick={() => handleRatingChange(criteria.key, value)}
                aria-label={`Rate ${criteria.label} ${value} out of 5`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className={styles.commentGroup}>
        <label htmlFor="comment" className={styles.commentLabel}>
          Additional Comments (optional)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this course..."
          className={styles.commentInput}
          rows={3}
        />
      </div>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <div className={styles.actions}>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {initialValues ? 'Update Rating' : 'Submit Rating'}
        </Button>
      </div>
    </form>
  );
}

