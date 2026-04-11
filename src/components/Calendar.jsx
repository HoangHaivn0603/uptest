import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Sun, 
  Moon, 
  Info, 
  X,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { format, addMonths, subMonths, isSameDay } from 'date-fns';
import { getMonthDays, getDayDetails, isAuspiciousTruc } from '../utils/lunar';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [days, setDays] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    setDays(getMonthDays(year, month));
  }, [currentDate]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleDayClick = (day) => {
    setSelectedDate(day.date);
    setIsModalOpen(true);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const selectedDetails = getDayDetails(selectedDate);

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="min-h-screen pb-20 max-w-md mx-auto relative px-4">
      {/* Header */}
      <header className="py-6 flex justify-between items-center bg-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-traditional-red flex items-center justify-center shadow-lg transform rotate-3">
             <CalendarIcon className="text-traditional-gold w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-traditional-red dark:text-traditional-gold tracking-tight">
            Lịch Việt
          </h1>
        </div>
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-full glass hover:scale-110 transition-transform"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-traditional-gold" /> : <Moon className="w-5 h-5 text-traditional-red" />}
        </button>
      </header>

      {/* Control Panel */}
      <div className="glass rounded-2xl p-4 mb-6 sticky top-4 z-40 transition-all duration-300">
        <div className="flex justify-between items-center mb-0">
          <div className="flex items-center gap-1 group cursor-pointer">
            <h2 className="text-xl font-bold font-serif first-letter:capitalize">
              Tháng {format(currentDate, 'M')}, {format(currentDate, 'yyyy')}
            </h2>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={handleToday} className="px-3 py-1 font-semibold text-sm rounded-lg border border-traditional-red/20 hover:bg-traditional-red/5 transition-colors">
              Hôm nay
            </button>
            <button onClick={handleNextMonth} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass rounded-3xl overflow-hidden shadow-2xl animate-fade-in">
        <div className="grid grid-cols-7 bg-traditional-red text-white py-2 text-center text-xs font-bold uppercase tracking-wider">
          {weekDays.map(wd => <div key={wd}>{wd}</div>)}
        </div>
        <div className="calendar-grid p-2">
          {days.map((day, idx) => {
            const isToday = isSameDay(day.date, new Date());
            const hasHoliday = !!day.lunar.holiday;
            
            return (
              <div 
                key={idx}
                onClick={() => handleDayClick(day)}
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
                  (idx % 7 === 6) && "text-red-500" // Chủ nhật
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
                {hasHoliday && (
                  <div className="absolute bottom-1 w-1 h-1 bg-traditional-red rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Info Card */}
      <div className="mt-6 glass rounded-2xl p-5 border-l-4 border-l-traditional-red shadow-lg animate-slide-up">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-secondary text-xs uppercase font-bold tracking-widest mb-1">Hôm nay: {format(new Date(), 'dd/MM/yyyy')}</p>
            <p className="text-lg font-bold font-serif">
              {getDayDetails(new Date()).lunar.canChiDay}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Giờ: {getDayDetails(new Date()).lunar.canChiHour}
            </p>
          </div>
          <div className="text-right">
             <span className="text-xs font-bold px-2 py-1 bg-traditional-red text-white rounded-full">
               Tiết {getDayDetails(new Date()).solarTerm}
             </span>
          </div>
        </div>
      </div>

      {/* Day Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="glass w-full max-w-sm rounded-[2.5rem] overflow-hidden relative shadow-2xl transform scale-100 group">
            
            {/* Modal Header */}
            <div className="bg-traditional-red p-6 text-white relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <p className="text-sm font-medium text-white/80 mb-1">{selectedDetails.solar.dayOfWeek === 0 ? 'Chủ Nhật' : `Thứ ${selectedDetails.solar.dayOfWeek + 1}`}</p>
                <h3 className="text-6xl font-black mb-1 drop-shadow-lg">{selectedDetails.solar.date}</h3>
                <p className="text-lg font-bold">Tháng {selectedDetails.solar.month} Năm {selectedDetails.solar.year}</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              
              {/* Lunar Section */}
              <div className="text-center mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
                <div className="inline-flex items-center gap-2 mb-2">
                   <Moon className="w-4 h-4 text-traditional-red" />
                   <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Âm Lịch</span>
                </div>
                <p className="text-3xl font-serif font-bold text-traditional-red dark:text-traditional-gold mb-1">
                  Ngày {selectedDetails.lunar.date} tháng {selectedDetails.lunar.month} {selectedDetails.lunar.isLeap ? '(Nhuận)' : ''}
                </p>
                <p className="text-lg font-medium">Năm {selectedDetails.lunar.canChiYear}</p>
                {selectedDetails.holiday && (
                  <div className="mt-3 px-4 py-2 bg-traditional-red text-white rounded-xl inline-block font-bold text-sm shadow-md">
                    {selectedDetails.holiday}
                  </div>
                )}
              </div>

              {/* Details Grid */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-3xl bg-traditional-red/5 border border-traditional-red/10">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Can chi ngày</p>
                    <p className="font-bold text-base">{selectedDetails.lunar.canChiDay}</p>
                  </div>
                  <div className="p-4 rounded-3xl bg-traditional-red/5 border border-traditional-red/10">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Can chi tháng</p>
                    <p className="font-bold text-base">{selectedDetails.lunar.canChiMonth}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-3xl bg-traditional-gold/10 border border-traditional-gold/20">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                    isAuspiciousTruc(selectedDetails.truc) ? "bg-green-500/20" : "bg-red-500/20"
                  )}>
                    {isAuspiciousTruc(selectedDetails.truc) ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Trực:</span>
                       <span className="font-black text-lg text-traditional-red">{selectedDetails.truc}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      Ngày {isAuspiciousTruc(selectedDetails.truc) ? 'Hoàng Đạo (Tốt)' : 'Hắc Đạo (Xấu)'}
                    </p>
                  </div>
                </div>

                {/* Lucky Hours */}
                <div className="p-5 rounded-3xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-traditional-gold" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Giờ Hoàng Đạo</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDetails.luckyHours.split(', ').map((hour, i) => (
                      <span key={i} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold">
                        {hour}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Info List */}
                <div className="space-y-4">
                   <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Nên làm:</p>
                        <p className="text-sm">Cúng bái, cầu phúc, giải oan, thẩm mỹ, chữa bệnh.</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5"></div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Kiêng kỵ:</p>
                        <p className="text-sm">Kiện tụng, tranh chấp, làm việc đại sự, chuyển nhà.</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 text-center">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em]">Tiết {selectedDetails.solarTerm}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
