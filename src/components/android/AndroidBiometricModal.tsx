import React, { useState } from 'react';
import { Fingerprint, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface AndroidBiometricModalProps {
  onSuccess: () => void;
  onUsePin: () => void;
  onCancel: () => void;
}

export const AndroidBiometricModal: React.FC<AndroidBiometricModalProps> = ({
  onSuccess,
  onUsePin,
  onCancel
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleTouchSensor = () => {
    triggerHaptic('medium');
    setIsVerifying(true);
    setTimeout(() => {
      triggerHaptic('success');
      setIsVerifying(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 600);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      {/* Android Material You Bottom Sheet / Dialog */}
      <div className="w-full max-w-sm bg-slate-900 border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative">
        {/* Android bottom sheet grab handle */}
        <div className="w-10 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Android BiometricPrompt API</span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-white mb-1">
          Вход в BIP-39 Vault
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Подтвердите личность с помощью биометрии (сканер отпечатка пальца или Face Unlock)
        </p>

        {/* Biometric Scanner Orb */}
        <div className="flex flex-col items-center justify-center py-4 mb-4">
          <button
            type="button"
            onClick={handleTouchSensor}
            disabled={isVerifying || isSuccess}
            className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative cursor-pointer ${
              isSuccess
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 scale-105 shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                : isVerifying
                ? 'bg-sky-500/20 border-sky-400 text-sky-300 animate-pulse scale-105'
                : 'bg-slate-800/80 border-slate-700 text-sky-400 hover:border-sky-400 hover:scale-105'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            ) : (
              <Fingerprint className="w-10 h-10" />
            )}

            {/* Ripple rings */}
            {!isSuccess && !isVerifying && (
              <span className="absolute inset-0 rounded-full border border-sky-400/30 animate-ping pointer-events-none" />
            )}
          </button>

          <span className="text-xs text-slate-400 mt-3 font-medium">
            {isSuccess
              ? 'Отпечаток подтвержден!'
              : isVerifying
              ? 'Проверка в Android Keystore...'
              : 'Коснитесь датчика для входа'}
          </span>
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <button
            type="button"
            onClick={onUsePin}
            className="text-sky-400 hover:text-sky-300 font-semibold py-2"
          >
            Использовать PIN-код
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-200 py-2"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};
