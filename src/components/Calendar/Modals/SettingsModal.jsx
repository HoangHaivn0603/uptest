import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Search, RefreshCw } from 'lucide-react';
import { cn, modalVariants, overlayVariants } from '../../../utils/helpers';
import { VIETNAM_CITIES } from '../../../utils/constants';

// Use shared constants
const PRESET_CITIES = VIETNAM_CITIES;

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  userYear, 
  setUserYear, 
  locationConfig, 
  setLocationConfig, 
  theme, 
  setTheme, 
  searchQuery, 
  setSearchQuery, 
  searchResults, 
  isSearching, 
  onSave 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="settings-modal"
          variants={overlayVariants}
          initial="hidden" animate="visible" exit="exit"
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
          <motion.div 
            variants={modalVariants}
            className="glass w-full max-w-sm rounded-[2rem] p-8 relative shadow-2xl border border-white/20"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-traditional-red rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                 <Settings className="text-white w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold font-serif">Cá nhân hóa tử vi</h4>
              <p className="text-xs text-gray-500 mt-2 px-6">Nhập năm sinh của bạn để chúng tôi tính toán mức độ hòa hợp hàng ngày.</p>
            </div>
            
            <form onSubmit={onSave} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Năm sinh của bạn (Dương lịch)</label>
                <input 
                  required
                  type="number" 
                  min="1920"
                  max="2026"
                  value={userYear || ''}
                  onChange={(e) => {
                    const v = e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value));
                    setUserYear(v);
                  }}
                  placeholder="Ví dụ: 1990"
                  className={cn(
                    "w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-4 py-4 text-center text-xl font-bold tracking-widest focus:ring-2 focus:ring-traditional-red shadow-inner",
                    (userYear !== '' && userYear !== null && (userYear < 1920 || userYear > 2026)) && "ring-2 ring-red-400"
                  )}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Vị trí thời tiết</label>
                <div className="flex gap-2 p-1 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4">
                  <button 
                    type="button"
                    onClick={() => setLocationConfig({ type: 'gps' })}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all",
                      locationConfig.type === 'gps' ? "bg-white dark:bg-gray-700 shadow-sm text-traditional-red" : "text-gray-400"
                    )}
                  >
                    Tự động (GPS)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setLocationConfig({ type: 'city', cityId: locationConfig.cityId || 'hanoi' })}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all",
                      locationConfig.type === 'city' ? "bg-white dark:bg-gray-700 shadow-sm text-traditional-red" : "text-gray-400"
                    )}
                  >
                    Chọn thành phố
                  </button>
                </div>

                {locationConfig.type === 'city' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-300">
                      {PRESET_CITIES.map(city => (
                        <button 
                          key={city.id}
                          type="button"
                          onClick={() => setLocationConfig({ type: 'city', cityId: city.id })}
                          className={cn(
                            "py-3 px-2 rounded-xl border text-[9px] font-bold uppercase tracking-tight transition-all",
                            locationConfig.cityId === city.id 
                              ? "border-traditional-red bg-traditional-red/5 text-traditional-red shadow-inner" 
                              : "border-gray-100 dark:border-gray-800 text-gray-500 hover:border-traditional-red/30"
                          )}
                        >
                          {city.name}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Tìm kiếm thành phố khác..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border-none bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold focus:ring-2 focus:ring-traditional-red transition-all"
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <RefreshCw className="w-3 h-3 text-traditional-red animate-spin" />
                        </div>
                      )}
                    </div>

                    {searchResults.length > 0 && (
                      <div className="max-h-40 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700">
                        {searchResults.map(result => (
                          <button
                            key={result.id}
                            type="button"
                            onClick={() => {
                              setLocationConfig({ 
                                type: 'city', 
                                cityId: `custom-${result.id}`, 
                                customName: result.name, 
                                lat: result.latitude, 
                                lon: result.longitude 
                              });
                              setSearchQuery('');
                            }}
                            className="w-full text-left p-3 hover:bg-traditional-red/5 transition-colors flex flex-col gap-0.5"
                          >
                            <span className="text-[10px] font-black">{result.name}</span>
                            <span className="text-[8px] text-gray-400 font-bold uppercase">{result.admin1}, {result.country}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Giao diện (Theme)</label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { id: 'traditional', name: 'Đỏ', color: 'bg-[#B91C1C]' },
                    { id: 'royal', name: 'Xanh', color: 'bg-[#1E40AF]' },
                    { id: 'emerald', name: 'Lục', color: 'bg-[#065F46]' },
                    { id: 'lotus', name: 'Sen', color: 'bg-[#DB2777]' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-2 rounded-2xl transition-all",
                        theme === t.id ? "bg-gray-100 dark:bg-gray-800 ring-2 ring-traditional-red" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-full shadow-lg", t.color)}></div>
                      <span className="text-[9px] font-bold uppercase">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                disabled={userYear !== '' && userYear !== null && (userYear < 1920 || userYear > 2026)}
                className="w-full py-4 bg-traditional-red text-white disabled:bg-gray-200 disabled:text-gray-400 rounded-2xl font-bold shadow-xl shadow-traditional-red/20 enabled:active:scale-95 transition-all text-sm uppercase tracking-widest"
              >
                Lưu thông tin
              </button>
              
              <button 
                type="button"
                onClick={onClose}
                className="w-full text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
              >
                Bỏ qua
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
