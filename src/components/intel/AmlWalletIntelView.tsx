/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIP39-ABOARD-SDK - AML Compliance, Cleanliness Screener & External Wallet Suite
 * Real-time dirty wallet detection (OFAC, Mixers, Drainers), EIP-6963 wallet linking,
 * and token allowance / anti-drainer security shields.
 */

import React, { useState } from 'react';
import {
  screenAddressRisk,
  getMockTokenApprovals,
  AmlRiskReport,
  TokenApprovalAudit
} from '../../services/amlIntelligence';
import {
  detectInjectedWallets,
  connectExternalWallet,
  createDelegationProofMessage,
  ExternalWalletLink
} from '../../services/walletConnector';
import { AppLanguage, I18N_DICTIONARY } from '../../services/i18n';
import { triggerHaptic } from '../../utils/haptics';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  AlertTriangle,
  Flame,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  Layers,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Eye,
  RefreshCw,
  Cpu,
  Lock,
  Wallet
} from 'lucide-react';

interface AmlWalletIntelViewProps {
  currentLanguage: AppLanguage;
  masterVaultAddress?: string;
}

export const AmlWalletIntelView: React.FC<AmlWalletIntelViewProps> = ({
  currentLanguage,
  masterVaultAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
}) => {
  const [activeSubtab, setActiveSubtab] = useState<'aml' | 'wallets' | 'approvals'>('aml');
  const [addressInput, setAddressInput] = useState<string>(masterVaultAddress);
  const [selectedChain, setSelectedChain] = useState<'eth' | 'btc' | 'sol'>('eth');
  const [amlReport, setAmlReport] = useState<AmlRiskReport>(() => screenAddressRisk(masterVaultAddress, 'eth'));
  const [isScanning, setIsScanning] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // External wallet state
  const [linkedWallets, setLinkedWallets] = useState<ExternalWalletLink[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeProof, setActiveProof] = useState<string | null>(null);

  // Token approvals state
  const [tokenApprovals, setTokenApprovals] = useState<TokenApprovalAudit[]>(() =>
    getMockTokenApprovals(masterVaultAddress)
  );

  const t = I18N_DICTIONARY[currentLanguage];

  const presets = [
    {
      name: currentLanguage === 'ru' ? 'Свой кошелек' : currentLanguage === 'es' ? 'Bóveda Propia' : 'My Vault',
      address: masterVaultAddress,
      chain: 'eth' as const,
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      name: 'Tornado.Cash Router',
      address: '0xd90e2f925da726b50c4ed8d0fb90ad053324f31b',
      chain: 'eth' as const,
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    {
      name: 'OFAC: Blender.io',
      address: '0x1a0a3e3ba4d724f469950d65b746c10e194ea778',
      chain: 'eth' as const,
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      name: 'Pink Drainer Exploit',
      address: '0x00000000000109ae96434d3ea2d36ebaf9418641',
      chain: 'eth' as const,
      badge: 'bg-red-500/20 text-red-300 border-red-500/30'
    },
    {
      name: 'Coinbase Custody',
      address: '0x71660c4005ba85c37ccec55d0c4493e66fe775d3',
      chain: 'eth' as const,
      badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
    }
  ];

  const handleScanAddress = (addrToScan?: string, chainType?: 'eth' | 'btc' | 'sol') => {
    const targetAddr = addrToScan || addressInput;
    const targetChain = chainType || selectedChain;
    if (!targetAddr.trim()) return;

    setIsScanning(true);
    triggerHaptic('medium');
    setTimeout(() => {
      const res = screenAddressRisk(targetAddr, targetChain);
      setAmlReport(res);
      setIsScanning(false);
      triggerHaptic(res.tier === 'CLEAN' ? 'success' : 'error');
    }, 350);
  };

  const handleConnectWallet = async (walletId: string) => {
    setIsConnecting(true);
    triggerHaptic('medium');
    try {
      const res = await connectExternalWallet(walletId);
      const nonce = Math.random().toString(36).substring(2, 10).toUpperCase();
      const proofMsg = createDelegationProofMessage(masterVaultAddress, res.address, nonce);
      setActiveProof(proofMsg);

      const newLink: ExternalWalletLink = {
        address: res.address,
        walletName: res.walletName,
        chainId: res.chainId,
        linkedAt: new Date().toLocaleTimeString(),
        delegationSignature: `0x${Math.random().toString(16).substring(2, 66)}...EIP191`,
        isPrimarySigner: false
      };

      setLinkedWallets(prev => [newLink, ...prev.filter(w => w.address.toLowerCase() !== res.address.toLowerCase())]);
      triggerHaptic('success');
    } catch (err) {
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRevokeApproval = (tokenSymbol: string) => {
    triggerHaptic('warning');
    setTokenApprovals(prev => prev.filter(t => t.tokenSymbol !== tokenSymbol));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    triggerHaptic('light');
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'CLEAN': return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
      case 'LOW': return 'text-sky-400 bg-sky-500/15 border-sky-500/30';
      case 'MEDIUM': return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
      case 'HIGH': return 'text-orange-400 bg-orange-500/15 border-orange-500/30';
      case 'CRITICAL_SANCTIONED': return 'text-rose-400 bg-rose-500/20 border-rose-500/40 animate-pulse';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="h-full max-h-full flex flex-col justify-between overflow-hidden p-2 sm:p-4 gap-2 select-none">
      {/* Top Header Strip with Subtab Switcher */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-amber-400 to-sky-400 p-px shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                {currentLanguage === 'ru' ? 'AML Радар & Внешние Кошельки' : currentLanguage === 'es' ? 'Radar AML y Billeteras Externas' : 'AML Cleanliness Radar & Web3 Wallet Bridge'}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                OFAC · Mixers · Drainers
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              {currentLanguage === 'ru' 
                ? 'Проверка входящих контрагентов на грязь, санкции и подключение MetaMask/Rabby к профилю'
                : currentLanguage === 'es'
                ? 'Verificación de fondos sucios, sanciones y conexión de MetaMask/Rabby al perfil soberano'
                : 'Scoring counterparties for sanctions/mixers, linking external wallets, and anti-drainer shields.'}
            </p>
          </div>
        </div>

        {/* Subtab Buttons */}
        <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono self-end sm:self-auto">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveSubtab('aml');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer font-bold transition-all ${
              activeSubtab === 'aml'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>{currentLanguage === 'ru' ? '1. Проверка на Грязь' : currentLanguage === 'es' ? '1. Escáner AML' : '1. AML Screener'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveSubtab('wallets');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer font-bold transition-all ${
              activeSubtab === 'wallets'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>{currentLanguage === 'ru' ? '2. Внешние Кошельки' : currentLanguage === 'es' ? '2. Billeteras Externas' : '2. External Wallets'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveSubtab('approvals');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer font-bold transition-all ${
              activeSubtab === 'approvals'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentLanguage === 'ru' ? '3. Защита Аппрувов' : currentLanguage === 'es' ? '3. Escudo de Aprobaciones' : '3. Allowance Guard'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        {/* Left Column (6 cols): Active AML Screener & Address Scanner */}
        <div className="lg:col-span-6 flex flex-col justify-between overflow-hidden gap-2">
          {/* Address Input & Quick Presets */}
          <div className="cyber-card rounded-2xl p-3 border border-slate-800 flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-sky-400" />
                <span>{currentLanguage === 'ru' ? 'Адрес для анализа (EVM / BTC / SOL):' : 'Counterparty Address to Screen:'}</span>
              </span>
              <div className="flex items-center gap-1 text-[10px] font-mono">
                {(['eth', 'btc', 'sol'] as const).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedChain(c);
                      handleScanAddress(addressInput, c);
                    }}
                    className={`px-1.5 py-0.5 rounded uppercase font-bold cursor-pointer ${
                      selectedChain === c ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={addressInput}
                onChange={e => setAddressInput(e.target.value)}
                placeholder="0x... / bc1... / base58..."
                className="flex-1 bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={() => handleScanAddress()}
                disabled={isScanning}
                className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>{currentLanguage === 'ru' ? 'Проверить' : 'Scan'}</span>
              </button>
            </div>

            {/* Quick Test Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
              <span className="text-[10px] font-mono text-slate-500 shrink-0">Пресеты:</span>
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAddressInput(p.address);
                    setSelectedChain(p.chain);
                    handleScanAddress(p.address, p.chain);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border whitespace-nowrap cursor-pointer transition-all ${p.badge}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Risk Score & Cleanliness Card */}
          <div className="cyber-card rounded-2xl p-3 border border-slate-800 flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  {currentLanguage === 'ru' ? 'Результат скоринга чистоты' : 'AML Cleanliness & Risk Rating'}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getTierColor(amlReport.tier)}`}>
                  {amlReport.tier}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {amlReport.entityType || 'Clean Retail'}
              </span>
            </div>

            {/* Gauge meters */}
            <div className="grid grid-cols-2 gap-2 my-2 shrink-0">
              {/* Cleanliness Meter */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-900 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {currentLanguage === 'ru' ? 'Индекс чистоты кошелька:' : 'Cleanliness Index:'}
                </span>
                <div className="flex items-baseline gap-1 my-1">
                  <span className={`text-2xl font-black tabular-nums ${amlReport.cleanlinessScore > 70 ? 'text-emerald-400' : amlReport.cleanlinessScore > 30 ? 'text-amber-400' : 'text-rose-500'}`}>
                    {amlReport.cleanlinessScore}%
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">/ 100% Clean</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${amlReport.cleanlinessScore > 70 ? 'bg-emerald-400' : amlReport.cleanlinessScore > 30 ? 'bg-amber-400' : 'bg-rose-500'}`}
                    style={{ width: `${amlReport.cleanlinessScore}%` }}
                  />
                </div>
              </div>

              {/* Recommended Action */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-900 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {currentLanguage === 'ru' ? 'Рекомендация безопасности:' : 'Action Recommendation:'}
                </span>
                <div className="flex items-center gap-1.5 my-1">
                  {amlReport.recommendedAction === 'BLOCK_TRANSACTION' && <XCircle className="w-5 h-5 text-rose-500" />}
                  {amlReport.recommendedAction === 'REQUIRE_TRAVEL_RULE' && <AlertTriangle className="w-5 h-5 text-orange-400" />}
                  {amlReport.recommendedAction === 'WARN_USER' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                  {amlReport.recommendedAction === 'PROCEED' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  <span className="text-xs font-bold text-white uppercase">
                    {amlReport.recommendedAction.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 truncate">
                  {amlReport.matchedEntity || 'Verified Clean State'}
                </span>
              </div>
            </div>

            {/* Risk Breakdown Vector Bars */}
            <div className="space-y-1.5 p-2 bg-slate-950/60 rounded-xl border border-slate-900 text-[10px] font-mono shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">OFAC / Sanctions SDN:</span>
                <span className={amlReport.breakdown.sanctionsExposure > 0 ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                  {amlReport.breakdown.sanctionsExposure}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Mixer & Tumbler Hops (Tornado/Sinbad):</span>
                <span className={amlReport.breakdown.mixerHops > 0 ? 'text-purple-400 font-bold' : 'text-slate-500'}>
                  {amlReport.breakdown.mixerHops}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Drainer / Phishing Contract Signatures:</span>
                <span className={amlReport.breakdown.drainerPhishing > 0 ? 'text-red-400 font-bold' : 'text-slate-500'}>
                  {amlReport.breakdown.drainerPhishing}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Darknet / Ransomware Exposure:</span>
                <span className={amlReport.breakdown.darknetRansomware > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                  {amlReport.breakdown.darknetRansomware}%
                </span>
              </div>
            </div>

            {/* Flags list */}
            <div className="flex-1 overflow-y-auto mt-1 space-y-1 pr-1 scrollbar-thin">
              {amlReport.flags.map(flag => (
                <div
                  key={flag.id}
                  className={`p-2 rounded-lg border text-[10px] font-mono flex items-start gap-1.5 ${
                    flag.severity === 'critical'
                      ? 'bg-rose-950/40 border-rose-600/40 text-rose-200'
                      : flag.severity === 'danger'
                      ? 'bg-orange-950/40 border-orange-600/40 text-orange-200'
                      : flag.severity === 'warning'
                      ? 'bg-amber-950/40 border-amber-600/40 text-amber-200'
                      : 'bg-emerald-950/30 border-emerald-600/30 text-emerald-200'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold block">{flag.title}</span>
                    <span className="text-slate-300/90 text-[9px] leading-tight block">{flag.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): External Wallet Connector OR Token Approvals Guard */}
        <div className="lg:col-span-6 flex flex-col justify-between overflow-hidden gap-2">
          {activeSubtab === 'wallets' && (
            <div className="cyber-card rounded-2xl p-3 border border-slate-800 h-full max-h-full flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-white">
                    {currentLanguage === 'ru' ? 'Подключение внешних кошельков (EIP-6963)' : 'External Injected Wallets (EIP-6963)'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Dual-Signer Mode
                </span>
              </div>

              <p className="text-[11px] text-slate-300 font-mono my-1 shrink-0">
                {currentLanguage === 'ru'
                  ? 'Привяжите MetaMask, Rabby или Phantom как доверенный аппаратный ключ восстановления к вашему суверенному BIP-39 аккаунту.'
                  : 'Link MetaMask, Rabby, or Phantom as an authorized external recovery signer to your BIP-39 Sovereign Identity.'}
              </p>

              {/* Wallet Injected Providers Grid */}
              <div className="grid grid-cols-3 gap-2 my-1 shrink-0">
                {[
                  { id: 'metamask', name: 'MetaMask', icon: '🦊' },
                  { id: 'rabby', name: 'Rabby', icon: '🐰' },
                  { id: 'phantom', name: 'Phantom', icon: '👻' },
                  { id: 'coinbase', name: 'Coinbase', icon: '🔵' },
                  { id: 'okx', name: 'OKX', icon: '⬛' },
                  { id: 'ledger', name: 'Ledger', icon: '🔒' }
                ].map(w => (
                  <button
                    key={w.id}
                    type="button"
                    disabled={isConnecting}
                    onClick={() => handleConnectWallet(w.id)}
                    className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/50 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{w.icon}</span>
                    <span className="text-[10px] font-bold text-white truncate w-full">{w.name}</span>
                    <span className="text-[8px] font-mono text-sky-400 uppercase">Подключить</span>
                  </button>
                ))}
              </div>

              {/* Linked Wallets List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 my-1 pr-1 scrollbar-thin">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">
                  {currentLanguage === 'ru' ? 'Привязанные внешние адреса-делегаты:' : 'Linked External Delegate Signers:'}
                </span>
                {linkedWallets.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 text-center text-slate-500 text-xs font-mono">
                    Нет привязанных кошельков. Нажмите на иконку выше для авторизации.
                  </div>
                ) : (
                  linkedWallets.map(w => (
                    <div key={w.address} className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px] font-mono">
                      <div>
                        <div className="flex items-center gap-1.5 text-white font-bold">
                          <span>{w.walletName}</span>
                          <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 rounded">Linked</span>
                        </div>
                        <span className="text-[10px] text-slate-400 truncate block max-w-[200px] sm:max-w-xs">{w.address}</span>
                      </div>
                      <span className="text-[9px] text-slate-500">{w.linkedAt}</span>
                    </div>
                  ))
                )}
              </div>

              {/* EIP-191 Cross-Delegation Signature Box */}
              {activeProof && (
                <div className="p-2 bg-slate-950 rounded-xl border border-sky-500/30 font-mono text-[9px] text-sky-300 shrink-0">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span>EIP-191 Delegation Proof:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeProof, 'proof')}
                      className="text-sky-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'proof' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'proof' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap select-all max-h-16 overflow-y-auto scrollbar-thin text-slate-400">
                    {activeProof}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeSubtab === 'approvals' && (
            <div className="cyber-card rounded-2xl p-3 border border-slate-800 h-full max-h-full flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">
                    {currentLanguage === 'ru' ? 'Аудит разрешений токенов (Anti-Drainer)' : 'Token Allowance Guard (Revoke.cash)'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                  3 Активных Аппрува
                </span>
              </div>

              <p className="text-[11px] text-slate-300 font-mono my-1 shrink-0">
                {currentLanguage === 'ru'
                  ? 'Сканирование смарт-контрактов с неограниченным доступом к вашим токенам. В 1 клик отзовите разрешение, чтобы защититься от дрейнеров.'
                  : 'Scan smart contracts with unlimited access to your tokens. Revoke dangerous allowances to stop wallet drainers.'}
              </p>

              {/* Token Approvals List */}
              <div className="flex-1 overflow-y-auto space-y-2 my-1 pr-1 scrollbar-thin">
                {tokenApprovals.map(a => (
                  <div
                    key={a.tokenSymbol}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      a.riskLevel === 'DANGEROUS_DRAINER'
                        ? 'bg-rose-950/40 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white text-xs">{a.tokenSymbol}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                          a.riskLevel === 'DANGEROUS_DRAINER'
                            ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {a.riskLevel === 'DANGEROUS_DRAINER' ? '⚠ ОПАСНЫЙ ДРЕЙНЕР' : 'Безопасно'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{a.spenderName}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{a.spenderAddress}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRevokeApproval(a.tokenSymbol)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1 transition-all cursor-pointer ${
                        a.riskLevel === 'DANGEROUS_DRAINER'
                          ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{currentLanguage === 'ru' ? 'Отозвать (Revoke)' : 'Revoke'}</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Protection summary tip */}
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-2 shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>BIP39-ABOARD-SDK блокирует подписание транзакций с подозрительными Permit2 сессиями.</span>
              </div>
            </div>
          )}

          {activeSubtab === 'aml' && (
            <div className="cyber-card rounded-2xl p-3 border border-slate-800 h-full max-h-full flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-sky-400" />
                  <span>SDK Интеграция AML Скрининга в код</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(`import { screenAddressRisk } from '@bip39-auth/core';\n\n// Проверка перед транзакцией:\nconst report = screenAddressRisk(counterpartyAddress, 'eth');\nif (report.tier === 'CRITICAL_SANCTIONED') {\n  throw new Error('Transaction blocked: OFAC / Mixer Sanctions Detected!');\n}`, 'code-aml')}
                  className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-mono cursor-pointer"
                >
                  {copiedKey === 'code-aml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'code-aml' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1 shrink-0">
                <p><strong>1. Автоматический щит для P2P и мерчантов:</strong></p>
                <p className="text-slate-400 text-[10px]">
                  Предотвращает блокировку счетов на CEX-биржах из-за случайного приема «грязной» крипты с Tornado Cash или даркнет-маркетов.
                </p>
              </div>

              <pre className="flex-1 overflow-y-auto p-2.5 bg-slate-950/90 rounded-xl font-mono text-[10px] text-slate-300 leading-relaxed border border-slate-900 scrollbar-thin select-all">
{`// 1. Импорт функции скоринга чистоты адреса
import { screenAddressRisk } from '@bip39-auth/core';

export async function processIncomingPayment(fromAddress: string) {
  // 2. Мгновенная проверка на санкции OFAC и миксеры
  const report = screenAddressRisk(fromAddress, 'eth');

  if (report.cleanlinessScore < 40) {
    console.error('High AML Contamination:', report.flags);
    return {
      status: 'REJECTED',
      reason: report.matchedEntity || 'Mixer / Phishing contamination'
    };
  }

  // 3. Адрес чист -> проводим оплату!
  return { status: 'APPROVED', cleanliness: report.cleanlinessScore };
}`}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="shrink-0 pt-1 text-[11px] font-mono text-slate-500 flex items-center justify-between border-t border-slate-900">
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>AML Intelligence Radar · OFAC SDN · Tornado Cash · EIP-6963 Wallets</span>
        </span>
        <span className="text-slate-400">
          Status: <span className="text-emerald-400">Autonomous Heuristic Engine Active</span>
        </span>
      </div>
    </div>
  );
};
