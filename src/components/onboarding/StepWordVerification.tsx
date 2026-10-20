import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { VerificationChallenge } from '../../types/onboarding';

interface StepWordVerificationProps {
  challenges: VerificationChallenge[];
  onSuccess: () => void;
  onBackToMnemonic: () => void;
}

export const StepWordVerification: React.FC<StepWordVerificationProps> = ({
  challenges,
  onSuccess,
  onBackToMnemonic
}) => {
  const [currentStep, setCurrentStep] = useState(0); // 0, 1, 2
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [errorWord, setErrorWord] = useState<string | null>(null);

  const activeChallenge = challenges[currentStep];
  const isComplete = selectedWords.length === challenges.length;

  const handleSelectWord = (word: string) => {
    setErrorWord(null);

    if (word === activeChallenge.correctWord) {
      const updated = [...selectedWords, word];
      setSelectedWords(updated);

      if (updated.length === challenges.length) {
        // All 3 passed! Trigger celebratory confetti
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } else {
        // Move to next challenge
        setCurrentStep(prev => prev + 1);
      }
    } else {
      // Wrong word chosen
      setErrorWord(word);
    }
  };

  const handleReset = () => {
    setSelectedWords([]);
    setCurrentStep(0);
    setErrorWord(null);
  };

  return (
    <div className="max-w-xl mx-auto py-2">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBackToMnemonic}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Вернуться к фразе
        </button>
        <span className="text-xs font-mono text-sky-400">Шаг 3 из 5 · Проверка записи</span>
      </div>

      <div className="cyber-card rounded-3xl p-6 sm:p-8 relative gaudi-mosaic-border mb-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono mb-2">
            <span>КОНТРОЛЬНАЯ ВЕРИФИКАЦИЯ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">
            Подтвердите 3 случайных слова
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Выберите правильное слово из 5 предложенных вариантов, чтобы подтвердить сохранность копии.
          </p>
        </div>

        {/* 3 Step Progress Indicators */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {challenges.map((challenge, idx) => {
            const isDone = selectedWords.length > idx;
            const isCurrent = currentStep === idx && !isComplete;

            return (
              <div
                key={idx}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono transition-all ${
                  isDone
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : isCurrent
                    ? 'bg-sky-500/20 border-sky-400 text-white shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                    : 'bg-slate-900/50 border-slate-800 text-slate-500'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span>#{idx + 1}</span>
                )}
                <span>Слово №{challenge.displayNumber}</span>
              </div>
            );
          })}
        </div>

        {/* Challenge Interactive Area */}
        {!isComplete ? (
          <div>
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 mb-5 text-center">
              <span className="text-xs text-slate-400 block mb-1">
                Вопрос {currentStep + 1} из 3
              </span>
              <div className="text-base sm:text-lg font-bold text-white">
                Какое слово стоит под номером{' '}
                <span className="text-sky-400 underline underline-offset-4 decoration-amber-400 font-mono text-xl">
                  #{activeChallenge.displayNumber}
                </span>{' '}
                в вашей фразе?
              </div>
            </div>

            {/* 5 clickable word buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 mb-4">
              {activeChallenge.options.map((option, optIdx) => {
                const isError = errorWord === option;

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectWord(option)}
                    className={`py-3 px-2 rounded-xl font-mono text-sm font-semibold border transition-all text-center ${
                      isError
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-shake'
                        : 'bg-slate-900/80 hover:bg-slate-800/90 text-slate-100 border-slate-700/80 hover:border-sky-400/60 hover:text-amber-300 shadow-sm'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {errorWord && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Слово &quot;{errorWord}&quot; неверное. Сверьтесь со своей записью.</span>
                </div>
                <button
                  type="button"
                  onClick={onBackToMnemonic}
                  className="underline hover:text-white shrink-0 ml-2"
                >
                  Посмотреть фразу
                </button>
              </div>
            )}
          </div>
        ) : (
          /* All 3 words passed */
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Верификация успешно пройдена!
            </h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto mb-6">
              Вы подтвердили знание ключевых слов. Теперь установим защитный PIN-код и панический PIN (Duress PIN).
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Сбросить и повторить
              </button>

              <button
                type="button"
                onClick={onSuccess}
                className="px-6 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950 hover:opacity-95 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 cursor-pointer"
              >
                Перейти к установке PIN
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
