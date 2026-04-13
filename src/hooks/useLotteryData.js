import { useState, useCallback } from 'react';
import { fetchLotteryResults, getCachedLotteryResults } from '../utils/lottery';

/**
 * Hook for lottery results data management.
 */
export function useLotteryData() {
  const [lotteryData, setLotteryData] = useState(null);
  const [isRefreshingLottery, setIsRefreshingLottery] = useState(false);
  const [lotteryUpdatedAt, setLotteryUpdatedAt] = useState(null);
  const [isLotteryCached, setIsLotteryCached] = useState(false);

  const handleRefreshLottery = useCallback(async () => {
    setIsRefreshingLottery(true);

    const cached = getCachedLotteryResults();
    const hasCached = Boolean(cached?.data);
    if (hasCached) {
      setLotteryData(cached.data);
      setLotteryUpdatedAt(cached.updatedAt || null);
      setIsLotteryCached(true);
      setIsRefreshingLottery(false);
    }

    try {
      const data = await fetchLotteryResults();
      if (data) {
        setLotteryData(data);
        setLotteryUpdatedAt(Date.now());
        setIsLotteryCached(false);
        return { success: true };
      }
      if (hasCached) {
        return { success: true, stale: true };
      }
      return { success: false, error: 'Không thể tải kết quả xổ số.' };
    } catch (error) {
      console.error('Lottery refresh error:', error);
      return { success: false, error: 'Không thể tải kết quả xổ số.' };
    } finally {
      setTimeout(() => setIsRefreshingLottery(false), 500);
    }
  }, []);

  return {
    lotteryData,
    isRefreshingLottery,
    lotteryUpdatedAt,
    isLotteryCached,
    handleRefreshLottery,
  };
}
