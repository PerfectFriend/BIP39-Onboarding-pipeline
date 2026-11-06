/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIP39-ABOARD-SDK - Theme Studio & 20-Preset Configurator
 * Visual showcase of Cyberpunk + Van Gogh + Gaudí banners,
 * live theme preview, and 1-click integration code exporter.
 */

import React, { useState } from 'react';
import { SDK_THEMES, SdkTheme } from '../../types/themes';
import { AppLanguage, I18N_DICTIONARY } from '../../services/i18n';
import { triggerHaptic } from '../../utils/haptics';
import {
  Palette,
  Sparkles,
  Copy,
  Check,
  Shield,
  Layers,
  Code2,
  Globe,
  Sliders,
  Eye,
  CheckCircle2,
  Lock,
  Download
} from 'lucide-react';

interface ThemeStudioViewProps {
  currentLanguage: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  activeThemeId: string;
  onThemeSelect: (themeId: string) => void;
}

export const ThemeStudioView: React.FC<ThemeStudioViewProps> = ({
  currentLanguage,
  onLanguageChange,
  activeThemeId,
  onThemeSelect
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'artistic' | 'cyberpunk' | 'neon' | 'dark'>('all');
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeBannerIndex, setActiveBannerIndex] = useState<0 | 1>(0);

  const t = I18N_DICTIONARY[currentLanguage];
  const activeTheme = SDK_THEMES.find(t => t.id === activeThemeId) || SDK_THEMES[0];

  const filteredThemes = selectedCategory === 'all'
    ? SDK_THEMES
    : SDK_THEMES.filter(t => t.category === selectedCategory);

  const bannerImages = [
    {
      url: '/src/assets/images/bip39_aboard_hero_1794005512735.jpg',
      title: currentLanguage === 'ru' ? 'Ван Гог + Гауди + Киберпанк' : currentLanguage === 'es' ? 'Van Gogh + Gaudí + Cyberpunk' : 'Van Gogh + Gaudí + Cyberpunk Masterpiece',
      tag: currentLanguage === 'ru' ? 'Звездное Небо · Витражи Саграда Фамилия · Золотой Мастер-Ключ' : currentLanguage === 'es' ? 'Cielo Estrellado · Vidrieras Gaudí · Llave Maestra' : 'Starry Night Impasto · Gaudí Parabolic Arches · Holographic Key'
    },
    {
      url: '/src/assets/images/bip39_vault_matrix_1794005527942.jpg',
      title: currentLanguage === 'ru' ? 'Криптографическое Святилище Матрицы' : currentLanguage === 'es' ? 'Santuario de Bóveda Matrix' : 'Matrix Cryptographic Sanctuary Enclave',
      tag: currentLanguage === 'ru' ? 'Биометрический алтарь · Неоновый бинарный дождь · Керамический тренкадис' : currentLanguage === 'es' ? 'Altar biométrico · Lluvia binaria neón · Trencadís' : 'Biometric Enclave · Neon Cascading Rain · Organic Mosaic Columns'
    }
  ];

  const generatedIntegrationSnippet = `// BIP39-ABOARD-SDK Drop-in Integration (${activeTheme.name})
// Language: ${currentLanguage.toUpperCase()} | Theme: ${activeTheme.id}
import { BIP39AuthProvider, useBIP39Auth } from '@bip39-auth/core';

export function Root() {
  return (
    <BIP39AuthProvider
      config={{
        appName: 'MySovereignApp',
        theme: '${activeTheme.id}', // ${activeTheme.name}
        defaultLanguage: '${currentLanguage}',
        defaultWordCount: 12,
        allowPanicPin: true,       // Duress $5 Wrench Attack protection
        allowPdfExport: true       // Cold Storage PDF Paper Passport
      }}
      onDuressWipe={() => {
        // Instant wipe of memory and session storage
        console.warn('EMERGENCY: Duress wipe executed!');
      }}
    >
      <App />
    </BIP39AuthProvider>
  );
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedIntegrationSnippet);
    triggerHaptic('light');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const getThemeLocalizedName = (theme: SdkTheme) => {
    if (currentLanguage === 'ru') return theme.nameRu;
    if (currentLanguage === 'es') return theme.nameEs;
    return theme.name;
  };

  return (
    <div className="h-full max-h-full flex flex-col justify-between overflow-hidden p-2 sm:p-4 gap-2 select-none">
      {/* Top Banner & Header Bar */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-sky-400 to-purple-500 p-px shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Palette className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                {t.configurator.title}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                20 Palettes
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              {t.configurator.subtitle}
            </p>
          </div>
        </div>

        {/* Language Switcher Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onLanguageChange('en');
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                currentLanguage === 'en'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN 🇬🇧
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onLanguageChange('ru');
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                currentLanguage === 'ru'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              RU 🇷🇺
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onLanguageChange('es');
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                currentLanguage === 'es'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ES 🇪🇸
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace: Left Column (Banner & Theme Grid) | Right Column (Live Mockup & Code) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        {/* Left Column (7 cols): Art Banner & 20-Theme Selector */}
        <div className="lg:col-span-7 flex flex-col justify-between overflow-hidden gap-2">
          {/* Panoramic Artistic Banner Carousel */}
          <div className="h-32 sm:h-36 shrink-0 relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl group">
            <img
              src={bannerImages[activeBannerIndex].url}
              alt="Cyberpunk Van Gogh Gaudí Art Banner"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            {/* Banner Text Overlay */}
            <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-wider text-amber-300 font-bold bg-slate-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {bannerImages[activeBannerIndex].tag}
                </span>
                <h3 className="text-xs sm:text-sm font-extrabold text-white mt-1 drop-shadow-md">
                  {bannerImages[activeBannerIndex].title}
                </h3>
              </div>
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveBannerIndex(0);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    activeBannerIndex === 0 ? 'bg-amber-400 scale-125' : 'bg-slate-600'
                  }`}
                  aria-label="Banner 1"
                />
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveBannerIndex(1);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    activeBannerIndex === 1 ? 'bg-amber-400 scale-125' : 'bg-slate-600'
                  }`}
                  aria-label="Banner 2"
                />
              </div>
            </div>
          </div>

          {/* Theme Palette Filter Bar */}
          <div className="shrink-0 flex items-center justify-between gap-1 overflow-x-auto scrollbar-none py-1">
            <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-xl border border-slate-800 text-[10px] font-mono">
              {(['all', 'artistic', 'cyberpunk', 'neon', 'dark'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedCategory(cat);
                  }}
                  className={`px-2 py-1 rounded-lg uppercase cursor-pointer transition-all ${
                    selectedCategory === cat
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <span className="text-[10px] font-mono text-slate-500 hidden sm:block">
              {filteredThemes.length} / 20 Themes
            </span>
          </div>

          {/* 20 Themes Grid List */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2 scrollbar-thin">
            {filteredThemes.map(theme => {
              const isSelected = theme.id === activeThemeId;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    onThemeSelect(theme.id);
                  }}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                    isSelected
                      ? `bg-slate-900 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)] ring-1 ring-amber-400`
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-bold text-white truncate pr-1">
                      {getThemeLocalizedName(theme)}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 my-1">
                    <div
                      className={`h-2.5 flex-1 rounded-full bg-gradient-to-r ${theme.previewGradient}`}
                    />
                    <div
                      className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                      style={{ backgroundColor: theme.primary }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tight truncate">
                    {theme.category} · {theme.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Live Interactive Theme Preview & Code Exporter */}
        <div className="lg:col-span-5 flex flex-col justify-between overflow-hidden gap-2">
          {/* Live Mockup Box Styled with Active Theme */}
          <div
            className={`rounded-2xl p-3 border transition-all duration-300 flex flex-col justify-between shrink-0 h-44 ${activeTheme.cardBgClass} ${activeTheme.borderClass} ${activeTheme.glowClass}`}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" style={{ color: activeTheme.primary }} />
                <span className="text-xs font-bold text-white truncate">
                  BIP-39 Onboarding Preview
                </span>
              </div>
              <span
                className="text-[9px] font-mono px-2 py-0.5 rounded-full border border-white/20 uppercase"
                style={{ color: activeTheme.primary }}
              >
                {activeTheme.name}
              </span>
            </div>

            {/* Simulated Seed Word Bubbles */}
            <div className="grid grid-cols-3 gap-1.5 my-1 font-mono text-[10px]">
              {['1. galaxy', '2. mosaic', '3. cipher', '4. vault', '5. starry', '6. matrix'].map(
                (w, i) => (
                  <div
                    key={i}
                    className="p-1 rounded-lg bg-black/40 border border-white/10 text-center text-slate-300 font-semibold"
                  >
                    {w}
                  </div>
                )
              )}
            </div>

            {/* Action Button Mock */}
            <button
              type="button"
              className="w-full py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 text-slate-950 transition-all cursor-default shadow-md"
              style={{ backgroundColor: activeTheme.primary }}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t.configurator.presetPreview}</span>
            </button>
          </div>

          {/* 1-Click Integration Code Snippet */}
          <div className="cyber-card rounded-2xl p-3 border border-slate-800 flex flex-col justify-between flex-1 overflow-hidden">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 shrink-0">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.configurator.exportCode}</span>
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-mono cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? t.configurator.copied : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="flex-1 overflow-y-auto p-2.5 bg-slate-950/90 rounded-xl font-mono text-[10px] text-slate-300 leading-relaxed border border-slate-900 scrollbar-thin select-all">
              {generatedIntegrationSnippet}
            </pre>
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="shrink-0 pt-1 text-[11px] font-mono text-slate-500 flex items-center justify-between border-t border-slate-900">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>BIP39-ABOARD-SDK · 20 Themes · English (Default) · RU · ES</span>
        </span>
        <span className="text-slate-400">
          CLI: <code className="text-sky-400">node scripts/init-sdk.js</code>
        </span>
      </div>
    </div>
  );
};
