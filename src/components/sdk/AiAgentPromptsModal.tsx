import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, BookOpen, ShieldCheck, Terminal, Cpu } from 'lucide-react';

interface AiAgentPromptsModalProps {
  onClose: () => void;
}

export const AiAgentPromptsModal: React.FC<AiAgentPromptsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'master' | 'security' | 'web3' | 'reskin'>('master');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const masterPrompt = `Ты — ведущий Web3 и Security инженер. Твоя задача — интегрировать готовый production-grade BIP-39 онбординг-модуль в текущее React/Next.js приложение.

Требования к интеграции:
1. Использовать готовый компонент <BIP39Onboarding config={...} onComplete={handleWalletReady} onPanicTriggered={handleEmergencyWipe} />.
2. Поддержать выбор 12/24 мнемонических слов (128 / 256 бит энтропии по BIP-39).
3. Обеспечить обязательный экран дисклеймера с личной ответственностью пользователя и блокирующим чекбоксом.
4. Включить защиту от скриншотов: при потере фокуса окна (window.blur) или нажатии клавиш PrintScreen / Cmd+Shift+S накладывать плотный blur-shield с предупреждением.
5. Реализовать экспорт Cold Storage PDF-паспорта со списком слов и встроенным QR-кодом для быстрого восстановления.
6. Обязательная интерактивная верификация: случайно выбрать 3 слова из фразы; для каждого предложить 5 кнопок (1 верное + 4 дистрактора из словаря BIP-39).
7. Задание 6-значного мастер-PIN с шифрованием AES-GCM (256-бит, PBKDF2 100,000 итераций).
8. Задание отдельного Панического PIN-кода (Duress PIN): при его вводе все ключи и локальные данные мгновенно и безвозвратно стираются, а приложение сбрасывается в исходное состояние.
9. Поддержать 3 пути восстановления: ручной ввод с автодополнением по словарю, сканирование QR-кода с камеры/файла и загрузку PDF-паспорта.
10. По завершении передать объекту хост-приложения деривированные аккаунты (BTC, ETH, SOL), seedHex и мастер-отпечаток (fingerprint). Не сохранять приватные ключи в незашифрованном виде.`;

  const securityPrompt = `Действуй как аудитор информационной безопасности криптовалютных кошельков. Проведи hardening и аудит текущего модуля онбординга BIP-39 по следующим стандартам:

1. WebCrypto Zero-Leakage:
   - Проверь, что ключи шифруются исключительно через AES-GCM (256-бит) со случайным 12-байтным IV и 16-байтной солью.
   - Деривация PBKDF2 должна использовать не менее 100 000 итераций SHA-256.
   - В открытом виде мнемоника и seed никогда не должны попадать в localStorage или cookies.

2. Duress Protection (Панический PIN):
   - Проверь, что хэш панического PIN вычисляется с отдельной солью и при совпадении вызывает мгновенный wipeAllVaultData() (очистка localStorage, sessionStorage, IndexedDB, обнуление state).

3. Clipboard & Screen Defense:
   - Функция копирования фразы в буфер обмена должна автоматически очищать clipboard через 60 секунд.
   - Убедись, что на элементе с мнемоникой стоят атрибуты -webkit-user-select: none и заблокированы contextmenu и dragstart.`;

  const web3Prompt = `Интегрируй полученные из BIP-39 онбординга учетные данные в стек Web3 библиотек (Ethers.js v6 / Viem для EVM, @solana/web3.js для Solana):

1. EVM (Ethereum / Arbitrum / Polygon):
   import { HDNodeWallet } from 'ethers';
   const evmWallet = HDNodeWallet.fromPhrase(mnemonic, undefined, "m/44'/60'/0'/0/0");
   // Получаем evmWallet.address, evmWallet.privateKey

2. Solana (Ed25519):
   import { Keypair } from '@solana/web3.js';
   import { derivePath } from 'ed25519-hd-key';
   const derivedSeed = derivePath("m/44'/501'/0'/0'", seedHex).key;
   const solanaKeypair = Keypair.fromSeed(derivedSeed);

3. Сгенерируй провайдер состояния useCryptoWallet(), предоставляющий доступ к провайдеру, балансам, подписанию сообщений (signMessage) и транзакций, с безопасной блокировкой по таймауту неактивности.`;

  const reskinPrompt = `Адаптируй визуальный дизайн BIP-39 онбординга под фирменный стиль проекта:
1. Замени цветовую палитру:
   - Фон: обсидиановый темный [#080914] с акцентными вихрями звездной ночи Ван Гога (золото [#F59E0B] + лазурный циан [#38BDF8]).
   - Карточки: стеклянный глассморфизм (backdrop-blur-xl, 1px border с градиентом тренкадис Гауди).
2. Типографика: заголовки Plus Jakarta Sans / Outfit, моноширинный код и мнемоника — JetBrains Mono.
3. Сохрани идеальную доступность (WCAG AA) и плавные микро-анимации состояний переходов.`;

  const prompts = [
    {
      id: 'master',
      title: 'Мастер-Промпт для AI-Агента',
      subtitle: 'Внедрение онбординга в любой проект за 1 клик (Cursor, Windsurf, Claude, Copilot)',
      content: masterPrompt,
      icon: Terminal,
      color: 'text-sky-400'
    },
    {
      id: 'security',
      title: 'Промпт Аудита и Безопасности',
      subtitle: 'Харденинг WebCrypto AES-GCM, Anti-Screenshot и Panic-Wipe',
      content: securityPrompt,
      icon: ShieldCheck,
      color: 'text-emerald-400'
    },
    {
      id: 'web3',
      title: 'Промпт Подключения Web3',
      subtitle: 'Связка с Ethers.js, Viem, Solana Web3 и деривация BIP-44',
      content: web3Prompt,
      icon: Cpu,
      color: 'text-amber-400'
    },
    {
      id: 'reskin',
      title: 'Промпт Кастомизации Брендинга',
      subtitle: 'Настройка цветов, шрифтов и стилистики Киберпанк + Ван Гог + Гауди',
      content: reskinPrompt,
      icon: Sparkles,
      color: 'text-purple-400'
    }
  ];

  const activePromptData = prompts.find(p => p.id === activeTab)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="cyber-card rounded-3xl p-6 sm:p-8 max-w-3xl w-full relative gaudi-mosaic-border max-h-[90vh] flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  AI Integration Prompts & Документация
                </h2>
                <p className="text-xs text-slate-400">
                  Готовые системные промпты для быстрой и унифицированной работы AI кодеров
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            {prompts.map((p) => {
              const Icon = p.icon;
              const isActive = activeTab === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveTab(p.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isActive
                      ? 'bg-sky-500/15 border-sky-400 text-white shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1.5 ${p.color}`} />
                  <div className="text-xs font-bold leading-tight line-clamp-1">{p.title}</div>
                </button>
              );
            })}
          </div>

          {/* Active Prompt Box */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-200">{activePromptData.title}</h3>
                <p className="text-[11px] text-slate-400">{activePromptData.subtitle}</p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(activePromptData.content, activePromptData.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-[0_0_15px_rgba(56,189,248,0.2)] cursor-pointer"
              >
                {copiedId === activePromptData.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === activePromptData.id ? 'Скопировано!' : 'Скопировать промпт'}
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-y-auto max-h-[320px] whitespace-pre-wrap leading-relaxed">
              {activePromptData.content}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>Вставьте этот промпт в Cursor / Windsurf / Claude для мгновенного результата</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
