import React, { useState, useEffect } from 'react';
import { Fingerprint, ScanFace, CheckCircle2, ShieldCheck, X, KeyRound, AlertCircle } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export interface BiometricAuthOverlayProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  description?: string;
  onSuccess: () => void;
  onCancel: () => void;
  onFallbackToPin?: () => void;
}

export const BiometricAuthOverlay: React.FC<BiometricAuthOverlayProps> = ({
  isOpen,
  title = 'Биометрическая верификация',
  subtitle = 'Android BiometricPrompt · StrongBox Keystore',
  description = 'Подтвердите личность с помощью биометрии (сканер отпечатка пальца или распознавание лица) для раскрытия секретной seed-фразы.',
  onSuccess,
  onCancel,
  onFallbackToPin
}) => {
  const [authMode, setAuthMode] = useState<'fingerprint' | 'face'>('fingerprint');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    if (status === 'scanning' || status === 'success') return;

    triggerHaptic('medium');
    setStatus('scanning');

    // Simulate authentic Android hardware biometric check (500ms - 800ms)
    setTimeout(() => {
      triggerHaptic('success');
      setStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 500);
    }, 750);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Android Material You Bottom Sheet / Dialog Container */}
      <div className="w-full max-w-sm bg-slate-900 border-t sm:border border-slate-700/80 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative overflow-hidden gaudi-mosaic-border">
        {/* Android bottom sheet grab handle bar */}
        <div className="w-10 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>{subtitle}</span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-white mb-1.5">
          {title}
        </h3>
        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
          {description}
        </p>

        {/* Biometric Mode Selector (Fingerprint vs Face Unlock) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setAuthMode('fingerprint');
              setStatus('idle');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'fingerprint'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Отпечаток</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setAuthMode('face');
              setStatus('idle');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'face'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ScanFace className="w-3.5 h-3.5" />
            <span>Face Unlock</span>
          </button>
        </div>

        {/* Biometric Interactive Scanner Area */}
        <div className="flex flex-col items-center justify-center py-4 mb-4">
          {authMode === 'fingerprint' ? (
            /* Fingerprint Sensor Trigger */
            <button
              type="button"
              onClick={handleSimulateScan}
              disabled={status === 'scanning' || status === 'success'}
              className={`w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative cursor-pointer ${
                status === 'success'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 scale-105 shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                  : status === 'scanning'
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300 animate-pulse scale-105 shadow-[0_0_20px_rgba(56,189,248,0.4)]'
                  : 'bg-slate-800/80 border-slate-700 text-sky-400 hover:border-sky-400 hover:scale-105 shadow-md active:scale-95'
              }`}
            >
              {status === 'success' ? (
                <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
              ) : (
                <Fingerprint className="w-12 h-12 text-sky-400" />
              )}

              {/* Dynamic Ripple Rings */}
              {status === 'idle' && (
                <span className="absolute inset-0 rounded-full border border-sky-400/30 animate-ping pointer-events-none" />
              )}

              {status === 'scanning' && (
                <span className="absolute inset-[-4px] rounded-full border-2 border-dashed border-sky-400 animate-spin pointer-events-none" />
              )}
            </button>
          ) : (
            /* Face Unlock Camera Viewfinder */
            <button
              type="button"
              onClick={handleSimulateScan}
              disabled={status === 'scanning' || status === 'success'}
              className={`w-24 h-24 rounded-3xl border-2 flex items-center justify-center transition-all duration-300 relative overflow-hidden cursor-pointer ${
                status === 'success'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 scale-105 shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                  : status === 'scanning'
                  ? 'bg-purple-500/20 border-purple-400 text-purple-300 animate-pulse scale-105 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                  : 'bg-slate-800/80 border-slate-700 text-purple-400 hover:border-purple-400 hover:scale-105 shadow-md active:scale-95'
              }`}
            >
              {status === 'success' ? (
                <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
              ) : (
                <ScanFace className="w-12 h-12 text-purple-400" />
              )}

              {/* Viewfinder corner lines */}
              <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-sky-400" />
              <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-sky-400" />
              <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-sky-400" />
              <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-sky-400" />

              {/* Laser scan line animation */}
              {status === 'scanning' && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse top-1/2" />
              )}
            </button>
          )}

          <span className="text-xs text-slate-300 mt-3.5 font-medium">
            {status === 'success'
              ? 'Биометрия подтверждена!'
              : status === 'scanning'
              ? 'Считывание сенсора Android...'
              : authMode === 'fingerprint'
              ? 'Коснитесь датчика отпечатка'
              : 'Нажмите для распознавания лица'}
          </span>
        </div>

        {/* Fallback to PIN and Cancel Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          {onFallbackToPin && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onFallbackToPin();
              }}
              className="text-sky-400 hover:text-sky-300 font-semibold py-2 flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Ввести PIN-код
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-200 py-2 cursor-pointer ml-auto"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};
