/**
 * Header Component
 * 
 * Main navigation header for the application.
 * Shows different options based on authentication state.
 */

import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFavorites } from '../../context/FavoritesContext';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { AuthForm } from '../AuthForm';
import styles from './Header.module.css';

export function Header() {
  const { user, isAuthenticated, signOut } = useAuth();
  const { favoritesCount } = useFavorites();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  // Close mobile menu when route changes
  const handleMobileNavClick = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  // Apply theme on mount and changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleSignOut = async () => {
    await signOut();
    setShowSignOutConfirm(false);
    navigate('/');
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setMobileMenuOpen(false);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContent}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>📚</span>
          <span className={styles.logoText}>CourseMatch</span>
        </Link>

        {/* Navigation */}
        <nav className={styles.nav}>
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            Discover
          </NavLink>
          
          {isAuthenticated && (
            <>
              <NavLink 
                to="/recommendations" 
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
              >
                For You
              </NavLink>
              <NavLink 
                to="/favorites" 
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
              >
                Favorites
                {favoritesCount > 0 && (
                  <span className={styles.badge}>{favoritesCount}</span>
                )}
              </NavLink>
            </>
          )}
        </nav>

        {/* Auth Actions (Desktop) */}
        <div className={styles.actions}>
          {/* Dark Mode Toggle */}
          <button 
            className={styles.themeToggle}
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          
          {isAuthenticated ? (
            <>
              <NavLink 
                to="/profile" 
                className={({ isActive }) => 
                  `${styles.profileLink} ${isActive ? styles.active : ''}`
                }
              >
                <span className={styles.avatar}>
                  {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className={styles.userName}>
                  {user?.displayName || 'Profile'}
                </span>
              </NavLink>
              <Button variant="ghost" size="sm" onClick={() => setShowSignOutConfirm(true)}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => openAuthModal('signin')}
              >
                Sign In
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => openAuthModal('signup')}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={styles.mobileMenuBtn}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className={`${styles.hamburger} ${mobileMenuOpen ? styles.hamburgerOpen : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <nav className={styles.mobileNav}>
          <button 
            className={styles.mobileNavLink}
            onClick={() => handleMobileNavClick('/')}
          >
            Discover
          </button>
          
          {isAuthenticated ? (
            <>
              <button 
                className={styles.mobileNavLink}
                onClick={() => handleMobileNavClick('/recommendations')}
              >
                For You
              </button>
              <button 
                className={styles.mobileNavLink}
                onClick={() => handleMobileNavClick('/favorites')}
              >
                Favorites {favoritesCount > 0 && `(${favoritesCount})`}
              </button>
              <button 
                className={styles.mobileNavLink}
                onClick={() => handleMobileNavClick('/profile')}
              >
                Profile
              </button>
              <div className={styles.mobileDivider} />
              <button 
                className={styles.mobileNavLink}
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowSignOutConfirm(true);
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <div className={styles.mobileDivider} />
              <button 
                className={styles.mobileNavLink}
                onClick={() => openAuthModal('signin')}
              >
                Sign In
              </button>
              <button 
                className={`${styles.mobileNavLink} ${styles.mobileNavPrimary}`}
                onClick={() => openAuthModal('signup')}
              >
                Sign Up
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Auth Modal */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={authMode === 'signin' ? 'Sign In' : 'Create Account'}
        size="sm"
      >
        <AuthForm 
          mode={authMode} 
          onSuccess={handleAuthSuccess}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      </Modal>

      {/* Sign Out Confirmation Modal */}
      <Modal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        title="Sign Out"
        size="sm"
      >
        <p className={styles.confirmText}>Are you sure you want to sign out?</p>
        <div className={styles.confirmActions}>
          <Button variant="outline" onClick={() => setShowSignOutConfirm(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </Modal>
    </header>
  );
}

