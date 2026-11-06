/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Honest hardware-backed biometric authentication using WebAuthn / FIDO2 / Passkeys.
 * Interacts directly with Android BiometricPrompt (fingerprint/face), Apple TouchID/FaceID,
 * and Windows Hello hardware TPM chips.
 */

// Unique challenge buffer generator
function createChallenge(): Uint8Array {
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  return challenge;
}

// Convert ArrayBuffer to Base64URL string
function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Convert Base64URL to Uint8Array
function base64urlToBuffer(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
  const raw = atob(padded);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    bytes[i] = raw.charCodeAt(i);
  }
  return bytes;
}

const STORAGE_CREDENTIAL_ID_KEY = 'bip39_webauthn_credential_id';

/**
 * Checks if hardware-backed biometric authenticator (Fingerprint / Face Unlock / Touch ID) is available
 */
export async function isPlatformBiometricsAvailable(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return false;
  }
  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch {
    return false;
  }
}

/**
 * Registers local hardware biometrics (Fingerprint / Face)
 */
export async function enrollHardwareBiometrics(username: string = 'BIP39 Vault User'): Promise<{ success: boolean; credentialId?: string; error?: string }> {
  if (!window.PublicKeyCredential) {
    return { success: false, error: 'WebAuthn не поддерживается в этом браузере' };
  }

  const userId = new Uint8Array(16);
  crypto.getRandomValues(userId);

  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge: createChallenge() as unknown as BufferSource,
    rp: {
      name: 'BIP-39 Vault Enclave',
      id: window.location.hostname || undefined,
    },
    user: {
      id: userId as unknown as BufferSource,
      name: username,
      displayName: username,
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' }, // ES256 (ECDSA P-256)
      { alg: -257, type: 'public-key' }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform', // Hardware device: TouchID, FaceID, Android Biometrics
      userVerification: 'required', // Mandatory biometric match
      requireResidentKey: false,
    },
    timeout: 60000,
    attestation: 'none',
  };

  try {
    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential | null;

    if (!credential) {
      return { success: false, error: 'Биометрическая регистрация отклонена' };
    }

    const credIdBase64 = bufferToBase64url(credential.rawId);
    localStorage.setItem(STORAGE_CREDENTIAL_ID_KEY, credIdBase64);

    return {
      success: true,
      credentialId: credIdBase64,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Ошибка инициализации аппаратной биометрии',
    };
  }
}

/**
 * Verifies hardware biometrics (Calls Android BiometricPrompt / Touch ID / Windows Hello)
 */
export async function verifyHardwareBiometrics(): Promise<{ success: boolean; error?: string; isSimulatedFallback?: boolean }> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return { success: false, error: 'WebAuthn не поддерживается в среде выполнения' };
  }

  const storedCredId = localStorage.getItem(STORAGE_CREDENTIAL_ID_KEY);

  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
    challenge: createChallenge() as unknown as BufferSource,
    timeout: 60000,
    userVerification: 'required', // Demands real Face / Fingerprint scan
    rpId: window.location.hostname || undefined,
    allowCredentials: storedCredId
      ? [
          {
            id: base64urlToBuffer(storedCredId) as unknown as BufferSource,
            type: 'public-key',
            transports: ['internal'],
          },
        ]
      : undefined,
  };

  try {
    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    });

    if (assertion) {
      return { success: true };
    }
    return { success: false, error: 'Биометрия не подтверждена' };
  } catch (err: any) {
    // If user cancelled, or credentials not found, return explicit error
    if (err.name === 'NotAllowedError') {
      return { success: false, error: 'Пользователь отменил биометрическое сканирование или тайм-аут истек.' };
    }
    return {
      success: false,
      error: err?.message || 'Ошибка биометрического сканера устройства',
    };
  }
}
