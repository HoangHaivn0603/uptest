import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { cn, modalVariants, overlayVariants } from '../../../utils/helpers';

export default function AddEventModal({ 
  isOpen, 
  onClose, 
  newEvent, 
  setNewEvent, 
  onAddEvent 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="add-event-modal"
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
              <h4 className="text-xl font-bold font-serif text-traditional-red">Thêm sự kiện mới</h4>
              <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={onAddEvent} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tên sự kiện (Tối đa 50 ký tự)</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  maxLength={50}
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value.slice(0, 50)})}
                  placeholder="Nhập tên sự kiện..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-traditional-red shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setNewEvent({...newEvent, type: 'lunar'})}
                  className={cn(
                    "py-3 rounded-2xl text-xs font-bold transition-all border",
                    newEvent.type === 'lunar' ? "bg-traditional-red text-white border-traditional-red shadow-lg" : "bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-800"
                  )}
                >
                  Dùng Lịch Âm
                </button>
                <button 
                  type="button"
                  onClick={() => setNewEvent({...newEvent, type: 'solar'})}
                  className={cn(
                    "py-3 rounded-2xl text-xs font-bold transition-all border",
                    newEvent.type === 'solar' ? "bg-traditional-red text-white border-traditional-red shadow-lg" : "bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-800"
                  )}
                >
                  Dùng Lịch Dương
                </button>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800">
                <input 
                  id="yearly-check"
                  type="checkbox" 
                  checked={newEvent.isYearly}
                  onChange={(e) => setNewEvent({...newEvent, isYearly: e.target.checked})}
                  className="w-5 h-5 rounded-md text-traditional-red focus:ring-traditional-red bg-white border-gray-300 pointer-events-auto cursor-pointer"
                />
                <label htmlFor="yearly-check" className="text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer">Lặp lại hàng năm</label>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-traditional-red text-white rounded-2xl font-bold shadow-xl shadow-traditional-red/20 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Lưu sự kiện
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}



