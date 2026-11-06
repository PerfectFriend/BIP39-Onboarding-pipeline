/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  isPlatformBiometricsAvailable,
  verifyHardwareBiometrics,
  enrollHardwareBiometrics
} from '../../services/webAuthnBiometrics';

export function clearBiometricCredentials(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('bip39_webauthn_credential_id');
  }
}

export {
  isPlatformBiometricsAvailable,
  verifyHardwareBiometrics,
  enrollHardwareBiometrics
};
