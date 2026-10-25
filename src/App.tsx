/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BIP39Onboarding } from './components/onboarding/BIP39Onboarding';
import { WalletDashboard } from './components/wallet/WalletDashboard';
import { SdkIntegrationDrawer } from './components/sdk/SdkIntegrationDrawer';
import { AiAgentPromptsModal } from './components/sdk/AiAgentPromptsModal';
import { AndroidDeviceFrame } from './components/android/AndroidDeviceFrame';
import { WalletCredentials } from './types/onboarding';
import { hasSavedVault, wipeAllVaultData, unlockVault } from './services/cryptoStorage';
import { triggerHaptic } from './utils/haptics';
import { Shield, Sparkles, Terminal, Skull, AlertOctagon, CheckCircle2, Smartphone, Monitor } from 'lucide-react';

export default function App() {
  const [wallet, setWallet] = useState<WalletCredentials | null>(null);
  const [primaryPin, setPrimaryPin] = useState<string>('');
  const [panicPin, setPanicPin] = useState<string | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'android' | 'desktop'>('android');

  // Modals & Drawers
  const [isSdkDrawerOpen, setIsSdkDrawerOpen] = useState(false);
  const [isAiPromptsModalOpen, setIsAiPromptsModalOpen] = useState(false);
  const [emergencyWipeActive, setEmergencyWipeActive] = useState(false);

  // Check on mount if duress occurred in previous session
  useEffect(() => {
    if (localStorage.getItem('bip39_vault_duress_active') === 'true') {
      localStorage.removeItem('bip39_vault_duress_active');
      triggerEmergencyAlert();
    }
  }, []);

  const handleOnboardingComplete = (
    credentials: WalletCredentials,
    pin: string,
    duressPin?: string
  ) => {
    triggerHaptic('success');
    setWallet(credentials);
    setPrimaryPin(pin);
    setPanicPin(duressPin);
  };

  const handleLogout = () => {
    triggerHaptic('light');
    setWallet(null);
    setPrimaryPin('');
    setPanicPin(undefined);
  };

  const triggerEmergencyAlert = () => {
    triggerHaptic('error');
    setEmergencyWipeActive(true);
    setWallet(null);
    setPrimaryPin('');
    setPanicPin(undefined);
    setTimeout(() => {
      setEmergencyWipeActive(false);
    }, 5000);
  };

  const handlePanicTriggered = async () => {
    await wipeAllVaultData();
    triggerEmergencyAlert();
  };

  const handleRestartOnboarding = async () => {
    triggerHaptic('medium');
    await wipeAllVaultData();
    setWallet(null);
    setPrimaryPin('');
    setPanicPin(undefined);
    setIsSdkDrawerOpen(false);
  };

  // Android biometric simulation unlock
  const handleAndroidBiometricAuth = async () => {
    if (primaryPin) {
      triggerHaptic('success');
      return;
    }
  };

  const activeContent = wallet ? (
    <WalletDashboard
      credentials={wallet}
      primaryPin={primaryPin}
      panicPin={panicPin}
      onLogout={handleLogout}
      onDuressTriggered={handlePanicTriggered}
      onOpenSdkModal={() => setIsSdkDrawerOpen(true)}
      onOpenAiPromptsModal={() => setIsAiPromptsModalOpen(true)}
    />
  ) : (
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
  );

  return (
    <div className="min-h-screen bg-cyber-vangogh text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-white">
      {/* Top Bar Contract: 3 zones */}
      <header className="sticky top-0 z-40 w-full bg-slate-950/75 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Zone 1: Single Brand wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-sky-400 to-purple-500 p-px shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Shield className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <span className="font-extrabold text-base tracking-tight text-white whitespace-nowrap shrink-0">
            BIP-39 Vault
          </span>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hidden sm:inline-block">
            Android Edition
          </span>
        </div>

        {/* Zone 2: View Switcher (Android Mobile Phone vs Web Desktop) */}
        <div className="flex items-center p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setViewMode('android');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'android'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Android Mode</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setViewMode('desktop');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'desktop'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Web Responsive</span>
          </button>
        </div>

        {/* Zone 3: 1 Primary action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsAiPromptsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-sky-500/20 hover:from-purple-500/30 hover:to-sky-500/30 text-purple-200 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Kotlin & AI</span> Промпты
          </button>

          <button
            type="button"
            onClick={() => setIsSdkDrawerOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer hidden md:flex"
          >
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>Android SDK</span>
          </button>
        </div>
      </header>

      {/* Emergency Wipe Banner Alert if Panic Pin was triggered */}
      {emergencyWipeActive && (
        <div className="w-full bg-rose-600 text-white px-4 py-3 flex items-center justify-center gap-3 animate-bounce shadow-lg z-50">
          <Skull className="w-5 h-5 text-white" />
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
            ANDROID DURESS EMERGENCY WIPE TRIGGERED: Все аппаратные ключи Android Keystore и сессии уничтожены.
          </span>
          <AlertOctagon className="w-5 h-5 text-white" />
        </div>
      )}

      {/* Main Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-6 py-4 sm:py-6 flex flex-col justify-center">
        {viewMode === 'android' ? (
          <AndroidDeviceFrame
            onOpenBiometricAuth={handleAndroidBiometricAuth}
            isUnlocked={!!wallet}
          >
            {activeContent}
          </AndroidDeviceFrame>
        ) : (
          activeContent
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/40 py-3.5 px-6 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Android 14/15 Architecture · FLAG_SECURE · Android Keystore StrongBox · BiometricPrompt</span>
        </div>
        <div>
          <span>Стилистика: Киберпанк + Ван Гог + Гауди · Haptic Vibration Active</span>
        </div>
      </footer>

      {/* SDK Drawer */}
      {isSdkDrawerOpen && (
        <SdkIntegrationDrawer
          credentials={wallet || undefined}
          primaryPin={primaryPin}
          panicPin={panicPin}
          onClose={() => setIsSdkDrawerOpen(false)}
          onRestartOnboarding={handleRestartOnboarding}
        />
      )}

      {/* AI Prompts Modal with Android Native Tab */}
      {isAiPromptsModalOpen && (
        <AiAgentPromptsModal
          onClose={() => setIsAiPromptsModalOpen(false)}
        />
      )}
    </div>
  );
}
