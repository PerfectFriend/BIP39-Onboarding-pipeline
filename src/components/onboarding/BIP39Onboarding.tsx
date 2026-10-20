import React, { useState, useEffect } from 'react';
import { OnboardingStep, EntropyWordCount, WalletCredentials, VerificationChallenge, BIP39OnboardingProps } from '../../types/onboarding';
import { generateMnemonic, generateVerificationChallenges, deriveMockAddresses, mnemonicToSeedHex } from '../../services/bip39';
import { encryptAndSaveVault, hasSavedVault, unlockVault } from '../../services/cryptoStorage';
import { StepWelcome } from './StepWelcome';
import { StepDisclaimer } from './StepDisclaimer';
import { StepMnemonicDisplay } from './StepMnemonicDisplay';
import { StepWordVerification } from './StepWordVerification';
import { StepPinSetup } from './StepPinSetup';
import { StepPanicPinSetup } from './StepPanicPinSetup';
import { StepRestoreSeed } from './StepRestoreSeed';
import { Lock, ArrowLeft, AlertCircle } from 'lucide-react';

export const BIP39Onboarding: React.FC<BIP39OnboardingProps> = ({
  config = {},
  onComplete,
  onPanicTriggered,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [wordCount, setWordCount] = useState<EntropyWordCount>(config.defaultWordCount || 12);
  const [generatedWords, setGeneratedWords] = useState<string[]>([]);
  const [fingerprint, setFingerprint] = useState<string>('00000000');
  const [challenges, setChallenges] = useState<VerificationChallenge[]>([]);
  const [tempCredentials, setTempCredentials] = useState<WalletCredentials | null>(null);
  const [primaryPin, setPrimaryPin] = useState<string>('');

  // Existing vault unlock modal state
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockPinInput, setUnlockPinInput] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [vaultExists, setVaultExists] = useState(false);

  useEffect(() => {
    setVaultExists(hasSavedVault());
  }, []);

  // 1. Generate new BIP-39 mnemonic
  const handleProceedToGenerate = async () => {
    const { mnemonic, words } = await generateMnemonic(wordCount);
    const seedHex = await mnemonicToSeedHex(mnemonic);
    const addresses = await deriveMockAddresses(seedHex);

    const creds: WalletCredentials = {
      mnemonic,
      mnemonicWords: words,
      seedHex,
      masterFingerprint: addresses.fingerprint,
      accounts: {
        btc: addresses.btc,
        eth: addresses.eth,
        sol: addresses.sol
      },
      createdAt: Date.now()
    };

    setGeneratedWords(words);
    setFingerprint(addresses.fingerprint);
    setTempCredentials(creds);
    setChallenges(generateVerificationChallenges(words));
    setCurrentStep('display_mnemonic');
  };

  // 2. Mnemonic confirmed -> go to verification
  const handleProceedToVerification = () => {
    setCurrentStep('verify_words');
  };

  // 3. Verification passed -> set up primary PIN
  const handleVerificationSuccess = () => {
    setCurrentStep('setup_pin');
  };

  // 4. Primary PIN set -> set up Panic PIN
  const handlePinConfirmed = (pin: string) => {
    setPrimaryPin(pin);
    if (config.allowPanicPin !== false) {
      setCurrentStep('setup_panic_pin');
    } else {
      finalizeOnboarding(pin, undefined);
    }
  };

  // 5. Restore seed completed
  const handleSeedRestored = (credentials: WalletCredentials) => {
    setTempCredentials(credentials);
    setGeneratedWords(credentials.mnemonicWords);
    setFingerprint(credentials.masterFingerprint);
    setCurrentStep('setup_pin');
  };

  // 6. Final step: Encrypt in WebCrypto and invoke onComplete
  const finalizeOnboarding = async (pin: string, panicPin?: string) => {
    if (!tempCredentials) return;

    try {
      await encryptAndSaveVault(tempCredentials, pin, panicPin);
      setVaultExists(true);
      onComplete(tempCredentials, pin, panicPin);
    } catch (err) {
      console.error('Failed to encrypt vault:', err);
    }
  };

  // 7. Unlock existing vault with PIN
  const handleUnlockExisting = async () => {
    setIsUnlocking(true);
    setUnlockError(null);

    try {
      const result = await unlockVault(unlockPinInput);
      if (result.isDuress) {
        // Duress triggered!
        setShowUnlockModal(false);
        setVaultExists(false);
        if (onPanicTriggered) {
          onPanicTriggered();
        } else {
          alert('Экстренное стирание данных выполнено: кошелек сброшен.');
        }
        return;
      }

      if (result.success && result.credentials) {
        setShowUnlockModal(false);
        onComplete(result.credentials, unlockPinInput);
      } else {
        setUnlockError(result.error || 'Неверный PIN-код');
      }
    } catch (err: any) {
      setUnlockError(err?.message || 'Ошибка расшифровки');
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="w-full relative">
      {/* Step Router */}
      {currentStep === 'welcome' && (
        <StepWelcome
          onCreateNew={() => setCurrentStep('disclaimer')}
          onRestore={() => setCurrentStep('restore')}
          hasExistingVault={vaultExists}
          onUnlockExisting={() => setShowUnlockModal(true)}
        />
      )}

      {currentStep === 'disclaimer' && (
        <StepDisclaimer
          wordCount={wordCount}
          onWordCountChange={setWordCount}
          onProceed={handleProceedToGenerate}
          onBack={() => setCurrentStep('welcome')}
        />
      )}

      {currentStep === 'display_mnemonic' && (
        <StepMnemonicDisplay
          words={generatedWords}
          fingerprint={fingerprint}
          onProceedToVerification={handleProceedToVerification}
          onBack={() => setCurrentStep('disclaimer')}
        />
      )}

      {currentStep === 'verify_words' && (
        <StepWordVerification
          challenges={challenges}
          onSuccess={handleVerificationSuccess}
          onBackToMnemonic={() => setCurrentStep('display_mnemonic')}
        />
      )}

      {currentStep === 'setup_pin' && (
        <StepPinSetup
          onPinConfirmed={handlePinConfirmed}
          onBack={() => setCurrentStep(tempCredentials ? 'verify_words' : 'welcome')}
        />
      )}

      {currentStep === 'setup_panic_pin' && (
        <StepPanicPinSetup
          primaryPin={primaryPin}
          onFinishWithPanicPin={(panicPin) => finalizeOnboarding(primaryPin, panicPin)}
          onBack={() => setCurrentStep('setup_pin')}
        />
      )}

      {currentStep === 'restore' && (
        <StepRestoreSeed
          onSeedRestored={handleSeedRestored}
          onBack={() => setCurrentStep('welcome')}
        />
      )}

      {/* Unlock Existing Vault Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="cyber-card rounded-3xl p-6 sm:p-7 max-w-sm w-full relative gaudi-mosaic-border text-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              Разблокировка хранилища
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Введите ваш PIN-код (или панический PIN для экстренного сброса)
            </p>

            <input
              type="password"
              maxLength={6}
              value={unlockPinInput}
              onChange={(e) => {
                setUnlockPinInput(e.target.value);
                setUnlockError(null);
              }}
              placeholder="••••••"
              autoFocus
              className="w-full py-3 text-center text-2xl tracking-[0.5em] font-mono bg-slate-950/80 border border-slate-800 rounded-xl text-white outline-none focus:border-sky-400 mb-4"
            />

            {unlockError && (
              <div className="mb-4 text-xs text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded-xl p-2.5 flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{unlockError}</span>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowUnlockModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Отмена
              </button>

              <button
                type="button"
                disabled={unlockPinInput.length < 4 || isUnlocking}
                onClick={handleUnlockExisting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider hover:opacity-95 disabled:opacity-50"
              >
                {isUnlocking ? 'Расшифровка...' : 'Войти'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
