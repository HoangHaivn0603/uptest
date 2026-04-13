import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, CheckCircle2, XCircle, Clock, Compass, Navigation, Star, Bell, Plus, Info, Trash2 } from 'lucide-react';
import { isAuspiciousTruc, get12HoursDetails } from '../../../utils/lunar';
import { getCanChiFromYear, getDirections, getCompatibility, getHourlyCompatibility } from '../../../utils/horoscope';
import { matchEvents, getSystemReminders } from '../../../utils/events';
import { cn, modalVariants, overlayVariants } from '../../../utils/helpers';

export default function DayDetailModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  selectedDetails, 
  userYear, 
  events, 
  onAddEventClick, 
  onDeleteEvent 
}) {
  if (!selectedDetails) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="day-modal"
          variants={overlayVariants}
          initial="hidden" animate="visible" exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
          <motion.div 
            variants={modalVariants}
            className="glass w-full max-w-sm rounded-[2.5rem] overflow-hidden relative shadow-2xl group"
          >
          
          {/* Modal Header */}
          <div className="bg-traditional-red p-6 text-white relative">
            <button 
              onClick={onClose}
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
              <p className="text-lg font-medium">Nam {selectedDetails.lunar.canChiYear}</p>
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

              {/* 12-Hour Timeline (Auspicious/Inauspicious) */}
              <div className="p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-black/20 shadow-inner">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-traditional-gold" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Khung giờ trong ngày</span>
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-traditional-gold/10 text-traditional-gold text-[8px] font-black uppercase tracking-tighter">12 Giờ Can Chi</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {get12HoursDetails(selectedDate).map((h, i) => {
                    const isNow = new Date().toDateString() === selectedDate.toDateString() && 
                                 new Date().getHours() >= h.start && 
                                 (h.end === 1 ? new Date().getHours() >= 23 || new Date().getHours() < 1 : new Date().getHours() < h.end);
                    
                    return (
                      <div key={i} className={cn(
                        "relative p-3 rounded-2xl border transition-all flex flex-col gap-1 overflow-hidden group",
                        isNow ? "border-traditional-red bg-traditional-red/5 ring-1 ring-traditional-red/20" : "border-gray-50 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/30"
                      )}>
                        {isNow && (
                          <div className="absolute top-0 right-0 p-1 bg-traditional-red text-white text-[7px] font-black uppercase tracking-tighter rounded-bl-lg">Hiện tại</div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className={cn("text-xs font-black", h.isLucky ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 opacity-60")}>
                            Giờ {h.name}
                          </span>
                          {h.isLucky ? (
                            <Star className="w-2.5 h-2.5 text-traditional-gold fill-traditional-gold" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 tabular-nums">{h.range}</p>
                        <p className={cn(
                          "text-[8px] font-black uppercase tracking-widest mt-1",
                          h.isLucky ? "text-emerald-500" : "text-gray-400 opacity-40"
                        )}>
                          {h.isLucky ? 'Hoàng Đạo' : 'Hắc Đạo'}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center gap-2 justify-center">
                   <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Tốt</span>
                   </div>
                   <div className="flex items-center gap-1 ml-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Bình thường</span>
                   </div>
                </div>
              </div>

              {/* Directions Section */}
              {(() => {
                const dirs = getDirections(selectedDetails.lunar.canChiDay);
                return dirs ? (
                  <div className="p-5 rounded-[2rem] bg-gradient-to-br from-traditional-gold/5 to-transparent border border-traditional-gold/20 animate-fade-in">
                    <div className="flex items-center gap-2 mb-4">
                      <Compass className="w-4 h-4 text-traditional-gold" />
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Hướng xuất hành</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-traditional-red uppercase tracking-wider">Hỷ Thần</p>
                        <div className="flex items-center gap-2">
                           <Navigation className="w-3 h-3 text-gray-400 rotate-45" />
                           <p className="font-black text-lg">{dirs.hyThan}</p>
                        </div>
                        <p className="text-[9px] text-gray-400">(Tốt cho hỷ sự, niềm vui)</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider">Tài Thần</p>
                        <div className="flex items-center gap-2">
                           <Navigation className="w-3 h-3 text-gray-400" />
                           <p className="font-black text-lg">{dirs.taiThan}</p>
                        </div>
                        <p className="text-[9px] text-gray-400">(Tốt cho tài lộc, kinh doanh)</p>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Compatibility Info */}
              {userYear && (
                <div className="p-5 rounded-3xl bg-traditional-red/5 border border-traditional-red/10 animate-fade-in">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-traditional-red" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Tương thích với bạn</span>
                  </div>
                  {(() => {
                    const userCC = getCanChiFromYear(userYear);
                    if (!userCC) return null;
                    const comp = getCompatibility(userCC.chi, selectedDetails.lunar.canChiDay);
                    if (!comp) return null;
                    return (
                      <div>
                        <p className="text-sm font-bold mb-1">
                          {userCC.fullName} & {selectedDetails.lunar.canChiDay}: 
                          <span className={cn(
                            "ml-2 px-2 py-0.5 rounded-full text-[10px] uppercase",
                            comp.type === 'good' ? "bg-green-500 text-white" : comp.type === 'bad' ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"
                          )}>
                            {comp.label}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">{comp.text}</p>
                      </div>
                    );
                  })()}
                </div>
              )}

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

              {/* Personal Events Section */}
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-traditional-gold" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Sự kiện & Nhắc lịch</span>
                  </div>
                  <button 
                    onClick={onAddEventClick}
                    className="p-1.5 bg-traditional-red text-white rounded-full hover:rotate-90 transition-transform"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* System Reminders */}
                  {getSystemReminders(selectedDetails.lunar).map(sys => (
                    <div key={sys.id} className="flex items-center justify-between p-3 bg-traditional-gold/10 border border-traditional-gold/20 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-traditional-gold" />
                        <span className="text-sm font-bold text-traditional-red-dark uppercase tracking-tight">{sys.title}</span>
                      </div>
                    </div>
                  ))}

                  {/* User Events */}
                  {matchEvents(selectedDate, selectedDetails.lunar, events).map(ev => (
                    <div key={ev.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 animate-slide-up">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{ev.title}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          {ev.type === 'lunar' ? 'Lịch Âm' : 'Lịch Dương'} {ev.isYearly ? '• Hàng năm' : ''}
                        </span>
                      </div>
                      <button 
                        onClick={() => onDeleteEvent(ev.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {matchEvents(selectedDate, selectedDetails.lunar, events).length === 0 && getSystemReminders(selectedDetails.lunar).length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-xs text-gray-400 italic">Chưa có sự kiện nào được tạo.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 text-center">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em]">Tiết {selectedDetails.solarTerm}</p>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}




