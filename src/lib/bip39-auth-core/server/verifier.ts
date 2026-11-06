/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Server-side verification utility for @bip39-auth/core
 * Used in Express, Next.js API Routes, Fastify, NestJS, etc.
 * Verifies sovereign user signature without passwords, SMS codes, or private key exposure.
 */

import { verifyAuthChallenge } from '../signer';
import { AuthChallengePayload } from '../types';

export interface VerifyLoginRequest {
  challenge: AuthChallengePayload;
  signature: string;
  expectedAddress: string;
}

export interface VerifyLoginResult {
  authenticated: boolean;
  userId?: string; // EIP-55 address (e.g. 0x71C...3a)
  error?: string;
}

/**
 * Server-side login verification function
 * 
 * Example in Next.js App Router / Express:
 * ```ts
 * const result = verifyBIP39Login({ challenge, signature, expectedAddress });
 * if (result.authenticated) {
 *    // Create HTTP-only session cookie with result.userId
 *    req.session.userId = result.userId;
 * }
 * ```
 */
export function verifyBIP39Login(req: VerifyLoginRequest): VerifyLoginResult {
  if (!req.challenge || !req.signature || !req.expectedAddress) {
    return { authenticated: false, error: 'Missing challenge, signature, or address' };
  }

  const check = verifyAuthChallenge(req.challenge, req.signature, req.expectedAddress);

  if (check.valid && check.recoveredAddress) {
    return {
      authenticated: true,
      userId: check.recoveredAddress
    };
  }

  return {
    authenticated: false,
    error: check.error || 'Invalid cryptographic signature'
  };
}
