import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Lock, Delete, Shuffle, CheckCircle2 } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface StepPinSetupProps {
  onPinConfirmed: (pin: string) => void;
  onBack: () => void;
}

export const StepPinSetup: React.FC<StepPinSetupProps> = ({
  onPinConfirmed,
  onBack
}) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [randomizeKeypad, setRandomizeKeypad] = useState(false);

  // Keypad numbers
  const defaultKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const [shuffledKeys, setShuffledKeys] = useState(defaultKeys);

  const toggleRandomize = () => {
    if (!randomizeKeypad) {
      const shuffled = [...defaultKeys].sort(() => Math.random() - 0.5);
      setShuffledKeys(shuffled);
    } else {
      setShuffledKeys(defaultKeys);
    }
    setRandomizeKeypad(!randomizeKeypad);
  };

  const currentInput = isConfirming ? confirmPin : pin;
  const targetLength = 6; // Standard 6-digit PIN

  const handleKeyPress = (digit: string) => {
    triggerHaptic('light');
    setError(null);
    if (currentInput.length >= targetLength) return;

    const nextVal = currentInput + digit;
    if (isConfirming) {
      setConfirmPin(nextVal);
      if (nextVal.length === targetLength) {
        // Auto-check on final digit
        if (nextVal === pin) {
          triggerHaptic('success');
          onPinConfirmed(pin);
        } else {
          triggerHaptic('error');
          setError('Введенные PIN-коды не совпадают. Попробуйте снова.');
          setConfirmPin('');
        }
      }
    } else {
      setPin(nextVal);
    }
  };

  const handleDelete = () => {
    triggerHaptic('medium');
    setError(null);
    if (isConfirming) {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const handleNextToConfirm = () => {
    if (pin.length < 4) {
      setError('PIN-код должен содержать минимум 4 цифры.');
      return;
    }
    setIsConfirming(true);
    setError(null);
  };

  const handleBackToFirstPin = () => {
    setIsConfirming(false);
    setConfirmPin('');
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto py-2">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={isConfirming ? handleBackToFirstPin : onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isConfirming ? 'Изменить PIN' : 'Назад'}
        </button>
        <span className="text-xs font-mono text-sky-400">Шаг 4 из 5 · Мастер PIN-код</span>
      </div>

      <div className="cyber-card rounded-3xl p-6 sm:p-7 relative gaudi-mosaic-border mb-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 mx-auto mb-3 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
          <Lock className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold text-white mb-1">
          {isConfirming ? 'Повторите PIN-код' : 'Задайте основной PIN-код'}
        </h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
          {isConfirming
            ? 'Введите тот же 6-значный код для верификации и шифрования AES-GCM.'
            : 'PIN-код используется для локального шифрования seed-фразы в браузере.'}
        </p>

        {/* PIN Dots Display */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {Array.from({ length: targetLength }).map((_, idx) => {
            const isFilled = currentInput.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border transition-all duration-150 ${
                  isFilled
                    ? 'bg-sky-400 border-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.7)] scale-110'
                    : 'bg-slate-900 border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="mb-4 text-xs text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded-xl p-2.5 animate-shake">
            {error}
          </div>
        )}

        {/* Keypad Randomize Option */}
        <div className="flex items-center justify-between mb-4 px-2 text-[11px] text-slate-400">
          <span>Случайный порядок клавиш:</span>
          <button
            type="button"
            onClick={toggleRandomize}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
              randomizeKeypad
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shuffle className="w-3 h-3" />
            {randomizeKeypad ? 'Включен' : 'Выключен'}
          </button>
        </div>

        {/* Virtual Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto mb-6">
          {shuffledKeys.slice(0, 9).map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-14 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-sky-400/50 text-xl font-bold font-mono text-white active:scale-95 transition-all shadow-sm"
            >
              {digit}
            </button>
          ))}

          {/* Bottom row: empty/randomize, 10th key, delete */}
          <button
            type="button"
            onClick={toggleRandomize}
            className="h-14 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-amber-300 flex items-center justify-center transition-colors"
            title="Перемешать клавиши"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => handleKeyPress(shuffledKeys[9])}
            className="h-14 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-sky-400/50 text-xl font-bold font-mono text-white active:scale-95 transition-all shadow-sm"
          >
            {shuffledKeys[9]}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-rose-400 flex items-center justify-center transition-colors active:scale-95"
            title="Удалить цифру"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button */}
        {!isConfirming ? (
          <button
            type="button"
            disabled={pin.length < 4}
            onClick={handleNextToConfirm}
            className={`w-full py-3.5 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              pin.length >= 4
                ? 'bg-gradient-to-r from-sky-400 to-amber-400 text-slate-950 hover:opacity-95 shadow-[0_0_20px_rgba(56,189,248,0.3)] cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            Подтвердить PIN
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            <span>Введите последние цифры для завершения</span>
          </div>
        )}
      </div>
    </div>
  );
};
