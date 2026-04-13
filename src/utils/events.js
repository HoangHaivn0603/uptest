/**
 * Event Management Utility
 * Supports Solar and Lunar event matching and storage
 */

export const getStoredEvents = () => {
  const events = localStorage.getItem('viet-lunar-events');
  return events ? JSON.parse(events) : [];
};

export const replaceStoredEvents = (events) => {
  const normalized = Array.isArray(events) ? events : [];
  localStorage.setItem('viet-lunar-events', JSON.stringify(normalized));
  return normalized;
};

export const saveEvent = (event) => {
  const events = getStoredEvents();
  const newEvents = [...events, { ...event, id: crypto.randomUUID() }];
  localStorage.setItem('viet-lunar-events', JSON.stringify(newEvents));
  return newEvents;
};

export const deleteEvent = (id) => {
  const events = getStoredEvents();
  const newEvents = events.filter(e => e.id !== id);
  localStorage.setItem('viet-lunar-events', JSON.stringify(newEvents));
  return newEvents;
};

/**
 * Checks if a given day matches any stored events
 */
export const matchEvents = (solarDate, lunarDate, storedEvents) => {
  return storedEvents.filter(event => {
    if (event.type === 'solar') {
      const isDayMatch = event.day === solarDate.getDate();
      const isMonthMatch = event.month === (solarDate.getMonth() + 1);
      const isYearMatch = event.isYearly ? true : event.year === solarDate.getFullYear();
      return isDayMatch && isMonthMatch && isYearMatch;
    } else {
      // Lunar event matching
      const isDayMatch = event.day === lunarDate.date;
      const isMonthMatch = event.month === lunarDate.month;
      // Lunar events are almost always yearly in practice (e.g. Giỗ)
      return isDayMatch && isMonthMatch;
    }
  });
};

/**
 * Pre-defined lunar reminders (Rằm, Mồng 1)
 */
export const getSystemReminders = (lunarDate) => {
  const reminders = [];
  if (lunarDate.date === 1) {
    reminders.push({ id: 'sys-m1', title: 'Mồng một', type: 'system' });
  } else if (lunarDate.date === 15) {
    reminders.push({ id: 'sys-r15', title: 'Ngày rằm', type: 'system' });
  }
  return reminders;
};
