import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NavigationPanel({ 
  onPrevMonth, 
  onNextMonth, 
  onToday 
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xs z-50">
      <div className="glass-dark rounded-2xl p-2 flex justify-between items-center shadow-2xl border border-white/10 mx-4">
          <button onClick={onPrevMonth} className="p-3 rounded-xl hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button onClick={onToday} className="px-5 py-2 font-bold text-sm text-traditional-gold bg-traditional-red rounded-xl shadow-lg active:scale-95 transition-all">
            Hôm nay
          </button>
          <button onClick={onNextMonth} className="p-3 rounded-xl hover:bg-white/10 transition-colors">
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
      </div>
    </div>
  );
}
