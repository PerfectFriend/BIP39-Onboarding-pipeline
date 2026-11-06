/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HDKey } from '@scure/bip32';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { ed25519 } from '@noble/curves/ed25519.js';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { sha256, sha512 } from '@noble/hashes/sha2.js';
import { ripemd160 } from '@noble/hashes/legacy.js';
import { hmac } from '@noble/hashes/hmac.js';
import { base58, bech32, hex } from '@scure/base';

export interface DerivedChainKeys {
  eth: {
    address: string;
    path: string;
    publicKey: string;
    privateKeyHex: string;
  };
  btc: {
    address: string;
    path: string;
    publicKey: string;
    privateKeyHex: string;
  };
  sol: {
    address: string;
    path: string;
    publicKey: string;
    privateKeyHex: string;
  };
  masterFingerprint: string;
}

/**
 * Applies EIP-55 mixed-case checksum to an Ethereum address (20 bytes hex)
 */
export function toChecksumAddress(rawAddressHex: string): string {
  const addr = rawAddressHex.toLowerCase().replace(/^0x/, '');
  const hash = hex.encode(keccak_256(new TextEncoder().encode(addr)));
  let checksummed = '0x';
  for (let i = 0; i < addr.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      checksummed += addr[i].toUpperCase();
    } else {
      checksummed += addr[i];
    }
  }
  return checksummed;
}

/**
 * SLIP-0010 Ed25519 Key Derivation for Solana (m/44'/501'/0'/0')
 */
function deriveSolanaEd25519Key(seedBytes: Uint8Array, path: string = "m/44'/501'/0'/0'"): { privateKey: Uint8Array; publicKey: Uint8Array } {
  // Master key derivation: HMAC-SHA512 with key "ed25519 seed"
  const encoder = new TextEncoder();
  const masterKey = hmac(sha512, encoder.encode('ed25519 seed'), seedBytes);
  let k = masterKey.slice(0, 32);
  let c = masterKey.slice(32);

  const segments = path
    .split('/')
    .slice(1)
    .map((seg) => {
      const isHardened = seg.endsWith("'");
      const index = parseInt(seg.replace("'", ''), 10);
      return isHardened ? index + 0x80000000 : index;
    });

  for (const index of segments) {
    // Hardened child derivation for Ed25519: 0x00 + key + 4-byte BE index
    const data = new Uint8Array(1 + 32 + 4);
    data[0] = 0x00;
    data.set(k, 1);
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    view.setUint32(33, index, false);

    const I = hmac(sha512, c, data);
    k = I.slice(0, 32);
    c = I.slice(32);
  }

  const pubKey = ed25519.getPublicKey(k);
  return { privateKey: k, publicKey: pubKey };
}

/**
 * Cryptographically derives honest multi-chain keys and addresses from BIP-39 Seed Bytes
 */
export function deriveHonestChainKeys(seedBytes: Uint8Array): DerivedChainKeys {
  const root = HDKey.fromMasterSeed(seedBytes);

  // BIP-32 Master Fingerprint (first 4 bytes of Hash160 in hex)
  const masterFingerprint = (root.fingerprint >>> 0).toString(16).padStart(8, '0').toUpperCase();

  // 1. Ethereum / EVM (BIP-44: m/44'/60'/0'/0/0)
  const ethPath = "m/44'/60'/0'/0/0";
  const ethChild = root.derive(ethPath);
  if (!ethChild.privateKey || !ethChild.publicKey) throw new Error('Failed to derive Ethereum keys');
  
  // Uncompressed public key without 0x04 prefix (64 bytes)
  const ethUncompressed = secp256k1.getPublicKey(ethChild.privateKey, false).slice(1);
  const ethAddressBytes = keccak_256(ethUncompressed).slice(-20);
  const ethAddress = toChecksumAddress(hex.encode(ethAddressBytes));

  // 2. Bitcoin Native SegWit (BIP-84: m/84'/0'/0'/0/0 -> bc1q...)
  const btcPath = "m/84'/0'/0'/0/0";
  const btcChild = root.derive(btcPath);
  if (!btcChild.privateKey || !btcChild.publicKey) throw new Error('Failed to derive Bitcoin keys');
  
  // Hash160 of compressed public key
  const btcPubHash = ripemd160(sha256(btcChild.publicKey));
  const btcWords = bech32.toWords(btcPubHash);
  const btcAddress = bech32.encode('bc', [0, ...btcWords]);

  // 3. Solana (SLIP-0010: m/44'/501'/0'/0')
  const solPath = "m/44'/501'/0'/0'";
  const solKeys = deriveSolanaEd25519Key(seedBytes, solPath);
  const solAddress = base58.encode(solKeys.publicKey);

  return {
    eth: {
      address: ethAddress,
      path: ethPath,
      publicKey: hex.encode(ethChild.publicKey),
      privateKeyHex: hex.encode(ethChild.privateKey)
    },
    btc: {
      address: btcAddress,
      path: btcPath,
      publicKey: hex.encode(btcChild.publicKey),
      privateKeyHex: hex.encode(btcChild.privateKey)
    },
    sol: {
      address: solAddress,
      path: solPath,
      publicKey: hex.encode(solKeys.publicKey),
      privateKeyHex: hex.encode(solKeys.privateKey)
    },
    masterFingerprint
  };
}

/**
 * Sign an arbitrary message using the derived Ethereum private key
 */
export function signEthereumMessage(message: string, privateKeyHex: string): { r: string; s: string; v: number; signature: string } {
  const enc = new TextEncoder();
  const prefix = `\x19Ethereum Signed Message:\n${message.length}`;
  const prefixedData = new Uint8Array(prefix.length + message.length);
  prefixedData.set(enc.encode(prefix), 0);
  prefixedData.set(enc.encode(message), prefix.length);

  const msgHash = keccak_256(prefixedData);
  const sigBytes = secp256k1.sign(msgHash, hex.decode(privateKeyHex));
  const parsedSig = secp256k1.Signature.fromBytes(sigBytes);
  
  const rHex = parsedSig.r.toString(16).padStart(64, '0');
  const sHex = parsedSig.s.toString(16).padStart(64, '0');
  const v = (parsedSig.recovery ?? 0) + 27;
  const signature = `0x${rHex}${sHex}${v.toString(16)}`;

  return { r: `0x${rHex}`, s: `0x${sHex}`, v, signature };
}
