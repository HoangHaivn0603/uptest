import { useState, useCallback, createContext, useContext } from 'react';

/**
 * Toast Context for global notifications
 */
const ToastContext = createContext(null);

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider');
  return ctx;
}

export { ToastContext };

/**
 * Custom hook to manage toast notifications.
 * Supports success, error, warning, info types.
 * Auto-dismisses after 4 seconds, stacks up to 3 toasts.
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = crypto.randomUUID();
    setToasts(prev => {
      const next = [...prev, { id, message, type, duration }];
      // Keep max 3 toasts visible
      return next.length > 3 ? next.slice(-3) : next;
    });

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
