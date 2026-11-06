/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * @bip39-auth/core - Cloud Storage Zero-Knowledge Encryption Module
 * Deterministic client-side key derivation (HKDF / BIP-44) and AES-256-GCM
 * encryption for any cloud storage (AWS S3, Google Cloud, Firebase, Supabase, IPFS, iCloud).
 */

import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { base64, hex } from '@scure/base';

export interface CloudEncryptedPayload {
  ciphertextBase64: string;
  ivBase64: string;
  tagLength: number;
  namespace: string;
  derivedKeyFingerprint: string;
}

/**
 * Derives a deterministic 256-bit AES-GCM symmetric key from BIP-39 Seed
 * specifically isolated to a named cloud domain or service namespace.
 * 
 * @param seedBytes BIP-39 Master Seed (512-bit / 64 bytes)
 * @param namespace Isolated namespace, e.g. "s3_vault_v1", "user_profile_e2ee", "firebase_docs"
 * @returns 32 bytes (256-bit) AES key
 */
export function deriveCloudStorageKey(
  seedBytes: Uint8Array,
  namespace: string = 'cloud_storage_aes256_v1'
): Uint8Array {
  const encoder = new TextEncoder();
  const salt = encoder.encode(`bip39-auth-cloud-kdf:${namespace}`);
  const info = encoder.encode(`encryption-key:${namespace}`);
  return hkdf(sha256, seedBytes, salt, info, 32);
}

/**
 * Computes a public 4-byte key fingerprint (safe to store alongside metadata)
 */
export function getEncryptionKeyFingerprint(keyBytes: Uint8Array): string {
  const hash = sha256(keyBytes);
  return hex.encode(hash.slice(0, 4)).toUpperCase();
}

/**
 * Encrypts arbitrary file data or JSON string for zero-knowledge cloud upload.
 * Zero-Knowledge guarantee: The cloud provider only receives random ciphertext.
 */
export async function encryptForCloud(
  plainData: Uint8Array | string,
  keyBytes: Uint8Array,
  namespace: string = 'cloud_storage_aes256_v1'
): Promise<CloudEncryptedPayload> {
  const dataBytes = typeof plainData === 'string' ? new TextEncoder().encode(plainData) : plainData;
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit CSPRNG IV per NIST SP 800-38D

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes as unknown as BufferSource,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource, tagLength: 128 },
    cryptoKey,
    dataBytes as unknown as BufferSource
  );

  return {
    ciphertextBase64: base64.encode(new Uint8Array(encryptedBuffer)),
    ivBase64: base64.encode(iv),
    tagLength: 128,
    namespace,
    derivedKeyFingerprint: getEncryptionKeyFingerprint(keyBytes)
  };
}

/**
 * Decrypts a cloud payload back into raw bytes.
 * Throws an error if data was tampered with or if key is invalid.
 */
export async function decryptFromCloud(
  payload: { ciphertextBase64: string; ivBase64: string },
  keyBytes: Uint8Array
): Promise<Uint8Array> {
  const ciphertext = base64.decode(payload.ciphertextBase64);
  const iv = base64.decode(payload.ivBase64);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes as unknown as BufferSource,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource, tagLength: 128 },
    cryptoKey,
    ciphertext as unknown as BufferSource
  );

  return new Uint8Array(decryptedBuffer);
}

/**
 * Decrypts cloud payload and parses as UTF-8 string or JSON
 */
export async function decryptFromCloudAsText(
  payload: { ciphertextBase64: string; ivBase64: string },
  keyBytes: Uint8Array
): Promise<string> {
  const bytes = await decryptFromCloud(payload, keyBytes);
  return new TextDecoder().decode(bytes);
}
