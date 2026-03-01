/**
 * ProtectedRoute Component
 * 
 * A wrapper component that protects routes requiring authentication.
 * Redirects to home page if user is not authenticated.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../Loader';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loader while checking auth state
  if (loading) {
    return <Loader fullScreen text="Loading..." />;
  }

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/" state={{ from: location, requireAuth: true }} replace />;
  }

  return children;
}

