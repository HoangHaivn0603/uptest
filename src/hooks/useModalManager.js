import { useState, useCallback } from 'react';

/**
 * Hook to manage all modal open/close states + associated form state.
 */
export function useModalManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isLotteryOpen, setIsLotteryOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Converter sub-state (belongs to ConverterModal)
  const [converterType, setConverterType] = useState('solarToLunar');
  const [convSolar, setConvSolar] = useState({ d: new Date().getDate(), m: new Date().getMonth() + 1, y: new Date().getFullYear() });
  const [convLunar, setConvLunar] = useState({ d: 1, m: 1, y: new Date().getFullYear(), isLeap: false });

  // Close a specific modal by name
  const closeAll = useCallback(() => {
    setIsModalOpen(false);
    setIsSettingsOpen(false);
    setIsAddEventOpen(false);
    setIsConverterOpen(false);
    setIsFinanceOpen(false);
    setIsWeatherModalOpen(false);
    setIsInstallModalOpen(false);
    setIsNewsOpen(false);
    setIsLotteryOpen(false);
    setIsAuthOpen(false);
    setIsChatOpen(false);
  }, []);

  return {
    isModalOpen, setIsModalOpen,
    isSettingsOpen, setIsSettingsOpen,
    isAddEventOpen, setIsAddEventOpen,
    isConverterOpen, setIsConverterOpen,
    isFinanceOpen, setIsFinanceOpen,
    isWeatherModalOpen, setIsWeatherModalOpen,
    isInstallModalOpen, setIsInstallModalOpen,
    isNewsOpen, setIsNewsOpen,
    isLotteryOpen, setIsLotteryOpen,
    isAuthOpen, setIsAuthOpen,
    isChatOpen, setIsChatOpen,
    converterType, setConverterType,
    convSolar, setConvSolar,
    convLunar, setConvLunar,
    closeAll,
  };
}
