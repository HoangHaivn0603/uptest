import { useEffect } from 'react';
import { useCalendarNavigation } from './useCalendarNavigation';
import { useWeatherData } from './useWeatherData';
import { useFinanceData } from './useFinanceData';
import { useNewsData } from './useNewsData';
import { useLotteryData } from './useLotteryData';
import { useEventManager } from './useEventManager';
import { useAppSettings } from './useAppSettings';
import { useModalManager } from './useModalManager';
import { getDayDetails } from '../utils/lunar';
import { pullUserData, pushUserSettings } from '../utils/sync';

/**
 * Orchestrator hook that composes all sub-hooks into a single API.
 */
export function useCalendarLogic(addToast, auth = {}) {
  const { user, accessToken } = auth;

  const nav = useCalendarNavigation();
  const weather = useWeatherData();
  const finance = useFinanceData();
  const news = useNewsData();
  const lottery = useLotteryData();
  const eventMgr = useEventManager(user, accessToken);
  const settings = useAppSettings();
  const modals = useModalManager();

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      const financeResult = await finance.handleRefreshFinance();
      if (financeResult && !financeResult.success && addToast) {
        addToast(financeResult.error, 'warning');
      }
    };
    loadInitialData();
    lottery.handleRefreshLottery();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Hydrate user-scoped settings after login.
  useEffect(() => {
    let isActive = true;

    const hydrateUserSettings = async () => {
      if (!user?.id) return;

      const synced = await pullUserData({ userId: user.id, accessToken });
      if (!isActive || !synced.settings) return;

      const syncedSettings = synced.settings;
      if (Object.prototype.hasOwnProperty.call(syncedSettings, 'userYear')) {
        settings.setUserYear(String(syncedSettings.userYear || ''));
      }
      if (typeof syncedSettings.theme === 'string' && syncedSettings.theme) {
        settings.setTheme(syncedSettings.theme);
      }
      if (typeof syncedSettings.isDarkMode === 'boolean') {
        settings.setIsDarkMode(syncedSettings.isDarkMode);
      }
      if (syncedSettings.locationConfig && typeof syncedSettings.locationConfig === 'object') {
        weather.setLocationConfig(syncedSettings.locationConfig);
      }
    };

    hydrateUserSettings();

    return () => {
      isActive = false;
    };
  }, [user?.id, accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lazy-load: fetch news when modal opens
  useEffect(() => {
    if (modals.isNewsOpen && news.newsArticles.length === 0) {
      news.handleRefreshNews();
    }
  }, [modals.isNewsOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lazy-load: fetch lottery when modal opens
  useEffect(() => {
    if (modals.isLotteryOpen && !lottery.lotteryData) {
      lottery.handleRefreshLottery();
    }
  }, [modals.isLotteryOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lazy-load: fetch finance when modal opens
  useEffect(() => {
    if (modals.isFinanceOpen && finance.goldPrices.length === 0) {
      finance.handleRefreshFinance();
    }
  }, [modals.isFinanceOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Wrapped handlers that integrate toasts
  const handleRefreshFinance = async () => {
    const result = await finance.handleRefreshFinance();
    if (result && !result.success && addToast) {
      addToast(result.error, 'warning');
    }
  };

  const handleRefreshNews = async () => {
    const result = await news.handleRefreshNews();
    if (result && !result.success && addToast) {
      addToast(result.error, 'error');
    }
  };

  const handleRefreshLottery = async () => {
    const result = await lottery.handleRefreshLottery();
    if (result && !result.success && addToast) {
      addToast(result.error, 'error');
    }
  };

  const handleDayClick = (day) => {
    nav.setSelectedDate(day.date);
    modals.setIsModalOpen(true);
  };

  const handleAddEvent = (e) => {
    const result = eventMgr.handleAddEvent(e, nav.selectedDate);
    modals.setIsAddEventOpen(false);
    if (result.success && addToast) {
      addToast('Đã thêm sự kiện thành công!', 'success');
    }
  };

  const handleSaveSettings = (e) => {
    const payload = settings.handleSaveSettings(e, weather.locationConfig);

    if (user?.id) {
      void pushUserSettings({
        userId: user.id,
        accessToken,
        settings: payload,
      });
    }

    modals.setIsSettingsOpen(false);
    if (addToast) addToast('Đã lưu cài đặt!', 'success');
  };

  const handleInstallClick = () => {
    settings.handleInstallClick(modals.setIsInstallModalOpen);
  };

  const todayDetails = getDayDetails(nav.selectedDate);

  return {
    // Navigation
    currentDate: nav.currentDate,
    selectedDate: nav.selectedDate,
    todayDetails,
    days: nav.days,
    handlePrevMonth: nav.handlePrevMonth,
    handleNextMonth: nav.handleNextMonth,
    handleToday: nav.handleToday,
    handleDayClick,

    // Weather
    weather: weather.weather,
    aqiData: weather.aqiData,
    loadingWeather: weather.loadingWeather,
    locationName: weather.locationName,
    locationConfig: weather.locationConfig,
    setLocationConfig: weather.setLocationConfig,
    searchQuery: weather.searchQuery,
    setSearchQuery: weather.setSearchQuery,
    searchResults: weather.searchResults,
    isSearching: weather.isSearching,
    handleRefreshWeather: weather.handleRefreshWeather,

    // Finance
    goldPrices: finance.goldPrices,
    goldHistory: finance.goldHistory,
    exchangeRates: finance.exchangeRates,
    bankRates: finance.bankRates,
    isRefreshingFinance: finance.isRefreshingFinance,
    financeType: finance.financeType,
    setFinanceType: finance.setFinanceType,
    isFinanceLive: finance.isFinanceLive,
    financeUpdatedAt: finance.financeUpdatedAt,
    isFinanceCached: finance.isFinanceCached,
    handleRefreshFinance,

    // News
    newsArticles: news.newsArticles,
    isRefreshingNews: news.isRefreshingNews,
    newsUpdatedAt: news.newsUpdatedAt,
    isNewsCached: news.isNewsCached,
    handleRefreshNews,

    // Lottery
    lotteryData: lottery.lotteryData,
    isRefreshingLottery: lottery.isRefreshingLottery,
    lotteryUpdatedAt: lottery.lotteryUpdatedAt,
    isLotteryCached: lottery.isLotteryCached,
    handleRefreshLottery,

    // Events
    events: eventMgr.events,
    newEvent: eventMgr.newEvent,
    setNewEvent: eventMgr.setNewEvent,
    handleAddEvent,
    handleDeleteEvent: eventMgr.handleDeleteEvent,

    // Settings
    isDarkMode: settings.isDarkMode,
    toggleDarkMode: settings.toggleDarkMode,
    theme: settings.theme,
    setTheme: settings.setTheme,
    userYear: settings.userYear,
    setUserYear: settings.setUserYear,
    isInstalled: settings.isInstalled,
    handleSaveSettings,
    handleInstallClick,

    // Modals
    isModalOpen: modals.isModalOpen,
    setIsModalOpen: modals.setIsModalOpen,
    isSettingsOpen: modals.isSettingsOpen,
    setIsSettingsOpen: modals.setIsSettingsOpen,
    isAddEventOpen: modals.isAddEventOpen,
    setIsAddEventOpen: modals.setIsAddEventOpen,
    isConverterOpen: modals.isConverterOpen,
    setIsConverterOpen: modals.setIsConverterOpen,
    isFinanceOpen: modals.isFinanceOpen,
    setIsFinanceOpen: modals.setIsFinanceOpen,
    isWeatherModalOpen: modals.isWeatherModalOpen,
    setIsWeatherModalOpen: modals.setIsWeatherModalOpen,
    isInstallModalOpen: modals.isInstallModalOpen,
    setIsInstallModalOpen: modals.setIsInstallModalOpen,
    isNewsOpen: modals.isNewsOpen,
    setIsNewsOpen: modals.setIsNewsOpen,
    isLotteryOpen: modals.isLotteryOpen,
    setIsLotteryOpen: modals.setIsLotteryOpen,
    isAuthOpen: modals.isAuthOpen,
    setIsAuthOpen: modals.setIsAuthOpen,
    isChatOpen: modals.isChatOpen,
    setIsChatOpen: modals.setIsChatOpen,
    converterType: modals.converterType,
    setConverterType: modals.setConverterType,
    convSolar: modals.convSolar,
    setConvSolar: modals.setConvSolar,
    convLunar: modals.convLunar,
    setConvLunar: modals.setConvLunar,
  };
}
