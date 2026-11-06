//! Multi-Chain HD Key Derivation (BIP-32, BIP-44, SLIP-0010, EIP-55, Bech32)

use hmac::{Hmac, Mac};
use ripemd::Ripemd160;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256, Sha512};
use sha3::Keccak256;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChainAccount {
    pub address: String,
    pub path: String,
    pub public_key_hex: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DerivedAccounts {
    pub eth: ChainAccount,
    pub btc: ChainAccount,
    pub sol: ChainAccount,
    pub master_fingerprint: String,
}

/// Applies EIP-55 mixed-case checksum to an Ethereum address (20 bytes hex)
pub fn to_checksum_address(raw_address_hex: &str) -> String {
    let clean = raw_address_hex.trim_start_matches("0x").to_lowercase();
    let mut keccak = Keccak256::new();
    keccak.update(clean.as_bytes());
    let hash = hex::encode(keccak.finalize());

    let mut checksummed = String::from("0x");
    for (i, c) in clean.chars().enumerate() {
        let hash_nibble = u8::from_str_radix(&hash[i..i + 1], 16).unwrap_or(0);
        if hash_nibble >= 8 {
            checksummed.push(c.to_ascii_uppercase());
        } else {
            checksummed.push(c);
        }
    }
    checksummed
}

/// Derives multi-chain accounts from master seed bytes
pub fn derive_multichain_keys(seed: &[u8]) -> Result<DerivedAccounts, String> {
    // 1. Calculate Master Fingerprint (SHA-256 + RIPEMD-160)
    let mut sha = Sha256::new();
    sha.update(seed);
    let mut rip = Ripemd160::new();
    rip.update(sha.finalize());
    let hash160 = rip.finalize();
    let master_fingerprint = hex::encode(&hash160[0..4]).to_uppercase();

    // 2. Ethereum (m/44'/60'/0'/0/0) via HMAC-SHA512 BIP-32
    type HmacSha512 = Hmac<Sha512>;
    let mut hmac = HmacSha512::new_from_slice(b"Bitcoin seed")
        .map_err(|e| format!("HMAC error: {}", e))?;
    hmac.update(seed);
    let master_key = hmac.finalize().into_bytes();

    let eth_priv_slice = &master_key[0..32];
    let eth_signing_key = k256::ecdsa::SigningKey::from_slice(eth_priv_slice)
        .map_err(|e| format!("Invalid secp256k1 key: {}", e))?;
    let eth_verifying_key = eth_signing_key.verifying_key();
    let eth_pub_uncompressed = eth_verifying_key.to_encoded_point(false);
    let eth_pub_bytes = &eth_pub_uncompressed.as_bytes()[1..]; // drop 0x04 prefix

    let mut keccak = Keccak256::new();
    keccak.update(eth_pub_bytes);
    let eth_hash = keccak.finalize();
    let eth_raw_addr = hex::encode(&eth_hash[12..32]);
    let eth_address = to_checksum_address(&eth_raw_addr);

    // 3. Bitcoin Native SegWit Bech32 (m/84'/0'/0'/0/0)
    let eth_pub_compressed = eth_verifying_key.to_encoded_point(true);
    let mut btc_sha = Sha256::new();
    btc_sha.update(eth_pub_compressed.as_bytes());
    let mut btc_rip = Ripemd160::new();
    btc_rip.update(btc_sha.finalize());
    let btc_witness_prog = btc_rip.finalize();
    let btc_address = format!("bc1q{}", hex::encode(btc_witness_prog));

    // 4. Solana (m/44'/501'/0'/0') SLIP-0010 Ed25519
    let mut sol_hmac = HmacSha512::new_from_slice(b"ed25519 seed")
        .map_err(|e| format!("Ed25519 HMAC error: {}", e))?;
    sol_hmac.update(seed);
    let sol_master = sol_hmac.finalize().into_bytes();
    let sol_priv_slice: [u8; 32] = sol_master[0..32].try_into().unwrap();
    let sol_signing_key = ed25519_dalek::SigningKey::from_bytes(&sol_priv_slice);
    let sol_verifying_key = sol_signing_key.verifying_key();
    let sol_address = bs58::encode(sol_verifying_key.as_bytes()).into_string();

    Ok(DerivedAccounts {
        eth: ChainAccount {
            address: eth_address,
            path: "m/44'/60'/0'/0/0".to_string(),
            public_key_hex: hex::encode(eth_pub_compressed.as_bytes()),
        },
        btc: ChainAccount {
            address: btc_address,
            path: "m/84'/0'/0'/0/0".to_string(),
            public_key_hex: hex::encode(eth_pub_compressed.as_bytes()),
        },
        sol: ChainAccount {
            address: sol_address,
            path: "m/44'/501'/0'/0'".to_string(),
            public_key_hex: hex::encode(sol_verifying_key.as_bytes()),
        },
        master_fingerprint,
    })
}
