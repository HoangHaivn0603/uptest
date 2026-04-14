import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isSameDay, isBefore, isAfter } from 'date-fns';
import { matchEvents, getSystemReminders } from '../../utils/events';
import { cn } from '../../utils/helpers';

export default function CalendarGrid({ 
  currentDate, 
  days, 
  onDayClick, 
  events,
  onPrevMonth,
  onNextMonth
}) {
  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const prevDateRef = useRef(currentDate);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (isBefore(currentDate, prevDateRef.current)) {
      setDirection(-1); // Going back
    } else if (isAfter(currentDate, prevDateRef.current)) {
      setDirection(1); // Going forward
    }
    prevDateRef.current = currentDate;
  }, [currentDate]);

  const handleDragEnd = (event, info) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      onNextMonth?.();
    } else if (info.offset.x > threshold) {
      onPrevMonth?.();
    }
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : direction < 0 ? -100 : 0,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction > 0 ? -100 : direction < 0 ? 100 : 0,
      opacity: 0
    })
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-center sm:px-2">
          <h2 className="text-lg font-bold font-serif first-letter:capitalize">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
      </div>

      <div className="glass rounded-3xl overflow-hidden shadow-2xl animate-fade-in relative">
        <div className="grid grid-cols-7 bg-traditional-red text-white py-2 text-center text-xs font-bold uppercase tracking-wider z-10 relative">
          {weekDays.map(wd => <div key={wd}>{wd}</div>)}
        </div>
        
        <div className="relative overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div 
              key={format(currentDate, 'yyyy-MM')}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ 
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              whileDrag={{ cursor: 'grabbing' }}
              className="calendar-grid p-2 touch-none"
            >
              {days.map((day, idx) => {
                const isToday = isSameDay(day.date, new Date());
                const hasHoliday = !!day.lunar.holiday;
                
                return (
                  <div 
                    key={idx}
                    onClick={() => onDayClick(day)}
                    className={cn(
                      "day-cell rounded-xl cursor-pointer select-none",
                      !day.isCurrentMonth && "other-month",
                      isToday && "today",
                      hasHoliday && "bg-traditional-red/5"
                    )}
                  >
                    <span className={cn(
                      "text-lg font-semibold",
                      isToday ? "text-traditional-red" : "text-gray-900 dark:text-white",
                      ((idx + 1) % 7 === 0) && "text-red-500"
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
      </div>
    </>
  );
}
