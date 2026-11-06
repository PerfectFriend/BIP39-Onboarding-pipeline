//! Server-Side Login Verifier for Web Frameworks (Axum, Actix-web, Rocket)

use serde::{Deserialize, Serialize};
use crate::signer::{AuthChallenge, verify_eip191_signature};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyLoginRequest {
    pub challenge: AuthChallenge,
    pub signature: String,
    pub expected_address: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyLoginResult {
    pub authenticated: bool,
    pub user_id: Option<String>,
    pub error: Option<String>,
}

/// Verifies a sovereign login request
pub fn verify_bip39_login(req: &VerifyLoginRequest, max_age_secs: u64) -> VerifyLoginResult {
    // 1. Check challenge expiration
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    if now > req.challenge.timestamp + max_age_secs {
        return VerifyLoginResult {
            authenticated: false,
            user_id: None,
            error: Some("Challenge has expired".to_string()),
        };
    }

    // 2. Format challenge message and verify signature
    let message = req.challenge.format_message();
    let is_valid = verify_eip191_signature(&message, &req.signature, &req.expected_address);

    if is_valid {
        VerifyLoginResult {
            authenticated: true,
            user_id: Some(req.expected_address.clone()),
            error: None,
        }
    } else {
        VerifyLoginResult {
            authenticated: false,
            user_id: None,
            error: Some("Cryptographic signature verification failed".to_string()),
        }
    }
}
