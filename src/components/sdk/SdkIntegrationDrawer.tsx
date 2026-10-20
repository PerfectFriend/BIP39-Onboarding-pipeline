import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Shield, Sparkles, RefreshCw } from 'lucide-react';
import { WalletCredentials } from '../../types/onboarding';

interface SdkIntegrationDrawerProps {
  credentials?: WalletCredentials;
  primaryPin?: string;
  panicPin?: string;
  onClose: () => void;
  onRestartOnboarding: () => void;
}

export const SdkIntegrationDrawer: React.FC<SdkIntegrationDrawerProps> = ({
  credentials,
  primaryPin,
  panicPin,
  onClose,
  onRestartOnboarding
}) => {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const reactQuickStartSnippet = `import { useState } from 'react';
import { BIP39Onboarding } from '@/components/onboarding/BIP39Onboarding';
import { WalletCredentials } from '@/types/onboarding';

export function App() {
  const [wallet, setWallet] = useState<WalletCredentials | null>(null);

  if (!wallet) {
    return (
      <BIP39Onboarding
        config={{
          defaultWordCount: 12, // or 24
          allowPanicPin: true,  // enables duress panic wipe PIN
          allowPdfExport: true, // enables Cold Storage Paper Passport
          appName: 'MyCryptoVault'
        }}
        onComplete={(creds, pin, duressPin) => {
          console.log('Wallet onboarded successfully!', creds.masterFingerprint);
          setWallet(creds);
        }}
        onPanicTriggered={() => {
          console.warn('Emergency Panic PIN triggered! Vault wiped.');
          setWallet(null);
        }}
      />
    );
  }

  return <MyVaultDashboard wallet={wallet} />;
}`;

  const web3DerivationSnippet = `import { HDNodeWallet } from 'ethers';

// Deriving EVM wallet from BIP-39 mnemonic
export function deriveEthereumWallet(mnemonic: string) {
  // Standard BIP-44 path for Ethereum
  const wallet = HDNodeWallet.fromPhrase(mnemonic, undefined, "m/44'/60'/0'/0/0");
  return {
    address: wallet.address,
    privateKey: wallet.privateKey
  };
}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-950 border-l border-slate-800 p-6 overflow-y-auto flex flex-col justify-between h-full">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">SDK & Интеграционный Инспектор</h2>
                <p className="text-xs text-slate-400">Готовый drop-in компонент для любых React / Web3 приложений</p>
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

          {/* Restart Pipeline Action */}
          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-400/30 mb-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-sky-300 block">Перезапустить процесс онбординга</span>
              <span className="text-[11px] text-slate-400">Повторить путь генерации или протестировать 24 слова</span>
            </div>
            <button
              type="button"
              onClick={onRestartOnboarding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Сброс и запуск
            </button>
          </div>

          {/* Quick-Start React Component Code Snippet */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-sky-400" />
                1. Быстрая интеграция в React / Next.js:
              </span>
              <button
                type="button"
                onClick={() => handleCopy(reactQuickStartSnippet, 'react_snippet')}
                className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-mono"
              >
                {copiedSnippet === 'react_snippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSnippet === 'react_snippet' ? 'Скопировано!' : 'Копировать TSX'}
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
              {reactQuickStartSnippet}
            </pre>
          </div>

          {/* Web3 Derivation Snippet */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-400" />
                2. Деривация ключей через Ethers.js / Web3:
              </span>
              <button
                type="button"
                onClick={() => handleCopy(web3DerivationSnippet, 'web3_snippet')}
                className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-mono"
              >
                {copiedSnippet === 'web3_snippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSnippet === 'web3_snippet' ? 'Скопировано!' : 'Копировать TS'}
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
              {web3DerivationSnippet}
            </pre>
          </div>

          {/* Live Credentials Inspector */}
          {credentials && (
            <div className="space-y-2 mb-6">
              <span className="text-xs font-semibold text-slate-300 block">
                Живой инспектор активной сессии:
              </span>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-2">
                <div>
                  <span className="text-slate-500">Fingerprint: </span>
                  <span className="text-amber-400">{credentials.masterFingerprint}</span>
                </div>
                <div>
                  <span className="text-slate-500">Word Count: </span>
                  <span className="text-sky-400">{credentials.mnemonicWords.length} words</span>
                </div>
                <div>
                  <span className="text-slate-500">BTC Address: </span>
                  <span className="text-slate-300 break-all">{credentials.accounts.btc}</span>
                </div>
                <div>
                  <span className="text-slate-500">ETH Address: </span>
                  <span className="text-slate-300 break-all">{credentials.accounts.eth}</span>
                </div>
                <div>
                  <span className="text-slate-500">Panic PIN: </span>
                  <span className="text-rose-400">{panicPin ? 'Configured (Active)' : 'None'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700"
          >
            Закрыть инспектор
          </button>
        </div>
      </div>
    </div>
  );
};
