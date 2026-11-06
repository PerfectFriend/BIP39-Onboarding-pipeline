//! Secure Enclave Storage with Zero-Plaintext RAM policy and Duress Panic Wipe

use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use pbkdf2::pbkdf2_hmac;
use rand::Rng;
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use zeroize::{Zeroize, ZeroizeOnDrop};

const PBKDF2_ROUNDS: u32 = 100_000;
const SALT_LEN: usize = 16;
const NONCE_LEN: usize = 12;

#[derive(Debug, Serialize, Deserialize)]
pub struct EncryptedVault {
    pub ciphertext_hex: String,
    pub iv_hex: String,
    pub salt_hex: String,
    pub pin_hash_hex: String,
    pub duress_hash_hex: Option<String>,
    pub created_at: u64,
}

#[derive(Zeroize, ZeroizeOnDrop)]
pub struct VaultEnclave {
    pub master_seed: Vec<u8>,
    pub mnemonic: String,
    pub primary_pin: String,
}

pub struct DecryptResult {
    pub decrypted_bytes: Vec<u8>,
    pub is_duress: bool,
}

/// Computes SHA-256 hash of PIN with salt
pub fn hash_pin(pin: &str, salt: &[u8]) -> String {
    use sha2::Digest;
    let mut hasher = Sha256::new();
    hasher.update(pin.as_bytes());
    hasher.update(salt);
    hex::encode(hasher.finalize())
}

/// Derives a 256-bit AES key from a PIN using PBKDF2 HMAC-SHA256
fn derive_key(pin: &str, salt: &[u8]) -> [u8; 32] {
    let mut key = [0u8; 32];
    pbkdf2_hmac::<Sha256>(pin.as_bytes(), salt, PBKDF2_ROUNDS, &mut key);
    key
}

/// Encrypts sensitive payload into a self-contained JSON vault
pub fn encrypt_vault_payload(
    payload: &[u8],
    primary_pin: &str,
    duress_pin: Option<&str>,
) -> Result<String, String> {
    let mut rng = rand::thread_rng();

    // 1. Generate 16-byte random salt and 12-byte nonce
    let mut salt = [0u8; SALT_LEN];
    let mut nonce_bytes = [0u8; NONCE_LEN];
    rng.fill(&mut salt[..]);
    rng.fill(&mut nonce_bytes[..]);

    // 2. Derive key and encrypt with AES-256-GCM
    let mut key = derive_key(primary_pin, &salt);
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|e| format!("Cipher initialization error: {}", e))?;

    let nonce = Nonce::from_slice(&nonce_bytes);
    let ciphertext = cipher
        .encrypt(nonce, payload)
        .map_err(|e| format!("Encryption failure: {}", e))?;

    // Zeroize key from memory
    key.zeroize();

    let pin_hash = hash_pin(primary_pin, &salt);
    let duress_hash = duress_pin.map(|dp| hash_pin(dp, &salt));

    let vault = EncryptedVault {
        ciphertext_hex: hex::encode(ciphertext),
        iv_hex: hex::encode(nonce_bytes),
        salt_hex: hex::encode(salt),
        pin_hash_hex: pin_hash,
        duress_hash_hex: duress_hash,
        created_at: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs(),
    };

    serde_json::to_string(&vault).map_err(|e| format!("Serialization error: {}", e))
}

/// Decrypts vault payload with PIN verification and instant Duress detection
pub fn decrypt_vault_payload(vault_json: &str, entered_pin: &str) -> Result<DecryptResult, String> {
    let vault: EncryptedVault = serde_json::from_str(vault_json)
        .map_err(|e| format!("Invalid vault JSON format: {}", e))?;

    let salt = hex::decode(&vault.salt_hex).map_err(|e| format!("Invalid salt hex: {}", e))?;
    let iv_bytes = hex::decode(&vault.iv_hex).map_err(|e| format!("Invalid IV hex: {}", e))?;
    let ciphertext = hex::decode(&vault.ciphertext_hex).map_err(|e| format!("Invalid ciphertext: {}", e))?;

    let entered_hash = hash_pin(entered_pin, &salt);

    // 1. Check if Panic PIN was entered ($5 Wrench Attack Trigger)
    if let Some(ref duress_hash) = vault.duress_hash_hex {
        if &entered_hash == duress_hash {
            // Panic triggered! Return immediately with duress flag
            return Ok(DecryptResult {
                decrypted_bytes: Vec::new(),
                is_duress: true,
            });
        }
    }

    // 2. Check primary PIN
    if entered_hash != vault.pin_hash_hex {
        return Err("Invalid PIN code. Access denied.".to_string());
    }

    // 3. Decrypt payload
    let mut key = derive_key(entered_pin, &salt);
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|e| format!("Cipher error: {}", e))?;

    let nonce = Nonce::from_slice(&iv_bytes);
    let plaintext = cipher
        .decrypt(nonce, ciphertext.as_ref())
        .map_err(|_| "Decryption failed (integrity check mismatch)".to_string())?;

    key.zeroize();

    Ok(DecryptResult {
        decrypted_bytes: plaintext,
        is_duress: false,
    })
}

/// Explicit memory wiping helper
pub fn wipe_sensitive_memory<T: Zeroize>(mut sensitive_data: T) {
    sensitive_data.zeroize();
}
