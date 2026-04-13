import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Download, Share, PlusSquare } from 'lucide-react';

import { modalVariants, overlayVariants } from '../../../utils/helpers';

export default function InstallModal({ 
  isOpen, 
  onClose 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="install-modal"
          variants={overlayVariants}
          initial="hidden" animate="visible" exit="exit"
          className="fixed inset-0 z-[70] flex items-center justify-center px-4"
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>
          <motion.div 
            variants={modalVariants}
            className="glass w-full max-sm rounded-[2.5rem] p-8 relative shadow-2xl border border-white/20 text-white overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-traditional-red"></div>
            
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-traditional-red rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl rotate-3">
                 <CalendarIcon className="text-traditional-gold w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold font-serif">Cài đặt ứng dụng</h4>
              <p className="text-sm text-white/60 mt-2">Cài đặt bản Lịch Việt ra màn hình chính để sử dụng như ứng dụng thật.</p>
            </div>

            <div className="space-y-6">
              {/* iPhone Step */}
              <div className="bg-white/5 rounded-3xl p-5 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-traditional-gold/20 flex items-center justify-center text-traditional-gold font-bold">1</div>
                  <span className="font-bold text-sm tracking-wide uppercase">Cho iPhone (iOS)</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-white/80">
                    <Share className="w-4 h-4 text-blue-400" />
                    <span>Bấm nút "Chia sẻ" ở dưới trình duyệt Safari</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white/80">
                    <PlusSquare className="w-4 h-4 text-traditional-gold" />
                    <span>Chọn <b>"Thêm vào màn hình chính"</b></span>
                  </li>
                </ul>
              </div>

              {/* Android Step */}
              <div className="bg-white/5 rounded-3xl p-5 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-traditional-red/20 flex items-center justify-center text-traditional-red font-bold">2</div>
                  <span className="font-bold text-sm tracking-wide uppercase">Cho Android / Chrome</span>
                </div>
                <div className="text-sm text-white/80">
                   Bấm vào nút <span className="p-1 px-2 bg-traditional-red rounded-lg inline-flex items-center gap-1 mx-1">Cài đặt <Download className="w-3 h-3" /></span> ở góc trên ứng dụng.
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full mt-8 py-4 bg-white text-black rounded-2xl font-bold shadow-xl active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              Đã hiểu
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
