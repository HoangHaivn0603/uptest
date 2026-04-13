import { useCallback, useEffect, useState } from 'react';
import { deleteEvent, getStoredEvents, replaceStoredEvents, saveEvent } from '../utils/events';
import { getDayDetails } from '../utils/lunar';
import { pullUserData, pushUserEvents } from '../utils/sync';

/**
 * Hook for event management with optional user sync.
 */
export function useEventManager(user, accessToken) {
  const [events, setEvents] = useState(() => getStoredEvents());
  const [newEvent, setNewEvent] = useState({ title: '', type: 'lunar', isYearly: true });

  useEffect(() => {
    let isActive = true;

    const hydrate = async () => {
      if (!user?.id) return;
      const synced = await pullUserData({ userId: user.id, accessToken });
      if (!isActive) return;

      if (Array.isArray(synced.events)) {
        const normalized = replaceStoredEvents(synced.events);
        setEvents(normalized);
      }
    };

    hydrate();

    return () => {
      isActive = false;
    };
  }, [user?.id, accessToken]);

  const handleAddEvent = useCallback((e, selectedDate) => {
    e.preventDefault();
    const details = getDayDetails(selectedDate);
    const eventToSave = {
      ...newEvent,
      day: newEvent.type === 'solar' ? details.solar.date : details.lunar.date,
      month: newEvent.type === 'solar' ? details.solar.month : details.lunar.month,
      year: details.solar.year,
    };

    const nextEvents = saveEvent(eventToSave);
    setEvents(nextEvents);
    setNewEvent({ title: '', type: 'lunar', isYearly: true });

    if (user?.id) {
      void pushUserEvents({ userId: user.id, accessToken, events: nextEvents });
    }

    return { success: true };
  }, [newEvent, user, accessToken]);

  const handleDeleteEvent = useCallback((id) => {
    const nextEvents = deleteEvent(id);
    setEvents(nextEvents);

    if (user?.id) {
      void pushUserEvents({ userId: user.id, accessToken, events: nextEvents });
    }
  }, [user, accessToken]);

  return {
    events,
    newEvent,
    setNewEvent,
    handleAddEvent,
    handleDeleteEvent,
  };
}
