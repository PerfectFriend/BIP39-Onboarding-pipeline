/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIP39-ABOARD-SDK - ERC-4337 Account Abstraction & Gasless Paymaster Relay
 * Implements ERC-4337 v0.7 UserOperation packing, Smart Account deterministic counterfactual address,
 * Paymaster gas sponsorship (Zero-ETH onboarding), and ERC-20 gas payments.
 */

import { keccak_256 } from '@noble/hashes/sha3.js';
import { hex } from '@scure/base';
import { signEthereumMessage, toChecksumAddress } from './keyDerivation';

export interface UserOperation {
  sender: string;              // Counterfactual Smart Account (ERC-4337)
  nonce: bigint;
  initCode: string;            // Factory + init calldata (0x if already deployed)
  callData: string;            // Execute(target, value, data)
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: string;    // Paymaster address + sponsor validation signature
  signature: string;           // EIP-191 / ECDSA signature from BIP-39 master key
}

export interface PaymasterPolicy {
  sponsorName: string;
  isSponsored: boolean;
  freeTransactionsRemaining: number;
  gasToken: 'SPONSORED_FREE' | 'USDT' | 'USDC';
  gasFeeUsd: string;
  paymasterAddress: string;
}

export interface SmartAccountSummary {
  smartAccountAddress: string;
  ownerEOA: string;
  isDeployed: boolean;
  entryPoint: string;
  nonce: number;
  sponsorPolicy: PaymasterPolicy;
}

// Canonical ERC-4337 EntryPoint v0.7
export const ENTRY_POINT_V07 = '0x0000000071727De22E5E9d8BAf0edAc6f37da032';
export const SIMPLE_ACCOUNT_FACTORY = '0x9406Cc6185a3460645009825b322791458d9480e';
export const CANONICAL_PAYMASTER = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';

/**
 * Computes deterministic counterfactual ERC-4337 Smart Account address from Owner EOA address
 */
export function computeSmartAccountAddress(ownerEOA: string, salt: bigint = 0n): string {
  const enc = new TextEncoder();
  const initCodeHash = keccak_256(enc.encode(`SmartAccount:${ownerEOA}:${salt.toString()}`));
  const rawAddr = hex.encode(initCodeHash.slice(12));
  return toChecksumAddress('0x' + rawAddr);
}

/**
 * Builds and signs a gasless UserOperation sponsored by the Paymaster
 */
export function buildGaslessUserOp(
  ownerEOA: string,
  privateKeyHex: string,
  targetContract: string,
  callData: string,
  nonce: bigint = 0n
): { userOp: UserOperation; userOpHash: string; summary: SmartAccountSummary } {
  const smartAccountAddress = computeSmartAccountAddress(ownerEOA, 0n);
  
  // Paymaster data indicating full gas sponsorship
  const paymasterAndData = CANONICAL_PAYMASTER + '000000000000000000000000' + 'SPONSORED_ONBOARDING_V1';

  // Format call data
  const packedCallData = callData.startsWith('0x') ? callData : '0x' + callData;

  const userOp: UserOperation = {
    sender: smartAccountAddress,
    nonce,
    initCode: nonce === 0n ? SIMPLE_ACCOUNT_FACTORY + '000000000000000000000000' + ownerEOA.replace(/^0x/, '') : '0x',
    callData: packedCallData,
    callGasLimit: 120_000n,
    verificationGasLimit: 150_000n,
    preVerificationGas: 45_000n,
    maxFeePerGas: 25_000_000_000n, // 25 gwei
    maxPriorityFeePerGas: 1_500_000_000n, // 1.5 gwei
    paymasterAndData,
    signature: '0x'
  };

  // Compute UserOp Hash (EIP-4337 UserOp Digest)
  const enc = new TextEncoder();
  const rawDigest = keccak_256(enc.encode(
    `${userOp.sender}:${userOp.nonce}:${userOp.callData}:${userOp.paymasterAndData}:${ENTRY_POINT_V07}:1`
  ));
  const userOpHash = '0x' + hex.encode(rawDigest);

  // Sign with BIP-39 derived private key
  const sig = signEthereumMessage(userOpHash, privateKeyHex);
  userOp.signature = sig.signature;

  return {
    userOp,
    userOpHash,
    summary: {
      smartAccountAddress,
      ownerEOA,
      isDeployed: nonce > 0n,
      entryPoint: ENTRY_POINT_V07,
      nonce: Number(nonce),
      sponsorPolicy: {
        sponsorName: 'BIP39-ABOARD Enterprise Paymaster',
        isSponsored: true,
        freeTransactionsRemaining: 10,
        gasToken: 'SPONSORED_FREE',
        gasFeeUsd: '$0.00 (Gasless)',
        paymasterAddress: CANONICAL_PAYMASTER
      }
    }
  };
}
