/**
 * Melipayamak OTP Login Modal with 2-minute Timer, Rate Limiting & Fast Role Demos
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Smartphone, KeyRound, Timer, AlertCircle, CheckCircle, RefreshCw, X, Sparkles } from 'lucide-react';
import { useApp, getRolePersianName } from '../../context/AppContext';
import { Role } from '../../types';
import { toPersianDigits, normalizeIranMobile } from '../../utils/formatters';

interface OtpLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OtpLoginModal: React.FC<OtpLoginModalProps> = ({ isOpen, onClose }) => {
  const {
    users,
    verifyAndLoginOtp,
    showToast,
  } = useApp();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mobile, setMobile] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(120);
  const [attempts, setAttempts] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedDemoCode, setGeneratedDemoCode] = useState('54812');

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    // Input Validation
    const cleanMobile = normalizeIranMobile(mobile);
    if (!cleanMobile.startsWith('09') || cleanMobile.length !== 11) {
      setErrorMsg('شماره موبایل وارد شده نامعتبر است. نمونه صحیح: ۰۹۱۲۱۱۱۰۰۰۱');
      return;
    }

    // Check if user exists
    const user = users.find((u) => normalizeIranMobile(u.mobile) === cleanMobile);
    if (!user) {
      setErrorMsg('این شماره همراه در پایگاه اطلاعاتی پرسنل توان‌بان تعریف نشده است.');
      return;
    }

    if (!user.isActive) {
      setErrorMsg('این حساب کاربری غیرفعال شده است.');
      return;
    }

    setIsLoading(true);
    // Simulate Melipayamak API latency & SHA-256 hash generation
    setTimeout(() => {
      setIsLoading(false);
      const randomCode = Math.floor(10000 + Math.random() * 90000).toString();
      setGeneratedDemoCode(randomCode);
      setOtpCode(randomCode); // prefill for easy one-click testing
      setStep('otp');
      setCountdown(120);
      showToast(`پیامک رمز یکبار مصرف (ملی‌پیامک) ارسال شد: کد ${randomCode}`, 'info', 'ارسال پیامک');
    }, 600);
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (attempts >= 5) {
      setErrorMsg('به علت ۵ بار تلاش ناموفق، دسترسی موقتا قفل گردید (Brute Force Protection).');
      return;
    }

    if (countdown <= 0) {
      setErrorMsg('کد اعتبارسنجی منقضی شده است. لطفا درخواست ارسال مجدد کد نمایید.');
      return;
    }

    setIsLoading(true);
    const result = await verifyAndLoginOtp(mobile, otpCode);
    setIsLoading(false);

    if (result.success) {
      onClose();
    } else {
      setAttempts((a) => a + 1);
      setErrorMsg(result.error || 'کد وارد شده اشتباه است.');
    }
  };

  const fillFastRole = (userMobile: string) => {
    setMobile(userMobile);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md rounded-2xl glass-panel border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl relative text-right"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">ورود امن پرسنلی (OTP ملی‌پیامک)</h3>
            <p className="text-xs text-slate-400">احراز هویت امن پرسنلی با رمز یک‌بار مصرف پیامکی</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === 'phone' ? (
          <div>
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  شماره تلفن همراه پرسنل:
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    dir="ltr"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="09121110001"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 text-center"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  کد تایید ۵ رقمی از طریق درگاه Melipayamak ارسال خواهد شد.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(245,158,11,0.3)]"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'دریافت رمز یکبار مصرف (SMS)'}
              </button>
            </form>

            {/* Official Personnel Directory for Instant Access */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>حساب‌های پرسنلی تاییدشده سازمان (دفترچه سازمانی):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-right max-h-56 overflow-y-auto">
                {users.map((u) => (
                  <button
                    key={u._id}
                    type="button"
                    onClick={() => fillFastRole(u.mobile || '')}
                    className="px-2.5 py-2 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 hover:border-slate-700 text-[11px] text-slate-300 text-right transition-colors"
                  >
                    <span className="font-semibold block text-white truncate">{u.fullName}</span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {getRolePersianName(u.role).split(' (')[0]}
                    </span>
                    <span className="text-[10px] text-amber-400 block tabular-nums">
                      {toPersianDigits(u.mobile || u.encryptedMobile)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                <span>کد تایید پیامکی ارسال شده به {toPersianDigits(mobile)}:</span>
                <span className="text-amber-400 flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5" />
                  {toPersianDigits(Math.floor(countdown / 60))}:{toPersianDigits(('0' + (countdown % 60)).slice(-2))}
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  dir="ltr"
                  maxLength={5}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="۵۴۸۱۲"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-amber-300 font-bold text-center tracking-widest text-lg focus:outline-none focus:border-amber-400"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                <span>کد ارسالی سامانه: {toPersianDigits(generatedDemoCode)}</span>
                <button
                  type="button"
                  disabled={countdown > 0}
                  onClick={() => handleSendOtp()}
                  className="text-amber-400 hover:underline disabled:opacity-40"
                >
                  ارسال مجدد کد
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(245,158,11,0.3)]"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'تایید کد و ورود به سامانه'}
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200 mt-2"
            >
              ویرایش شماره تلفن
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
