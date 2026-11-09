/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIP39-ABOARD-SDK - ERC-5564 Stealth Addresses (Vitalik Buterin's Privacy Standard)
 * Implements non-interactive Diffie-Hellman stealth address generation,
 * stealth meta-addresses (spending key + viewing key), and recipient announcement scanning.
 */

import { secp256k1 } from '@noble/curves/secp256k1.js';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { hex } from '@scure/base';
import { toChecksumAddress } from './keyDerivation';

// Canonical secp256k1 curve order n
export const SECP256K1_N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141n;

export interface StealthMetaAddress {
  spendingPublicKey: string; // 33 bytes compressed hex
  viewingPublicKey: string;  // 33 bytes compressed hex
  fullStealthUri: string;    // st:eth:0x...
}

export interface StealthPaymentResult {
  stealthAddress: string;     // The one-time unlinkable recipient address (0x...)
  ephemeralPublicKey: string; // R = r * G to publish in announcement
  viewTag: string;            // 1-byte view tag for 256x faster parsing
  sharedSecretHash: string;
}

export interface StealthInboxPayment {
  id: string;
  stealthAddress: string;
  amount: string;
  token: string;
  ephemeralPubKey: string;
  derivedStealthPrivateKey: string;
  discoveredAt: string;
  isClaimed: boolean;
}

/**
 * Derives recipient's ERC-5564 Stealth Meta-Address from master seed bytes
 */
export function deriveStealthMetaAddress(masterSeedBytes: Uint8Array): {
  metaAddress: StealthMetaAddress;
  spendingPrivateKey: string;
  viewingPrivateKey: string;
} {
  const spendHash = keccak_256(new Uint8Array([...masterSeedBytes, 0x55, 0x64, 0x01]));
  const viewHash = keccak_256(new Uint8Array([...masterSeedBytes, 0x55, 0x64, 0x02]));

  const spendPriv = spendHash.slice(0, 32);
  const viewPriv = viewHash.slice(0, 32);

  const spendingPublicKey = hex.encode(secp256k1.getPublicKey(spendPriv, true));
  const viewingPublicKey = hex.encode(secp256k1.getPublicKey(viewPriv, true));

  return {
    metaAddress: {
      spendingPublicKey,
      viewingPublicKey,
      fullStealthUri: `st:eth:0x${spendingPublicKey}${viewingPublicKey}`
    },
    spendingPrivateKey: hex.encode(spendPriv),
    viewingPrivateKey: hex.encode(viewPriv)
  };
}

/**
 * Sender generates a one-time stealth address to send funds to recipient
 */
export function generateStealthAddress(
  spendingPubKeyHex: string,
  viewingPubKeyHex: string
): StealthPaymentResult {
  // 1. Sender generates ephemeral keypair (r, R = r * G)
  const ephemeralPriv = secp256k1.utils.randomSecretKey();
  const ephemeralPublicKey = hex.encode(secp256k1.getPublicKey(ephemeralPriv, true));

  // 2. Compute Diffie-Hellman shared secret: S = r * K_view
  const sharedSecret = secp256k1.getSharedSecret(ephemeralPriv, hex.decode(viewingPubKeyHex), true);

  // 3. Hash shared secret: s_h = keccak256(S)
  const sharedSecretHash = keccak_256(sharedSecret);

  // 4. View tag for ultra-fast scanning (first byte of secret hash)
  const viewTag = '0x' + hex.encode(sharedSecretHash.slice(0, 1));

  // 5. One-time stealth public key: P = K_spend + s_h * G
  const spendPoint = secp256k1.Point.fromHex(spendingPubKeyHex);
  const sHashScalar = BigInt('0x' + hex.encode(sharedSecretHash)) % SECP256K1_N;
  const sHashPoint = secp256k1.Point.BASE.multiply(sHashScalar);
  const stealthPoint = spendPoint.add(sHashPoint);

  // 6. Convert uncompressed stealth public key to Ethereum address
  const uncompressed = stealthPoint.toBytes(false).slice(1);
  const addrBytes = keccak_256(uncompressed).slice(-20);
  const stealthAddress = toChecksumAddress('0x' + hex.encode(addrBytes));

  return {
    stealthAddress,
    ephemeralPublicKey,
    viewTag,
    sharedSecretHash: hex.encode(sharedSecretHash)
  };
}

/**
 * Recipient scans announcements to discover incoming payments and recovers the spending key
 */
export function scanAndRecoverStealthPrivateKey(
  ephemeralPubKeyHex: string,
  viewingPrivKeyHex: string,
  spendingPrivKeyHex: string
): { stealthAddress: string; stealthPrivateKey: string } {
  // 1. Compute shared secret: S = k_view * R
  const sharedSecret = secp256k1.getSharedSecret(hex.decode(viewingPrivKeyHex), hex.decode(ephemeralPubKeyHex), true);
  const sharedSecretHash = keccak_256(sharedSecret);
  const sHashScalar = BigInt('0x' + hex.encode(sharedSecretHash));

  // 2. Compute stealth private key: p_stealth = (k_spend + s_h) mod n
  const spendPrivScalar = BigInt('0x' + spendingPrivKeyHex);
  const stealthPrivScalar = (spendPrivScalar + sHashScalar) % SECP256K1_N;
  const stealthPrivHex = stealthPrivScalar.toString(16).padStart(64, '0');

  // 3. Verify resulting stealth address
  const stealthPoint = secp256k1.Point.BASE.multiply(stealthPrivScalar);
  const uncompressed = stealthPoint.toBytes(false).slice(1);
  const addrBytes = keccak_256(uncompressed).slice(-20);
  const stealthAddress = toChecksumAddress('0x' + hex.encode(addrBytes));

  return {
    stealthAddress,
    stealthPrivateKey: stealthPrivHex
  };
}
