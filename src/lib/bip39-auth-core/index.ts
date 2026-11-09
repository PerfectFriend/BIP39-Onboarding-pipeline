/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * @bip39-auth/core
 * Self-Sovereign Identity (SSI) & Non-Custodial BIP-39 Onboarding Library
 * Drop-in replacement for Phone Number (SMS OTP) and Email/Password authentication.
 */

export * from './types';
export * from './bip39';
export * from './storage';
export * from './keyDerivation';
export * from './signer';
export * from './cloudEncryption';
export * from './aml';
export * from './advancedCrypto';
export * from './webAuthn';
export * from './react/BIP39AuthProvider';
export * from './react/useBIP39Auth';
export * from './server/verifier';
