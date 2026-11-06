#!/usr/bin/env node
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIP39-ABOARD-SDK - Terminal Cloud E2EE Tool
 * Derives AES-256-GCM symmetric keys from BIP-39 mnemonic and tests client-side encryption.
 * Usage: node scripts/cloud-e2ee-cli.js [namespace] [plaintext]
 */

const crypto = require('crypto');

const namespace = process.argv[2] || 'aws_s3_user_vault_v1';
const sampleText = process.argv[3] || '{"status":"ok","notes":"Secret E2EE Payload"}';

// Demo 12-word mnemonic seed
const demoEntropy = crypto.randomBytes(16);
const salt = `bip39-auth-cloud-kdf:${namespace}`;
const info = `encryption-key:${namespace}`;

// Derive 32-byte (256-bit) AES key via HKDF-SHA256
const derivedKey = crypto.hkdfSync('sha256', demoEntropy, Buffer.from(salt), Buffer.from(info), 32);

// Encrypt sample payload with AES-256-GCM
const iv = crypto.randomBytes(12);
const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
let encrypted = cipher.update(sampleText, 'utf8', 'base64');
encrypted += cipher.final('base64');
const authTag = cipher.getAuthTag();

// Combined ciphertext + auth tag
const finalCiphertext = encrypted + ':' + authTag.toString('base64');

console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════════');
console.log('\x1b[32m%s\x1b[0m', '  ☁️  Zero-Knowledge Cloud Storage E2EE Test Suite');
console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════════');
console.log('\x1b[33m%s\x1b[0m', `Namespace:        ${namespace}`);
console.log('\x1b[34m%s\x1b[0m', `Key Fingerprint:  ${crypto.createHash('sha256').update(derivedKey).digest('hex').slice(0, 8).toUpperCase()}`);
console.log('\x1b[90m%s\x1b[0m', `IV (Base64):      ${iv.toString('base64')}`);
console.log('\x1b[35m%s\x1b[0m', `Encrypted Blob:   ${finalCiphertext}`);

// Decrypt verification
const parts = finalCiphertext.split(':');
const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv);
decipher.setAuthTag(Buffer.from(parts[1], 'base64'));
let decrypted = decipher.update(parts[0], 'base64', 'utf8');
decrypted += decipher.final('utf8');

console.log('\x1b[32m%s\x1b[0m', `Decrypted Match:  ${decrypted === sampleText ? '✓ 100% OK' : '✗ Failed'}`);
console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════════\n');
