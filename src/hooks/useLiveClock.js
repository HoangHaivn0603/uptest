import { useState, useEffect, useMemo } from 'react';
import { getCurrentCanChiHour, get12HoursDetails } from '../utils/lunar';

/**
 * Hook to manage live digital clock and current Zodiac hour tracking.
 */
export function useLiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentCanChi = useMemo(() => getCurrentCanChiHour(now), [now]);
  const day12Hours = useMemo(() => get12HoursDetails(now), [now]);
  
  // Find if current hour is lucky
  const currentHourDetails = day12Hours.find(h => h.name === currentCanChi.name);

  return {
    now,
    currentCanChi,
    isLucky: currentHourDetails?.isLucky || false,
    day12Hours
  };
}
