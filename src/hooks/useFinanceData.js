import { useState, useCallback } from 'react';
import {
  getGoldPrices,
  getGoldHistory,
  getExchangeRates,
  getBankInterestRates,
  getCachedGoldPrices,
  getCachedGoldHistory,
  getCachedExchangeRates,
  getCachedBankRates,
} from '../utils/finance';

function hasUsableFinanceRows(rows) {
  return Array.isArray(rows) && rows.some((item) => item?.buy && item?.sell && item.buy !== '---' && item.sell !== '---');
}

/**
 * Hook for financial data (gold prices + history + exchange rates + bank interest rates).
 */
export function useFinanceData() {
  const [goldPrices, setGoldPrices] = useState([]);
  const [goldHistory, setGoldHistory] = useState({});
  const [exchangeRates, setExchangeRates] = useState([]);
  const [bankRates, setBankRates] = useState([]);
  const [isRefreshingFinance, setIsRefreshingFinance] = useState(false);
  const [financeType, setFinanceType] = useState('gold');
  const [isFinanceLive, setIsFinanceLive] = useState({ gold: true, rates: true, bankRates: false });
  const [financeUpdatedAt, setFinanceUpdatedAt] = useState(null);
  const [isFinanceCached, setIsFinanceCached] = useState(false);

  const handleRefreshFinance = useCallback(async () => {
    setIsRefreshingFinance(true);

    const cachedGold = getCachedGoldPrices();
    const cachedHistory = getCachedGoldHistory();
    const cachedRates = getCachedExchangeRates();
    const cachedBank = getCachedBankRates();

    if (cachedGold?.data) setGoldPrices(cachedGold.data);
    if (cachedHistory) setGoldHistory(cachedHistory);
    if (cachedRates?.data) setExchangeRates(cachedRates.data);
    if (cachedBank?.data) setBankRates(cachedBank.data);

    if (cachedGold || cachedRates || cachedBank) {
      setIsFinanceCached(true);
      setFinanceUpdatedAt(Math.max(cachedGold?.updatedAt || 0, cachedRates?.updatedAt || 0));
      setIsRefreshingFinance(false);
    }

    try {
      // Fetch everything
      const [goldRes, historyRes, ratesRes, bankRes] = await Promise.all([
        getGoldPrices(),
        getGoldHistory(7),
        getExchangeRates(),
        getBankInterestRates(),
      ]);

      const hasUsableCachedGold = hasUsableFinanceRows(cachedGold?.data);
      const hasUsableCachedRates = hasUsableFinanceRows(cachedRates?.data);

      const keepCachedGold = !goldRes.isLive && hasUsableCachedGold;
      const keepCachedRates = !ratesRes.isLive && hasUsableCachedRates;

      setGoldPrices(keepCachedGold ? cachedGold.data : goldRes.data);
      setExchangeRates(keepCachedRates ? cachedRates.data : ratesRes.data);
      setBankRates(bankRes.data);
      
      if (historyRes.isLive) {
        setGoldHistory(historyRes.data);
      }

      setIsFinanceLive({ 
        gold: keepCachedGold ? true : goldRes.isLive, 
        rates: keepCachedRates ? true : ratesRes.isLive, 
        bankRates: bankRes.isLive 
      });
      setIsFinanceCached(keepCachedGold || keepCachedRates);

      const fetchedAt = Date.now();
      setFinanceUpdatedAt(fetchedAt);

      return { success: true };
    } catch (error) {
      console.error('Finance refresh error:', error);
      return { success: false, error: 'Lỗi tải dữ liệu tài chính.' };
    } finally {
      setTimeout(() => setIsRefreshingFinance(false), 500);
    }
  }, []);

  return {
    goldPrices,
    goldHistory,
    exchangeRates,
    bankRates,
    isRefreshingFinance,
    financeType,
    setFinanceType,
    isFinanceLive,
    financeUpdatedAt,
    isFinanceCached,
    handleRefreshFinance,
  };
}
