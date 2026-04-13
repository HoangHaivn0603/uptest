import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { getDaysInMonth } from 'date-fns';
import { solarToLunar, lunarToSolar } from '../../../utils/lunar';
import { cn, modalVariants, overlayVariants } from '../../../utils/helpers';

export default function ConverterModal({ 
  isOpen, 
  onClose, 
  converterType, 
  setConverterType, 
  convSolar, 
  setConvSolar, 
  convLunar, 
  setConvLunar, 
  onViewDate 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="converter-modal"
          variants={overlayVariants}
          initial="hidden" animate="visible" exit="exit"
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
          <motion.div 
            variants={modalVariants}
            className="glass w-full max-w-sm rounded-[2rem] p-6 relative shadow-2xl border border-white/20"
          >
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold font-serif text-traditional-red">Chuyển đổi ngày</h4>
              <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-6">
              <button 
                onClick={() => setConverterType('solarToLunar')}
                className={cn(
                  "flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                  converterType === 'solarToLunar' ? "bg-white dark:bg-gray-700 shadow-sm text-traditional-red" : "text-gray-400"
                )}
              >
                Dương → Âm
              </button>
              <button 
                onClick={() => setConverterType('lunarToSolar')}
                className={cn(
                  "flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                  converterType === 'lunarToSolar' ? "bg-white dark:bg-gray-700 shadow-sm text-traditional-red" : "text-gray-400"
                )}
              >
                Âm → Dương
              </button>
            </div>

            {converterType === 'solarToLunar' ? (
              <div className="space-y-4">
                 {(() => {
                   const maxDays = getDaysInMonth(new Date(convSolar.y || 2026, (convSolar.m || 1) - 1));
                   const isDayInvalid = convSolar.d > maxDays || convSolar.d < 1;
                   const isMonthInvalid = convSolar.m > 12 || convSolar.m < 1;
                   const isYearInvalid = convSolar.y < 1900 || convSolar.y > 2100;
                   const hasError = isDayInvalid || isMonthInvalid || isYearInvalid;

                   return (
                     <>
                       <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Ngày (1-{maxDays})</label>
                            <input 
                              type="number" 
                              value={convSolar.d} 
                              onChange={e => setConvSolar({...convSolar, d: e.target.value === '' ? '' : parseInt(e.target.value)})} 
                              className={cn(
                                "w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-center font-bold transition-all",
                                isDayInvalid && convSolar.d !== '' && "ring-2 ring-red-400 bg-red-50 dark:bg-red-900/10"
                              )} 
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Tháng (1-12)</label>
                            <input 
                              type="number" 
                              value={convSolar.m} 
                              onChange={e => setConvSolar({...convSolar, m: e.target.value === '' ? '' : parseInt(e.target.value)})} 
                              className={cn(
                                "w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-center font-bold transition-all",
                                isMonthInvalid && convSolar.m !== '' && "ring-2 ring-red-400 bg-red-50 dark:bg-red-900/10"
                              )} 
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Nam</label>
                            <input 
                              type="number" 
                              value={convSolar.y} 
                              onChange={e => setConvSolar({...convSolar, y: e.target.value === '' ? '' : parseInt(e.target.value)})} 
                              className={cn(
                                "w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-center font-bold transition-all",
                                isYearInvalid && convSolar.y !== '' && "ring-2 ring-red-400 bg-red-50 dark:bg-red-900/10"
                              )} 
                            />
                          </div>
                       </div>
                       
                       {hasError && (
                         <div className="px-1 animate-fade-in">
                            <p className="text-[9px] font-bold text-red-500 uppercase tracking-tight">
                              {isMonthInvalid ? "Tháng không hợp lệ (1-12)" : 
                               isDayInvalid ? `Tháng ${convSolar.m}/${convSolar.y} chỉ có ${maxDays} ngày` : 
                               "Năm phải từ 1900 - 2100"}
                             </p>
                          </div>
                        )}

                        <div className="p-4 bg-traditional-red/5 rounded-2xl border border-traditional-red/10 animate-fade-in min-h-[5rem] flex flex-col justify-center">
                          {!hasError ? (() => {
                            const res = solarToLunar(convSolar.d, convSolar.m, convSolar.y);
                            if (!res) return <p className="text-xs font-bold text-gray-400 text-center uppercase tracking-widest mt-1">Dữ liệu lỗi</p>;
                            return (
                               <div className="text-center">
                                  <p className="text-2xl font-black text-traditional-red tracking-tight">{res.d}/{res.m}/{res.y}{res.isLeap ? ' (N)' : ''}</p>
                                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Nam {res.canChiYear}</p>
                               </div>
                            );
                          })() : (
                            <div className="text-center italic text-gray-400 text-[10px]">Đang chờ dữ liệu hợp lệ...</div>
                          )}
                       </div>
                     </>
                   );
                 })()}
              </div>
            ) : (
              <div className="space-y-4">
                 {(() => {
                   const isDayInvalid = convLunar.d > 30 || convLunar.d < 1;
                   const isMonthInvalid = convLunar.m > 12 || convLunar.m < 1;
                   const isYearInvalid = convLunar.y < 1900 || convLunar.y > 2100;
                   const hasError = isDayInvalid || isMonthInvalid || isYearInvalid;

                   return (
                     <>
                       <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Ngày (1-30)</label>
                            <input 
                              type="number" 
                              value={convLunar.d} 
                              onChange={e => setConvLunar({...convLunar, d: e.target.value === '' ? '' : parseInt(e.target.value)})} 
                              className={cn(
                                "w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-center font-bold transition-all",
                                isDayInvalid && convLunar.d !== '' && "ring-2 ring-red-400 bg-red-50 dark:bg-red-900/10"
                              )} 
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Tháng (1-12)</label>
                            <input 
                              type="number" 
                              value={convLunar.m} 
                              onChange={e => setConvLunar({...convLunar, m: e.target.value === '' ? '' : parseInt(e.target.value)})} 
                              className={cn(
                                "w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-center font-bold transition-all",
                                isMonthInvalid && convLunar.m !== '' && "ring-2 ring-red-400 bg-red-50 dark:bg-red-900/10"
                              )} 
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Nam</label>
                            <input 
                              type="number" 
                              value={convLunar.y} 
                              onChange={e => setConvLunar({...convLunar, y: e.target.value === '' ? '' : parseInt(e.target.value)})} 
                              className={cn(
                                "w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-3 text-center font-bold transition-all",
                                isYearInvalid && convLunar.y !== '' && "ring-2 ring-red-400 bg-red-50 dark:bg-red-900/10"
                              )} 
                            />
                          </div>
                       </div>
                       
                       {hasError && (
                         <div className="px-1 animate-fade-in">
                            <p className="text-[9px] font-bold text-red-500 uppercase tracking-tight">
                              {isMonthInvalid ? "Tháng không hợp lệ (1-12)" : 
                               isDayInvalid ? "Ngày Âm lịch không hợp lệ (1-30)" : 
                               "Năm phải từ 1900 - 2100"}
                            </p>
                         </div>
                       )}

                       <div className="flex items-center gap-3">
                          <input type="checkbox" id="conv-leap" checked={convLunar.isLeap} onChange={e => setConvLunar({...convLunar, isLeap: e.target.checked})} className="w-4 h-4 text-traditional-red rounded" />
                          <label htmlFor="conv-leap" className="text-xs font-bold text-gray-500 uppercase">Tháng nhuận</label>
                       </div>
                       <div className="p-4 bg-traditional-red/5 rounded-2xl border border-traditional-red/10 animate-fade-in min-h-[5rem] flex flex-col justify-center">
                          {!hasError ? (() => {
                            const res = lunarToSolar(convLunar.d, convLunar.m, convLunar.y, convLunar.isLeap);
                            if (!res || isNaN(res.getTime())) return <p className="text-xs font-bold text-gray-400 text-center uppercase tracking-widest mt-1">Dữ liệu lỗi</p>;
                             return (
                               <div className="text-center">
                                  <p className="text-2xl font-black text-traditional-red tracking-tight">{res.getDate()}/{res.getMonth() + 1}/{res.getFullYear()}</p>
                                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Thứ {res.getDay() === 0 ? 'Chủ Nhật' : res.getDay() + 1}</p>
                               </div>
                             );
                          })() : (
                            <div className="text-center italic text-gray-400 text-[10px]">Đang chờ dữ liệu hợp lệ...</div>
                          )}
                       </div>
                     </>
                   );
                 })()}
              </div>
            )}

            <button 
              disabled={(() => {
                const maxDays = converterType === 'solarToLunar' 
                  ? getDaysInMonth(new Date(convSolar.y || 2026, (convSolar.m || 1) - 1))
                  : 30;
                
                const d = converterType === 'solarToLunar' ? convSolar.d : convLunar.d;
                const m = converterType === 'solarToLunar' ? convSolar.m : convLunar.m;
                const y = converterType === 'solarToLunar' ? convSolar.y : convLunar.y;

                const isInvalid = d < 1 || d > maxDays || m < 1 || m > 12 || y < 1900 || y > 2100 || isNaN(d) || isNaN(m) || isNaN(y);
                return isInvalid;
              })()}
              onClick={() => {
                const targetDate = converterType === 'solarToLunar' 
                  ? new Date(convSolar.y, convSolar.m - 1, convSolar.d)
                  : lunarToSolar(convLunar.d, convLunar.m, convLunar.y, convLunar.isLeap);
                onViewDate(targetDate);
              }}
              className="w-full mt-6 py-4 bg-traditional-red text-white disabled:bg-gray-200 disabled:text-gray-400 rounded-2xl font-bold shadow-xl enabled:active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              Xem ngày này
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}




