/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AndroidDeviceFrame } from './AndroidDeviceFrame';
import { WalletCredentials } from '../../types/onboarding';
import { BiometricAuthOverlay } from './BiometricAuthOverlay';
import { verifyHardwareBiometrics, isPlatformBiometricsAvailable } from '../../services/webAuthnBiometrics';
import { triggerHaptic } from '../../utils/haptics';
import {
  Smartphone,
  Shield,
  Fingerprint,
  Cpu,
  Layers,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  EyeOff
} from 'lucide-react';

interface AndroidPlatformViewProps {
  wallet: WalletCredentials | null;
  children: React.ReactNode;
}

export const AndroidPlatformView: React.FC<AndroidPlatformViewProps> = ({
  wallet,
  children,
}) => {
  const [showBiometrics, setShowBiometrics] = useState(false);
  const [hardwareBiometricsActive, setHardwareBiometricsActive] = useState(false);
  const [biometricsStatus, setBiometricsStatus] = useState<string | null>(null);
  const [isVerifyingHardware, setIsVerifyingHardware] = useState(false);

  const handleTestHardwareBiometrics = async () => {
    triggerHaptic('light');
    setIsVerifyingHardware(true);
    setBiometricsStatus('Запрос системного диалога WebAuthn / Android BiometricPrompt...');

    try {
      const isAvailable = await isPlatformBiometricsAvailable();
      if (!isAvailable) {
        // Fallback to our authentic Android BiometricPrompt overlay
        setShowBiometrics(true);
        setBiometricsStatus('Аппаратный WebAuthn недоступен в данном браузере. Запущен Android BiometricPrompt эмулятор.');
        setIsVerifyingHardware(false);
        return;
      }

      const res = await verifyHardwareBiometrics();
      if (res.success) {
        triggerHaptic('success');
        setBiometricsStatus('✓ Аппаратная биометрия (WebAuthn/FIDO2) успешно верифицирована!');
      } else {
        // Fallback to visual modal
        setShowBiometrics(true);
        setBiometricsStatus('Запущен эмулятор BiometricPrompt.');
      }
    } catch {
      setShowBiometrics(true);
    } finally {
      setIsVerifyingHardware(false);
    }
  };

  return (
    <div className="w-full h-full max-h-full flex flex-col lg:flex-row items-center justify-between p-3 sm:p-4 gap-4 overflow-hidden select-none">
      {/* Left / Center: Google Pixel Phone Frame */}
      <div className="flex-1 h-full max-h-full flex items-center justify-center overflow-hidden">
        <AndroidDeviceFrame
          isUnlocked={!!wallet}
          onOpenBiometricAuth={handleTestHardwareBiometrics}
        >
          {children}
        </AndroidDeviceFrame>
      </div>

      {/* Right: Android Architecture & Security Control Deck */}
      <div className="w-full lg:w-80 xl:w-96 h-full max-h-full flex flex-col justify-between py-1 overflow-hidden shrink-0">
        {/* Card 1: Platform Header */}
        <div className="cyber-card rounded-2xl p-3.5 border border-slate-800">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Android 14/15 Architecture</h3>
              <span className="text-[10px] font-mono text-emerald-300">Google Pixel Security Model</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Полная аппаратная изоляция ключей BIP-39 в среде Android: StrongBox Keymaster, FLAG_SECURE и нативный BiometricPrompt API.
          </p>
        </div>

        {/* Card 2: Live Security Modules */}
        <div className="cyber-card rounded-2xl p-3.5 border border-slate-800 space-y-2.5 my-2 flex-1 flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
            Статус подсистем безопасности
          </span>

          <div className="space-y-2 text-xs">
            {/* Module 1: FLAG_SECURE */}
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-[11px] font-semibold text-slate-200">FLAG_SECURE</div>
                  <div className="text-[9px] text-slate-500 font-mono">Блокировка снимков экрана</div>
                </div>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                ACTIVE
              </span>
            </div>

            {/* Module 2: Android Keystore StrongBox */}
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="text-[11px] font-semibold text-slate-200">StrongBox Keymaster</div>
                  <div className="text-[9px] text-slate-500 font-mono">Аппаратный HSM чип Titan M2</div>
                </div>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-400/30">
                AES-256
              </span>
            </div>

            {/* Module 3: BiometricPrompt */}
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-[11px] font-semibold text-slate-200">BiometricPrompt</div>
                  <div className="text-[9px] text-slate-500 font-mono">Class 3 Biometrics (Strong)</div>
                </div>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                FIDO2 / TEE
              </span>
            </div>
          </div>

          {/* Biometric Interactive Action */}
          <div className="space-y-1.5 pt-1">
            <button
              type="button"
              onClick={handleTestHardwareBiometrics}
              disabled={isVerifyingHardware}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
            >
              <Fingerprint className="w-4 h-4" />
              <span>{isVerifyingHardware ? 'Считывание сенсора...' : 'Тест аппаратной биометрии'}</span>
            </button>

            {biometricsStatus && (
              <div className="text-[10px] font-mono p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 leading-tight">
                {biometricsStatus}
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Kotlin Jetpack Compose Summary */}
        <div className="cyber-card rounded-2xl p-3 border border-slate-800 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 mb-1 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Jetpack Compose Ready</span>
          </div>
          <p className="text-slate-400 text-[9px] leading-tight">
            Код готов для сборки в Android Studio: Material 3, EncryptedSharedPreferences и WindowManager.FLAG_SECURE.
          </p>
        </div>
      </div>

      {/* Biometric Prompt Test Overlay */}
      <BiometricAuthOverlay
        isOpen={showBiometrics}
        title="Тест биометрии Android"
        subtitle="Android BiometricPrompt API (Class 3 Strong)"
        onSuccess={() => {
          setShowBiometrics(false);
          triggerHaptic('success');
          setBiometricsStatus('✓ Эмулятор BiometricPrompt: отпечаток распознан!');
        }}
        onFallbackToPin={() => {
          setShowBiometrics(false);
          setBiometricsStatus('Переключено на ввод PIN-кода.');
        }}
        onCancel={() => setShowBiometrics(false)}
      />
    </div>
  );
};
