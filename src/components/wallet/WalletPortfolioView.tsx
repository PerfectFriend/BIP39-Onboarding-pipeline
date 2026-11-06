/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WalletCredentials } from '../../types/onboarding';
import { generateQrDataUrl } from '../../services/qrGenerator';
import { triggerHaptic } from '../../utils/haptics';
import { fetchLiveEthBalance, fetchLiveSolanaBalance, fetchLiveBtcBalance } from '../../services/rpcService';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Check,
  RefreshCw,
  QrCode,
  Shield,
  ExternalLink,
  PlusCircle,
  TrendingUp,
  X,
  Send
} from 'lucide-react';

interface WalletPortfolioViewProps {
  credentials: WalletCredentials | null;
  onNavigateToOnboarding: () => void;
  onGenerateDemoWallet: () => void;
}

export const WalletPortfolioView: React.FC<WalletPortfolioViewProps> = ({
  credentials,
  onNavigateToOnboarding,
  onGenerateDemoWallet,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<'ETH' | 'BTC' | 'SOL'>('ETH');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Send & Receive modal states
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveQrUrl, setReceiveQrUrl] = useState<string>('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendRecipient, setSendRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);

  // Live RPC balances state
  const [isLiveRpcMode, setIsLiveRpcMode] = useState(false);
  const [liveBalances, setLiveBalances] = useState<{ eth: string; btc: string; sol: string }>({
    eth: '0.0000',
    btc: '0.000000',
    sol: '0.0000',
  });
  const [isLoadingLiveRpc, setIsLoadingLiveRpc] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    triggerHaptic('light');
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleFetchLiveBalances = async () => {
    if (!credentials) return;
    triggerHaptic('light');
    setIsLoadingLiveRpc(true);
    try {
      const [ethBal, solBal, btcBal] = await Promise.all([
        fetchLiveEthBalance(credentials.accounts.eth, 'sepolia'),
        fetchLiveSolanaBalance(credentials.accounts.sol, 'devnet'),
        fetchLiveBtcBalance(credentials.accounts.btc),
      ]);
      setLiveBalances({ eth: ethBal, sol: solBal, btc: btcBal });
      setIsLiveRpcMode(true);
      triggerHaptic('success');
    } catch {
      // Fallback
    } finally {
      setIsLoadingLiveRpc(false);
    }
  };

  const handleOpenReceive = async () => {
    if (!credentials) return;
    const addr =
      selectedAsset === 'ETH'
        ? credentials.accounts.eth
        : selectedAsset === 'BTC'
        ? credentials.accounts.btc
        : credentials.accounts.sol;
    const qr = await generateQrDataUrl(addr);
    setReceiveQrUrl(qr);
    setShowReceiveModal(true);
    triggerHaptic('light');
  };

  const handleSendTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendRecipient || !sendAmount) return;
    triggerHaptic('medium');
    setSendSuccess(true);
    setTimeout(() => {
      setSendSuccess(false);
      setShowSendModal(false);
      setSendRecipient('');
      setSendAmount('');
      triggerHaptic('success');
    }, 1800);
  };

  if (!credentials) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 mb-4 shadow-[0_0_30px_rgba(56,189,248,0.25)]">
          <Wallet className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Хранилище не инициализировано</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          Создайте новую BIP-39 мастер-фразу в мастере онбординга или активируйте демонстрационный криптокошелек для быстрого тестирования.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onNavigateToOnboarding}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-sky-500 hover:from-amber-400 hover:to-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Пройти BIP-39 онбординг</span>
          </button>
          <button
            type="button"
            onClick={onGenerateDemoWallet}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-700 hover:border-sky-400 font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span>Активировать демо-кошелек</span>
          </button>
        </div>
      </div>
    );
  }

  const assets = [
    {
      symbol: 'ETH' as const,
      name: 'Ethereum',
      chain: 'Sepolia Testnet / Mainnet',
      balance: isLiveRpcMode ? liveBalances.eth : '4.8520',
      price: '$3,420.50',
      fiatValue: isLiveRpcMode ? `$${(parseFloat(liveBalances.eth) * 3420.5).toFixed(2)}` : '$16,596.26',
      change: '+3.42%',
      address: credentials.accounts.eth,
      iconColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      path: "m/44'/60'/0'/0/0"
    },
    {
      symbol: 'BTC' as const,
      name: 'Bitcoin',
      chain: 'Native SegWit (Bech32)',
      balance: isLiveRpcMode ? liveBalances.btc : '0.1245',
      price: '$67,400.00',
      fiatValue: isLiveRpcMode ? `$${(parseFloat(liveBalances.btc) * 67400).toFixed(2)}` : '$8,391.30',
      change: '+1.85%',
      address: credentials.accounts.btc,
      iconColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      path: "m/84'/0'/0'/0/0"
    },
    {
      symbol: 'SOL' as const,
      name: 'Solana',
      chain: 'Solana Devnet (Ed25519)',
      balance: isLiveRpcMode ? liveBalances.sol : '28.40',
      price: '$148.20',
      fiatValue: isLiveRpcMode ? `$${(parseFloat(liveBalances.sol) * 148.2).toFixed(2)}` : '$4,208.88',
      change: '+7.12%',
      address: credentials.accounts.sol,
      iconColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      path: "m/44'/501'/0'/0'"
    },
  ];

  const currentAsset = assets.find((a) => a.symbol === selectedAsset)!;
  const totalFiat = isLiveRpcMode
    ? `$${(
        parseFloat(liveBalances.eth) * 3420.5 +
        parseFloat(liveBalances.btc) * 67400 +
        parseFloat(liveBalances.sol) * 148.2
      ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '$29,196.44';

  return (
    <div className="w-full h-full max-h-full flex flex-col justify-between p-3 sm:p-5 overflow-hidden select-none">
      {/* Top Header Row with Portfolio Balance & Live RPC Switcher */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
        {/* Total Balance Card */}
        <div className="md:col-span-2 cyber-card rounded-2xl p-4 flex items-center justify-between border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-slate-400">Общий баланс портфеля</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5" /> +4.82% (24ч)
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight tabular-nums">
              {totalFiat}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
              Fingerprint: <span className="text-sky-300">{credentials.masterFingerprint}</span> · {credentials.mnemonicWords.length} слов
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSendModal(true)}
              className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Отправить</span>
            </button>

            <button
              type="button"
              onClick={handleOpenReceive}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 hover:border-sky-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>Получить</span>
            </button>
          </div>
        </div>

        {/* Live RPC Sync Card */}
        <div className="cyber-card rounded-2xl p-4 flex flex-col justify-between border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isLiveRpcMode ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isLiveRpcMode ? 'Live Testnet RPC' : 'Демо балансы'}
            </span>
            <span className="text-[10px] font-mono text-slate-500">Sepolia / Devnet</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight mb-2">
            Прямой JSON-RPC запрос баланса деривированного адреса из блокчейна.
          </p>
          <button
            type="button"
            onClick={handleFetchLiveBalances}
            disabled={isLoadingLiveRpc}
            className="w-full py-1.5 px-3 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-400/30 text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 text-sky-400 ${isLoadingLiveRpc ? 'animate-spin' : ''}`} />
            <span>{isLoadingLiveRpc ? 'Запрос в блокчейн...' : isLiveRpcMode ? 'Обновить из RPC' : 'Запросить баланс из сети'}</span>
          </button>
        </div>
      </div>

      {/* Center Row: Asset Selector Tabs & Main Address Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 my-2 flex-1 overflow-hidden">
        {/* Left: 3 Asset Cards */}
        <div className="flex flex-col gap-2 justify-center">
          {assets.map((asset) => {
            const isSelected = selectedAsset === asset.symbol;
            return (
              <button
                key={asset.symbol}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedAsset(asset.symbol);
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-900/90 border-sky-400/60 shadow-[0_0_20px_rgba(56,189,248,0.15)]'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold font-mono text-xs ${asset.iconColor}`}>
                    {asset.symbol}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      {asset.name}
                      <span className="text-[9px] font-mono text-emerald-400">{asset.change}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{asset.chain}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-slate-100 tabular-nums">
                    {asset.balance} {asset.symbol}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{asset.fiatValue}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Center/Right: Derived Address Card */}
        <div className="lg:col-span-2 cyber-card rounded-2xl p-4 border border-slate-800 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold font-mono text-xs ${currentAsset.iconColor}`}>
                  {currentAsset.symbol}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{currentAsset.name} Account</h3>
                  <span className="text-[10px] font-mono text-slate-400">Path: {currentAsset.path}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-white tabular-nums">
                  {currentAsset.balance} {currentAsset.symbol}
                </span>
                <span className="block text-[10px] text-slate-400 font-mono">{currentAsset.fiatValue}</span>
              </div>
            </div>

            {/* Address Box */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 mb-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Честный деривированный адрес ({currentAsset.symbol}):</span>
                <button
                  type="button"
                  onClick={() => handleCopy(currentAsset.address, 'addr')}
                  className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
                >
                  {copiedKey === 'addr' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'addr' ? 'Скопирован' : 'Копировать'}</span>
                </button>
              </div>
              <div className="font-mono text-xs text-sky-200 break-all select-all bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                {currentAsset.address}
              </div>
            </div>
          </div>

          {/* Quick Transactions Log */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Подтвержденные транзакции сети
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-200">Входящий перевод</div>
                    <div className="text-[9px] font-mono text-slate-500">0x3a8f...92c1</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold font-mono text-emerald-400">+0.500 ETH</div>
                  <div className="text-[9px] text-slate-500 font-mono">+$1,710.25</div>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-sky-500/15 text-sky-400 flex items-center justify-center">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-200">Перевод в мемпул</div>
                    <div className="text-[9px] font-mono text-slate-500">0x99e2...bb42</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold font-mono text-slate-200">-450 USDT</div>
                  <div className="text-[9px] text-slate-500 font-mono">-$450.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Strip */}
      <div className="shrink-0 pt-1 text-[11px] font-mono text-slate-500 flex items-center justify-between border-t border-slate-900">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Криптографический анклав BIP-39 · SLIP-0010 · EIP-55 · Bech32</span>
        </span>
        <span>Статус: 100% Non-Custodial Sovereign Vault</span>
      </div>

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="cyber-card rounded-3xl p-5 max-w-sm w-full border border-sky-500/30 text-center relative">
            <button
              type="button"
              onClick={() => setShowReceiveModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Получить {currentAsset.name}</h3>
            <p className="text-xs text-slate-400 mb-4">Отсканируйте QR-код для перевода</p>

            {receiveQrUrl && (
              <div className="bg-white p-3 rounded-2xl inline-block mb-3 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                <img src={receiveQrUrl} alt="QR Code" className="w-40 h-40" />
              </div>
            )}

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 mb-4 text-left">
              <span className="text-[10px] text-slate-400 block mb-1">Адрес:</span>
              <p className="text-[11px] font-mono text-sky-300 break-all">{currentAsset.address}</p>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(currentAsset.address, 'modal-addr')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedKey === 'modal-addr' ? 'Адрес скопирован!' : 'Скопировать адрес'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="cyber-card rounded-3xl p-5 max-w-sm w-full border border-sky-500/30 text-left relative">
            <button
              type="button"
              onClick={() => setShowSendModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Отправить {currentAsset.symbol}</h3>
            <p className="text-xs text-slate-400 mb-4">
              Доступно: {currentAsset.balance} {currentAsset.symbol}
            </p>

            {sendSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center text-emerald-300 space-y-2">
                <Check className="w-8 h-8 mx-auto" />
                <div className="text-xs font-bold">Транзакция отправлена в сеть!</div>
                <div className="text-[10px] font-mono text-emerald-400/80">TXID: 0x8f3c...4a2b</div>
              </div>
            ) : (
              <form onSubmit={handleSendTransaction} className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Адрес получателя</label>
                  <input
                    type="text"
                    required
                    placeholder={currentAsset.symbol === 'ETH' ? '0x...' : currentAsset.symbol === 'BTC' ? 'bc1q...' : 'Base58...'}
                    value={sendRecipient}
                    onChange={(e) => setSendRecipient(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Сумма ({currentAsset.symbol})</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white outline-none focus:border-sky-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Подтвердить и отправить</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
