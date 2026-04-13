import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Trophy, BarChart3, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { cn, modalVariants, overlayVariants } from '../../../utils/helpers';

export default function LotteryModal({ 
  isOpen, 
  onClose, 
  lotteryData, 
  isRefreshing, 
  onRefresh,
  updatedAt,
  isCached
}) {
  const [activeTab, setActiveTab] = useState('table'); // 'table' or 'stats'

  if (!lotteryData && !isRefreshing) return null;

  const results = lotteryData?.results || {};
  const stats = lotteryData?.stats || { heads: [], tails: [] };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="lottery-modal"
          variants={overlayVariants}
          initial="hidden" animate="visible" exit="exit"
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
          <motion.div 
            variants={modalVariants}
            className="relative w-full max-w-lg h-[90vh] sm:h-[85vh] bg-white dark:bg-gray-950 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 sm:p-8 pb-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-traditional-gold rounded-2xl flex items-center justify-center shadow-lg">
                    <Trophy className="text-traditional-red w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black font-serif">Kết quả XSMB</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {updatedAt ? format(new Date(updatedAt), 'HH:mm dd/MM/yyyy') : (lotteryData?.time || 'Đang tải...')}
                        {isCached ? ' • Offline Cache' : ''}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={onRefresh}
                     className={cn("p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all", isRefreshing && "animate-spin")}
                   >
                     <RefreshCw className="w-5 h-5 text-gray-400" />
                   </button>
                   <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                     <X className="w-6 h-6" />
                   </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl">
                <button 
                  onClick={() => setActiveTab('table')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
                    activeTab === 'table' ? "bg-white dark:bg-gray-800 shadow-sm text-traditional-red" : "text-gray-500"
                  )}
                >
                  <Trophy className="w-4 h-4" />
                  Bảng kết quả
                </button>
                <button 
                  onClick={() => setActiveTab('stats')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
                    activeTab === 'stats' ? "bg-white dark:bg-gray-800 shadow-sm text-traditional-red" : "text-gray-500"
                  )}
                >
                  <BarChart3 className="w-4 h-4" />
                  Đầu - Đuôi
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {isRefreshing && !lotteryData ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 border-4 border-traditional-gold/20 border-t-traditional-gold rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-400 font-medium">Đang lấy kết quả mới nhất...</p>
                </div>
              ) : activeTab === 'table' ? (
                /* RESULT TABLE */
                <div className="space-y-3">
                  <ResultRow label="Đặc Biệt" numbers={results['ĐB']} highlight />
                  <ResultRow label="Giải Nhất" numbers={results['G1']} />
                  <ResultRow label="Giải Nhì" numbers={results['G2']} />
                  <ResultRow label="Giải Ba" numbers={results['G3']} cols={3} />
                  <ResultRow label="Giải Tư" numbers={results['G4']} cols={2} />
                  <ResultRow label="Giải Năm" numbers={results['G5']} cols={3} />
                  <ResultRow label="Giải Sáu" numbers={results['G6']} cols={3} />
                  <ResultRow label="Giải Bảy" numbers={results['G7']} cols={4} />
                </div>
              ) : (
                /* HEAD-TAIL STATS */
                <div className="space-y-6">
                  <div className="glass rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-800">
                    <div className="bg-traditional-red p-3 text-center">
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Thống kê theo Đầu</span>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {stats.heads.map((suffixes, head) => (
                        <div key={head} className="flex items-center p-3 gap-6">
                          <div className="w-8 h-8 rounded-full bg-traditional-gold/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-black text-traditional-red">{head}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                             {suffixes.length > 0 ? suffixes.map((s, i) => (
                               <span key={i} className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                 {s}{i < suffixes.length - 1 ? ',' : ''}
                               </span>
                             )) : <span className="text-xs text-gray-300 italic">Trống</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="h-10"></div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center sticky bottom-0 border-t border-gray-100 dark:border-gray-800">
               <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] italic text-center">
                 Dữ liệu cung cấp bởi api-xsmb-today
               </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ResultRow({ label, numbers, highlight, cols = 1 }) {
  if (!numbers) return null;
  
  return (
    <div className={cn(
      "flex flex-col sm:flex-row rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800",
      highlight ? "bg-traditional-red/5 border-traditional-red/20" : "bg-white dark:bg-gray-900"
    )}>
      <div className={cn(
        "w-full sm:w-24 px-3 py-2 flex items-center justify-center shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800",
        highlight ? "bg-traditional-red text-white" : "bg-gray-50 dark:bg-gray-800 text-gray-500"
      )}>
        <span className="text-[10px] font-black uppercase tracking-wider text-center">{label}</span>
      </div>
      <div className={cn(
        "flex-1 p-3 grid gap-3",
        cols === 1 ? "grid-cols-1" : cols === 2 ? "grid-cols-2" : cols === 3 ? "grid-cols-3" : "grid-cols-4"
      )}>
        {numbers.map((num, i) => (
          <div key={i} className="text-center">
            <span className={cn(
              "font-black font-mono tracking-wider",
              highlight ? "text-2xl text-traditional-red" : "text-lg text-gray-800 dark:text-gray-200"
            )}>
              {num}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
