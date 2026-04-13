import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isSameDay } from 'date-fns';
import { matchEvents, getSystemReminders } from '../../utils/events';
import { cn } from '../../utils/helpers';

export default function CalendarGrid({ 
  currentDate, 
  days, 
  onDayClick, 
  events 
}) {
  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <>
      <div className="mb-6 flex justify-between items-center sm:px-2">
          <h2 className="text-lg font-bold font-serif first-letter:capitalize">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
      </div>

      <div className="glass rounded-3xl overflow-hidden shadow-2xl animate-fade-in">
        <div className="grid grid-cols-7 bg-traditional-red text-white py-2 text-center text-xs font-bold uppercase tracking-wider">
          {weekDays.map(wd => <div key={wd}>{wd}</div>)}
        </div>
        <AnimatePresence mode="wait">
          <motion.div 
            key={format(currentDate, 'yyyy-MM')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="calendar-grid p-2"
          >
            {days.map((day, idx) => {
              const isToday = isSameDay(day.date, new Date());
              const hasHoliday = !!day.lunar.holiday;
              
              return (
                <div 
                  key={idx}
                  onClick={() => onDayClick(day)}
                  className={cn(
                    "day-cell rounded-xl",
                    !day.isCurrentMonth && "other-month",
                    isToday && "today",
                    hasHoliday && "bg-traditional-red/5"
                  )}
                >
                  <span className={cn(
                    "text-lg font-semibold",
                    isToday ? "text-traditional-red" : "text-gray-900 dark:text-white",
                    ((idx + 1) % 7 === 0) && "text-red-500" // Note: Index based check for Sunday (T2=0...CN=6)
                  )}>
                    {format(day.date, 'd')}
                  </span>
                  <span className={cn(
                    "text-[10px] font-medium mt-1 leading-none",
                    hasHoliday ? "text-traditional-red font-bold" : "text-gray-500 dark:text-gray-400"
                  )}>
                    {day.lunar.date === 1 ? `${day.lunar.date}/${day.lunar.month}` : day.lunar.date}
                  </span>
                  {day.lunar.isLeap && (
                    <span className="absolute top-1 right-1 text-[8px] px-1 bg-traditional-gold text-traditional-red-dark rounded-full font-bold">N</span>
                  )}
                  <div className="flex gap-0.5 mt-1">
                    {hasHoliday && (
                      <div className="w-1 h-1 bg-traditional-red rounded-full"></div>
                    )}
                    {matchEvents(day.date, day.lunar, events).length > 0 && (
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                    )}
                    {getSystemReminders(day.lunar).length > 0 && (
                      <div className="w-1 h-1 bg-traditional-gold rounded-full"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
