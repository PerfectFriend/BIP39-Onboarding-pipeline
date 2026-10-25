import React, { useState } from 'react';
import { ShieldAlert, ArrowLeft, ArrowRight, Skull, CheckCircle2, Delete } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface StepPanicPinSetupProps {
  primaryPin: string;
  onFinishWithPanicPin: (panicPin: string | undefined) => void;
  onBack: () => void;
}

export const StepPanicPinSetup: React.FC<StepPanicPinSetupProps> = ({
  primaryPin,
  onFinishWithPanicPin,
  onBack
}) => {
  const [panicPin, setPanicPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const targetLength = 6;

  const handleKeyPress = (digit: string) => {
    triggerHaptic('light');
    setError(null);
    if (panicPin.length >= targetLength) return;
    const nextVal = panicPin + digit;
    setPanicPin(nextVal);
  };

  const handleDelete = () => {
    triggerHaptic('medium');
    setError(null);
    setPanicPin(prev => prev.slice(0, -1));
  };

  const handleConfirmPanicPin = () => {
    if (panicPin.length < 4) {
      triggerHaptic('error');
      setError('Панический PIN должен содержать минимум 4 цифры.');
      return;
    }
    if (panicPin === primaryPin) {
      triggerHaptic('warning');
      setError('Панический PIN-код НЕ должен совпадать с основным PIN-кодом!');
      return;
    }
    triggerHaptic('success');
    onFinishWithPanicPin(panicPin);
  };

  const handleSkip = () => {
    triggerHaptic('light');
    onFinishWithPanicPin(undefined);
  };

  return (
    <div className="max-w-md mx-auto py-2">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к PIN
        </button>
        <span className="text-xs font-mono text-amber-400">Шаг 5 из 5 · Duress PIN (Принуждение)</span>
      </div>

      <div className="cyber-card rounded-3xl p-6 sm:p-7 relative gaudi-mosaic-border mb-4 text-center">
        {/* Warning Icon Badge */}
        <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-3 shadow-[0_0_25px_rgba(244,63,94,0.25)]">
          <Skull className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold text-white mb-1.5 flex items-center justify-center gap-2">
          Панический PIN-код
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Duress
          </span>
        </h2>

        <p className="text-xs text-slate-300 max-w-xs mx-auto mb-5 leading-relaxed">
          Код тревоги на случай силового принуждения. Если ввести этот PIN при разблокировке, <strong>приложение мгновенно удалит все ключи</strong> и сбросит хранилище в нулевое состояние.
        </p>

        {/* Informational callout */}
        <div className="bg-rose-950/30 border border-rose-500/20 rounded-2xl p-3.5 mb-5 text-left text-xs text-rose-200/90 space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-rose-300">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            Как это работает на практике:
          </div>
          <p className="text-[11px] text-slate-400">
            Злоумышленник видит стандартный экран загрузки или сброс кошелька, а секретная seed-фраза и зашифрованные данные физически уничтожаются из памяти браузера за 10 миллисекунд.
          </p>
        </div>

        {/* PIN Dots */}
        <div className="flex items-center justify-center gap-3 mb-5">
          {Array.from({ length: targetLength }).map((_, idx) => {
            const isFilled = panicPin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border transition-all duration-150 ${
                  isFilled
                    ? 'bg-rose-500 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.7)] scale-110'
                    : 'bg-slate-900 border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="mb-4 text-xs text-rose-300 bg-rose-500/20 border border-rose-500/40 rounded-xl p-2.5 animate-shake">
            {error}
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-13 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-rose-400/50 text-xl font-bold font-mono text-white active:scale-95 transition-all shadow-sm"
            >
              {digit}
            </button>
          ))}

          <div />

          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-13 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-rose-400/50 text-xl font-bold font-mono text-white active:scale-95 transition-all shadow-sm"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="h-13 rounded-2xl bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-rose-400 flex items-center justify-center transition-colors active:scale-95"
            title="Удалить цифру"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Submit Actions */}
        <div className="space-y-2">
          <button
            type="button"
            disabled={panicPin.length < 4}
            onClick={handleConfirmPanicPin}
            className={`w-full py-3.5 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              panicPin.length >= 4
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:opacity-95 shadow-[0_0_20px_rgba(244,63,94,0.3)] cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Зафиксировать и войти в кошелек
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Пропустить установку панического PIN
          </button>
        </div>
      </div>
    </div>
  );
};
