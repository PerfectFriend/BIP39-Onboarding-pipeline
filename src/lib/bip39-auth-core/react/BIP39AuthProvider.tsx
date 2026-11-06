/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { WalletCredentials, BIP39AuthConfig, AuthSession } from '../types';
import { hasSavedVault, unlockVault, wipeAllVaultData, clearVaultSession } from '../storage';
import { deriveHonestChainKeys } from '../keyDerivation';
import { createAuthChallenge, signAuthChallenge } from '../signer';
import { verifyHardwareBiometrics, isPlatformBiometricsAvailable } from '../webAuthn';
import { hex } from '@scure/base';

interface BIP39AuthContextValue {
  isAuthenticated: boolean;
  hasVault: boolean;
  credentials: WalletCredentials | null;
  session: AuthSession | null;
  isOnboardingOpen: boolean;
  isDuressActive: boolean;
  isBiometricsAvailable: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  unlockWithPin: (pin: string) => Promise<{ success: boolean; isDuress?: boolean; error?: string }>;
  unlockWithBiometrics: () => Promise<boolean>;
  lockSession: () => void;
  logoutAndWipe: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  createSessionProof: () => Promise<{ session: AuthSession; signature: string; message: string }>;
  setLoggedInCredentials: (creds: WalletCredentials, primaryPin: string, duressPin?: string) => void;
}

const BIP39AuthContext = createContext<BIP39AuthContextValue | null>(null);

const SESSION_STORAGE_KEY = 'bip39_auth_active_session';

export const BIP39AuthProvider: React.FC<{
  children: React.ReactNode;
  config?: BIP39AuthConfig;
  onDuressWipe?: () => void;
}> = ({ children, config = {}, onDuressWipe }) => {
  const [credentials, setCredentials] = useState<WalletCredentials | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [hasVault, setHasVault] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isDuressActive, setIsDuressActive] = useState(false);
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState(false);

  useEffect(() => {
    setHasVault(hasSavedVault());
    isPlatformBiometricsAvailable().then(setIsBiometricsAvailable);

    // Restore existing session if valid
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const parsed: AuthSession = JSON.parse(raw);
        if (parsed.expiresAt > Date.now()) {
          setSession(parsed);
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

  const openOnboarding = () => setIsOnboardingOpen(true);
  const closeOnboarding = () => setIsOnboardingOpen(false);

  const createSessionFromCredentials = (creds: WalletCredentials): AuthSession => {
    const expiry = config.sessionExpiryMs || 7 * 24 * 60 * 60 * 1000; // default 7 days
    const sess: AuthSession = {
      masterFingerprint: creds.masterFingerprint,
      primaryAddress: creds.accounts.eth,
      accounts: creds.accounts,
      issuedAt: Date.now(),
      expiresAt: Date.now() + expiry
    };
    setSession(sess);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sess));
    return sess;
  };

  const setLoggedInCredentials = (creds: WalletCredentials) => {
    setCredentials(creds);
    setHasVault(true);
    createSessionFromCredentials(creds);
    closeOnboarding();
  };

  const unlockWithPin = async (pin: string) => {
    try {
      const res = await unlockVault(pin);
      if (res.isDuress) {
        setIsDuressActive(true);
        setCredentials(null);
        setSession(null);
        setHasVault(false);
        localStorage.removeItem(SESSION_STORAGE_KEY);
        if (onDuressWipe) onDuressWipe();
        return { success: false, isDuress: true };
      }

      if (res.success && res.credentials) {
        setCredentials(res.credentials);
        createSessionFromCredentials(res.credentials);
        return { success: true };
      }

      return { success: false, error: res.error || 'Invalid PIN' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Decryption failed' };
    }
  };

  const unlockWithBiometrics = async () => {
    const res = await verifyHardwareBiometrics();
    return res.success;
  };

  const lockSession = () => {
    setCredentials(null);
    clearVaultSession();
  };

  const logoutAndWipe = async () => {
    await wipeAllVaultData();
    setCredentials(null);
    setSession(null);
    setHasVault(false);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    if (onDuressWipe) onDuressWipe();
  };

  const signMessage = async (message: string): Promise<string> => {
    if (!credentials) {
      throw new Error('Vault is locked. Unlock before signing.');
    }
    const seedBytes = hex.decode(credentials.seedHex);
    const honest = deriveHonestChainKeys(seedBytes);
    const sig = signAuthChallenge(
      createAuthChallenge(config.appName || 'app.local', message),
      honest.eth.privateKeyHex
    );
    return sig.signature;
  };

  const createSessionProof = async () => {
    if (!credentials) {
      throw new Error('Vault is locked. Cannot generate session proof.');
    }
    const sess = session || createSessionFromCredentials(credentials);
    const challenge = createAuthChallenge(config.appName || 'app.local', 'Session Authentication Proof');
    const seedBytes = hex.decode(credentials.seedHex);
    const honest = deriveHonestChainKeys(seedBytes);
    const signed = signAuthChallenge(challenge, honest.eth.privateKeyHex);

    return {
      session: sess,
      signature: signed.signature,
      message: signed.message
    };
  };

  return (
    <BIP39AuthContext.Provider
      value={{
        isAuthenticated: !!session,
        hasVault,
        credentials,
        session,
        isOnboardingOpen,
        isDuressActive,
        isBiometricsAvailable,
        openOnboarding,
        closeOnboarding,
        unlockWithPin,
        unlockWithBiometrics,
        lockSession,
        logoutAndWipe,
        signMessage,
        createSessionProof,
        setLoggedInCredentials
      }}
    >
      {children}
    </BIP39AuthContext.Provider>
  );
};

export const useBIP39Auth = () => {
  const ctx = useContext(BIP39AuthContext);
  if (!ctx) {
    throw new Error('useBIP39Auth must be used within a <BIP39AuthProvider>');
  }
  return ctx;
};
