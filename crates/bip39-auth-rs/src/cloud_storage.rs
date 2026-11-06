//! Zero-Knowledge Cloud Storage Key Derivation & Encryption
//! 
//! Provides deterministic HKDF key expansion from BIP-39 seed
//! and AES-256-GCM encryption for cloud services (S3, Cloud Storage, IPFS, Firebase).

use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce
};
use hkdf::Hkdf;
use rand_core::{OsRng, RngCore};
use sha2::Sha256;
use zeroize::{Zeroize, ZeroizeOnDrop};
use serde::{Deserialize, Serialize};

#[derive(Zeroize, ZeroizeOnDrop)]
pub struct CloudSymmetricKey {
    pub key: [u8; 32],
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CloudCiphertextPayload {
    pub ciphertext_hex: String,
    pub iv_hex: String,
    pub namespace: String,
    pub key_fingerprint: String,
}

/// Derives a 256-bit symmetric key from seed with specific domain separation
pub fn derive_cloud_key(seed: &[u8], namespace: &str) -> Result<CloudSymmetricKey, String> {
    let salt = format!("bip39-auth-cloud-kdf:{}", namespace);
    let info = format!("encryption-key:{}", namespace);

    let hk = Hkdf::<Sha256>::new(Some(salt.as_bytes()), seed);
    let mut okm = [0u8; 32];
    hk.expand(info.as_bytes(), &mut okm)
        .map_err(|e| format!("HKDF expand failed: {:?}", e))?;

    Ok(CloudSymmetricKey { key: okm })
}

/// Encrypts data for zero-knowledge cloud upload
pub fn encrypt_for_cloud(
    data: &[u8],
    key: &CloudSymmetricKey,
    namespace: &str,
) -> Result<CloudCiphertextPayload, String> {
    let cipher = Aes256Gcm::new_from_slice(&key.key)
        .map_err(|e| format!("Cipher init failed: {:?}", e))?;

    let mut iv = [0u8; 12];
    OsRng.fill_bytes(&mut iv);
    let nonce = Nonce::from_slice(&iv);

    let ciphertext = cipher
        .encrypt(nonce, data)
        .map_err(|e| format!("Encryption error: {:?}", e))?;

    // Key fingerprint (first 4 bytes of sha256)
    use sha2::Digest;
    let mut hasher = Sha256::new();
    hasher.update(&key.key);
    let fp = hex::encode(&hasher.finalize()[0..4]).to_uppercase();

    Ok(CloudCiphertextPayload {
        ciphertext_hex: hex::encode(ciphertext),
        iv_hex: hex::encode(iv),
        namespace: namespace.to_string(),
        key_fingerprint: fp,
    })
}

/// Decrypts ciphertext downloaded from cloud storage
pub fn decrypt_from_cloud(
    payload: &CloudCiphertextPayload,
    key: &CloudSymmetricKey,
) -> Result<Vec<u8>, String> {
    let cipher = Aes256Gcm::new_from_slice(&key.key)
        .map_err(|e| format!("Cipher init failed: {:?}", e))?;

    let iv = hex::decode(&payload.iv_hex)
        .map_err(|e| format!("Invalid IV hex: {:?}", e))?;
    let ciphertext = hex::decode(&payload.ciphertext_hex)
        .map_err(|e| format!("Invalid ciphertext hex: {:?}", e))?;

    let nonce = Nonce::from_slice(&iv);
    cipher
        .decrypt(nonce, ciphertext.as_ref())
        .map_err(|e| format!("Decryption authentication failed: {:?}", e))
}
