/**
 * Input Component
 * 
 * A reusable input component with label and error states.
 * 
 * Props:
 * - label: string
 * - type: 'text' | 'email' | 'password' | 'number' | 'search'
 * - placeholder: string
 * - value: string
 * - onChange: function
 * - error: string (error message)
 * - disabled: boolean
 * - required: boolean
 * - id: string
 * - name: string
 */

import { forwardRef } from 'react';
import styles from './Input.module.css';

export const Input = forwardRef(function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  id,
  name,
  className = '',
  ...props
}, ref) {
  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`${styles.inputGroup} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        name={name || inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

