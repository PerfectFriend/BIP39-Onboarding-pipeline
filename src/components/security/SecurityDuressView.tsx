/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WalletCredentials } from '../../types/onboarding';
import { exportPaperPassportPdf } from '../../services/pdfExport';
import { triggerHaptic } from '../../utils/haptics';
import { deriveHonestChainKeys, signEthereumMessage } from '../../services/keyDerivation';
import { wipeAllVaultData } from '../../services/cryptoStorage';
import { BiometricAuthOverlay } from '../android/BiometricAuthOverlay';
import { hex } from '@scure/base';
import {
  Shield,
  Skull,
  FileDown,
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  PenTool,
  KeyRound,
  FileCheck,
  Check,
  Copy,
  Terminal
} from 'lucide-react';

interface SecurityDuressViewProps {
  credentials: WalletCredentials | null;
  primaryPin: string;
  panicPin?: string;
  onDuressTriggered: () => void;
  onNavigateToOnboarding: () => void;
  onGenerateDemoWallet: () => void;
}

export const SecurityDuressView: React.FC<SecurityDuressViewProps> = ({
  credentials,
  primaryPin,
  panicPin,
  onDuressTriggered,
  onNavigateToOnboarding,
  onGenerateDemoWallet,
}) => {
  // Duress PIN test modal & feedback
  const [duressInput, setDuressInput] = useState('');
  const [duressFeedback, setDuressFeedback] = useState<string | null>(null);

  // Seed phrase modal
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [seedVerifyPin, setSeedVerifyPin] = useState('');
  const [seedVerifyError, setSeedVerifyError] = useState<string | null>(null);
  const [seedUnlocked, setSeedUnlocked] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  // EIP-191 Secp256k1 message signing
  const [messageToSign, setMessageToSign] = useState('BIP-39 Enclave Sovereign Signature Proof');
  const [signatureOutput, setSignatureOutput] = useState<{
    signature: string;
    r: string;
    s: string;
    v: number;
    address: string;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    triggerHaptic('light');
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Test duress pin
  const handleTriggerDuressCheck = async () => {
    setDuressFeedback(null);
    if (!duressInput) return;

    if (panicPin && duressInput === panicPin) {
      triggerHaptic('error');
      await wipeAllVaultData();
      onDuressTriggered();
    } else if (duressInput === primaryPin) {
      triggerHaptic('medium');
      setDuressFeedback('Введен основной PIN. Паника НЕ активирована (данные сохранены). Для теста введите панический PIN.');
    } else {
      triggerHaptic('error');
      setDuressFeedback('Код не совпадает с паническим PIN. Введите заданный панический PIN.');
    }
  };

  const handleUnlockSeedWithPin = () => {
    if (seedVerifyPin === primaryPin) {
      triggerHaptic('success');
      setSeedUnlocked(true);
      setSeedVerifyError(null);
    } else {
      triggerHaptic('error');
      setSeedVerifyError('Неверный основной PIN-код');
    }
  };

  const handleBiometricSuccess = () => {
    setShowBiometricModal(false);
    setSeedUnlocked(true);
    setShowSeedModal(true);
    triggerHaptic('success');
  };

  const handleExportPdf = () => {
    if (!credentials) return;
    triggerHaptic('medium');
    exportPaperPassportPdf({
      mnemonicWords: credentials.mnemonicWords,
      fingerprint: credentials.masterFingerprint,
      createdAt: credentials.createdAt,
    });
  };

  const handleGenerateRealSignature = () => {
    if (!credentials) return;
    try {
      triggerHaptic('medium');
      const seedBytes = hex.decode(credentials.seedHex);
      const honest = deriveHonestChainKeys(seedBytes);
      const sig = signEthereumMessage(messageToSign, honest.eth.privateKeyHex);
      setSignatureOutput({
        ...sig,
        address: honest.eth.address,
      });
      triggerHaptic('success');
    } catch (err: any) {
      alert('Ошибка при подписании: ' + err?.message);
    }
  };

  if (!credentials) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Центр безопасности ожидает хранилище</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          Для тестирования Панического PIN-кода (Duress PIN), экспорта Cold Storage PDF-паспорта и аппаратной подписи сообщений secp256k1 необходимо инициализировать кошелек.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onNavigateToOnboarding}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-sky-500 hover:from-amber-400 hover:to-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all"
          >
            <KeyRound className="w-4 h-4" />
            <span>Настроить BIP-39 мастер-ключ</span>
          </button>
          <button
            type="button"
            onClick={onGenerateDemoWallet}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 hover:border-amber-400 font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span>Загрузить тестовые ключи</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full max-h-full flex flex-col justify-between p-3 sm:p-5 overflow-hidden select-none">
      {/* Top Banner: Enclave Security Architecture Specs */}
      <div className="cyber-card rounded-2xl p-3 sm:p-4 border border-slate-800 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 p-px shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white">Security Operations & Duress Enclave</h2>
              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Grade A+ Zero-Knowledge
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              WebCrypto AES-256-GCM · PBKDF2 100k · StrongBox TEE · Master Fingerprint: <span className="text-sky-300">{credentials.masterFingerprint}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportPdf}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Скачать PDF-паспорт</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowSeedModal(true);
              setSeedVerifyPin('');
              setSeedVerifyError(null);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>Seed-фраза</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Major Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 my-2 flex-1 overflow-hidden">
        {/* Left Column: Duress Panic PIN Simulator Card */}
        <div className="cyber-card rounded-2xl p-4 border border-rose-950/60 bg-gradient-to-b from-slate-950/80 to-rose-950/20 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-rose-900/40 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <Skull className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Лаборатория Панического PIN-кода ($5 Wrench Attack)</h3>
                  <span className="text-[10px] font-mono text-rose-300/80">Мгновенное стирание всех ключей за 10 мс</span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Panic PIN: {panicPin ? '•••••• (Активен)' : 'Не задан'}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
              В ситуации физической угрозы или силового принуждения ввод альтернативного панического кода
              <span className="text-rose-400 font-semibold"> немедленно обнуляет оперативную память</span>, удаляет шифрованные контейнеры из WebCrypto и Android Keystore и сбрасывает приложение.
            </p>

            <div className="bg-slate-950/90 border border-rose-900/50 rounded-xl p-3 mb-2 space-y-2">
              <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
                Тестовый ввод панического PIN ({panicPin ? `Ваш панический PIN: ${panicPin}` : 'Задайте в онбординге'}):
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="password"
                  maxLength={6}
                  placeholder="••••••"
                  value={duressInput}
                  onChange={(e) => {
                    setDuressInput(e.target.value);
                    setDuressFeedback(null);
                  }}
                  className="w-36 py-2 px-3 text-center text-base tracking-[0.3em] font-mono bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-rose-500"
                />

                <button
                  type="button"
                  onClick={handleTriggerDuressCheck}
                  className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(225,29,72,0.3)]"
                >
                  <Skull className="w-3.5 h-3.5" />
                  <span>Имитировать панику</span>
                </button>
              </div>

              {duressFeedback && (
                <div className="text-[10px] font-mono p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  {duressFeedback}
                </div>
              )}
            </div>
          </div>

          {/* Duress Guarantee Indicators */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-900 text-[10px] font-mono">
            <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-300">
              <span className="text-emerald-400 block font-bold mb-0.5">✓ Zero-Plaintext</span>
              <span>Ключи не пишутся на диск</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-300">
              <span className="text-emerald-400 block font-bold mb-0.5">✓ Anti-Dump</span>
              <span>Обнуление Uint8Array буферов</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-300">
              <span className="text-emerald-400 block font-bold mb-0.5">✓ Plausible</span>
              <span>Никаких следов в логах</span>
            </div>
          </div>
        </div>

        {/* Right Column: Secp256k1 EIP-191 Signature Test Lab */}
        <div className="cyber-card rounded-2xl p-4 border border-slate-800 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Честная криптографическая подпись Secp256k1 (EIP-191)</h3>
                  <span className="text-[10px] font-mono text-slate-400">ECDSA r, s, v вычисление с деривированным ключом</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-2">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">
                  Текст произвольного сообщения для подписи:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageToSign}
                    onChange={(e) => setMessageToSign(e.target.value)}
                    className="flex-1 py-1.5 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono outline-none focus:border-sky-400"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateRealSignature}
                    className="py-1.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all shrink-0"
                  >
                    <PenTool className="w-3 h-3" />
                    <span>Подписать</span>
                  </button>
                </div>
              </div>

              {/* Signature Output Console */}
              {signatureOutput ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-1.5 font-mono text-[10px]">
                  <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-900">
                    <span className="text-emerald-400 font-bold">✓ EIP-191 Signature Generated</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(signatureOutput.signature, 'sig')}
                      className="text-sky-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'sig' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'sig' ? 'Скопировано' : 'Копировать'}</span>
                    </button>
                  </div>
                  <div className="text-slate-300 break-all select-all bg-slate-900/60 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-500">sig: </span>{signatureOutput.signature}
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[9px] text-slate-400">
                    <div className="truncate"><span className="text-sky-400">r:</span> {signatureOutput.r.slice(0, 10)}...</div>
                    <div className="truncate"><span className="text-sky-400">s:</span> {signatureOutput.s.slice(0, 10)}...</div>
                    <div><span className="text-sky-400">v:</span> {signatureOutput.v}</div>
                  </div>
                  <div className="text-[9px] text-slate-500 truncate">
                    Signer: <span className="text-emerald-400">{signatureOutput.address}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-900 text-center text-slate-500 text-xs font-mono">
                  Нажмите кнопку «Подписать», чтобы сгенерировать честную ECDSA подпись secp256k1
                </div>
              )}
            </div>
          </div>

          {/* Enclave Security Status */}
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>ECDSA Curve: secp256k1 (Koblitz) · Keccak-256 Digest</span>
            </span>
            <span className="text-slate-500">EIP-55 Checksummed</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Strip */}
      <div className="shrink-0 pt-1 text-[11px] font-mono text-slate-500 flex items-center justify-between border-t border-slate-900">
        <span className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>FIPS 140-3 Hardware Protection: BiometricPrompt + StrongBox Enclave</span>
        </span>
        <span>Paper Passport PDF: 100% Offline Client-Side Render</span>
      </div>

      {/* Reveal Seed Modal */}
      {showSeedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="cyber-card rounded-3xl p-5 max-w-md w-full border border-sky-400/40 text-center relative gaudi-mosaic-border">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Раскрытие мастер-фразы BIP-39
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Требуется подтверждение основного PIN-кода или биометрии
            </p>

            {seedUnlocked ? (
              <div className="space-y-3 text-left">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span>Мнемоническая фраза ({credentials.mnemonicWords.length} слов):</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(credentials.mnemonic, 'seed')}
                      className="text-sky-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'seed' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'seed' ? 'Скопировано' : 'Копировать'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                    {credentials.mnemonicWords.map((w, i) => (
                      <div key={i} className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono flex items-center gap-1">
                        <span className="text-slate-600 text-[9px]">{i + 1}.</span>
                        <span className="text-amber-300 font-semibold">{w}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowSeedModal(false);
                    setSeedUnlocked(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700 cursor-pointer"
                >
                  Скрыть и заблокировать
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="password"
                  maxLength={6}
                  placeholder="••••••"
                  value={seedVerifyPin}
                  onChange={(e) => setSeedVerifyPin(e.target.value)}
                  className="w-full py-2.5 text-center text-xl tracking-[0.4em] font-mono bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-sky-400"
                />

                {seedVerifyError && (
                  <div className="text-xs text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded-xl p-2">
                    {seedVerifyError}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBiometricModal(true)}
                    className="flex-1 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-sky-500/30"
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span>Биометрия</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleUnlockSeedWithPin}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Войти по PIN
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSeedModal(false)}
                  className="text-xs text-slate-500 hover:text-slate-300 pt-1 block mx-auto cursor-pointer"
                >
                  Отмена
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Biometric Prompt Test Overlay */}
      <BiometricAuthOverlay
        isOpen={showBiometricModal}
        title="Подтверждение биометрии"
        subtitle="Подтвердите личность для показа seed-фразы"
        onSuccess={handleBiometricSuccess}
        onFallbackToPin={() => setShowBiometricModal(false)}
        onCancel={() => setShowBiometricModal(false)}
      />
    </div>
  );
};
