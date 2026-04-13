import { useState, useEffect } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { getMonthDays } from '../utils/lunar';

/**
 * Hook for calendar navigation (month prev/next, today, day selection).
 */
export function useCalendarNavigation() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [days, setDays] = useState([]);

  useEffect(() => {
    setDays(getMonthDays(currentDate.getFullYear(), currentDate.getMonth() + 1));
  }, [currentDate]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  return {
    currentDate, setCurrentDate,
    selectedDate, setSelectedDate,
    days,
    handlePrevMonth,
    handleNextMonth,
    handleToday,
  };
}
