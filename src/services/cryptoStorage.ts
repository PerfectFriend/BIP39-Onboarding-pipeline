/**
 * Web Crypto API AES-GCM (256-bit) and PBKDF2 (100,000 iterations) storage
 * with duress PIN detection and panic zero-wipe.
 */

import { EncryptedPayload, WalletCredentials } from '../types/onboarding';

const STORAGE_KEY = 'bip39_secure_vault_v1';
const DURESS_FLAG_KEY = 'bip39_vault_duress_active';

// Convert Uint8Array to hex string
function toHex(buf: Uint8Array): string {
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Convert hex string to Uint8Array
function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Hash a PIN with salt using SHA-256
 */
export async function hashPin(pin: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = fromHex(saltHex);
  const data = new Uint8Array(pin.length + salt.length);
  data.set(enc.encode(pin));
  data.set(salt, pin.length);

  const hash = await crypto.subtle.digest('SHA-256', data);
  return toHex(new Uint8Array(hash));
}

/**
 * Derive AES-GCM 256 key from PIN and Salt via PBKDF2
 */
async function deriveEncryptionKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt credentials with PIN and optionally set up a Duress PIN
 */
export async function encryptAndSaveVault(
  credentials: WalletCredentials,
  pin: string,
  panicPin?: string
): Promise<EncryptedPayload> {
  const salt = new Uint8Array(16);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(salt);
  crypto.getRandomValues(iv);

  const key = await deriveEncryptionKey(pin, salt);
  const enc = new TextEncoder();
  const plaintext = enc.encode(JSON.stringify(credentials));

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource
    },
    key,
    plaintext
  );

  const saltHex = toHex(salt);
  let duressHash: string | undefined;
  if (panicPin && panicPin.trim() !== '') {
    duressHash = await hashPin(panicPin, saltHex);
  }

  const payload: EncryptedPayload = {
    version: 1,
    salt: saltHex,
    iv: toHex(iv),
    ciphertext: toHex(new Uint8Array(ciphertextBuffer)),
    duressHash,
    createdAt: Date.now()
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  localStorage.removeItem(DURESS_FLAG_KEY);
  return payload;
}

/**
 * Unlock vault or trigger Duress Wipe if panic PIN is provided
 */
export async function unlockVault(
  pin: string
): Promise<{ success: boolean; credentials?: WalletCredentials; isDuress?: boolean; error?: string }> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { success: false, error: 'No encrypted vault found in storage.' };
  }

  try {
    const payload: EncryptedPayload = JSON.parse(raw);
    const salt = fromHex(payload.salt);
    const iv = fromHex(payload.iv);
    const ciphertext = fromHex(payload.ciphertext);

    // Check if entered PIN matches the Panic / Duress PIN!
    if (payload.duressHash) {
      const enteredDuressHash = await hashPin(pin, payload.salt);
      if (enteredDuressHash === payload.duressHash) {
        // EMERGENCY DURESS TRIGGERED!
        // Immediately wipe all secrets, storage, and leave system sanitized
        await wipeAllVaultData();
        localStorage.setItem(DURESS_FLAG_KEY, 'true');
        return {
          success: false,
          isDuress: true,
          error: 'DURESS_TRIGGERED'
        };
      }
    }

    // Attempt decryption with main key
    const key = await deriveEncryptionKey(pin, salt);
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource
      },
      key,
      ciphertext as unknown as BufferSource
    );

    const dec = new TextDecoder();
    const credentials: WalletCredentials = JSON.parse(dec.decode(decryptedBuffer));

    return {
      success: true,
      credentials
    };
  } catch {
    return {
      success: false,
      error: 'Incorrect PIN. Unable to decrypt vault payload.'
    };
  }
}

/**
 * Check if a vault currently exists in localStorage
 */
export function hasSavedVault(): boolean {
  return !!localStorage.getItem(STORAGE_KEY);
}

/**
 * Retrieve metadata about the saved vault without decrypting
 */
export function getVaultMetadata(): { hasVault: boolean; hasDuress: boolean; createdAt?: number } {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { hasVault: false, hasDuress: false };
  try {
    const payload: EncryptedPayload = JSON.parse(raw);
    return {
      hasVault: true,
      hasDuress: !!payload.duressHash,
      createdAt: payload.createdAt
    };
  } catch {
    return { hasVault: false, hasDuress: false };
  }
}

/**
 * Completely wipe all encrypted credentials, metadata and session
 */
export async function wipeAllVaultData(): Promise<void> {
  // Clear localStorage items
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(DURESS_FLAG_KEY);
  sessionStorage.clear();

  // Try clearing IndexedDB if used
  if (typeof window !== 'undefined' && window.indexedDB) {
    try {
      window.indexedDB.deleteDatabase('bip39_vault_db');
    } catch {
      // Ignore
    }
  }
}
