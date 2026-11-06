/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EntropyWordCount = 12 | 24;

export interface BIP39AccountAddresses {
  eth: string; // EIP-55 checksummed (m/44'/60'/0'/0/0)
  btc: string; // Native SegWit Bech32 (m/84'/0'/0'/0/0)
  sol: string; // Base58 Ed25519 (m/44'/501'/0'/0')
}

export interface WalletCredentials {
  mnemonic: string;
  mnemonicWords: string[];
  seedHex: string;
  masterFingerprint: string;
  accounts: BIP39AccountAddresses;
  createdAt: number;
}

export interface VerificationChallenge {
  wordIndex: number;
  displayNumber: number; // 1-indexed (e.g. 7 for wordIndex 6)
  correctWord: string;
  options: string[]; // 5 choices (1 correct + 4 distractors)
}

export interface BIP39AuthConfig {
  appName?: string;
  defaultWordCount?: EntropyWordCount;
  allowPanicPin?: boolean;
  allowPdfExport?: boolean;
  sessionExpiryMs?: number;
  storageKeyPrefix?: string;
}

export interface AuthSession {
  masterFingerprint: string;
  primaryAddress: string; // Default EVM address
  accounts: BIP39AccountAddresses;
  issuedAt: number;
  expiresAt: number;
  authSignature?: string;
}

export interface AuthChallengePayload {
  nonce: string;
  timestamp: number;
  domain: string;
  statement: string;
}
