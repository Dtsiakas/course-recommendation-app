/**
 * Favorites Context
 * 
 * Provides shared favorites state across the application.
 * Allows immediate UI updates when favorites change.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch favorites count
  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setFavoritesCount(0);
      return;
    }

    setLoading(true);
    try {
      const favorites = await userService.getFavorites(user.uid);
      setFavoritesCount(favorites.length);
    } catch (err) {
      console.error('Error fetching favorites count:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Fetch on mount and when auth changes
  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  // Increment count (optimistic update)
  const incrementCount = useCallback(() => {
    setFavoritesCount(prev => prev + 1);
  }, []);

  // Decrement count (optimistic update)
  const decrementCount = useCallback(() => {
    setFavoritesCount(prev => Math.max(0, prev - 1));
  }, []);

  const value = {
    favoritesCount,
    loading,
    refreshFavorites,
    incrementCount,
    decrementCount
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

