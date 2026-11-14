/**
 * Elegant Toast Container with Motion Animations & Phosphor Duotone Icons
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Warning, WarningCircle, Info, X } from '@phosphor-icons/react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="fixed bottom-6 left-6 z-[9990] flex flex-col gap-2.5 max-w-md pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-xl shadow-2xl text-sm ${
              toast.type === 'success'
                ? 'bg-[#0B1120]/95 border-emerald-500/40 text-emerald-100'
                : toast.type === 'error'
                ? 'bg-rose-950/92 border-rose-500/45 text-rose-100'
                : toast.type === 'warning'
                ? 'bg-[#16130A]/95 border-amber-500/45 text-amber-100'
                : 'bg-[#0B1120]/95 border-cyan-500/40 text-slate-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle weight="duotone" className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <WarningCircle weight="duotone" className="w-5 h-5 text-rose-400" />}
              {toast.type === 'warning' && <Warning weight="duotone" className="w-5 h-5 text-amber-400" />}
              {toast.type === 'info' && <Info weight="duotone" className="w-5 h-5 text-cyan-400" />}
            </div>
            <div className="flex-1 min-w-0">
              {toast.title && <div className="font-semibold text-xs mb-0.5">{toast.title}</div>}
              <div className="text-xs leading-relaxed opacity-90">{toast.message}</div>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 text-slate-400 hover:text-white transition-colors p-1"
              aria-label="بستن"
            >
              <X weight="bold" className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
