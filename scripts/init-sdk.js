#!/usr/bin/env node
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIP39-ABOARD-SDK - Automated Project Initializer & Scaffolding Tool
 * Usage: node scripts/init-sdk.js
 */

const fs = require('fs');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════════');
console.log('\x1b[33m%s\x1b[0m', '  🛡️  BIP39-ABOARD-SDK: Sovereign Non-Custodial Auth Generator');
console.log('\x1b[35m%s\x1b[0m', '  Art Style: Cyberpunk + Antoni Gaudí + Vincent van Gogh');
console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════════');

const defaultConfig = {
  appName: 'SovereignPortal',
  defaultLanguage: 'en', // 'en' | 'ru' | 'es'
  wordCount: 12,
  theme: 'cyber-vangogh',
  allowPanicPin: true,
  allowPdfExport: true,
  cloudStorageE2EE: {
    enabled: true,
    namespace: 'aws_s3_user_vault_v1',
    algorithm: 'AES-256-GCM'
  },
  serverVerification: {
    enabled: true,
    route: '/api/auth/verify',
    nonceTtlSeconds: 300
  }
};

const targetPath = path.join(process.cwd(), 'bip39-aboard.config.json');

try {
  fs.writeFileSync(targetPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
  console.log('\x1b[32m%s\x1b[0m', `\n[SUCCESS] Configuration generated: ${targetPath}`);
  console.log('\x1b[90m%s\x1b[0m', 'Default Language: English (EN) | Themes Available: 20');
  console.log('\x1b[34m%s\x1b[0m', '\nNext Steps:');
  console.log('1. Import <BIP39AuthProvider /> in your app entrypoint:');
  console.log("   import { BIP39AuthProvider } from '@bip39-auth/core';");
  console.log('2. Wrap your layout and enjoy zero-cost, SMS-free, Zero-Knowledge authentication!');
  console.log('3. Test Cloud E2EE key derivation via: node scripts/cloud-e2ee-cli.js\n');
} catch (err) {
  console.error('\x1b[31m%s\x1b[0m', 'Failed to write config file:', err);
  process.exit(1);
}
