import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../utils/helpers';

const TOAST_CONFIG = {
  success: { icon: CheckCircle2, bg: 'bg-green-500', border: 'border-green-400/30', text: 'text-green-50' },
  error:   { icon: AlertCircle, bg: 'bg-red-500', border: 'border-red-400/30', text: 'text-red-50' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-500', border: 'border-amber-400/30', text: 'text-amber-50' },
  info:    { icon: Info, bg: 'bg-blue-500', border: 'border-blue-400/30', text: 'text-blue-50' }
};

function ToastItem({ toast, onRemove }) {
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl min-w-[280px] max-w-[380px]",
        config.bg, config.border
      )}
    >
      <Icon className="w-5 h-5 text-white shrink-0" />
      <p className={cn("text-sm font-bold flex-1", config.text)}>
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-1 hover:bg-white/20 rounded-full transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5 text-white/80" />
      </button>
    </motion.div>
  );
}

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
