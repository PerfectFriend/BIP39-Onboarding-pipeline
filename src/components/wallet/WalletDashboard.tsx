import React, { useState } from 'react';
import { WalletCredentials } from '../../types/onboarding';
import { wipeAllVaultData } from '../../services/cryptoStorage';
import { exportPaperPassportPdf } from '../../services/pdfExport';
import { generateQrDataUrl } from '../../services/qrGenerator';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Check,
  Shield,
  Skull,
  LogOut,
  QrCode,
  FileDown,
  Eye,
  EyeOff,
  Code2,
  AlertTriangle,
  Sparkles,
  Lock,
  RefreshCw
} from 'lucide-react';

interface WalletDashboardProps {
  credentials: WalletCredentials;
  primaryPin: string;
  panicPin?: string;
  onLogout: () => void;
  onDuressTriggered: () => void;
  onOpenSdkModal: () => void;
  onOpenAiPromptsModal: () => void;
}

export const WalletDashboard: React.FC<WalletDashboardProps> = ({
  credentials,
  primaryPin,
  panicPin,
  onLogout,
  onDuressTriggered,
  onOpenSdkModal,
  onOpenAiPromptsModal
}) => {
  const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'ETH' | 'SOL'>('ETH');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [seedVerifyPin, setSeedVerifyPin] = useState('');
  const [seedVerifyError, setSeedVerifyError] = useState<string | null>(null);
  const [seedUnlocked, setSeedUnlocked] = useState(false);

  // Send & Receive modal states
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveQrUrl, setReceiveQrUrl] = useState<string>('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendRecipient, setSendRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);

  // Duress PIN test modal
  const [showDuressTestModal, setShowDuressTestModal] = useState(false);
  const [duressTestInput, setDuressTestInput] = useState('');
  const [duressTestFeedback, setDuressTestFeedback] = useState<string | null>(null);

  // Assets mockup with real addresses
  const assets = [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: '4.8520',
      price: '$3,420.50',
      fiatValue: '$16,596.26',
      change: '+3.42%',
      address: credentials.accounts.eth,
      iconColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30'
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      balance: '0.1245',
      price: '$67,400.00',
      fiatValue: '$8,391.30',
      change: '+1.85%',
      address: credentials.accounts.btc,
      iconColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      balance: '28.40',
      price: '$148.20',
      fiatValue: '$4,208.88',
      change: '+7.12%',
      address: credentials.accounts.sol,
      iconColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }
  ];

  const totalFiat = '$29,196.44';
  const activeAssetData = assets.find(a => a.symbol === selectedAsset)!;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleOpenReceive = async () => {
    const qr = await generateQrDataUrl(activeAssetData.address);
    setReceiveQrUrl(qr);
    setShowReceiveModal(true);
  };

  const handleSendTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendRecipient || !sendAmount) return;
    setSendSuccess(true);
    setTimeout(() => {
      setSendSuccess(false);
      setShowSendModal(false);
      setSendRecipient('');
      setSendAmount('');
    }, 2000);
  };

  // Trigger real duress wipe test
  const handleTestDuressPin = async () => {
    setDuressTestFeedback(null);
    if (!duressTestInput) return;

    if (panicPin && duressTestInput === panicPin) {
      // Emergency duress code matched!
      await wipeAllVaultData();
      setShowDuressTestModal(false);
      onDuressTriggered();
    } else if (duressTestInput === primaryPin) {
      setDuressTestFeedback('Вы ввели основной PIN-код. Паника НЕ активирована (данные сохранены).');
    } else {
      setDuressTestFeedback('Неверный код. Введите панический PIN для демонстрации экстренного уничтожения.');
    }
  };

  const handleExportPdf = () => {
    exportPaperPassportPdf({
      mnemonicWords: credentials.mnemonicWords,
      fingerprint: credentials.masterFingerprint,
      createdAt: credentials.createdAt
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-2">
      {/* Top Bar with Status and Quick Controls */}
      <div className="cyber-card rounded-2xl p-4 sm:p-5 mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-sky-400 p-px">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">BIP-39 Crypto Vault</h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Зашифровано AES-GCM
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
              <span>Fingerprint: {credentials.masterFingerprint}</span>
              <span>·</span>
              <span>{credentials.mnemonicWords.length} слов</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenAiPromptsModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            AI Prompts & Docs
          </button>

          <button
            type="button"
            onClick={onOpenSdkModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-400/30 text-xs font-semibold transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-sky-400" />
            SDK Инспектор
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs transition-colors border border-slate-700"
            title="Заблокировать сессию"
          >
            <LogOut className="w-3.5 h-3.5" />
            Заблокировать
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Portfolio & Main Balances */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Portfolio Card with Cosmic Gradient */}
          <div className="cyber-card rounded-3xl p-6 sm:p-8 relative overflow-hidden gaudi-mosaic-border">
            <div className="relative z-10">
              <span className="text-xs font-medium text-slate-400 block mb-1">
                Общий баланс портфеля
              </span>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-mono tabular-nums">
                  {totalFiat}
                </span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  +4.82% за 24ч
                </span>
              </div>

              {/* Action Buttons: Send & Receive */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setShowSendModal(true)}
                  className="py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(56,189,248,0.25)] cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Отправить
                </button>

                <button
                  type="button"
                  onClick={handleOpenReceive}
                  className="py-3 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-sky-400 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ArrowDownLeft className="w-4 h-4 text-amber-400" />
                  Получить
                </button>
              </div>

              {/* Active Asset Selector Tabs */}
              <div className="flex items-center gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
                {assets.map((asset) => (
                  <button
                    key={asset.symbol}
                    type="button"
                    onClick={() => setSelectedAsset(asset.symbol as any)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      selectedAsset === asset.symbol
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{asset.symbol}</span>
                    <span className="font-mono text-[11px] text-slate-500">({asset.balance})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Asset Details & Derived Address */}
          <div className="cyber-card rounded-3xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold font-mono text-sm ${activeAssetData.iconColor}`}>
                  {activeAssetData.symbol}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{activeAssetData.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Курс: {activeAssetData.price} · {activeAssetData.change}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white font-mono tabular-nums">
                  {activeAssetData.balance} {activeAssetData.symbol}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {activeAssetData.fiatValue}
                </div>
              </div>
            </div>

            {/* Derived Blockchain Address Box */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>Деривированный публичный адрес ({activeAssetData.symbol}):</span>
                <button
                  type="button"
                  onClick={() => handleCopy(activeAssetData.address, 'address')}
                  className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium"
                >
                  {copiedKey === 'address' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'address' ? 'Скопирован' : 'Копировать'}
                </button>
              </div>
              <div className="font-mono text-xs text-slate-200 break-all select-all bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                {activeAssetData.address}
              </div>
            </div>
          </div>

          {/* Recent Activity Mockup */}
          <div className="cyber-card rounded-3xl p-6 border border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-4">История транзакций</h3>
            <div className="space-y-3">
              {[
                { type: 'incoming', title: 'Получено ETH', time: 'Сегодня, 14:22', amount: '+0.5000 ETH', fiat: '+$1,710.25', hash: '0x3a8f...92c1' },
                { type: 'outgoing', title: 'Отправлено USDT', time: 'Вчера, 19:40', amount: '-450.00 USDT', fiat: '-$450.00', hash: '0x99e2...bb42' },
                { type: 'incoming', title: 'Получено SOL', time: '18 окт, 11:15', amount: '+12.00 SOL', fiat: '+$1,778.40', hash: '8xLm...K902' }
              ].map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      tx.type === 'incoming' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-sky-500/15 text-sky-400'
                    }`}>
                      {tx.type === 'incoming' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{tx.title}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{tx.time} · {tx.hash}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-bold font-mono ${
                      tx.type === 'incoming' ? 'text-emerald-400' : 'text-slate-200'
                    }`}>
                      {tx.amount}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">{tx.fiat}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Security Center & Duress Testing */}
        <div className="space-y-6">
          {/* Security Status Box */}
          <div className="cyber-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>Центр безопасности</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Алгоритм шифрования:</span>
                <span className="font-mono text-slate-200 font-semibold">AES-256-GCM</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Деривация ключа:</span>
                <span className="font-mono text-slate-200 font-semibold">PBKDF2 (100k)</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Панический PIN:</span>
                <span className={`font-mono font-semibold ${panicPin ? 'text-rose-400' : 'text-slate-500'}`}>
                  {panicPin ? 'Активен (Duress ON)' : 'Не установлен'}
                </span>
              </div>
            </div>

            {/* Export PDF Passport Button */}
            <button
              type="button"
              onClick={handleExportPdf}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-amber-400" />
              Скачать бумажный PDF-паспорт
            </button>

            {/* View Secret Seed Phrase Button */}
            <button
              type="button"
              onClick={() => setShowSeedModal(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-sky-400" />
              Просмотреть seed-фразу
            </button>
          </div>

          {/* Duress / Panic PIN Simulator Card */}
          <div className="cyber-card rounded-3xl p-6 border border-rose-500/30 bg-rose-950/15 space-y-3 relative overflow-hidden">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <Skull className="w-4 h-4 text-rose-400" />
              <span>Тестирование Панического PIN</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Проверьте работу защитного механизма принуждения: ввод панического PIN мгновенно и безвозвратно уничтожит секреты и вернет систему к заводскому состоянию.
            </p>

            <button
              type="button"
              onClick={() => setShowDuressTestModal(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.15)]"
            >
              <Skull className="w-4 h-4" />
              Симуляция ввода Panic PIN
            </button>
          </div>
        </div>
      </div>

      {/* RECEIVE MODAL */}
      {showReceiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="cyber-card rounded-3xl p-6 sm:p-7 max-w-sm w-full relative gaudi-mosaic-border text-center">
            <h3 className="text-lg font-bold text-white mb-1">
              Получить {activeAssetData.name} ({activeAssetData.symbol})
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Сканируйте QR-код для перевода на этот кошелек
            </p>

            {receiveQrUrl && (
              <div className="p-3 bg-white rounded-2xl w-52 h-52 mx-auto mb-4 flex items-center justify-center shadow-lg">
                <img src={receiveQrUrl} alt="Address QR" className="w-full h-full" />
              </div>
            )}

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 break-all mb-4">
              {activeAssetData.address}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleCopy(activeAssetData.address, 'receive_modal')}
                className="flex-1 py-2.5 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold uppercase hover:bg-sky-400 flex items-center justify-center gap-1.5"
              >
                {copiedKey === 'receive_modal' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedKey === 'receive_modal' ? 'Скопирован!' : 'Копировать адрес'}
              </button>
              <button
                type="button"
                onClick={() => setShowReceiveModal(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEND MODAL */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="cyber-card rounded-3xl p-6 sm:p-7 max-w-md w-full relative gaudi-mosaic-border">
            <h3 className="text-lg font-bold text-white mb-1">
              Отправить {activeAssetData.name} ({activeAssetData.symbol})
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Доступный баланс: {activeAssetData.balance} {activeAssetData.symbol}
            </p>

            {sendSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">Транзакция отправлена!</h4>
                <p className="text-xs text-slate-400">Транзакция транслируется в сеть блокчейн.</p>
              </div>
            ) : (
              <form onSubmit={handleSendTransaction} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Адрес получателя:
                  </label>
                  <input
                    type="text"
                    required
                    value={sendRecipient}
                    onChange={(e) => setSendRecipient(e.target.value)}
                    placeholder="0x... или bc1q..."
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:border-sky-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Сумма ({activeAssetData.symbol}):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      required
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:border-sky-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setSendAmount(activeAssetData.balance)}
                      className="absolute right-2 top-2 px-2 py-0.5 rounded bg-slate-800 text-[10px] text-sky-400 font-bold"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSendModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold uppercase hover:bg-sky-400"
                  >
                    Подтвердить и отправить
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* VIEW SEED PHRASE MODAL */}
      {showSeedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="cyber-card rounded-3xl p-6 sm:p-7 max-w-lg w-full relative gaudi-mosaic-border">
            <h3 className="text-lg font-bold text-white mb-1">
              Экспорт секретной seed-фразы
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Для просмотра подтвердите ваш основной PIN-код.
            </p>

            {!seedUnlocked ? (
              <div className="space-y-4">
                <input
                  type="password"
                  maxLength={6}
                  value={seedVerifyPin}
                  onChange={(e) => {
                    setSeedVerifyPin(e.target.value);
                    setSeedVerifyError(null);
                  }}
                  placeholder="Введите PIN-код"
                  className="w-full py-2.5 text-center font-mono text-lg bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-sky-400"
                />

                {seedVerifyError && (
                  <p className="text-xs text-rose-400">{seedVerifyError}</p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSeedModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (seedVerifyPin === primaryPin) {
                        setSeedUnlocked(true);
                      } else {
                        setSeedVerifyError('Неверный PIN-код');
                      }
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold uppercase hover:bg-sky-400"
                  >
                    Подтвердить
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  {credentials.mnemonicWords.map((w, i) => (
                    <div key={i} className="text-xs font-mono text-slate-300">
                      <span className="text-slate-500 mr-1.5">{i + 1}.</span>
                      {w}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowSeedModal(false);
                    setSeedUnlocked(false);
                    setSeedVerifyPin('');
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold"
                >
                  Закрыть и скрыть
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DURESS PIN SIMULATOR MODAL */}
      {showDuressTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="cyber-card rounded-3xl p-6 sm:p-7 max-w-sm w-full relative border border-rose-500/50 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto mb-3">
              <Skull className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Симуляция принуждения (Duress)
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Введите панический PIN-код, настроенный на онбординге:
              {panicPin ? <span className="block text-rose-300 font-mono mt-1">Подсказка: ваш Panic PIN: {panicPin}</span> : <span className="block text-slate-500 mt-1">Панический PIN не был задан</span>}
            </p>

            <input
              type="password"
              maxLength={6}
              value={duressTestInput}
              onChange={(e) => setDuressTestInput(e.target.value)}
              placeholder="••••••"
              className="w-full py-3 text-center text-2xl tracking-[0.5em] font-mono bg-slate-950 border border-rose-500/40 rounded-xl text-rose-300 outline-none focus:border-rose-400 mb-3"
            />

            {duressTestFeedback && (
              <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 mb-4 text-left">
                {duressTestFeedback}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDuressTestModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleTestDuressPin}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.3)]"
              >
                Проверить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
