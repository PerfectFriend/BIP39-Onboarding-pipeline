import React, { useState } from 'react';
import { Copy, Check, FileDown, ArrowRight, ArrowLeft, Shield, Eye, EyeOff, Share2 } from 'lucide-react';
import { ScreenshotShield } from './ScreenshotShield';
import { exportPaperPassportPdf } from '../../services/pdfExport';
import { triggerHaptic } from '../../utils/haptics';

interface StepMnemonicDisplayProps {
  words: string[];
  fingerprint: string;
  onProceedToVerification: () => void;
  onBack: () => void;
}

export const StepMnemonicDisplay: React.FC<StepMnemonicDisplayProps> = ({
  words,
  fingerprint,
  onProceedToVerification,
  onBack
}) => {
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showWords, setShowWords] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Single-touch copy all words with safety timeout
  const handleCopyAll = async () => {
    try {
      triggerHaptic('medium');
      await navigator.clipboard.writeText(words.join(' '));
      setCopied(true);
      setCopyFeedback('Фраза скопирована в буфер обмена (очистите буфер после записи!)');
      setTimeout(() => {
        setCopied(false);
        setCopyFeedback(null);
      }, 4000);
    } catch {
      setCopyFeedback('Не удалось скопировать автоматически, запишите вручную.');
    }
  };

  // Export Cold Storage PDF with QR & Android Share
  const handleExportPdf = async () => {
    triggerHaptic('light');
    setIsExportingPdf(true);
    try {
      await exportPaperPassportPdf({
        mnemonicWords: words,
        fingerprint,
        createdAt: Date.now()
      });
      triggerHaptic('success');
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Android Native Share Sheet
  const handleAndroidShare = async () => {
    triggerHaptic('light');
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `BIP-39 Vault Passport (${fingerprint})`,
          text: `BIP-39 Cold Storage Recovery Passport (Fingerprint: ${fingerprint})`
        });
      } catch {
        // User dismissed share sheet
      }
    } else {
      handleExportPdf();
    }
  };

  return (
    <ScreenshotShield active={true}>
      <div className="max-w-2xl mx-auto py-2">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-sky-400">Шаг 2 из 5 · Сохранение фразы</span>
            <button
              type="button"
              onClick={() => setShowWords(!showWords)}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
            >
              {showWords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showWords ? 'Скрыть' : 'Показать'}
            </button>
          </div>
        </div>

        <div className="cyber-card rounded-3xl p-6 sm:p-7 relative gaudi-mosaic-border mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Секретная Seed-фраза</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-400/30">
                  {words.length} слов
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Перепишите слова строго по порядку на бумажный носитель или сохраните PDF-паспорт.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className="text-[11px] font-mono text-slate-400">ID:</span>
              <span className="text-[11px] font-mono text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                {fingerprint}
              </span>
            </div>
          </div>

          {/* Numbered Words Grid */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5 ${
              !showWords ? 'filter blur-md select-none' : ''
            }`}
          >
            {words.map((word, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-sky-500/30 transition-colors group"
              >
                <span className="text-[11px] font-mono text-sky-400/80 w-5 text-right select-none">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <span className="text-sm font-mono font-semibold text-slate-100 tracking-wide group-hover:text-amber-300 transition-colors">
                  {word}
                </span>
              </div>
            ))}
          </div>

          {/* Action Row: Copy & Export PDF */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyAll}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-sky-400" />}
                {copied ? 'Скопировано!' : 'Копировать всю фразу'}
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
              >
                <FileDown className="w-3.5 h-3.5 text-amber-400" />
                {isExportingPdf ? 'Формирование PDF...' : 'PDF-паспорт'}
              </button>

              <button
                type="button"
                onClick={handleAndroidShare}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors"
                title="Android Share Sheet"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Android Share</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Защита от скриншотов активна</span>
            </div>
          </div>

          {copyFeedback && (
            <div className="mt-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center animate-fade-in">
              {copyFeedback}
            </div>
          )}
        </div>

        {/* Next step button */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">
            На следующем шаге система проверит 3 случайных слова из этой фразы.
          </p>

          <button
            type="button"
            onClick={onProceedToVerification}
            className="px-6 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider bg-gradient-to-r from-sky-400 to-amber-400 text-slate-950 hover:opacity-95 shadow-[0_0_20px_rgba(56,189,248,0.3)] flex items-center gap-2 shrink-0 cursor-pointer"
          >
            Я записал фразу · Проверить
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </ScreenshotShield>
  );
};
