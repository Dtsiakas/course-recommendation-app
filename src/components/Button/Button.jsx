/**
 * Button Component
 * 
 * A reusable button component with multiple variants and sizes.
 * 
 * Props:
 * - variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 * - size: 'sm' | 'md' | 'lg'
 * - disabled: boolean
 * - loading: boolean
 * - fullWidth: boolean
 * - type: 'button' | 'submit' | 'reset'
 * - onClick: function
 * - children: React nodes
 */

import styles from './Button.module.css';

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  onClick,
  children,
  className = '',
  ...props
}) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      <span className={loading ? styles.hiddenText : ''}>{children}</span>
    </button>
  );
}

