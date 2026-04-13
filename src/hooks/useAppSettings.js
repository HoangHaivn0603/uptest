import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for app-wide settings (dark mode, theme, birth year, PWA install).
 */
export function useAppSettings() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || 
           (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('appTheme') || 'traditional';
  });
  
  const [userYear, setUserYear] = useState(() => localStorage.getItem('userBirthYear') || '');
  
  // PWA
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => (
    window.matchMedia('(display-mode: standalone)').matches
  ));

  // Sync Theme/Dark Mode
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', isDarkMode);

    if (theme === 'traditional') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('appTheme', theme);
  }, [isDarkMode, theme]);

  // PWA install listener
  useEffect(() => {
    const promptHandler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const installHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', promptHandler);
    window.addEventListener('appinstalled', installHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', promptHandler);
      window.removeEventListener('appinstalled', installHandler);
    };
  }, []);

  const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), []);

  const handleSaveSettings = useCallback((e, locationConfig) => {
    e.preventDefault();
    localStorage.setItem('userBirthYear', userYear);
    localStorage.setItem('weatherLocation', JSON.stringify(locationConfig));
    return {
      userYear,
      theme,
      isDarkMode,
      locationConfig,
    };
  }, [userYear, theme, isDarkMode]);

  const getCurrentSettings = useCallback((locationConfig) => {
    return {
      userYear,
      theme,
      isDarkMode,
      locationConfig,
    };
  }, [userYear, theme, isDarkMode]);

  const handleInstallClick = useCallback(async (setIsInstallModalOpen) => {
    if (!deferredPrompt) {
      setIsInstallModalOpen(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  }, [deferredPrompt]);

  return {
    isDarkMode, toggleDarkMode,
    setIsDarkMode,
    theme, setTheme,
    userYear, setUserYear,
    isInstalled,
    getCurrentSettings,
    handleSaveSettings,
    handleInstallClick,
  };
}
