/**
 * Select Component
 * 
 * A reusable select dropdown component with label and error states.
 * 
 * Props:
 * - label: string
 * - options: Array<{ value: string, label: string }>
 * - value: string | string[] (for multiple)
 * - onChange: function
 * - error: string
 * - disabled: boolean
 * - required: boolean
 * - multiple: boolean
 * - placeholder: string
 * - id: string
 * - name: string
 */

import { forwardRef } from 'react';
import styles from './Select.module.css';

export const Select = forwardRef(function Select({
  label,
  options = [],
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  multiple = false,
  placeholder = 'Select an option',
  id,
  name,
  className = '',
  ...props
}, ref) {
  const selectId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`${styles.selectGroup} ${className}`}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.selectWrapper}>
        <select
          ref={ref}
          id={selectId}
          name={name || selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          multiple={multiple}
          className={`${styles.select} ${error ? styles.selectError : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {!multiple && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {!multiple && <span className={styles.arrow} aria-hidden="true" />}
      </div>
      {error && (
        <span id={`${selectId}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

