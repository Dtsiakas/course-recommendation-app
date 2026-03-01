/**
 * AuthForm Component
 * 
 * A form component for sign in and sign up.
 * Used inside the auth modal.
 * 
 * Props:
 * - mode: 'signin' | 'signup'
 * - onSuccess: function called after successful auth
 * - onSwitchMode: function to switch between signin/signup
 */

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../Button';
import { Input } from '../Input';
import styles from './AuthForm.module.css';

export function AuthForm({ mode, onSuccess, onSwitchMode }) {
  const { signIn, signUp, error, clearError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Clear auth error when user types
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'signup' && !formData.displayName) {
      errors.displayName = 'Name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    let result;
    if (mode === 'signin') {
      result = await signIn(formData.email, formData.password);
    } else {
      result = await signUp(formData.email, formData.password, formData.displayName);
    }

    setLoading(false);

    if (result.success) {
      onSuccess?.();
    }
  };

  const handleSwitchMode = () => {
    clearError();
    setFormErrors({});
    onSwitchMode?.(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {mode === 'signup' && (
        <Input
          label="Name"
          name="displayName"
          type="text"
          placeholder="Enter your name"
          value={formData.displayName}
          onChange={handleChange}
          error={formErrors.displayName}
          disabled={loading}
          required
        />
      )}

      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleChange}
        error={formErrors.email}
        disabled={loading}
        required
      />

      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleChange}
        error={formErrors.password}
        disabled={loading}
        required
      />

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={loading}
      >
        {mode === 'signin' ? 'Sign In' : 'Create Account'}
      </Button>

      <p className={styles.switchMode}>
        {mode === 'signin' ? (
          <>
            Don&apos;t have an account?{' '}
            <button type="button" onClick={handleSwitchMode} className={styles.switchButton}>
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button type="button" onClick={handleSwitchMode} className={styles.switchButton}>
              Sign in
            </button>
          </>
        )}
      </p>
    </form>
  );
}

