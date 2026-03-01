/**
 * NotFound Page (404)
 * 
 * Displayed when a user navigates to a non-existent route.
 */

import { Link } from 'react-router-dom';
import { Button } from '../../components';
import styles from './NotFound.module.css';

export function NotFound() {
  return (
    <div className={styles.notFound}>
      <div className={styles.content}>
        <span className={styles.errorCode}>404</span>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.message}>
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className={styles.actions}>
          <Link to="/">
            <Button variant="primary">Back to Discover</Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
      <div className={styles.illustration}>
        📚❓
      </div>
    </div>
  );
}

