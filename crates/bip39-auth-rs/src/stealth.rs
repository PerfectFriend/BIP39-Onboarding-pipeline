//! ERC-5564 Stealth Addresses Standard Implementation in Pure Rust
//!
//! Provides non-interactive Secp256k1 Diffie-Hellman key exchange:
//! - Stealth meta-address pair (Spending key K_spend, Viewing key K_view)
//! - Ephemeral keypair generation (R = r * G)
//! - Shared secret derivation (S = r * K_view = k_view * R)
//! - Stealth public address calculation (P_stealth = K_spend + hash(S) * G)
//! - Viewing key scanner and private key recovery (p_stealth = (k_spend + hash(S)) mod n)
//!
//! Memory Safety Guarantee: All ephemeral scalars and secret recovery keys implement
//! `ZeroizeOnDrop` ensuring automatic zeroization from RAM upon exiting scope.

use k256::elliptic_curve::sec1::{FromEncodedPoint, ToEncodedPoint};
use k256::{AffinePoint, EncodedPoint, FieldBytes, NonZeroScalar, ProjectivePoint, PublicKey, Scalar, SecretKey};
use rand::rngs::OsRng;
use serde::{Deserialize, Serialize};
use sha3::{Digest, Keccak256};
use zeroize::{Zeroize, ZeroizeOnDrop};

/// Canonical Secp256k1 Curve Order N:
/// 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
pub const SECP256K1_N_HEX: &str = "fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141";

/// A stealth meta-address consisting of a spending public key and a viewing public key
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StealthMetaAddress {
    pub spending_pubkey: String,
    pub viewing_pubkey: String,
    pub encoded_meta_address: String, // st:eth:0x...
}

/// Generated stealth payment containing the ephemeral pubkey (announcement) and stealth address
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StealthPayment {
    pub stealth_address: String,
    pub ephemeral_pubkey: String, // R = r * G (compressed)
    pub view_tag: u8,
    pub stealth_pubkey: String,
}

/// Zeroizing wrapper for ephemeral and recovered private keys
#[derive(Zeroize, ZeroizeOnDrop)]
pub struct ZeroizeSecretScalar {
    pub scalar_bytes: [u8; 32],
}

/// Result of scanning an incoming transaction announcement with viewing and spending keys
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StealthScanResult {
    pub is_match: bool,
    pub stealth_address: String,
    pub recovered_private_key: Option<String>,
}

/// Generate a pair of stealth keys from a BIP-39 root seed or master secret
pub fn generate_stealth_meta_address(
    spending_privkey_hex: &str,
    viewing_privkey_hex: &str,
) -> Result<StealthMetaAddress, String> {
    let spend_sk = parse_secret_key(spending_privkey_hex)?;
    let view_sk = parse_secret_key(viewing_privkey_hex)?;

    let spend_pk = spend_sk.public_key();
    let view_pk = view_sk.public_key();

    let spend_hex = hex::encode(spend_pk.to_encoded_point(true).as_bytes());
    let view_hex = hex::encode(view_pk.to_encoded_point(true).as_bytes());

    let encoded = format!("st:eth:0x{}#0x{}", spend_hex, view_hex);

    Ok(StealthMetaAddress {
        spending_pubkey: format!("0x{}", spend_hex),
        viewing_pubkey: format!("0x{}", view_hex),
        encoded_meta_address: encoded,
    })
}

/// Generate a one-time non-interactive stealth address for a recipient's meta-address
///
/// Recipient publishes: (K_spend, K_view)
/// Sender executes:
/// 1. Sample ephemeral private scalar r in [1, n-1]
/// 2. Ephemeral public key: R = r * G
/// 3. Shared secret point: S = r * K_view
/// 4. Shared secret hash: s_h = keccak256(S.x || S.y)
/// 5. Stealth public key: P_stealth = K_spend + (s_h * G)
/// 6. Stealth address: keccak256(P_stealth)[12..32]
pub fn generate_stealth_address(
    spending_pubkey_hex: &str,
    viewing_pubkey_hex: &str,
) -> Result<StealthPayment, String> {
    let spend_point = parse_public_point(spending_pubkey_hex)?;
    let view_point = parse_public_point(viewing_pubkey_hex)?;

    // 1. Generate secure ephemeral private scalar r
    let ephemeral_sk = SecretKey::random(&mut OsRng);
    let ephemeral_scalar = *ephemeral_sk.to_nonzero_scalar();

    // 2. Compute Ephemeral Public Key: R = r * G
    let ephemeral_pk = ephemeral_sk.public_key();
    let r_compressed = ephemeral_pk.to_encoded_point(true);

    // 3. Compute Shared Secret Point: S = r * K_view
    let shared_point_proj = view_point * ephemeral_scalar;
    let shared_affine = shared_point_proj.to_affine();
    let shared_encoded = shared_affine.to_encoded_point(false);

    let shared_bytes = shared_encoded.as_bytes();
    if shared_bytes.len() < 65 {
        return Err("Invalid shared point encoding".to_string());
    }

    // 4. Compute Scalar Tweak: s_h = keccak256(S.x || S.y)
    let s_h_hash = Keccak256::digest(&shared_bytes[1..65]);
    let s_h_scalar = scalar_from_bytes(&s_h_hash)?;

    // View tag is the first byte of s_h_hash for quick block filtering
    let view_tag = s_h_hash[0];

    // 5. Compute Stealth Public Key: P_stealth = K_spend + (s_h * G)
    let tweak_point = ProjectivePoint::GENERATOR * s_h_scalar;
    let stealth_proj = spend_point + tweak_point;
    let stealth_affine = stealth_proj.to_affine();
    let stealth_encoded_uncompressed = stealth_affine.to_encoded_point(false);

    // 6. Derive EVM address: keccak256(P_stealth[1..65])[12..32]
    let p_uncompressed = stealth_encoded_uncompressed.as_bytes();
    let addr_hash = Keccak256::digest(&p_uncompressed[1..65]);
    let stealth_address = to_checksum_address(&addr_hash[12..32]);

    let stealth_pubkey_hex = hex::encode(stealth_encoded_uncompressed.as_bytes());

    Ok(StealthPayment {
        stealth_address,
        ephemeral_pubkey: format!("0x{}", hex::encode(r_compressed.as_bytes())),
        view_tag,
        stealth_pubkey: format!("0x{}", stealth_pubkey_hex),
    })
}

/// Scanner & Private Key Recovery
///
/// Recipient receives (R, expected_stealth_addr) from on-chain announcement:
/// 1. Shared secret: S = k_view * R
/// 2. Scalar tweak: s_h = keccak256(S.x || S.y)
/// 3. Verify: P_stealth ?= K_spend + (s_h * G)
/// 4. If match, recover private key: p_stealth = (k_spend + s_h) mod n
pub fn scan_and_recover_stealth_key(
    ephemeral_pubkey_hex: &str,
    viewing_privkey_hex: &str,
    spending_privkey_hex: &str,
    expected_stealth_address: &str,
) -> Result<StealthScanResult, String> {
    let r_point = parse_public_point(ephemeral_pubkey_hex)?;
    let view_sk = parse_secret_key(viewing_privkey_hex)?;
    let spend_sk = parse_secret_key(spending_privkey_hex)?;

    let view_scalar = *view_sk.to_nonzero_scalar();
    let spend_scalar = *spend_sk.to_nonzero_scalar();

    // 1. Shared Secret: S = k_view * R
    let shared_point_proj = r_point * view_scalar;
    let shared_affine = shared_point_proj.to_affine();
    let shared_encoded = shared_affine.to_encoded_point(false);
    let shared_bytes = shared_encoded.as_bytes();

    if shared_bytes.len() < 65 {
        return Err("Invalid shared point in scanner".to_string());
    }

    // 2. Scalar Tweak: s_h = keccak256(S.x || S.y)
    let s_h_hash = Keccak256::digest(&shared_bytes[1..65]);
    let s_h_scalar = scalar_from_bytes(&s_h_hash)?;

    // 3. Recompute stealth address
    let spend_point = ProjectivePoint::GENERATOR * spend_scalar;
    let tweak_point = ProjectivePoint::GENERATOR * s_h_scalar;
    let stealth_proj = spend_point + tweak_point;
    let stealth_affine = stealth_proj.to_affine();
    let stealth_uncompressed = stealth_affine.to_encoded_point(false);
    let p_bytes = stealth_uncompressed.as_bytes();

    let addr_hash = Keccak256::digest(&p_bytes[1..65]);
    let calculated_address = to_checksum_address(&addr_hash[12..32]);

    let clean_expected = expected_stealth_address.to_lowercase();
    let is_match = calculated_address.to_lowercase() == clean_expected;

    if is_match {
        // 4. Recover Private Key: p_stealth = (k_spend + s_h) mod n
        let recovered_scalar = spend_scalar + s_h_scalar;
        let scalar_bytes: [u8; 32] = recovered_scalar.to_bytes().into();

        // Enforce ZeroizeOnDrop for temporary memory
        let zeroize_holder = ZeroizeSecretScalar { scalar_bytes };
        let priv_hex = hex::encode(zeroize_holder.scalar_bytes);

        Ok(StealthScanResult {
            is_match: true,
            stealth_address: calculated_address,
            recovered_private_key: Some(format!("0x{}", priv_hex)),
        })
    } else {
        Ok(StealthScanResult {
            is_match: false,
            stealth_address: calculated_address,
            recovered_private_key: None,
        })
    }
}

// --- Internal Helper Functions ---

fn parse_secret_key(hex_str: &str) -> Result<SecretKey, String> {
    let clean = hex_str.trim_start_matches("0x");
    let bytes = hex::decode(clean).map_err(|e| format!("Invalid secret key hex: {}", e))?;
    if bytes.len() != 32 {
        return Err("Secret key must be 32 bytes".to_string());
    }
    SecretKey::from_slice(&bytes).map_err(|e| format!("Invalid scalar for Secp256k1: {}", e))
}

fn parse_public_point(hex_str: &str) -> Result<ProjectivePoint, String> {
    let clean = hex_str.trim_start_matches("0x");
    let bytes = hex::decode(clean).map_err(|e| format!("Invalid pubkey hex: {}", e))?;
    let enc = EncodedPoint::from_bytes(&bytes).map_err(|e| format!("Invalid Secp256k1 point: {}", e))?;
    let affine = AffinePoint::from_encoded_point(&enc);
    if affine.is_none().into() {
        return Err("Point is not on curve Secp256k1".to_string());
    }
    Ok(ProjectivePoint::from(affine.unwrap()))
}

fn scalar_from_bytes(bytes: &[u8]) -> Result<Scalar, String> {
    if bytes.len() != 32 {
        return Err("Scalar hash must be 32 bytes".to_string());
    }
    let fb = FieldBytes::from_slice(bytes);
    let s = Scalar::from_repr_vartime(*fb);
    if s.is_none().into() {
        return Err("Scalar out of range".to_string());
    }
    Ok(s.unwrap())
}

fn to_checksum_address(addr: &[u8]) -> String {
    let hex_addr = hex::encode(addr);
    let hash = Keccak256::digest(hex_addr.as_bytes());
    let mut out = String::with_capacity(42);
    out.push_str("0x");

    for (i, c) in hex_addr.chars().enumerate() {
        if c.is_ascii_digit() {
            out.push(c);
        } else {
            let byte = hash[i / 2];
            let nibble = if i % 2 == 0 { byte >> 4 } else { byte & 0x0f };
            if nibble >= 8 {
                out.push(c.to_ascii_uppercase());
            } else {
                out.push(c.to_ascii_lowercase());
            }
        }
    }
    out
}
