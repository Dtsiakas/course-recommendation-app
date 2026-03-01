/**
 * Card Component
 * 
 * A reusable card container component.
 * 
 * Props:
 * - children: React nodes
 * - onClick: function (makes card clickable)
 * - hoverable: boolean
 * - padding: 'none' | 'sm' | 'md' | 'lg'
 * - className: string
 */

import styles from './Card.module.css';

export function Card({
  children,
  onClick,
  hoverable = false,
  padding = 'md',
  className = '',
  ...props
}) {
  const Component = onClick ? 'button' : 'div';
  
  const classNames = [
    styles.card,
    styles[`padding-${padding}`],
    hoverable || onClick ? styles.hoverable : '',
    onClick ? styles.clickable : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <Component
      className={classNames}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * Card.Header - Optional header section
 */
Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`${styles.header} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card.Body - Main content section
 */
Card.Body = function CardBody({ children, className = '' }) {
  return (
    <div className={`${styles.body} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card.Footer - Optional footer section
 */
Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`${styles.footer} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card.Image - Image section for cards
 */
Card.Image = function CardImage({ src, alt, className = '' }) {
  return (
    <div className={`${styles.imageWrapper} ${className}`}>
      <img src={src} alt={alt} className={styles.image} />
    </div>
  );
};

