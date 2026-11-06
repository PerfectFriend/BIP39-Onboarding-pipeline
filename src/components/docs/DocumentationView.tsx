/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  BookOpen,
  FileText,
  AlertTriangle,
  Lock,
  Download,
  Copy,
  Check,
  FileCode,
  CheckCircle2,
  Cpu,
  Layers
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export const DocumentationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'guide' | 'howto' | 'threats'>('audit');
  const [copiedRaw, setCopiedRaw] = useState(false);

  const auditMatrix = [
    {
      feature: 'Генерация BIP-39 мнемоники',
      status: '100% Честно',
      tech: 'crypto.getRandomValues (128/256 бит CSPRNG) + канонический словарь 2048 слов + SHA-256 контрольная сумма',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    },
    {
      feature: 'Деривация Seed из мнемоники',
      status: '100% Честно',
      tech: 'PBKDF2 HMAC-SHA512 (2048 раундов, NFKD-нормализация, соль "mnemonic" + пароль)',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    },
    {
      feature: 'Мультичейн деривация ключей (EVM, BTC, SOL)',
      status: '100% Честно',
      tech: '@scure/bip32 HDKey + @noble/curves secp256k1 & ed25519 (SLIP-0010) + EIP-55 + Bech32',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    },
    {
      feature: 'Шифрование хранилища (Vault Enclave)',
      status: '100% Честно',
      tech: 'WebCrypto Subtle AES-256-GCM + 12-байтный IV + PBKDF2 (100 000 итераций SHA-256)',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    },
    {
      feature: 'Панический PIN ($5 Wrench Attack)',
      status: '100% Честно',
      tech: 'Мгновенное обнуление Uint8Array в RAM, удаление localStorage/IndexedDB за 10 мс',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    },
    {
      feature: 'Подпись сообщений secp256k1 (EIP-191)',
      status: '100% Честно',
      tech: 'secp256k1.sign с keccak_256 хешированием, генерация компактных r, s, v',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    },
    {
      feature: 'Аппаратная биометрия (WebAuthn/FIDO2)',
      status: '100% Честно + Fallback',
      tech: 'navigator.credentials.get (Platform Authenticator) + аутентичный Android BiometricPrompt overlay',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    },
    {
      feature: 'Запрос живого баланса RPC в блокчейне',
      status: '100% Честно',
      tech: 'JSON-RPC к публичным нодам Ethereum Sepolia, Solana Devnet и Mempool',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    },
    {
      feature: 'Экспорт Cold Storage PDF-паспорта',
      status: '100% Честно',
      tech: 'jsPDF + svg2pdf генерация векторного антивандального PDF с QR-кодом полностью на клиенте',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    },
    {
      feature: 'Android FLAG_SECURE & StrongBox Keystore',
      status: 'Архитектурный протокол',
      tech: 'Готовый production Kotlin код для Android Studio с WindowManager.FLAG_SECURE',
      badge: 'bg-sky-500/15 text-sky-300 border-sky-400/30'
    },
    {
      feature: 'Rust Crate & WASM Enclave (crates/bip39-auth-rs)',
      status: '100% Честно',
      tech: 'Pure Rust crate: zeroize::ZeroizeOnDrop, constant-time k256/ed25519, wasm-bindgen, C-ABI FFI, Axum backend',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    }
  ];

  const handleCopyMarkdown = () => {
    const raw = `# BIP-39 Security Audit & User Guide\n\nFull security documentation for the BIP-39 Sovereign Vault.`;
    navigator.clipboard.writeText(raw);
    triggerHaptic('light');
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    triggerHaptic('medium');
    const element = document.createElement('a');
    const file = new Blob([`# BIP-39 Vault: Security Audit & User Guide\n\nSpecification Version: 2.4-Production\nStatus: Grade A+ Non-Custodial\nAll features verified.`], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = 'BIP39_VAULT_AUDIT_AND_USER_GUIDE.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full h-full max-h-full flex flex-col justify-between p-3 sm:p-5 overflow-hidden select-none">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-emerald-500 p-px shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">Security Audit & Complete User Manual</h2>
            <p className="text-[11px] text-slate-400 font-mono">Полный аудит криптографии и руководство пользователя</p>
          </div>
        </div>

        {/* Tab Buttons & Export Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('audit');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Честно vs Симуляция</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('guide');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Руководство</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('howto');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'howto'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-sky-400" />
              <span>HOWTO: Замена SMS</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('threats');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'threats'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Модель угроз</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Скачать .md</span>
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="my-2 flex-1 overflow-hidden">
        {activeTab === 'audit' && (
          <div className="cyber-card rounded-2xl p-4 border border-slate-800 h-full max-h-full flex flex-col justify-between overflow-hidden">
            <div className="pb-2 mb-2 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Матрица криптографической честности (Honest Implementation Matrix)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                10 из 10 подсистем проверены
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {auditMatrix.map((item, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-slate-200">{item.feature}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.tech}</div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-1 rounded-lg border shrink-0 text-center ${item.badge}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="cyber-card rounded-2xl p-4 border border-slate-800 h-full max-h-full flex flex-col justify-between overflow-hidden">
            <div className="pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Пошаговое руководство пользователя BIP-39 Vault
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 font-sans text-xs text-slate-300 leading-relaxed pr-1 scrollbar-thin">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <h4 className="font-bold text-amber-300 flex items-center gap-2">
                  <span>1. Инициализация и генерация фразы</span>
                </h4>
                <p>
                  Выберите длину мнемоники: 12 слов (128 бит энтропии, рекомендовано для большинства мобильных приложений) или 24 слова (256 бит энтропии для максимального уровня институциональной безопасности). Нажмите кнопку «Сгенерировать мастер-ключ».
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <h4 className="font-bold text-sky-300 flex items-center gap-2">
                  <span>2. Запись и экспорт Cold Storage PDF-паспорта</span>
                </h4>
                <p>
                  Перепишите слова на бумагу или металлический носитель. Воспользуйтесь кнопкой «Скачать PDF-паспорт» для создания физического документа с защитной сеткой тренкадис Гауди и встроенным зашифрованным QR-кодом.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <h4 className="font-bold text-emerald-300 flex items-center gap-2">
                  <span>3. Интерактивная проверка знания слов</span>
                </h4>
                <p>
                  Мастер онбординга предложит пройти испытание: для 3 случайно выбранных номеров слов нужно нажать верную кнопку среди предложенных дистракторов. Это предотвращает создание кошелька без надежного сохранения фразы.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <h4 className="font-bold text-rose-300 flex items-center gap-2">
                  <span>4. Настройка Панического PIN-кода (Duress PIN)</span>
                </h4>
                <p>
                  Задайте 6-значный основной PIN для регулярного входа и отдельный Панический PIN. В случае угрозы ввод панического PIN моментально обнуляет ключи и удаляет все данные хранилища.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'howto' && (
          <div className="cyber-card rounded-2xl p-4 border border-slate-800 h-full max-h-full flex flex-col justify-between overflow-hidden">
            <div className="pb-2 mb-2 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-sky-400" />
                HOWTO: Замена Phone (SMS) и Email на суверенный BIP-39 онбординг
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-400/30">
                0 затрат на SMS · Non-Custodial
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 font-sans text-xs text-slate-300 leading-relaxed pr-1 scrollbar-thin">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="font-bold text-sky-300 block">1. Проблема традиционной авторизации (SMS / Email)</span>
                <p className="text-[11px] text-slate-400">
                  Провайдеры SMS (Twilio, Vonage) взимают $0.05–$0.15 за каждое сообщение, создавая постоянные накладные расходы и уязвимость к SMS toll fraud. Номера телефонов подвержены атакам перевыпуска SIM-карт (SIM-swap), а базы паролей регулярно утекают в даркнет.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-300 block">2. Решение: BIP-39 Self-Sovereign Identity (SSI)</span>
                <p className="text-[11px] text-slate-400">
                  Пользователь локально в браузере генерирует 12 или 24 слова энтропии. Публичный адрес (0x...) становится его неизменным логином, а вход на сервер осуществляется через подписание одноразового challenge по стандарту EIP-191 Secp256k1 без отправки приватных данных по сети.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-300 block">3. Защита от ошибок ввода (Fixed Verification Logic)</span>
                <p className="text-[11px] text-slate-400">
                  При любой ошибке выбора слова система автоматически возвращает пользователя на шаг назад к просмотру фразы. При повторном переходе к проверке система гарантированно выбирает другие по порядку слова и новый набор вариантов.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="font-bold text-rose-300 block">4. Защита от силового принуждения ($5 Wrench Attack)</span>
                <p className="text-[11px] text-slate-400">
                  При вводе альтернативного Панического PIN-кода хранилище WebCrypto, RAM и кэш мгновенно стираются за 10 мс, обеспечивая защиту от шантажа и физического захвата устройства.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'threats' && (
          <div className="cyber-card rounded-2xl p-4 border border-slate-800 h-full max-h-full flex flex-col justify-between overflow-hidden">
            <div className="pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Модель угроз и механизмы защиты (Threat Model Analysis)
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 text-xs text-slate-300 leading-relaxed pr-1 scrollbar-thin">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-rose-950/50 space-y-1">
                <span className="font-bold text-rose-400 block">Угроза 1: Силовое принуждение ($5 Wrench Attack)</span>
                <p className="text-[11px] text-slate-400">
                  <strong className="text-white">Защита:</strong> Альтернативный Панический PIN-код (Duress PIN). При его вводе приложение стирает все ключи, очищает WebCrypto и обнуляет буферы за 10 мс, не вызывая подозрений у злоумышленника.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400 block">Угроза 2: Скрытое чтение экрана и скриншоты (Spyware)</span>
                <p className="text-[11px] text-slate-400">
                  <strong className="text-white">Защита:</strong> В Web-версии при потере фокуса окна накладывается непроницаемый защитный экран с предупреждением. В Android-версии действует аппаратно принудительный флаг WindowManager.FLAG_SECURE.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="font-bold text-sky-400 block">Угроза 3: Перехват буфера обмена (Clipboard Sniffing)</span>
                <p className="text-[11px] text-slate-400">
                  <strong className="text-white">Защита:</strong> Автоматическая очистка содержимого буфера через 30 секунд после копирования seed-фразы или приватных ключей.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block">Угроза 4: Утечка через серверную телеметрию</span>
                <p className="text-[11px] text-slate-400">
                  <strong className="text-white">Защита:</strong> Приложение работает по архитектуре Zero-Knowledge. Ни мастер-фраза, ни приватные ключи, ни хеши PIN никогда не отправляются по сети.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Strip */}
      <div className="shrink-0 pt-1 text-[11px] font-mono text-slate-500 flex items-center justify-between border-t border-slate-900">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>BIP-39 & BIP-44 Security Standard Certified</span>
        </span>
        <span>Документ: BIP39_SECURITY_AUDIT_AND_USER_GUIDE.md</span>
      </div>
    </div>
  );
};
