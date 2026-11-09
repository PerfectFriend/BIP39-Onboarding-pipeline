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
//! - ERC-4337 Account Abstraction v0.7: counterfactual CREATE2 accounts, packed UserOp digests, gasless paymaster relay.
//! - ERC-5564 Stealth Addresses: Secp256k1 Diffie-Hellman, ephemeral $R = r \cdot G$, stealth view-key scanner, $p_{stealth}$ scalar recovery with ZeroizeOnDrop.
//! - Advanced AML & Threat Classifier: OFAC SDN registry, Tornado Cash, phishing drainers, risk scoring.
//! - Full WebAssembly bindings via `wasm_bindgen` for browser & Node.js.

pub mod mnemonic;
pub mod storage;
pub mod key_derivation;
pub mod signer;
pub mod verifier;
pub mod cloud_storage;
pub mod aml;
pub mod erc4337;
pub mod stealth;
pub mod ffi;

// Re-exports
pub use mnemonic::{MnemonicConfig, VerificationChallenge, generate_mnemonic_phrase, generate_verification_challenges};
pub use storage::{EncryptedVault, VaultEnclave, wipe_sensitive_memory};
pub use key_derivation::{DerivedAccounts, derive_multichain_keys, to_checksum_address};
pub use signer::{AuthChallenge, sign_auth_challenge, verify_eip191_signature};
pub use verifier::{verify_bip39_login, VerifyLoginRequest, VerifyLoginResult};
pub use cloud_storage::{derive_cloud_key, encrypt_for_cloud, decrypt_from_cloud, CloudSymmetricKey, CloudCiphertextPayload};
pub use aml::{screen_address_aml, AmlScoreResult, ThreatFlag, ThreatSeverity};
pub use erc4337::{
    compute_counterfactual_account, compute_user_operation_hash, build_gasless_user_op,
    PackedUserOperation, GaslessRelayPayload, SmartAccountInfo, CANONICAL_ENTRY_POINT_V07, CANONICAL_PAYMASTER,
};
pub use stealth::{
    generate_stealth_meta_address, generate_stealth_address, scan_and_recover_stealth_key,
    StealthMetaAddress, StealthPayment, StealthScanResult, ZeroizeSecretScalar,
};

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

    // --- NEW WASM EXPORTS FOR ERC-4337, ERC-5564 & AML ---

    /// Compute counterfactual ERC-4337 Smart Account address (CREATE2)
    #[wasm_bindgen]
    pub fn compute_smart_account(&self, owner_address: &str, salt_hex: Option<String>) -> Result<String, JsValue> {
        let info = erc4337::compute_counterfactual_account(owner_address, salt_hex.as_deref())
            .map_err(|e| JsValue::from_str(&e))?;
        serde_json::to_string(&info)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Build sponsored gasless UserOperation relay payload
    #[wasm_bindgen]
    pub fn build_gasless_user_op(
        &self,
        smart_account: &str,
        target_contract: &str,
        call_value_wei: &str,
        data_hex: &str,
        chain_id: u64,
    ) -> Result<String, JsValue> {
        let payload = erc4337::build_gasless_user_op(smart_account, target_contract, call_value_wei, data_hex, chain_id)
            .map_err(|e| JsValue::from_str(&e))?;
        serde_json::to_string(&payload)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Generate an ERC-5564 stealth payment address and ephemeral public key
    #[wasm_bindgen]
    pub fn generate_stealth_address(&self, spending_pubkey: &str, viewing_pubkey: &str) -> Result<String, JsValue> {
        let payment = stealth::generate_stealth_address(spending_pubkey, viewing_pubkey)
            .map_err(|e| JsValue::from_str(&e))?;
        serde_json::to_string(&payment)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Scan incoming announcement and recover stealth private key if addressed to receiver
    #[wasm_bindgen]
    pub fn scan_and_recover_stealth_key(
        &self,
        ephemeral_pubkey: &str,
        viewing_privkey: &str,
        spending_privkey: &str,
        expected_stealth_address: &str,
    ) -> Result<String, JsValue> {
        let result = stealth::scan_and_recover_stealth_key(
            ephemeral_pubkey,
            viewing_privkey,
            spending_privkey,
            expected_stealth_address,
        )
        .map_err(|e| JsValue::from_str(&e))?;
        serde_json::to_string(&result)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Screen an address for AML sanctions, mixers, and drainer signatures
    #[wasm_bindgen]
    pub fn screen_address_aml(&self, address: &str) -> Result<String, JsValue> {
        let score = aml::screen_address_aml(address);
        serde_json::to_string(&score)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }
}
