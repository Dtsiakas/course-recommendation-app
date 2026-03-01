/**
 * Loader Component
 * 
 * A reusable loading spinner component.
 * 
 * Props:
 * - size: 'sm' | 'md' | 'lg'
 * - centered: boolean (center in container)
 * - fullScreen: boolean (center in viewport)
 * - text: string (optional loading text)
 */

import styles from './Loader.module.css';

export function Loader({
  size = 'md',
  centered = false,
  fullScreen = false,
  text,
  className = ''
}) {
  const wrapperClassNames = [
    styles.wrapper,
    centered ? styles.centered : '',
    fullScreen ? styles.fullScreen : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClassNames} role="status" aria-live="polite">
      <div className={`${styles.spinner} ${styles[size]}`} aria-hidden="true">
        <div className={styles.circle} />
      </div>
      {text && <p className={styles.text}>{text}</p>}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

