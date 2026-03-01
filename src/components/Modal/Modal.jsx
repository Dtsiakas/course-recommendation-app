/**
 * Modal Component
 * 
 * A reusable modal dialog component with backdrop and focus trap.
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - title: string
 * - children: React nodes
 * - size: 'sm' | 'md' | 'lg'
 * - showCloseButton: boolean
 */

import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Handle escape key
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Focus management and body scroll lock
  useEffect(() => {
    if (isOpen) {
      // Store previous active element
      previousActiveElement.current = document.activeElement;
      
      // Focus the modal
      modalRef.current?.focus();
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Add escape key listener
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Remove escape key listener
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className={styles.backdrop} 
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div 
        ref={modalRef}
        className={`${styles.modal} ${styles[size]}`}
        tabIndex={-1}
      >
        {(title || showCloseButton) && (
          <div className={styles.header}>
            {title && (
              <h2 id="modal-title" className={styles.title}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close modal"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

/**
 * Modal.Footer - Optional footer for action buttons
 */
Modal.Footer = function ModalFooter({ children, className = '' }) {
  return (
    <div className={`${styles.footer} ${className}`}>
      {children}
    </div>
  );
};

// Simple close icon SVG
function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

