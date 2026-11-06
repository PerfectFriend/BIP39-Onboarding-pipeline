//! # BIP-39 Auth Core in Rust
//!
//! A production-grade, memory-safe cryptographic onboarding & self-sovereign
//! authentication engine written in Rust.
//!
//! Features:
//! - BIP-39 mnemonic generation (12 or 24 words) using OS CSPRNG.
//! - Anti-tamper verification challenge generator with automatic rollback on error.
//! - AES-256-GCM + PBKDF2 enclave storage with `zeroize::Zeroize` on drop.
//! - Multi-chain HD derivation: EVM (`m/44'/60'/0'/0/0`), Bitcoin (`m/84'/0'/0'/0/0`), Solana (`m/44'/501'/0'/0'`).
//! - EIP-191 Secp256k1 signature authentication for passwordless/SMS-less login.
//! - Full WebAssembly bindings via `wasm_bindgen` for browser & Node.js.

pub mod mnemonic;
pub mod storage;
pub mod key_derivation;
pub mod signer;
pub mod verifier;
pub mod cloud_storage;
pub mod ffi;

// Re-exports
pub use mnemonic::{MnemonicConfig, VerificationChallenge, generate_mnemonic_phrase, generate_verification_challenges};
pub use storage::{EncryptedVault, VaultEnclave, wipe_sensitive_memory};
pub use key_derivation::{DerivedAccounts, derive_multichain_keys, to_checksum_address};
pub use signer::{AuthChallenge, sign_auth_challenge, verify_eip191_signature};
pub use verifier::{verify_bip39_login, VerifyLoginRequest, VerifyLoginResult};
pub use cloud_storage::{derive_cloud_key, encrypt_for_cloud, decrypt_from_cloud, CloudSymmetricKey, CloudCiphertextPayload};

use wasm_bindgen::prelude::*;

/// WASM initialization entrypoint
#[wasm_bindgen(start)]
pub fn init_panic_hook() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

/// WebAssembly exported API for JS / TypeScript apps
#[wasm_bindgen]
pub struct RustBIP39Enclave {
    vault: Option<storage::VaultEnclave>,
}

#[wasm_bindgen]
impl RustBIP39Enclave {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self { vault: None }
    }

    /// Generate a fresh BIP-39 mnemonic phrase (12 or 24 words)
    #[wasm_bindgen]
    pub fn generate_mnemonic(&self, word_count: u8) -> Result<String, JsValue> {
        let count = match word_count {
            12 => mnemonic::WordCount::Words12,
            24 => mnemonic::WordCount::Words24,
            _ => return Err(JsValue::from_str("Invalid word count. Supported: 12 or 24")),
        };
        mnemonic::generate_mnemonic_phrase(count)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Derive multi-chain accounts from mnemonic words (JSON output)
    #[wasm_bindgen]
    pub fn derive_accounts(&self, mnemonic_words: &str) -> Result<String, JsValue> {
        let m = bip39::Mnemonic::parse_normalized(mnemonic_words)
            .map_err(|e| JsValue::from_str(&format!("Invalid mnemonic: {}", e)))?;
        let seed = m.to_seed("");
        let accounts = key_derivation::derive_multichain_keys(&seed)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        serde_json::to_string(&accounts)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Sign EIP-191 message using derived private key
    #[wasm_bindgen]
    pub fn sign_message(&self, message: &str, private_key_hex: &str) -> Result<String, JsValue> {
        let priv_bytes = hex::decode(private_key_hex.trim_start_matches("0x"))
            .map_err(|e| JsValue::from_str(&format!("Invalid hex private key: {}", e)))?;
        signer::sign_ethereum_message(message, &priv_bytes)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Verify EIP-191 message signature and recover signer address
    #[wasm_bindgen]
    pub fn verify_signature(&self, message: &str, signature_hex: &str, expected_address: &str) -> bool {
        signer::verify_eip191_signature(message, signature_hex, expected_address)
    }

    /// Encrypt sensitive vault into AES-256-GCM container
    #[wasm_bindgen]
    pub fn encrypt_vault(&self, data_json: &str, pin: &str, duress_pin: Option<String>) -> Result<String, JsValue> {
        storage::encrypt_vault_payload(data_json.as_bytes(), pin, duress_pin.as_deref())
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Decrypt vault container with PIN (returns JSON or triggers Duress wipe)
    #[wasm_bindgen]
    pub fn decrypt_vault(&self, encrypted_json: &str, pin: &str) -> Result<String, JsValue> {
        let res = storage::decrypt_vault_payload(encrypted_json, pin)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        
        if res.is_duress {
            return Err(JsValue::from_str("DURESS_PANIC_WIPE_TRIGGERED"));
        }

        String::from_utf8(res.decrypted_bytes)
            .map_err(|e| JsValue::from_str(&format!("UTF-8 decode error: {}", e)))
    }
}
