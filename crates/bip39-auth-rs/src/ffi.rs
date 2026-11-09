//! C-ABI Foreign Function Interface (FFI) for Android NDK (JNI), iOS (Swift), and C++
//!
//! Provides memory-safe C exports for:
//! - Mnemonic generation & account derivation
//! - ERC-4337 smart account counterfactual computation
//! - ERC-5564 stealth payment generation and key recovery
//! - AML address screening

use std::ffi::{CStr, CString};
use std::os::raw::{c_char, c_int, c_ulonglong};
use crate::mnemonic::{generate_mnemonic_phrase, WordCount};
use crate::key_derivation::derive_multichain_keys;
use crate::erc4337;
use crate::stealth;
use crate::aml;

/// Generates a BIP-39 mnemonic string across C ABI
///
/// # Safety
/// The returned pointer must be freed using `bip39_free_string`.
#[no_mangle]
pub unsafe extern "C" fn bip39_generate_mnemonic(word_count: c_int) -> *mut c_char {
    let count = match word_count {
        24 => WordCount::Words24,
        _ => WordCount::Words12,
    };

    match generate_mnemonic_phrase(count) {
        Ok(m) => CString::new(m).unwrap().into_raw(),
        Err(_) => std::ptr::null_mut(),
    }
}

/// Derives multi-chain accounts JSON from mnemonic words
///
/// # Safety
/// The returned pointer must be freed using `bip39_free_string`.
#[no_mangle]
pub unsafe extern "C" fn bip39_derive_accounts_json(mnemonic_c_str: *const c_char) -> *mut c_char {
    if mnemonic_c_str.is_null() {
        return std::ptr::null_mut();
    }

    let c_str = CStr::from_ptr(mnemonic_c_str);
    let words = match c_str.to_str() {
        Ok(s) => s,
        Err(_) => return std::ptr::null_mut(),
    };

    let m = match bip39::Mnemonic::parse_normalized(words) {
        Ok(m) => m,
        Err(_) => return std::ptr::null_mut(),
    };

    let seed = m.to_seed("");
    match derive_multichain_keys(&seed) {
        Ok(accounts) => match serde_json::to_string(&accounts) {
            Ok(json) => CString::new(json).unwrap().into_raw(),
            Err(_) => std::ptr::null_mut(),
        },
        Err(_) => std::ptr::null_mut(),
    }
}

/// Compute ERC-4337 Smart Account JSON (C-ABI)
///
/// # Safety
/// The returned pointer must be freed using `bip39_free_string`.
#[no_mangle]
pub unsafe extern "C" fn bip39_compute_smart_account_c(
    owner_address_c: *const c_char,
    salt_hex_c: *const c_char,
) -> *mut c_char {
    if owner_address_c.is_null() {
        return std::ptr::null_mut();
    }

    let owner = match CStr::from_ptr(owner_address_c).to_str() {
        Ok(s) => s,
        Err(_) => return std::ptr::null_mut(),
    };

    let salt = if salt_hex_c.is_null() {
        None
    } else {
        CStr::from_ptr(salt_hex_c).to_str().ok()
    };

    match erc4337::compute_counterfactual_account(owner, salt) {
        Ok(info) => match serde_json::to_string(&info) {
            Ok(json) => CString::new(json).unwrap().into_raw(),
            Err(_) => std::ptr::null_mut(),
        },
        Err(_) => std::ptr::null_mut(),
    }
}

/// Generate ERC-5564 stealth payment address and announcement JSON (C-ABI)
///
/// # Safety
/// The returned pointer must be freed using `bip39_free_string`.
#[no_mangle]
pub unsafe extern "C" fn bip39_generate_stealth_address_c(
    spending_pubkey_c: *const c_char,
    viewing_pubkey_c: *const c_char,
) -> *mut c_char {
    if spending_pubkey_c.is_null() || viewing_pubkey_c.is_null() {
        return std::ptr::null_mut();
    }

    let spend = match CStr::from_ptr(spending_pubkey_c).to_str() {
        Ok(s) => s,
        Err(_) => return std::ptr::null_mut(),
    };
    let view = match CStr::from_ptr(viewing_pubkey_c).to_str() {
        Ok(s) => s,
        Err(_) => return std::ptr::null_mut(),
    };

    match stealth::generate_stealth_address(spend, view) {
        Ok(payment) => match serde_json::to_string(&payment) {
            Ok(json) => CString::new(json).unwrap().into_raw(),
            Err(_) => std::ptr::null_mut(),
        },
        Err(_) => std::ptr::null_mut(),
    }
}

/// Scan announcement and recover stealth private key JSON (C-ABI)
///
/// # Safety
/// The returned pointer must be freed using `bip39_free_string`.
#[no_mangle]
pub unsafe extern "C" fn bip39_scan_and_recover_stealth_key_c(
    ephemeral_pubkey_c: *const c_char,
    viewing_privkey_c: *const c_char,
    spending_privkey_c: *const c_char,
    expected_stealth_addr_c: *const c_char,
) -> *mut c_char {
    if ephemeral_pubkey_c.is_null() || viewing_privkey_c.is_null() || spending_privkey_c.is_null() || expected_stealth_addr_c.is_null() {
        return std::ptr::null_mut();
    }

    let ephemeral = match CStr::from_ptr(ephemeral_pubkey_c).to_str() { Ok(s) => s, Err(_) => return std::ptr::null_mut() };
    let view = match CStr::from_ptr(viewing_privkey_c).to_str() { Ok(s) => s, Err(_) => return std::ptr::null_mut() };
    let spend = match CStr::from_ptr(spending_privkey_c).to_str() { Ok(s) => s, Err(_) => return std::ptr::null_mut() };
    let expected = match CStr::from_ptr(expected_stealth_addr_c).to_str() { Ok(s) => s, Err(_) => return std::ptr::null_mut() };

    match stealth::scan_and_recover_stealth_key(ephemeral, view, spend, expected) {
        Ok(result) => match serde_json::to_string(&result) {
            Ok(json) => CString::new(json).unwrap().into_raw(),
            Err(_) => std::ptr::null_mut(),
        },
        Err(_) => std::ptr::null_mut(),
    }
}

/// Screen address for AML risk and sanctions (C-ABI)
///
/// # Safety
/// The returned pointer must be freed using `bip39_free_string`.
#[no_mangle]
pub unsafe extern "C" fn bip39_screen_address_aml_c(address_c: *const c_char) -> *mut c_char {
    if address_c.is_null() {
        return std::ptr::null_mut();
    }

    let addr = match CStr::from_ptr(address_c).to_str() {
        Ok(s) => s,
        Err(_) => return std::ptr::null_mut(),
    };

    let score = aml::screen_address_aml(addr);
    match serde_json::to_string(&score) {
        Ok(json) => CString::new(json).unwrap().into_raw(),
        Err(_) => std::ptr::null_mut(),
    }
}

/// Frees a C string allocated by this library
///
/// # Safety
/// The pointer must have been created by `CString::into_raw`.
#[no_mangle]
pub unsafe extern "C" fn bip39_free_string(ptr: *mut c_char) {
    if !ptr.is_null() {
        drop(CString::from_raw(ptr));
    }
}
