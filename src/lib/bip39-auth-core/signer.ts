/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { secp256k1 } from '@noble/curves/secp256k1.js';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { hex } from '@scure/base';
import { toChecksumAddress, signEthereumMessage } from '../../services/keyDerivation';
import { AuthChallengePayload } from './types';

/**
 * Creates an authentication challenge payload (nonce + timestamp + domain)
 */
export function createAuthChallenge(
  domain: string = typeof window !== 'undefined' ? window.location.host : 'app.local',
  statement: string = 'Sign in with Sovereign BIP-39 Vault'
): AuthChallengePayload {
  const nonceBytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(nonceBytes);
  }
  const nonce = hex.encode(nonceBytes);
  return {
    nonce,
    timestamp: Date.now(),
    domain,
    statement
  };
}

/**
 * Formats challenge payload into an EIP-4361 / EIP-191 human-readable string
 */
export function formatChallengeMessage(payload: AuthChallengePayload): string {
  return `${payload.domain} wants you to sign in with your BIP-39 account:
Statement: ${payload.statement}
Nonce: ${payload.nonce}
Issued At: ${new Date(payload.timestamp).toISOString()}`;
}

/**
 * Signs an authentication challenge using client's private key
 */
export function signAuthChallenge(
  payload: AuthChallengePayload,
  privateKeyHex: string
): { signature: string; message: string } {
  const message = formatChallengeMessage(payload);
  const sig = signEthereumMessage(message, privateKeyHex);
  return {
    signature: sig.signature,
    message
  };
}

/**
 * Verifies an EIP-191 signature and recovers the public address
 */
export function verifyAuthChallenge(
  payload: AuthChallengePayload,
  signatureHex: string,
  expectedAddress: string,
  maxAgeMs: number = 5 * 60 * 1000 // 5 minutes validity
): { valid: boolean; recoveredAddress?: string; error?: string } {
  try {
    // 1. Check expiration
    const now = Date.now();
    if (now - payload.timestamp > maxAgeMs) {
      return { valid: false, error: 'Challenge expired' };
    }

    const message = formatChallengeMessage(payload);
    const prefix = `\x19Ethereum Signed Message:\n${message.length}`;
    const enc = new TextEncoder();
    const digest = keccak_256(enc.encode(prefix + message));

    const cleanSig = signatureHex.replace(/^0x/, '');
    const compactSigBytes = hex.decode(cleanSig.slice(0, 128));
    const recoveryByte = parseInt(cleanSig.slice(128, 130), 16);
    const recovery = recoveryByte >= 27 ? recoveryByte - 27 : recoveryByte;

    const signature = secp256k1.Signature.fromBytes(compactSigBytes).addRecoveryBit(recovery);
    const recoveredPubKeyPoint = signature.recoverPublicKey(digest);
    const rawPubBytes = recoveredPubKeyPoint.toBytes(false).slice(1);
    const addrBytes = keccak_256(rawPubBytes).slice(-20);
    const recoveredAddress = toChecksumAddress(hex.encode(addrBytes));

    const isMatch = recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    return {
      valid: isMatch,
      recoveredAddress,
      error: isMatch ? undefined : 'Address mismatch'
    };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Verification failed' };
  }
}
