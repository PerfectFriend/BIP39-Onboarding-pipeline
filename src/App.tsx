/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BIP39Onboarding } from './components/onboarding/BIP39Onboarding';
import { WalletPortfolioView } from './components/wallet/WalletPortfolioView';
import { SecurityDuressView } from './components/security/SecurityDuressView';
import { AndroidPlatformView } from './components/android/AndroidPlatformView';
import { DeveloperSdkView } from './components/sdk/DeveloperSdkView';
import { DocumentationView } from './components/docs/DocumentationView';
import { RustMigrationView } from './components/rust/RustMigrationView';
import { ThemeStudioView } from './components/themes/ThemeStudioView';
import { FuturisticWelcomeSplash } from './components/splash/FuturisticWelcomeSplash';
import { WalletCredentials } from './types/onboarding';
import { wipeAllVaultData, hasSavedVault } from './services/cryptoStorage';
import { generateMnemonic, mnemonicToSeedHex, deriveMockAddresses } from './services/bip39';
import { triggerHaptic } from './utils/haptics';
import { AppLanguage, I18N_DICTIONARY } from './services/i18n';
import {
  Shield,
  Sparkles,
  Wallet,
  Lock,
  Smartphone,
  Code2,
  BookOpen,
  Cpu,
  Palette,
  Skull,
  AlertOctagon,
  LogOut,
  CheckCircle2,
  Globe
} from 'lucide-react';

export type AppTopic = 'splash' | 'themes' | 'onboarding' | 'wallet' | 'security' | 'android' | 'rust' | 'sdk' | 'docs';

export default function App() {
  const [activeTopic, setActiveTopic] = useState<AppTopic>('splash');
  const [language, setLanguage] = useState<AppLanguage>('en'); // Default: English per user request
  const [activeThemeId, setActiveThemeId] = useState<string>('cyber-vangogh');
  const [wallet, setWallet] = useState<WalletCredentials | null>(null);
  const [primaryPin, setPrimaryPin] = useState<string>('123456');
  const [panicPin, setPanicPin] = useState<string | undefined>('999999');
  const [emergencyWipeActive, setEmergencyWipeActive] = useState(false);

  const t = I18N_DICTIONARY[language];

  // Check if duress occurred in previous session
  useEffect(() => {
    if (localStorage.getItem('bip39_vault_duress_active') === 'true') {
      localStorage.removeItem('bip39_vault_duress_active');
      triggerEmergencyAlert();
    }
  }, []);

  const triggerEmergencyAlert = () => {
    triggerHaptic('error');
    setEmergencyWipeActive(true);
    setWallet(null);
    setPrimaryPin('');
    setPanicPin(undefined);
    setActiveTopic('splash');
    setTimeout(() => {
      setEmergencyWipeActive(false);
    }, 6000);
  };

  const handlePanicTriggered = async () => {
    await wipeAllVaultData();
    triggerEmergencyAlert();
  };

  const handleOnboardingComplete = (
    credentials: WalletCredentials,
    pin: string,
    duressPin?: string
  ) => {
    triggerHaptic('success');
    setWallet(credentials);
    setPrimaryPin(pin);
    setPanicPin(duressPin || '999999');
    setActiveTopic('wallet');
  };

  const handleGenerateDemoWallet = async () => {
    triggerHaptic('medium');
    const { mnemonic, words } = await generateMnemonic(12);
    const seedHex = await mnemonicToSeedHex(mnemonic);
    const addresses = await deriveMockAddresses(seedHex);

    const demoCreds: WalletCredentials = {
      mnemonic,
      mnemonicWords: words,
      seedHex,
      masterFingerprint: addresses.fingerprint,
      accounts: {
        btc: addresses.btc,
        eth: addresses.eth,
        sol: addresses.sol
      },
      createdAt: Date.now()
    };

    setWallet(demoCreds);
    setPrimaryPin('123456');
    setPanicPin('999999');
    triggerHaptic('success');
  };

  const handleLogout = () => {
    triggerHaptic('light');
    setWallet(null);
    setActiveTopic('onboarding');
  };

  const topics: { id: AppTopic; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'splash', label: t.topics.splash, icon: Sparkles },
    { id: 'themes', label: t.topics.themes, icon: Palette },
    { id: 'onboarding', label: t.topics.onboarding, icon: Shield },
    { id: 'wallet', label: t.topics.wallet, icon: Wallet },
    { id: 'security', label: t.topics.security, icon: Lock },
    { id: 'android', label: t.topics.android, icon: Smartphone },
    { id: 'rust', label: t.topics.rust, icon: Cpu },
    { id: 'sdk', label: t.topics.sdk, icon: Code2 },
    { id: 'docs', label: t.topics.docs, icon: BookOpen },
  ];

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden bg-[#080914] text-slate-100 flex flex-col select-none selection:bg-sky-500/30 selection:text-white">
      {/* Top Header Navigation Bar with Fullscreen Topic Buttons */}
      <header className="h-14 shrink-0 px-3 sm:px-6 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between gap-2 sm:gap-3 z-40">
        {/* Left: Brand mark */}
        <div
          onClick={() => {
            triggerHaptic('light');
            setActiveTopic('splash');
          }}
          className="flex items-center gap-2.5 cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-sky-400 to-purple-500 p-px shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Shield className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white leading-tight">
              BIP39-ABOARD-SDK
            </span>
            <span className="text-[9px] font-mono uppercase text-amber-400 leading-tight hidden sm:block">
              Cyberpunk · Gaudí · Van Gogh
            </span>
          </div>
        </div>

        {/* Center: Fullscreen Topic Tab Buttons */}
        <nav className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-x-auto max-w-full scrollbar-none">
          {topics.map((topic) => {
            const Icon = topic.icon;
            const isActive = activeTopic === topic.id;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTopic(topic.id);
                }}
                className={`px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500/25 to-amber-500/25 text-white border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>{topic.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Language Switcher & Quick Status */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center p-0.5 bg-slate-900 rounded-xl border border-slate-800 text-[10px] font-mono">
            {(['en', 'ru', 'es'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setLanguage(l);
                }}
                className={`px-1.5 sm:px-2 py-0.5 rounded-lg transition-all cursor-pointer font-bold uppercase ${
                  language === l
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {wallet ? (
            <button
              type="button"
              onClick={handleLogout}
              title="Заблокировать сессию"
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden md:inline">Заблокировать</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerateDemoWallet}
              title="Быстро загрузить тестовые ключи"
              className="px-2.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-400/30 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Демо-ключи</span>
            </button>
          )}
        </div>
      </header>

      {/* Emergency Wipe Banner Alert if Panic Pin was triggered */}
      {emergencyWipeActive && (
        <div className="w-full bg-rose-600 text-white px-4 py-2.5 flex items-center justify-center gap-3 animate-pulse shadow-2xl z-50 shrink-0">
          <Skull className="w-5 h-5 text-white animate-bounce" />
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-center">
            ANDROID DURESS EMERGENCY WIPE TRIGGERED: Все аппаратные ключи Android Keystore и сессии уничтожены.
          </span>
          <AlertOctagon className="w-5 h-5 text-white" />
        </div>
      )}

      {/* Main Fullscreen Topic Canvas (Strict Zero-Scroll: 100% viewport fit) */}
      <main className="flex-1 w-full h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] overflow-hidden relative">
        {/* 1. Topic: Splash screen */}
        {activeTopic === 'splash' && (
          <FuturisticWelcomeSplash
            language={language}
            onComplete={() => {
              triggerHaptic('success');
              setActiveTopic(wallet ? 'wallet' : 'themes');
            }}
          />
        )}

        {/* 2. Topic: 20-Theme Setup & Banner Studio */}
        {activeTopic === 'themes' && (
          <ThemeStudioView
            currentLanguage={language}
            onLanguageChange={setLanguage}
            activeThemeId={activeThemeId}
            onThemeSelect={setActiveThemeId}
          />
        )}

        {/* 3. Topic: Onboarding flow */}
        {activeTopic === 'onboarding' && (
          <BIP39Onboarding
            config={{
              defaultWordCount: 12,
              allowPanicPin: true,
              allowPdfExport: true,
              appName: 'BIP-39 Vault Android'
            }}
            onComplete={handleOnboardingComplete}
            onPanicTriggered={handlePanicTriggered}
          />
        )}

        {/* 3. Topic: Wallet Portfolio View */}
        {activeTopic === 'wallet' && (
          <WalletPortfolioView
            credentials={wallet}
            onNavigateToOnboarding={() => setActiveTopic('onboarding')}
            onGenerateDemoWallet={handleGenerateDemoWallet}
          />
        )}

        {/* 4. Topic: Security & Duress Enclave View */}
        {activeTopic === 'security' && (
          <SecurityDuressView
            credentials={wallet}
            primaryPin={primaryPin}
            panicPin={panicPin}
            onDuressTriggered={handlePanicTriggered}
            onNavigateToOnboarding={() => setActiveTopic('onboarding')}
            onGenerateDemoWallet={handleGenerateDemoWallet}
          />
        )}

        {/* 5. Topic: Android Emulator & Biometrics View */}
        {activeTopic === 'android' && (
          <AndroidPlatformView wallet={wallet}>
            {wallet ? (
              <WalletPortfolioView
                credentials={wallet}
                onNavigateToOnboarding={() => setActiveTopic('onboarding')}
                onGenerateDemoWallet={handleGenerateDemoWallet}
              />
            ) : (
              <BIP39Onboarding
                config={{
                  defaultWordCount: 12,
                  allowPanicPin: true,
                  allowPdfExport: true,
                  appName: 'BIP-39 Vault'
                }}
                onComplete={handleOnboardingComplete}
                onPanicTriggered={handlePanicTriggered}
              />
            )}
          </AndroidPlatformView>
        )}

        {/* 6. Topic: Rust & WASM High-Performance Enclave */}
        {activeTopic === 'rust' && <RustMigrationView />}

        {/* 7. Topic: Developer SDK & AI Studio Prompts */}
        {activeTopic === 'sdk' && <DeveloperSdkView />}

        {/* 8. Topic: Security Audit & User Documentation */}
        {activeTopic === 'docs' && <DocumentationView />}
      </main>
    </div>
  );
}
