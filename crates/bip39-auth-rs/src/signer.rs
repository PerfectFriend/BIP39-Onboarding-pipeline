//! EIP-191 Secp256k1 Message Signing and Signature Verification

use k256::ecdsa::{RecoveryId, Signature, SigningKey, VerifyingKey};
use serde::{Deserialize, Serialize};
use sha3::Keccak256;
use sha2::Digest;
use crate::key_derivation::to_checksum_address;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthChallenge {
    pub nonce: String,
    pub timestamp: u64,
    pub domain: String,
    pub statement: String,
}

impl AuthChallenge {
    pub fn format_message(&self) -> String {
        format!(
            "{} wants you to sign in with your BIP-39 account:\nStatement: {}\nNonce: {}\nIssued At: {}",
            self.domain, self.statement, self.nonce, self.timestamp
        )
    }
}

/// Signs an arbitrary message using EIP-191 specification
/// `\x19Ethereum Signed Message:\n<length><message>`
pub fn sign_ethereum_message(message: &str, private_key_bytes: &[u8]) -> Result<String, String> {
    let signing_key = SigningKey::from_slice(private_key_bytes)
        .map_err(|e| format!("Invalid private key: {}", e))?;

    let prefix = format!("\x19Ethereum Signed Message:\n{}", message.len());
    let mut keccak = Keccak256::new();
    keccak.update(prefix.as_bytes());
    keccak.update(message.as_bytes());
    let digest = keccak.finalize();

    let (sig, recid) = signing_key
        .sign_digest_recoverable(Keccak256::new().chain_update(&digest))
        .map_err(|e| format!("Signing error: {}", e))?;

    let mut sig_bytes = [0u8; 65];
    sig_bytes[0..64].copy_from_slice(&sig.to_bytes());
    sig_bytes[64] = recid.to_byte() + 27;

    Ok(format!("0x{}", hex::encode(sig_bytes)))
}

/// Signs an authentication challenge
pub fn sign_auth_challenge(challenge: &AuthChallenge, private_key_bytes: &[u8]) -> Result<String, String> {
    let msg = challenge.format_message();
    sign_ethereum_message(&msg, private_key_bytes)
}

/// Verifies an EIP-191 signature and checks if recovered address matches expected
pub fn verify_eip191_signature(message: &str, signature_hex: &str, expected_address: &str) -> bool {
    let clean_sig = signature_hex.trim_start_matches("0x");
    let sig_bytes = match hex::decode(clean_sig) {
        Ok(b) if b.len() == 65 => b,
        _ => return false,
    };

    let prefix = format!("\x19Ethereum Signed Message:\n{}", message.len());
    let mut keccak = Keccak256::new();
    keccak.update(prefix.as_bytes());
    keccak.update(message.as_bytes());
    let digest = keccak.finalize();

    let compact_sig = match Signature::from_slice(&sig_bytes[0..64]) {
        Ok(s) => s,
        Err(_) => return false,
    };

    let v = sig_bytes[64];
    let recovery_byte = if v >= 27 { v - 27 } else { v };
    let recid = match RecoveryId::from_byte(recovery_byte) {
        Some(r) => r,
        None => return false,
    };

    let recovered_key = match VerifyingKey::recover_from_digest(
        Keccak256::new().chain_update(&digest),
        &compact_sig,
        recid,
    ) {
        Ok(k) => k,
        Err(_) => return false,
    };

    let uncompressed = recovered_key.to_encoded_point(false);
    let pub_bytes = &uncompressed.as_bytes()[1..];

    let mut addr_keccak = Keccak256::new();
    addr_keccak.update(pub_bytes);
    let addr_hash = addr_keccak.finalize();
    let recovered_address = to_checksum_address(&hex::encode(&addr_hash[12..32]));

    recovered_address.to_lowercase() == expected_address.to_lowercase()
}
