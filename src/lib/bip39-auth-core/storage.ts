/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  encryptAndSaveVault,
  unlockVault,
  wipeAllVaultData,
  hasSavedVault,
  getVaultMetadata
} from '../../services/cryptoStorage';

export function clearVaultSession(): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }
}

export {
  encryptAndSaveVault,
  unlockVault,
  wipeAllVaultData,
  hasSavedVault,
  getVaultMetadata
};
