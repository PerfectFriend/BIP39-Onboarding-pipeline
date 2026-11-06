//! C-ABI Foreign Function Interface (FFI) for Android NDK (JNI) and iOS (Swift)

use std::ffi::{CStr, CString};
use std::os::raw::{c_char, c_int};
use crate::mnemonic::{generate_mnemonic_phrase, WordCount};
use crate::key_derivation::derive_multichain_keys;

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
