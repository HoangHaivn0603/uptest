import React, { lazy, Suspense, useEffect } from 'react';
import { getDayDetails } from '../utils/lunar';
import { getNextHoliday } from '../utils/holidays';
import { useCalendarLogic } from '../hooks/useCalendarLogic';
import { useAuth } from '../hooks/useAuth';
import { useToastContext } from '../hooks/useToast';

// UI Components
import CalendarHeader from './Calendar/CalendarHeader';
import CalendarGrid from './Calendar/CalendarGrid';
import NavigationPanel from './Calendar/NavigationPanel';
import { TodayWidget, WisdomCard, PersonalizedForecast, FinanceStats, LotteryWidget } from './Calendar/Widgets';

// Modals (lazy-loaded for faster initial load)
const loadDayDetailModal = () => import('./Calendar/Modals/DayDetailModal');
const loadWeatherModal = () => import('./Calendar/Modals/WeatherModal');

const DayDetailModal = lazy(loadDayDetailModal);
const AddEventModal = lazy(() => import('./Calendar/Modals/AddEventModal'));
const ConverterModal = lazy(() => import('./Calendar/Modals/ConverterModal'));
const FinanceModal = lazy(() => import('./Calendar/Modals/FinanceModal'));
const WeatherModal = lazy(loadWeatherModal);
const SettingsModal = lazy(() => import('./Calendar/Modals/SettingsModal'));
const InstallModal = lazy(() => import('./Calendar/Modals/InstallModal'));
const NewsModal = lazy(() => import('./Calendar/Modals/NewsModal'));
const LotteryModal = lazy(() => import('./Calendar/Modals/LotteryModal'));
const AuthModal = lazy(() => import('./Calendar/Modals/AuthModal'));
const AIChatModal = lazy(() => import('./Calendar/Modals/AIChatModal'));
const ChatFAB = lazy(() => import('./Calendar/Modals/AIChatModal').then(m => ({ default: m.ChatFAB })));

export default function Calendar() {
  const { addToast } = useToastContext();
  const { user, accessToken, login, register, logout, isLoading: isAuthLoading } = useAuth();

  const {
    // State
    currentDate,
    selectedDate,
    days,
    todayDetails,
    isModalOpen, setIsModalOpen,
    isDarkMode, toggleDarkMode,
    theme, setTheme,
    events,
    weather, loadingWeather, aqiData, locationName,
    isInstalled, isInstallModalOpen, setIsInstallModalOpen,
    userYear, setUserYear,
    isSettingsOpen, setIsSettingsOpen,
    isAddEventOpen, setIsAddEventOpen,
    isConverterOpen, setIsConverterOpen,
    isFinanceOpen, setIsFinanceOpen,
    isWeatherModalOpen, setIsWeatherModalOpen,
    isNewsOpen, setIsNewsOpen,
    locationConfig, setLocationConfig,
    searchQuery, setSearchQuery,
    searchResults, isSearching,
    isRefreshingFinance,
    isRefreshingNews,
    isRefreshingLottery,
    newsArticles,
    newsUpdatedAt,
    isNewsCached,
    lotteryData,
    lotteryUpdatedAt,
    isLotteryCached,
    goldPrices,
    goldHistory,
    exchangeRates,
    bankRates,
    financeType, setFinanceType,
    isFinanceLive,
    financeUpdatedAt,
    isFinanceCached,
    isLotteryOpen, setIsLotteryOpen,
    isAuthOpen, setIsAuthOpen,
    isChatOpen, setIsChatOpen,
    converterType, setConverterType,
    convSolar, setConvSolar,
    convLunar, setConvLunar,
    newEvent, setNewEvent,

    // Handlers
    handlePrevMonth,
    handleNextMonth,
    handleToday,
    handleDayClick,
    handleAddEvent,
    handleDeleteEvent,
    handleSaveSettings,
    handleRefreshWeather,
    handleRefreshFinance,
    handleRefreshNews,
    handleRefreshLottery,
    handleInstallClick,
  } = useCalendarLogic(addToast, { user, accessToken });

  useEffect(() => {
    const prefetch = () => {
      void loadDayDetailModal();
      void loadWeatherModal();
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(prefetch, { timeout: 1500 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timer = window.setTimeout(prefetch, 800);
    return () => window.clearTimeout(timer);
  }, []);

  const selectedDetails = getDayDetails(selectedDate);
  const nextHoliday = getNextHoliday();

  return (
    <div className="min-h-screen pb-20 max-w-md mx-auto relative px-4">
      {/* Header */}
      <CalendarHeader 
        isInstalled={isInstalled}
        onInstallClick={handleInstallClick}
        weather={weather}
        aqiData={aqiData}
        locationName={locationName}
        loadingWeather={loadingWeather}
        onRefreshWeather={handleRefreshWeather}
        onWeatherClick={() => setIsWeatherModalOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onNewsClick={() => setIsNewsOpen(true)}
        onFinanceClick={() => setIsFinanceOpen(true)}
        onLotteryClick={() => setIsLotteryOpen(true)}
        user={user}
        onAuthClick={() => user ? logout() : setIsAuthOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Widgets */}
      <TodayWidget 
        weather={weather}
        aqiData={aqiData}
        locationName={locationName}
        nextHoliday={nextHoliday}
        onWeatherClick={() => setIsWeatherModalOpen(true)}
      />

      <WisdomCard />

      <PersonalizedForecast userYear={userYear} />

      <FinanceStats 
        goldPrices={goldPrices}
        exchangeRates={exchangeRates}
        isFinanceLive={isFinanceLive}
        onFinanceClick={() => setIsFinanceOpen(true)}
      />

      <LotteryWidget 
        lotteryData={lotteryData}
        onLotteryClick={() => setIsLotteryOpen(true)}
      />

      {/* Main Calendar View */}
      <CalendarGrid 
        currentDate={currentDate}
        days={days}
        onDayClick={handleDayClick}
        events={events}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      {/* Bottom Navigation */}
      <NavigationPanel 
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />

      {/* Modals Container */}
      <Suspense fallback={null}>
        <DayDetailModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedDate={selectedDate}
          selectedDetails={selectedDetails}
          userYear={userYear}
          events={events}
          onAddEventClick={() => setIsAddEventOpen(true)}
          onDeleteEvent={handleDeleteEvent}
        />

        <AddEventModal 
          isOpen={isAddEventOpen}
          onClose={() => setIsAddEventOpen(false)}
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          onAddEvent={handleAddEvent}
        />

        <ConverterModal 
          isOpen={isConverterOpen}
          onClose={() => setIsConverterOpen(false)}
          converterType={converterType}
          setConverterType={setConverterType}
          convSolar={convSolar}
          setConvSolar={setConvSolar}
          convLunar={convLunar}
          setConvLunar={setConvLunar}
          onViewDate={(date) => {
            if (date && !isNaN(date.getTime())) {
              handleDayClick({ date });
              setIsConverterOpen(false);
            }
          }}
        />

        <FinanceModal 
          isOpen={isFinanceOpen}
          onClose={() => setIsFinanceOpen(false)}
          financeType={financeType}
          setFinanceType={setFinanceType}
          goldPrices={goldPrices}
          goldHistory={goldHistory}
          exchangeRates={exchangeRates}
          bankRates={bankRates}
          isRefreshing={isRefreshingFinance}
          onRefresh={handleRefreshFinance}
          isFinanceLive={isFinanceLive}
          updatedAt={financeUpdatedAt}
          isCached={isFinanceCached}
        />

        <WeatherModal 
          isOpen={isWeatherModalOpen}
          onClose={() => setIsWeatherModalOpen(false)}
          weather={weather}
          aqiData={aqiData}
        />

        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          userYear={userYear}
          setUserYear={setUserYear}
          locationConfig={locationConfig}
          setLocationConfig={setLocationConfig}
          theme={theme}
          setTheme={setTheme}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          onSave={handleSaveSettings}
        />

        <InstallModal 
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
        />

        <NewsModal 
          isOpen={isNewsOpen}
          onClose={() => setIsNewsOpen(false)}
          articles={newsArticles}
          isRefreshing={isRefreshingNews}
          onRefresh={handleRefreshNews}
          updatedAt={newsUpdatedAt}
          isCached={isNewsCached}
        />

        <LotteryModal 
          isOpen={isLotteryOpen}
          onClose={() => setIsLotteryOpen(false)}
          lotteryData={lotteryData}
          isRefreshing={isRefreshingLottery}
          onRefresh={handleRefreshLottery}
          updatedAt={lotteryUpdatedAt}
          isCached={isLotteryCached}
        />

        <AuthModal 
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLogin={login}
          onRegister={register}
          isLoading={isAuthLoading}
        />

        <AIChatModal 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          appData={{
            weather,
            goldPrices,
            exchangeRates,
            todayDetails
          }}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ChatFAB onClick={() => setIsChatOpen(true)} />
      </Suspense>
    </div>
  );
}
