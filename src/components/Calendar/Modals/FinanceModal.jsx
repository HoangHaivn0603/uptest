import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Star, Activity, Landmark, Calculator, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn, modalVariants, overlayVariants } from '../../../utils/helpers';

// --- Components ---

/** 
 * Simple Sparkline component to render historical price trend 
 */
function Sparkline({ data, color = "#ef4444" }) {
  if (!data || data.length < 2) return <div className="w-12 h-6" />;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 24;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const isUp = data[data.length - 1] >= data[0];
  const strokeColor = isUp ? "#10b981" : "#ef4444";

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={`M ${points}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Interest Calculator Component
 */
function BankCalculator({ bankRates }) {
  const [amount, setAmount] = useState(100000000); // 100M default
  const [selectedBankIdx, setSelectedBankIdx] = useState(0);
  const [term, setTerm] = useState('12m');
  const [isCustomRate, setIsCustomRate] = useState(false);
  const [customRate, setCustomRate] = useState(5.0);

  const selectedBank = bankRates?.[selectedBankIdx];
  const bankRate = selectedBank?.rates?.[term] || 0;
  const effectiveRate = isCustomRate ? customRate : bankRate;
  
  const months = parseInt(term);
  const interest = useMemo(() => {
    return Math.floor(amount * (effectiveRate / 100) * (months / 12));
  }, [amount, effectiveRate, months]);

  const total = amount + interest;

  return (
    <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border border-gray-100 dark:border-gray-800 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-traditional-red" />
          <h4 className="text-sm font-black uppercase tracking-wider text-gray-700 dark:text-gray-200">Công cụ tính lãi suất</h4>
        </div>
        
        {/* Toggle Custom Rate */}
        <button 
          onClick={() => setIsCustomRate(!isCustomRate)}
          className={cn(
            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border",
            isCustomRate 
              ? "bg-traditional-red text-white border-traditional-red shadow-sm" 
              : "bg-white dark:bg-gray-900 text-gray-400 border-gray-100 dark:border-gray-800"
          )}
        >
          {isCustomRate ? "Đang Tùy chỉnh" : "Tùy chỉnh %"}
        </button>
      </div>

      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Số tiền gửi (VND)</label>
          <input 
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-traditional-red/20 transition-all shadow-sm"
            placeholder="Nhập số tiền..."
          />
          <p className="text-[10px] text-gray-400 mt-1 ml-1 font-medium italic">Viết bằng số: {amount.toLocaleString('vi-VN')} đồng</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Rate Select / Input */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">
              {isCustomRate ? "Lãi suất (%/năm)" : "Ngân hàng"}
            </label>
            {isCustomRate ? (
              <input 
                type="number"
                step="0.1"
                value={customRate}
                onChange={(e) => setCustomRate(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-traditional-red/30 dark:border-traditional-red/20 rounded-2xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-traditional-red/10 transition-all text-traditional-red"
              />
            ) : (
              <select 
                value={selectedBankIdx}
                onChange={(e) => setSelectedBankIdx(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-bold focus:outline-none transition-all cursor-pointer"
              >
                {bankRates.map((b, i) => (
                  <option key={i} value={i}>{b.short} - {b.bank}</option>
                ))}
              </select>
            )}
          </div>

          {/* Term Select */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Kỳ hạn</label>
            <select 
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-bold focus:outline-none transition-all cursor-pointer"
            >
              <option value="1m">1 Tháng</option>
              <option value="3m">3 Tháng</option>
              <option value="6m">6 Tháng</option>
              <option value="12m">12 Tháng</option>
              <option value="24m">24 Tháng</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-traditional-red/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
          
          <div className="flex justify-between items-center mb-2 relative z-10">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Lãi suất áp dụng</span>
            <span className="text-sm font-black text-emerald-500">{effectiveRate.toFixed(2)}%/năm</span>
          </div>
          <div className="flex justify-between items-center mb-2 relative z-10">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Tiền lãi nhận được</span>
            <span className="text-sm font-black text-traditional-red">{interest.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="pt-2 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center relative z-10">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Tổng cộng nhận về</span>
            <span className="text-base font-black text-gray-800 dark:text-gray-100">{total.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Modal ---

export default function FinanceModal({ 
  isOpen, 
  onClose, 
  financeType, 
  setFinanceType, 
  goldPrices, 
  goldHistory = {},
  exchangeRates, 
  bankRates = [],
  isRefreshing, 
  onRefresh,
  isFinanceLive,
  updatedAt,
  isCached
}) {
  const [showCalculator, setShowCalculator] = useState(false);

  // Map display labels to vang.today keys for history lookup
  const BRAND_TO_KEY = {
    'SJC 9999': 'SJL1L10',
    'DOJI Hà Nội': 'DOHNL',
    'DOJI TP.HCM': 'DOHCML',
    'PNJ Hà Nội': 'PQHNVM',
    'Bảo Tín SJC': 'BTSJC',
    'Bảo Tín 9999': 'BT9999NTT',
    'PNJ 24K': 'PQHN24NTT',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="finance-modal"
          variants={overlayVariants}
          initial="hidden" animate="visible" exit="exit"
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div 
            variants={modalVariants}
            className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden"
          >
            <div className="p-6 pb-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black font-serif">Thị trường Tài chính</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    Cập nhật: {updatedAt ? format(new Date(updatedAt), 'HH:mm dd/MM/yyyy') : '--:-- --/--/----'}
                  </p>
                  {isCached && (
                    <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-1">Offline Cache</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={onRefresh}
                    className={cn("p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all", isRefreshing && "animate-spin")}
                  >
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
                <button 
                  onClick={() => setFinanceType('gold')}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all",
                    financeType === 'gold' ? "bg-white dark:bg-gray-700 shadow-sm text-traditional-red" : "text-gray-500"
                  )}
                >
                  Giá Vàng
                </button>
                <button 
                  onClick={() => setFinanceType('currency')}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all",
                    financeType === 'currency' ? "bg-white dark:bg-gray-700 shadow-sm text-traditional-red" : "text-gray-500"
                  )}
                >
                  Ngoại tệ
                </button>
                <button 
                  onClick={() => setFinanceType('bank')}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all",
                    financeType === 'bank' ? "bg-white dark:bg-gray-700 shadow-sm text-traditional-red" : "text-gray-500"
                  )}
                >
                  Lãi suất
                </button>
              </div>
            </div>

            {/* Warning when using fallback data */}
            {isFinanceLive && (
              (financeType === 'gold' && !isFinanceLive.gold) || 
              (financeType === 'currency' && !isFinanceLive.rates) ||
              (financeType === 'bank' && !isFinanceLive.bankRates)
            ) && (
              <div className="mx-6 mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-2">
                <span className="text-amber-500 text-sm">⚠️</span>
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Dữ liệu tham khảo — Không phải thời gian thực
                </p>
              </div>
            )}

            <div className="p-0 max-h-[60vh] overflow-y-auto">
              {financeType === 'gold' ? (
                <div className="p-6">
                  <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Đơn vị</th>
                          <th className="px-2 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">7 Ngày</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Mua vào</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Bán ra</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {goldPrices.map((item, i) => {
                          const historyKey = BRAND_TO_KEY[item.name];
                          const history = goldHistory[historyKey];
                          
                          return (
                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                              <td className="px-4 py-4 pr-0">
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-gray-700 dark:text-gray-200 truncate max-w-[80px]">{item.name}</span>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    {item.trend === 'up' && <TrendingUp className="w-2 h-2 text-emerald-500" />}
                                    {item.trend === 'down' && <TrendingDown className="w-2 h-2 text-rose-500" />}
                                    <span className={cn(
                                       "text-[8px] font-black uppercase tracking-tighter",
                                       item.trend === 'up' ? "text-emerald-500" : item.trend === 'down' ? "text-rose-500" : "text-gray-400"
                                    )}>
                                       {item.trend === 'up' ? 'Tăng' : item.trend === 'down' ? 'Giảm' : 'Ổn định'}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-2 py-4 text-center">
                                <Sparkline data={history} />
                              </td>
                              <td className="px-4 py-4 text-sm font-black text-traditional-red-dark dark:text-traditional-gold text-right">{item.buy}</td>
                              <td className="px-4 py-4 text-sm font-black text-traditional-red-dark dark:text-traditional-gold text-right tracking-tight">{item.sell}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-6 p-4 bg-traditional-gold/5 rounded-2xl border border-traditional-gold/10 flex items-start gap-3">
                     <Star className="w-5 h-5 text-traditional-gold fill-traditional-gold shrink-0 mt-0.5" />
                     <p className="text-xs text-gray-500 leading-relaxed italic">
                        Đơn vị tính: 1.000đ/lượng. Bảng giá mang tính chất tham khảo tại các cửa hàng SJC, DOJI, PNJ. Sparkline thể hiện xu hướng giá mua 7 ngày.
                     </p>
                  </div>
                </div>
              ) : financeType === 'currency' ? (
                <div className="p-6">
                  <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mã/Tên</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Mua</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Bán</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {exchangeRates.map((item, i) => (
                          <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="px-4 py-4">
                               <div className="flex items-center gap-2">
                                  <span className="text-xl">{item.flag}</span>
                                  <div>
                                     <p className="text-xs font-black text-gray-700 dark:text-gray-200 leading-none mb-1">{item.code}</p>
                                     <p className="text-[10px] text-gray-400 font-medium leading-none">{item.name}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-4 py-4 text-sm font-bold text-gray-700 dark:text-gray-300 text-right">{item.buy}</td>
                            <td className="px-4 py-4 text-sm font-black text-traditional-red-dark dark:text-traditional-gold text-right tracking-tight">{item.sell}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-start gap-3">
                     <Activity className="w-5 h-5 text-traditional-red shrink-0 mt-0.5" />
                     <p className="text-xs text-gray-500 leading-relaxed italic">
                        Tỷ giá tham khảo theo sở giao dịch Vietcombank (VCB). Có thể chênh lệch nhẹ tùy thời điểm giao dịch thực thực tế.
                     </p>
                  </div>
                </div>
              ) : (
                /* Bank Interest Rates Tab */
                <div className="p-6">
                  {/* Toggle Calculator Button */}
                  <button 
                    onClick={() => setShowCalculator(!showCalculator)}
                    className="w-full mb-6 p-4 bg-traditional-red/5 hover:bg-traditional-red/10 border border-traditional-red/10 rounded-[2rem] flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-traditional-red rounded-xl text-white shadow-lg shadow-traditional-red/20 group-hover:scale-110 transition-transform">
                        <Calculator className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-gray-800 dark:text-gray-100 uppercase tracking-wider">Công cụ tính lãi suất</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Duy nhất tại LichAntiFast</p>
                      </div>
                    </div>
                    <Info className={cn("w-4 h-4 text-gray-300 transition-transform", showCalculator && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {showCalculator && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <BankCalculator bankRates={bankRates} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                          <th className="px-3 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ngân hàng</th>
                          <th className="px-2 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">1T</th>
                          <th className="px-2 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">3T</th>
                          <th className="px-2 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">6T</th>
                          <th className="px-2 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">12T</th>
                          <th className="px-2 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">24T</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {bankRates.map((item, i) => {
                          const maxRates = {};
                          ['1m', '3m', '6m', '12m', '24m'].forEach((term) => {
                            maxRates[term] = Math.max(...bankRates.map((b) => b.rates?.[term] || 0));
                          });

                          return (
                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                              <td className="px-3 py-3.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{item.logo}</span>
                                  <div>
                                    <p className="text-[11px] font-black text-gray-700 dark:text-gray-200 leading-none mb-0.5">{item.short}</p>
                                    <p className="text-[9px] text-gray-400 font-medium leading-none truncate max-w-[70px]">{item.bank}</p>
                                  </div>
                                </div>
                              </td>
                              {['1m', '3m', '6m', '12m', '24m'].map((term) => {
                                const rate = item.rates?.[term];
                                const isMax = rate === maxRates[term] && rate > 0;
                                return (
                                  <td key={term} className="px-1 py-3.5 text-center">
                                    <span
                                      className={cn(
                                        "text-[11px] font-bold tabular-nums",
                                        isMax
                                          ? "text-emerald-600 dark:text-emerald-400 font-black"
                                          : "text-gray-600 dark:text-gray-400"
                                      )}
                                    >
                                      {rate != null ? rate.toFixed(1) : '—'}
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex items-center gap-4 justify-center">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Lãi suất cao nhất</span>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30 flex items-start gap-3">
                     <Landmark className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                     <p className="text-xs text-gray-500 leading-relaxed italic">
                        Lãi suất tiết kiệm (%/năm). Kỳ hạn 1-24 tháng. Sử dụng Công cụ tính phía trên để dự tính lợi nhuận của bạn.
                     </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 pt-2 pb-10 sm:pb-8 flex justify-center">
               <button 
                 onClick={onClose}
                 className="px-8 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold transition-all"
               >
                 Đóng
               </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
