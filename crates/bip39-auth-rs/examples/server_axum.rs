//! Axum Web Service Example using bip39-auth-core
//! Run with: cargo run --example server_axum

use axum::{
    extract::Json,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use bip39_auth_core::verifier::{verify_bip39_login, VerifyLoginRequest};
use rand::Rng;
use serde::Serialize;
use std::net::SocketAddr;

#[derive(Serialize)]
struct ChallengeResponse {
    nonce: String,
    timestamp: u64,
    domain: String,
    statement: String,
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/api/auth/challenge", get(get_challenge))
        .route("/api/auth/verify", post(verify_login));

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    println!("🦀 Rust BIP-39 Auth Server running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

/// GET /api/auth/challenge
async fn get_challenge() -> impl IntoResponse {
    let mut rng = rand::thread_rng();
    let mut nonce_bytes = [0u8; 16];
    rng.fill(&mut nonce_bytes[..]);

    let response = ChallengeResponse {
        nonce: hex::encode(nonce_bytes),
        timestamp: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs(),
        domain: "auth.sovereign.local".to_string(),
        statement: "Sign in with Sovereign BIP-39 Vault".to_string(),
    };

    Json(response)
}

/// POST /api/auth/verify
async fn verify_login(Json(payload): Json<VerifyLoginRequest>) -> impl IntoResponse {
    // 5 minutes max expiration
    let result = verify_bip39_login(&payload, 300);

    if result.authenticated {
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "status": "success",
                "user_id": result.user_id,
                "message": "Sovereign cryptographic authentication successful"
            })),
        )
    } else {
        (
            StatusCode::UNAUTHORIZED,
            Json(serde_json::json!({
                "status": "error",
                "error": result.error.unwrap_or_else(|| "Authentication failed".to_string())
            })),
        )
    }
}
