/**
 * Types and interfaces for the BIP-39 Onboarding Pipeline and Host Application.
 */

export type EntropyWordCount = 12 | 24;

export type OnboardingStep =
  | 'welcome'
  | 'disclaimer'
  | 'display_mnemonic'
  | 'verify_words'
  | 'setup_pin'
  | 'setup_panic_pin'
  | 'restore';

export type RestoreMode = 'manual' | 'qr_scan' | 'pdf_import';

export interface WalletCredentials {
  mnemonic: string;
  mnemonicWords: string[];
  seedHex: string;
  masterFingerprint: string;
  accounts: {
    btc: string;
    eth: string;
    sol: string;
  };
  createdAt: number;
}

export interface OnboardingConfig {
  defaultWordCount?: EntropyWordCount;
  allowPanicPin?: boolean;
  allowPdfExport?: boolean;
  appName?: string;
  requireDisclaimerCheck?: boolean;
}

export interface VerificationChallenge {
  wordIndex: number; // 0-based
  displayNumber: number; // 1-based (e.g. #3, #7, #11)
  correctWord: string;
  options: string[]; // 5 words: 1 correct + 4 random distractors
}

export interface EncryptedPayload {
  version: number;
  salt: string; // Hex
  iv: string; // Hex
  ciphertext: string; // Hex
  duressHash?: string; // SHA-256 hash of duress pin with salt
  createdAt: number;
}

export interface BIP39OnboardingProps {
  config?: OnboardingConfig;
  onComplete: (credentials: WalletCredentials, pin: string, panicPin?: string) => void;
  onPanicTriggered?: () => void;
  onCancel?: () => void;
}
