# BIP39-ABOARD-SDK 🛡️✨

> **The Sovereign, Zero-Knowledge Onboarding & Cloud E2EE Cryptography Engine**  
> *Drop-in replacement for Phone Number (SMS OTP) and Email/Password authentication in Web, Mobile, and Cloud applications.*

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Rust Crate](https://img.shields.io/badge/Rust-bip39--auth--rs-orange.svg)](https://crates.io/)
[![Zero-Knowledge](https://img.shields.io/badge/Zero--Knowledge-100%25-emerald.svg)]()
[![Duress Protected](https://img.shields.io/badge/Duress_Panic-10ms_Wipe-red.svg)]()

---

## 🌐 Language Navigation / Выбор языка / Selección de Idioma
- 🇬🇧 **[English (Default)](#-english)**
- 🇷🇺 **[Русский (Russian)](./README.ru.md)** | [Перейти к разделу](#-русский)
- 🇪🇸 **[Español (Spanish)](./README.es.md)** | [Ir a la sección](#-español)

---

<p align="center">
  <img src="./src/assets/images/bip39_aboard_hero_1794005512735.jpg" alt="BIP39-ABOARD-SDK Hero Banner: Cyberpunk + Van Gogh + Antoni Gaudí" width="100%" />
</p>

---

## 🇬🇧 English

### Why Replace Phone Number & Email with BIP-39?
Traditional SMS OTP and email authentication suffer from systemic security flaws and high costs:
* **SMS Costs ($0.05–$0.15/OTP):** Vulnerable to SMS toll fraud and huge carrier bills.
* **SIM-Swap & Phishing:** Telecom operators can be tricked into issuing duplicate SIM cards.
* **Database Leaks:** Storing customer phones and emails creates GDPR liability and breach risk.

### Features
1. **Self-Sovereign Identity (SSI):** Deterministic EVM/Solana address as a universal User ID. Zero server-side passwords.
2. **Zero-Knowledge Challenge-Response (EIP-191):** Client-side signing with ECDSA secp256k1. Private keys never leave RAM.
3. **Deterministic Cloud Storage Encryption (E2EE):** HKDF-SHA256 derivation of isolated AES-256-GCM symmetric keys for AWS S3, Firebase, Supabase, and IPFS.
4. **Duress Defense ($5 Wrench Attack):** Panic PIN completely obliterates in-memory keys and local storage in under 10ms.
5. **Memory-Safe Rust Enclave:** Includes `/crates/bip39-auth-rs` with `zeroize::ZeroizeOnDrop` hardware memory wipe.
6. **20 Cyberpunk + Gaudí + Van Gogh Visual Themes:** Fully customizable design system with zero-scroll responsive layouts.

### Quick Start (3 Lines)

```bash
npm install @bip39-auth/core
# or run the CLI generator:
node scripts/init-sdk.js
```

```tsx
import { BIP39AuthProvider, useBIP39Auth } from '@bip39-auth/core';

export function App() {
  return (
    <BIP39AuthProvider
      config={{ appName: 'MySovereignApp', defaultWordCount: 12, allowPanicPin: true }}
      onDuressWipe={() => console.warn('Duress wipe executed!')}
    >
      <MainApp />
    </BIP39AuthProvider>
  );
}
```

### Deterministic Cloud Storage Encryption (AWS S3, Firebase, Supabase)

```typescript
import { mnemonicToSeedHex, deriveCloudStorageKey, encryptForCloud } from '@bip39-auth/core';
import { hex } from '@scure/base';

// Derive 256-bit AES key for specific cloud bucket/namespace:
const seedBytes = hex.decode(await mnemonicToSeedHex(userMnemonic));
const cloudKey = deriveCloudStorageKey(seedBytes, 'aws_s3_user_vault_v1');

// Encrypt payload client-side before upload (cloud provider sees only noise):
const encrypted = await encryptForCloud(JSON.stringify(userProfile), cloudKey, 'aws_s3_user_vault_v1');
await uploadToS3({ ciphertext: encrypted.ciphertextBase64, iv: encrypted.ivBase64 });
```

---

<p align="center">
  <img src="./src/assets/images/bip39_vault_matrix_1794005527942.jpg" alt="BIP39-ABOARD-SDK Cryptographic Vault Sanctuary" width="100%" />
</p>

---

## 🇷🇺 Русский

### Кратко и главное
**BIP39-ABOARD-SDK** — готовый SDK для замены авторизации по номеру телефона (SMS) и Email на суверенную криптографическую идентификацию (BIP-39) с защитой от принуждения и сквозным шифрованием облачных баз данных.

### Ключевые возможности:
1. **0 затрат на SMS:** Никаких расходов на SMS-шлюзы и Twilio.
2. **Уникальный профиль без Email:** Публичный адрес (0x...) выступает как глобальный идентификатор (DID).
3. **E2EE для Cloud Storage:** Автоматическая деривация ключей AES-256 для Amazon S3, Firebase, Supabase. Облако не может прочитать файлы пользователя.
4. **Панический PIN:** Мгновенное стирание всех данных при физической угрозе.
5. **Ядро на Rust / WebAssembly:** Гарантированное затирание RAM нулями (`ZeroizeOnDrop`) при выходе из скоупа.
6. **20 готовых дизайнерских тем:** Киберпанк + Гауди + Ван Гог, Неон, Матрица, Обсидиан.

*Подробная документация: [README.ru.md](./README.ru.md) и [HOWTO.md](./HOWTO.md)*

---

## 🇪🇸 Español

### Resumen Rápido
**BIP39-ABOARD-SDK** es un motor de incorporación e identidad autosoberana (SSI) que reemplaza completamente el inicio de sesión por teléfono (SMS) y correo electrónico por claves maestras criptográficas BIP-39 con cifrado de almacenamiento en la nube de conocimiento cero (Zero-Knowledge).

### Características Principales:
1. **Cero Costes en SMS:** Sin gastos de proveedores telefónicos ni vulnerabilidades SIM-Swap.
2. **Perfil Único sin Correo:** La dirección pública (0x...) actúa como ID universal de usuario.
3. **Cifrado E2EE para la Nube:** Derivación determinista de claves AES-256-GCM para AWS S3, Firebase y Supabase. El proveedor solo almacena ruido cifrado.
4. **PIN de Pánico (Ataque de Llave Inglesa):** Borrado instantáneo de memoria y almacenamiento local en menos de 10ms.
5. **Enclave en Rust / WebAssembly:** Borrado físico de memoria RAM con `zeroize::ZeroizeOnDrop`.
6. **20 Temas Visuales:** Fusión de Cyberpunk + Gaudí + Van Gogh, Matrix y Minimalismo.

*Documentación en español: [README.es.md](./README.es.md)*

---

## 📂 Repository Structure

```
BIP39-ABOARD-SDK/
├── src/
│   ├── lib/bip39-auth-core/   # Ready-to-publish NPM Library (TypeScript)
│   │   ├── cloudEncryption.ts # Zero-Knowledge Cloud Storage E2EE
│   │   ├── keyDerivation.ts   # Multi-chain derivation (EVM, BTC, SOL)
│   │   ├── signer.ts          # EIP-191 Secp256k1 message signing
│   │   └── react/             # <BIP39AuthProvider />, useBIP39Auth()
│   ├── components/
│   │   ├── configurator/      # 20-Theme Setup & Configurator Studio
│   │   ├── onboarding/        # BIP-39 Onboarding Flow (Zero-Scroll)
│   │   └── rust/              # Rust / WASM Live Benchmark & Inspector
├── crates/bip39-auth-rs/      # High-Performance Memory-Safe Rust Crate
├── scripts/
│   ├── init-sdk.js            # Interactive CLI Scaffolding tool
│   └── cloud-e2ee-cli.js      # Standalone Terminal Cloud Encryptor
├── HOWTO.md                   # Complete Integration Architecture Guide
├── AGENT_PROMPTS.md           # 6 Ready-to-use System Prompts for AI Coders
├── README.md                  # Multilingual Readme (English Default)
├── README.ru.md               # Russian Documentation
└── README.es.md               # Spanish Documentation
```
