import React, { useState } from 'react';
import { ShieldAlert, ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole } from 'lucide-react';
import { EntropyWordCount } from '../../types/onboarding';

interface StepDisclaimerProps {
  wordCount: EntropyWordCount;
  onWordCountChange: (count: EntropyWordCount) => void;
  onProceed: () => void;
  onBack: () => void;
}

export const StepDisclaimer: React.FC<StepDisclaimerProps> = ({
  wordCount,
  onWordCountChange,
  onProceed,
  onBack
}) => {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="max-w-xl mx-auto py-2">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </button>
        <span className="text-xs font-mono text-sky-400">Шаг 1 из 5 · Настройка и ответственность</span>
      </div>

      <div className="cyber-card rounded-3xl p-6 sm:p-8 relative overflow-hidden gaudi-mosaic-border mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              Длина фразы и персональная ответственность
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Кошелек является полностью некастодиальным. Только вы управляете приватными ключами.
            </p>
          </div>
        </div>

        {/* 12 vs 24 words selector */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Выберите уровень энтропии (длину seed-фразы):
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onWordCountChange(12)}
              className={`p-4 rounded-2xl text-left border transition-all ${
                wordCount === 12
                  ? 'bg-sky-500/15 border-sky-400/80 text-white shadow-[0_0_20px_rgba(56,189,248,0.15)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-base text-slate-100">12 слов</span>
                {wordCount === 12 && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
              </div>
              <p className="text-[11px] text-slate-400">128-бит энтропия. Быстро записывать, стандарт индустрии.</p>
            </button>

            <button
              type="button"
              onClick={() => onWordCountChange(24)}
              className={`p-4 rounded-2xl text-left border transition-all ${
                wordCount === 24
                  ? 'bg-amber-500/15 border-amber-400/80 text-white shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-base text-slate-100">24 слова</span>
                {wordCount === 24 && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
              </div>
              <p className="text-[11px] text-slate-400">256-бит энтропия. Максимальный уровень военной защиты.</p>
            </button>
          </div>
        </div>

        {/* Security Rules Checklist */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2.5 mb-6 text-xs text-slate-300">
          <div className="flex items-start gap-2.5">
            <LockKeyhole className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Никаких серверов:</strong> seed-фраза генерируется строго в памяти вашего браузера. Разработчики не имеют к ней доступа.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <LockKeyhole className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>
              <strong>Потеря фразы = потеря всех средств:</strong> если вы забудете или потеряете фразу, служба поддержки не сможет восстановить доступ.
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <LockKeyhole className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Утечка третьим лицам:</strong> любой человек или бот, увидевший эти слова, сможет мгновенно перевести средства на свой счет.
            </span>
          </div>
        </div>

        {/* Required Confirmation Checkbox */}
        <label className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 cursor-pointer hover:bg-amber-500/15 transition-colors">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-700 bg-slate-900"
          />
          <span className="text-xs text-amber-200/90 leading-tight">
            Я полностью понимаю риски и принимаю <strong>персональную ответственность</strong> за сохранность и конфиденциальность сгенерированной мнемонической фразы.
          </span>
        </label>
      </div>

      <div className="flex items-center justify-end">
        <button
          type="button"
          disabled={!confirmed}
          onClick={onProceed}
          className={`px-6 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
            confirmed
              ? 'bg-gradient-to-r from-sky-400 to-amber-400 text-slate-950 hover:opacity-95 shadow-[0_0_20px_rgba(56,189,248,0.3)] cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
          }`}
        >
          Сгенерировать фразу
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
