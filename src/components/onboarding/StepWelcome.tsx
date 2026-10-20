import React from 'react';
import { ShieldCheck, Plus, Download, Sparkles, KeyRound, Lock } from 'lucide-react';

interface StepWelcomeProps {
  onCreateNew: () => void;
  onRestore: () => void;
  hasExistingVault: boolean;
  onUnlockExisting: () => void;
}

export const StepWelcome: React.FC<StepWelcomeProps> = ({
  onCreateNew,
  onRestore,
  hasExistingVault,
  onUnlockExisting
}) => {
  return (
    <div className="flex flex-col items-center text-center max-w-xl mx-auto py-4">
      {/* Visual Gaudi Mosaic Icon Orb */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-sky-500/20 to-purple-600/20 border border-sky-400/30 flex items-center justify-center p-1 shadow-[0_0_35px_rgba(56,189,248,0.2)]">
          <div className="w-full h-full rounded-2xl bg-slate-900/80 flex items-center justify-center relative overflow-hidden">
            {/* Van Gogh spiral aesthetic lines */}
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400 via-sky-500 to-transparent animate-pulse" />
            <ShieldCheck className="w-10 h-10 text-sky-400 relative z-10" />
          </div>
        </div>
        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-400/20 border border-amber-400/60 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-2">
        <span>BIP-39 PROTOCOL</span>
        <span aria-hidden="true">·</span>
        <span>AES-GCM 256-BIT</span>
        <span aria-hidden="true">·</span>
        <span>ZERO-KNOWLEDGE</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
        Мастер-Ключ Хранилища
      </h1>

      <p className="text-sm sm:text-base text-slate-300 max-w-md mb-8 leading-relaxed">
        Полный суверенитет над вашими криптографическими активами. Генерация и защита мнемонической фразы с физическим паспортом и паническим кодом.
      </p>

      {/* Main Choice Action Buttons */}
      <div className="w-full space-y-3.5 max-w-md">
        <button
          onClick={onCreateNew}
          className="w-full group relative overflow-hidden rounded-2xl p-px font-medium transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-amber-500 via-sky-400 to-emerald-400 opacity-90 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-between px-6 py-4 rounded-[15px] bg-slate-950/90 text-white group-hover:bg-slate-950/70 transition-colors">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-300">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                  Создать новый кошелек
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    BIP-39
                  </span>
                </div>
                <div className="text-xs text-slate-400">Генерация фразы на 12 или 24 слова</div>
              </div>
            </div>
            <KeyRound className="w-4 h-4 text-slate-400 group-hover:text-sky-300 transition-colors" />
          </div>
        </button>

        <button
          onClick={onRestore}
          className="w-full rounded-2xl p-px font-medium transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] border border-slate-700/80 hover:border-sky-500/40 bg-slate-900/60 hover:bg-slate-900/80"
        >
          <div className="flex items-center justify-between px-6 py-4 rounded-[15px] text-white">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-amber-300">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-slate-100">Восстановить кошелек</div>
                <div className="text-xs text-slate-400">Через seed-фразу, QR-код или PDF</div>
              </div>
            </div>
          </div>
        </button>

        {hasExistingVault && (
          <div className="pt-2">
            <button
              onClick={onUnlockExisting}
              className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 font-medium py-2 px-3 rounded-lg hover:bg-emerald-500/10 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              В хранилище уже есть сохраненный кошелек · Войти по PIN
            </button>
          </div>
        )}
      </div>

      {/* Trust Badges */}
      <div className="mt-10 pt-6 border-t border-slate-800/80 w-full max-w-md flex items-center justify-around text-xs text-slate-400">
        <div>
          <span className="block font-semibold text-slate-200">100% Client-Side</span>
          <span className="text-[11px] text-slate-500">Без отправки на сервер</span>
        </div>
        <div className="w-px h-6 bg-slate-800" />
        <div>
          <span className="block font-semibold text-slate-200">Duress Safe</span>
          <span className="text-[11px] text-slate-500">Панический PIN-код</span>
        </div>
        <div className="w-px h-6 bg-slate-800" />
        <div>
          <span className="block font-semibold text-slate-200">Paper Passport</span>
          <span className="text-[11px] text-slate-500">Печать PDF с QR</span>
        </div>
      </div>
    </div>
  );
};
