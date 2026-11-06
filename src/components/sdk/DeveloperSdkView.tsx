/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Terminal,
  Smartphone,
  Sparkles,
  Code2,
  ShieldCheck,
  Cpu,
  BookOpen,
  Package,
  KeyRound,
  Download,
  Flame,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import {
  deriveCloudStorageKey,
  encryptForCloud,
  decryptFromCloudAsText,
  getEncryptionKeyFingerprint,
  mnemonicToSeedHex,
  CloudEncryptedPayload
} from '../../lib/bip39-auth-core';
import { hex } from '@scure/base';

export const DeveloperSdkView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lib' | 'cloud' | 'howto' | 'prompts' | 'react' | 'kotlin'>('lib');
  const [activePromptSubtab, setActivePromptSubtab] = useState<'master' | 'nextjs' | 'android' | 'backend' | 'reskin'>('master');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Cloud Zero-Knowledge E2EE Interactive Demo State
  const [cloudNamespace, setCloudNamespace] = useState('aws_s3_user_vault_v1');
  const [demoInputData, setDemoInputData] = useState('{\n  "userId": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",\n  "fullName": "Константин Новиков",\n  "passportSeries": "4012 984512",\n  "privateNotes": "Секретный E2EE профиль в облаке",\n  "updatedAt": "2026-11-06T22:30:00Z"\n}');
  const [demoMnemonic, setDemoMnemonic] = useState('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
  const [demoEncryptedPayload, setDemoEncryptedPayload] = useState<CloudEncryptedPayload | null>(null);
  const [demoDecryptedText, setDemoDecryptedText] = useState<string | null>(null);
  const [derivedKeyHex, setDerivedKeyHex] = useState<string>('');
  const [derivedKeyFp, setDerivedKeyFp] = useState<string>('');
  const [isProcessingCrypto, setIsProcessingCrypto] = useState(false);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    triggerHaptic('light');
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadFile = (content: string, filename: string) => {
    triggerHaptic('medium');
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCloudEncrypt = async () => {
    try {
      setIsProcessingCrypto(true);
      triggerHaptic('medium');
      const seedHex = await mnemonicToSeedHex(demoMnemonic);
      const seedBytes = hex.decode(seedHex);
      const key = deriveCloudStorageKey(seedBytes, cloudNamespace);
      setDerivedKeyHex(hex.encode(key));
      setDerivedKeyFp(getEncryptionKeyFingerprint(key));
      
      const payload = await encryptForCloud(demoInputData, key, cloudNamespace);
      setDemoEncryptedPayload(payload);
      setDemoDecryptedText(null);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsProcessingCrypto(false);
    }
  };

  const handleCloudDecrypt = async () => {
    if (!demoEncryptedPayload) return;
    try {
      setIsProcessingCrypto(true);
      triggerHaptic('success');
      const seedHex = await mnemonicToSeedHex(demoMnemonic);
      const seedBytes = hex.decode(seedHex);
      const key = deriveCloudStorageKey(seedBytes, cloudNamespace);
      const plain = await decryptFromCloudAsText(demoEncryptedPayload, key);
      setDemoDecryptedText(plain);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsProcessingCrypto(false);
    }
  };

  const cloudCodeSnippet = `// Zero-Knowledge E2EE Cloud Storage Integration
import {
  mnemonicToSeedHex,
  deriveCloudStorageKey,
  encryptForCloud,
  decryptFromCloudAsText
} from '@bip39-auth/core';
import { hex } from '@scure/base';

// 1. Детерминированная деривация 256-битного AES-ключа для облака
const seedHex = await mnemonicToSeedHex(userMnemonic);
const cloudKey = deriveCloudStorageKey(hex.decode(seedHex), 'aws_s3_vault_v1');

// 2. Локальное шифрование объекта до отправки в сеть
const payload = await encryptForCloud(
  JSON.stringify({ profile: 'Private data', creditScore: 820 }),
  cloudKey,
  'aws_s3_vault_v1'
);

// 3. Отправка в S3 / Firebase / Supabase (провайдер видит только шум)
await fetch('/api/cloud/upload', {
  method: 'POST',
  body: JSON.stringify({
    userId: '0x...', // Идентификатор профиля (EVM Address)
    ciphertext: payload.ciphertextBase64,
    iv: payload.ivBase64,
    fingerprint: payload.derivedKeyFingerprint
  })
});

// 4. Мгновенная расшифровка на любом авторизованном клиенте:
const plainText = await decryptFromCloudAsText(payload, cloudKey);`;

  const libraryUsageSnippet = `// 1. Установка пакета (или копирование папки src/lib/bip39-auth-core)
// npm install @bip39-auth/core

import React from 'react';
import { BIP39AuthProvider, useBIP39Auth } from '@bip39-auth/core';

// 2. Оберните приложение в провайдер (вместо Firebase/Supabase Auth)
export function App() {
  return (
    <BIP39AuthProvider
      config={{
        appName: 'SovereignPortal',
        defaultWordCount: 12, // 12 или 24 слова
        allowPanicPin: true,  // Панический PIN для сброса ($5 Wrench Attack)
        allowPdfExport: true  // Генерация Cold Storage PDF-паспорта
      }}
      onDuressWipe={() => {
        alert('Аварийное уничтожение данных выполнено: сессия стерта!');
      }}
    >
      <MainApp />
    </BIP39AuthProvider>
  );
}

// 3. Используйте хук в любом компоненте для авторизации без SMS и Email
function MainApp() {
  const {
    isAuthenticated,
    session,
    hasVault,
    openOnboarding,
    unlockWithPin,
    lockSession,
    logoutAndWipe,
    createSessionProof
  } = useBIP39Auth();

  if (!isAuthenticated) {
    return (
      <div className="login-card">
        <h2>Войдите без Email и SMS</h2>
        <button onClick={openOnboarding}>
          Создать суверенный аккаунт (BIP-39)
        </button>
        {hasVault && (
          <button onClick={() => unlockWithPin(prompt('Введите PIN-код') || '')}>
            Войти по сохраненному PIN
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <p>Вы вошли как: {session?.primaryAddress}</p>
      <button onClick={lockSession}>Заблокировать</button>
      <button onClick={logoutAndWipe}>Удалить данные</button>
    </div>
  );
}`;

  const serverVerifierSnippet = `// Server-Side Verification (Next.js App Router, Express, Fastify)
// POST /api/auth/verify
import { verifyBIP39Login } from '@bip39-auth/core/server/verifier';

export async function POST(req: Request) {
  const { challenge, signature, expectedAddress } = await req.json();

  // 1. Проверяем одноразовый nonce и подпись EIP-191 Secp256k1
  const result = verifyBIP39Login({ challenge, signature, expectedAddress });

  if (result.authenticated && result.userId) {
    // 2. Успешный вход! Выпускаем HTTP-only Cookie с идентификатором userId (0x...)
    return Response.json({ success: true, userId: result.userId });
  }

  return Response.json({ error: result.error || 'Неверная подпись' }, { status: 401 });
}`;

  const reactQuickStartSnippet = `import { useState } from 'react';
import { BIP39Onboarding } from '@/components/onboarding/BIP39Onboarding';
import { WalletCredentials } from '@/types/onboarding';

export function App() {
  const [wallet, setWallet] = useState<WalletCredentials | null>(null);

  if (!wallet) {
    return (
      <BIP39Onboarding
        config={{
          defaultWordCount: 12, // 12 или 24 слова
          allowPanicPin: true,  // Панический PIN активен
          allowPdfExport: true, // Экспорт PDF паспорта
          appName: 'SovereignApp'
        }}
        onComplete={(creds, pin, duressPin) => {
          console.log('Пользователь успешно зарегистрирован:', creds.masterFingerprint);
          setWallet(creds);
        }}
        onPanicTriggered={() => {
          console.warn('Панический PIN активирован: хранилище обнулено!');
          setWallet(null);
        }}
      />
    );
  }

  return <UserDashboard wallet={wallet} />;
}`;

  const kotlinComposeSnippet = `package com.bip39.vault.security

import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Android 14/15 Sovereign Hardware Security Setup
 * Замена SMS/Email авторизации на нативном Android
 */
class AndroidSecurityEnclave(private val activity: ComponentActivity) {

    // 1. Блокировка скриншотов, захвата экрана и Recent Apps превью
    fun applyFlagSecure() {
        activity.window.setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        )
    }

    // 2. Аппаратный чип StrongBox Titan M2 / TEE
    fun getSecurePrefs(): EncryptedSharedPreferences {
        val masterKey = MasterKey.Builder(activity)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .setRequestStrongBoxBacked(true)
            .build()

        return EncryptedSharedPreferences.create(
            activity,
            "bip39_vault_enclave",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        ) as EncryptedSharedPreferences
    }

    // 3. Панический сброс ($5 Wrench Attack Defense)
    fun triggerPanicWipe() {
        val prefs = getSecurePrefs()
        prefs.edit().clear().commit()
        activity.cacheDir.deleteRecursively()
        activity.filesDir.deleteRecursively()
        activity.finishAffinity() // Закрытие без сохранения стейта
    }
}`;

  const prompts = {
    master: {
      title: '1. Полная замена Email/SMS на BIP-39 (React/Vite)',
      text: `Ты — ведущий Web3 и Security инженер. Твоя задача — полностью удалить традиционную авторизацию по номеру телефона (SMS) и Email/паролю из текущего проекта и заменить ее на суверенный некастодиальный онбординг на базе библиотеки @bip39-auth/core.

Контекст и требования:
1. Архитектура: Zero-Knowledge, 100% Client-Side. Приложение не должно сохранять незашифрованные сид-фразы или приватные ключи в LocalStorage или отправлять их на бэкенд.
2. Онбординг:
   - Использовать компонент <BIP39Onboarding config={{ defaultWordCount: 12, allowPanicPin: true, allowPdfExport: true, appName: 'MyGreatApp' }} onComplete={handleAuthSuccess} onPanicTriggered={handleDuressWipe} />.
   - Поддержать выбор 12/24 мнемонических слов (CSPRNG).
   - Обязательный экран дисклеймера с подтверждением ответственности.
   - Защита от скриншотов: при потере фокуса окна (window.blur) накладывать Blur-Shield с предупреждением.
   - Экспорт Cold Storage PDF-паспорта с QR-кодом для физического резервного копирования.
3. Исправленная логика верификации фразы (CRITICAL):
   - Система случайно выбирает 3 слова из фразы. Для каждого предлагает 5 кнопок (1 верное + 4 случайных дистрактора из словаря BIP-39).
   - В случае ошибки выбора слова: НЕ разрешать продолжать. Немедленно возвращать пользователя на шаг назад к просмотру фразы с предупреждающим сообщением.
   - При повторной попытке верификации алгоритм ОБЯЗАН выбрать другие по порядку слова и сгенерировать совершенно новый набор случайных вариантов.
4. Безопасность и хранение:
   - Мастер PIN (6 цифр) шифрует хранилище через WebCrypto Subtle AES-256-GCM + PBKDF2 (100 000 раундов SHA-256).
   - Отдельный Панический PIN (Duress PIN): при его вводе все ключи, LocalStorage и кэш мгновенно обнуляются за 10 мс.
   - Интеграция с WebAuthn / BiometricPrompt для быстрого входа по Touch ID / Face ID / Android Fingerprint.
5. Результат:
   - Передать объекту сессии деривированный публичный адрес (0x...) как User ID. Никаких баз паролей и SMS шлюзов!`
    },
    nextjs: {
      title: '2. Next.js 14/15 App Router (Server Actions & EIP-191)',
      text: `Ты — Senior Full-Stack разработчик (Next.js 14/15 App Router, TypeScript).
Реализуй серверную аутентификацию на базе криптографической подписи EIP-191 без паролей и SMS.

Архитектура:
1. Server Action: generateAuthChallengeAction():
   - Генерирует криптографически стойкий nonce (16 байт hex).
   - Сохраняет nonce в зашифрованную сессионную куку iron-session или Redis с TTL 300 секунд.
   - Возвращает клиенту payload: { nonce, timestamp, domain, statement }.

2. Server Action: verifyAuthSignatureAction(payload, signature, expectedAddress):
   - Проверяет, что nonce совпадает с сохраненным в сессии и не истек по времени.
   - Использует secp256k1.Signature.fromBytes(...).addRecoveryBit(recovery).recoverPublicKey(digest) с хешем keccak_256 от префикса "\\x19Ethereum Signed Message:\\n" + message.
   - Извлекает публичный ключ, вычисляет Ethereum адрес (последние 20 байт keccak-256) и приводит к EIP-55 чексумме.
   - Сверяет полученный адрес с expectedAddress.
   - В случае совпадения: инвалидирует nonce, выпускает сессионную HTTP-only Cookie с userId: recoveredAddress и ролью пользователя.

3. Middleware (middleware.ts):
   - Защищает приватные маршруты (/dashboard, /settings, /wallet), проверяя наличие валидной сессионной куки без обращений к тяжелым базам данных.`
    },
    android: {
      title: '3. Нативный Android (Kotlin, Compose, StrongBox)',
      text: `Ты — Lead Android Security Architect. Реализуй нативный Android модуль онбординга BIP-39 на Kotlin и Jetpack Compose (Material 3).

Требования к безопасности уровня ОС Android:
1. Защита от скриншотов и записи экрана:
   - В MainActivity примени WindowManager.LayoutParams.FLAG_SECURE:
     window.setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE)
2. Аппаратный чип безопасности Android Keystore (StrongBox):
   - Создай MasterKey с флагом setRequestStrongBoxBacked(true), использующий физический чип Titan M2 / TEE.
3. BiometricPrompt API (Class 3 Strong):
   - Разблокировка хранилища по отпечатку пальца без повторного запроса PIN.
4. Панический PIN (Duress Mode Wipe):
   - При совпадении с паническим кодом: encryptedPrefs.edit().clear().commit(), context.cacheDir.deleteRecursively(), activity.finishAffinity().
5. Проверка сид-фразы:
   - При ошибке выбора слова — немедленный возврат на предыдущий экран.
   - При повторном входе генерировать новые позиции слов и новые случайные дистракторы.`
    },
    backend: {
      title: '4. Микросервис верификации (Node.js/Express/FastAPI)',
      text: `Ты — Backend Security Engineer. Твоя задача — написать легковесный эндпоинт аутентификации для Express / Fastify / FastAPI, проверяющий подлинность пользователя по сигнатуре EIP-191 без базы данных паролей.

Спецификация:
1. GET /api/v1/auth/nonce:
   - Возвращает одноразовый UUID/Hex nonce со сроком жизни 5 минут.
2. POST /api/v1/auth/verify:
   - Принимает { challenge, signature, address }.
   - Проверяет TTL и соответствие домена.
   - Восстанавливает публичный ключ через secp256k1 ecrecover.
   - Возвращает JWT токен или устанавливает HTTP-Only Cookie.
   - В токене sub = 0x... (публичный адрес аккаунта).`
    },
    reskin: {
      title: '5. UI/UX Стилизация (Киберпанк + Гауди + Матрица)',
      text: `Ты — Lead UI/UX Frontend Designer. Стилизуй онбординг BIP-39 в авторской концепции Cyberpunk + Gaudí + Matrix:
1. Палитра: Obsidian Black (#080914), Neon Cyan (#00F0FF), Cyber Amber (#F59E0B), Matrix Green (#00FF66), Deep Purple (#8B5CF6).
2. Архитектура Гауди: мозаичные рамки Trencadís градиентом с CSS-маской, плавные кривые, витражные акценты.
3. Элементы Матрицы: цифровой дождь на HTML5 Canvas с символами латиницы и катаканы, HUD-консоль телеметрии с моноширинным шрифтом JetBrains Mono.
4. Контрастность: строгое соответствие стандарту WCAG AA (контраст текста не менее 4.5:1).`
    }
  };

  return (
    <div className="w-full h-full max-h-full flex flex-col justify-between p-3 sm:p-5 overflow-hidden select-none">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 via-emerald-400 to-purple-500 p-px shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Package className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white">Библиотека @bip39-auth/core & AI Промпты</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Замена Email & Phone OTP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Суверенная аутентификация: 0 расходов на SMS, Zero-Knowledge, Duress-Resistant
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('lib');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'lib'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-emerald-400" />
            <span>Библиотека Core</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('cloud');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'cloud'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-sky-400" />
            <span>Облачное E2EE ☁️</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('howto');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'howto'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Руководство HOWTO</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('prompts');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'prompts'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Промпты (5)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('react');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'react'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-sky-400" />
            <span>React SDK</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('kotlin');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'kotlin'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Android Compose</span>
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="my-2 flex-1 overflow-hidden">
        {/* Tab 1: Library Overview & Usage */}
        {activeTab === 'lib' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full max-h-full overflow-hidden">
            <div className="cyber-card rounded-2xl p-4 border border-slate-800 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 shrink-0">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-emerald-400" />
                  Клиентская интеграция: &lt;BIP39AuthProvider /&gt;
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(libraryUsageSnippet, 'lib-client')}
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono cursor-pointer"
                >
                  {copiedKey === 'lib-client' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'lib-client' ? 'Скопировано' : 'Копировать'}</span>
                </button>
              </div>
              <pre className="flex-1 overflow-y-auto p-3 bg-slate-950/90 rounded-xl font-mono text-[11px] text-emerald-200/90 leading-relaxed border border-slate-900 scrollbar-thin">
                {libraryUsageSnippet}
              </pre>
            </div>

            <div className="cyber-card rounded-2xl p-4 border border-slate-800 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 shrink-0">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  Серверный верификатор: verifyBIP39Login()
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(serverVerifierSnippet, 'lib-server')}
                  className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-mono cursor-pointer"
                >
                  {copiedKey === 'lib-server' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'lib-server' ? 'Скопировано' : 'Копировать'}</span>
                </button>
              </div>
              <pre className="flex-1 overflow-y-auto p-3 bg-slate-950/90 rounded-xl font-mono text-[11px] text-sky-200/90 leading-relaxed border border-slate-900 scrollbar-thin">
                {serverVerifierSnippet}
              </pre>
            </div>
          </div>
        )}

        {/* Tab: Cloud Zero-Knowledge E2EE Storage & Identity */}
        {activeTab === 'cloud' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full max-h-full overflow-hidden">
            {/* Left: Interactive Crypto Workbench */}
            <div className="cyber-card rounded-2xl p-3 sm:p-4 border border-slate-800 flex flex-col justify-between overflow-hidden gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-white">
                    Живой стенд: Деривация ключей AES-256 для облака
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Zero-Knowledge E2EE
                </span>
              </div>

              {/* Configuration Inputs */}
              <div className="grid grid-cols-2 gap-2 shrink-0">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">
                    Облачный Namespace (изоляция сервиса):
                  </label>
                  <select
                    value={cloudNamespace}
                    onChange={(e) => {
                      setCloudNamespace(e.target.value);
                      setDemoEncryptedPayload(null);
                      setDemoDecryptedText(null);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-sky-300 outline-none focus:border-sky-500"
                  >
                    <option value="aws_s3_user_vault_v1">AWS S3 (s3_user_vault_v1)</option>
                    <option value="firebase_profiles_e2ee">Firebase Firestore (e2ee)</option>
                    <option value="supabase_cloud_drive">Supabase Storage (cloud_drive)</option>
                    <option value="ipfs_encrypted_docs">IPFS / Filecoin Docs</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">
                    Симметричный ключ AES (HKDF-SHA256):
                  </label>
                  <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg px-2 py-1 text-[11px] font-mono text-emerald-400 truncate">
                    {derivedKeyFp ? (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        FP:{derivedKeyFp}
                      </span>
                    ) : (
                      <span className="text-slate-500">Нажмите Зашифровать</span>
                    )}
                    <span className="truncate text-[10px] text-slate-400">
                      {derivedKeyHex ? `${derivedKeyHex.slice(0, 16)}...` : '32-byte key'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data to encrypt input */}
              <div className="flex-1 min-h-[90px] flex flex-col gap-1 overflow-hidden">
                <label className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Данные пользователя для отправки в облако (JSON / Text):</span>
                  <span className="text-slate-500 text-[10px]">Шифруются локально на клиенте</span>
                </label>
                <textarea
                  value={demoInputData}
                  onChange={(e) => setDemoInputData(e.target.value)}
                  className="w-full flex-1 p-2 bg-slate-950/90 border border-slate-900 rounded-lg font-mono text-[11px] text-slate-300 resize-none outline-none focus:border-slate-700 scrollbar-thin"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={isProcessingCrypto}
                  onClick={handleCloudEncrypt}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.3)] disabled:opacity-50"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Зашифровать для облака (AES-256-GCM)</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessingCrypto || !demoEncryptedPayload}
                  onClick={handleCloudDecrypt}
                  className="py-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Расшифровать обратно</span>
                </button>
              </div>

              {/* Real-time Crypto Output */}
              <div className="h-24 shrink-0 bg-slate-950/90 rounded-xl p-2.5 border border-slate-900 flex flex-col justify-between overflow-hidden font-mono text-[10px]">
                {demoEncryptedPayload ? (
                  <div className="flex flex-col gap-1 overflow-y-auto scrollbar-thin">
                    <div className="flex items-center justify-between text-sky-400">
                      <span>✓ В облако отправляется только этот зашифрованный блоб:</span>
                      <span className="text-slate-500">IV: {demoEncryptedPayload.ivBase64}</span>
                    </div>
                    <p className="text-slate-400 break-all select-all">
                      {demoEncryptedPayload.ciphertextBase64}
                    </p>
                    {demoDecryptedText && (
                      <div className="mt-1 pt-1 border-t border-slate-800 text-emerald-400">
                        <span>✓ Успешно расшифровано: </span>
                        <span className="text-slate-200">{demoDecryptedText.slice(0, 100)}...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-center">
                    Нажмите «Зашифровать для облака», чтобы увидеть реальный зашифрованный блоб и вектор IV
                  </div>
                )}
              </div>
            </div>

            {/* Right: Architecture & Drop-in Integration Code */}
            <div className="cyber-card rounded-2xl p-3 sm:p-4 border border-slate-800 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-sky-400" />
                  Интеграция в AWS S3, Firebase, Supabase
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(cloudCodeSnippet, 'cloud-code')}
                  className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-mono cursor-pointer"
                >
                  {copiedKey === 'cloud-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'cloud-code' ? 'Скопировано' : 'Копировать'}</span>
                </button>
              </div>

              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80 my-1 text-[11px] text-slate-300 space-y-1 shrink-0">
                <div className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Идентификация (User ID):</strong> EVM-адрес (0x...) регистрируется как уникальный идентификатор профиля. Пароли и телефоны не нужны.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span><strong>Детерминированные ключи:</strong> HKDF-SHA256 генерирует уникальный AES-ключ для каждого облачного хранилища без передачи ключа на сервер.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Zero-Knowledge:</strong> Даже при полном взломе облачной базы данных злоумышленник получит лишь шум без шансов на расшифровку.</span>
                </div>
              </div>

              <pre className="flex-1 overflow-y-auto p-3 bg-slate-950/90 rounded-xl font-mono text-[11px] text-slate-300 leading-relaxed border border-slate-900 scrollbar-thin">
                {cloudCodeSnippet}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 2: HOWTO Guide */}
        {activeTab === 'howto' && (
          <div className="cyber-card rounded-2xl p-4 border border-slate-800 h-full max-h-full flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">
                  HOWTO: Замена SMS и Email на BIP-39 в любом приложении
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(`# Полное руководство разработчика: Интеграция @bip39-auth/core\n\nСм. файл HOWTO.md`, 'howto-copy')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700 cursor-pointer"
                >
                  {copiedKey === 'howto-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-sky-400" />}
                  <span>{copiedKey === 'howto-copy' ? 'Скопировано' : 'Копировать'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadFile(`# Полное руководство: Замена Email и SMS на BIP-39\n\nСм. HOWTO.md в репозитории проекта.`, 'HOWTO.md')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-mono cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Скачать HOWTO.md</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-950/80 rounded-xl space-y-3 font-sans text-xs text-slate-300 leading-relaxed border border-slate-900 scrollbar-thin">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <h4 className="font-bold text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  1. Экономика и 0 затрат на SMS
                </h4>
                <p>
                  Вместо оплаты $0.05–$0.15 за каждую SMS через Twilio/MessageBird пользователь генерирует мастер-пару на клиенте с 128 битами чистой энтропии. База данных пользователей не содержит персональных данных (PII), что исключает штрафы по GDPR и риски утечек.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <h4 className="font-bold text-sky-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  2. Исправленная верификация сид-фразы
                </h4>
                <p>
                  В случае неверного выбора слова интерфейс автоматически возвращает пользователя на шаг назад для повторной проверки фразы. При следующем переходе алгоритм гарантированно выбирает другие по порядку слова и новый набор вариантов.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <h4 className="font-bold text-rose-300 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  3. Панический PIN (Duress Mode)
                </h4>
                <p>
                  Пользователь настраивает основной PIN (например, 123456) и отдельный Панический PIN (например, 999999). При физическом принуждении ввод панического PIN мгновенно обнуляет все ключи за 10 мс.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: AI Prompts */}
        {activeTab === 'prompts' && (
          <div className="cyber-card rounded-2xl p-4 border border-slate-800 h-full max-h-full flex flex-col justify-between overflow-hidden">
            {/* Prompt Selector Pills */}
            <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-800 overflow-x-auto shrink-0">
              {(['master', 'nextjs', 'android', 'backend', 'reskin'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setActivePromptSubtab(key);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activePromptSubtab === key
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-900/60'
                  }`}
                >
                  {prompts[key].title}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between py-2 shrink-0">
              <span className="text-xs font-bold text-white">{prompts[activePromptSubtab].title}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(prompts[activePromptSubtab].text, `prompt-${activePromptSubtab}`)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-500/20 to-sky-500/20 border border-purple-500/40 text-[11px] text-purple-200 font-mono cursor-pointer hover:bg-purple-500/30"
                >
                  {copiedKey === `prompt-${activePromptSubtab}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === `prompt-${activePromptSubtab}` ? 'Промпт скопирован!' : 'Копировать для AI-агента'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadFile(prompts[activePromptSubtab].text, `PROMPT_${activePromptSubtab.toUpperCase()}.md`)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-700 text-[11px] font-mono cursor-pointer hover:text-white"
                >
                  <Download className="w-3 h-3" />
                  <span>.md</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 bg-slate-950/90 rounded-xl font-mono text-[11px] text-slate-300 leading-relaxed border border-slate-900 whitespace-pre-wrap select-all scrollbar-thin">
              {prompts[activePromptSubtab].text}
            </div>
          </div>
        )}

        {/* Tab 4: React SDK */}
        {activeTab === 'react' && (
          <div className="cyber-card rounded-2xl p-4 border border-slate-800 h-full max-h-full flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 shrink-0">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                QuickStart: &lt;BIP39Onboarding /&gt; в React
              </span>
              <button
                type="button"
                onClick={() => handleCopy(reactQuickStartSnippet, 'react-quick')}
                className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-mono cursor-pointer"
              >
                {copiedKey === 'react-quick' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'react-quick' ? 'Скопировано' : 'Копировать'}</span>
              </button>
            </div>
            <pre className="flex-1 overflow-y-auto p-3 bg-slate-950/90 rounded-xl font-mono text-[11px] text-slate-300 leading-relaxed border border-slate-900 scrollbar-thin">
              {reactQuickStartSnippet}
            </pre>
          </div>
        )}

        {/* Tab 5: Kotlin Android SDK */}
        {activeTab === 'kotlin' && (
          <div className="cyber-card rounded-2xl p-4 border border-slate-800 h-full max-h-full flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 shrink-0">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                Kotlin Jetpack Compose: AndroidSecurityEnclave.kt (FLAG_SECURE + StrongBox)
              </span>
              <button
                type="button"
                onClick={() => handleCopy(kotlinComposeSnippet, 'kotlin-code')}
                className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono cursor-pointer"
              >
                {copiedKey === 'kotlin-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'kotlin-code' ? 'Скопировано' : 'Копировать'}</span>
              </button>
            </div>
            <pre className="flex-1 overflow-y-auto p-3 bg-slate-950/90 rounded-xl font-mono text-[11px] text-emerald-200/90 leading-relaxed border border-slate-900 scrollbar-thin">
              {kotlinComposeSnippet}
            </pre>
          </div>
        )}
      </div>

      {/* Bottom Footer Strip */}
      <div className="shrink-0 pt-1 text-[11px] font-mono text-slate-500 flex items-center justify-between border-t border-slate-900">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>TypeScript & Kotlin Library · Пакет @bip39-auth/core v1.0.0</span>
        </span>
        <span>Файлы: HOWTO.md · AGENT_PROMPTS.md</span>
      </div>
    </div>
  );
};
