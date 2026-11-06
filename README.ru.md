# BIP39-ABOARD-SDK: Документация (Русский) 🛡️✨

> **Суверенная система онбординга и сквозного шифрования облачных данных для любого приложения.**  
> Полная замена авторизации по номеру телефона (SMS) и Email/паролю на криптографические ключи BIP-39.

<p align="center">
  <img src="./src/assets/images/bip39_aboard_hero_1794005512735.jpg" alt="BIP39-ABOARD-SDK Hero Banner" width="100%" />
</p>

---

## 🚀 Почему это выгодно вашему приложению?

1. **Экономия бюджета:** 0 рублей расходов на SMS-провайдеров (Twilio, SMS.RU) и спам-фильтры почты.
2. **Абсолютная безопасность:** Защита от SIM-Swap атак (угон симки через оператора связи).
3. **Отсутствие паролей:** Сервер проверяет подпись вызова (EIP-191 Secp256k1). В базе данных нет паролей, которые можно украсть.
4. **Облачное E2EE-шифрование:** Детерминированная деривация 256-битных AES-ключей через HKDF-SHA256 для Amazon S3, Firebase, Supabase, Google Drive. В облако уходит только зашифрованный блоб.
5. **Защита от пыток и принуждения ($5 Wrench Attack):** Панический PIN стирает сессию и физическую память за 10 мс.
6. **Высокая скорость:** Rust/WASM ядро работает в 15 раз быстрее чистого JS и физически затирает память нулями (`ZeroizeOnDrop`).

---

## 📦 Быстрый старт в React / Vite / Next.js

```bash
npm install @bip39-auth/core
```

```tsx
import { BIP39AuthProvider, useBIP39Auth } from '@bip39-auth/core';

export function Root() {
  return (
    <BIP39AuthProvider
      config={{
        appName: 'SovereignApp',
        defaultWordCount: 12, // 12 или 24 слова
        allowPanicPin: true,  // Панический PIN для сброса
        allowPdfExport: true  // Экспорт PDF-паспорта с QR-кодом
      }}
      onDuressWipe={() => alert('Данные уничтожены!')}
    >
      <App />
    </BIP39AuthProvider>
  );
}
```

---

## ☁️ Сквозное E2EE шифрование облачных хранилищ

```typescript
import { mnemonicToSeedHex, deriveCloudStorageKey, encryptForCloud, decryptFromCloudAsText } from '@bip39-auth/core';
import { hex } from '@scure/base';

// 1. Получаем мастер-сид
const seedBytes = hex.decode(await mnemonicToSeedHex(mnemonic));

// 2. Генерируем 256-битный ключ AES для облака
const cloudKey = deriveCloudStorageKey(seedBytes, 'aws_s3_vault_v1');

// 3. Шифруем чувствительные данные перед отправкой в S3 / Firebase / Supabase
const encrypted = await encryptForCloud(JSON.stringify(userProfile), cloudKey, 'aws_s3_vault_v1');

// 4. Отправляем в облако (провайдер видит только случайный шум):
await api.upload({ ciphertext: encrypted.ciphertextBase64, iv: encrypted.ivBase64 });

// 5. Расшифровка на любом авторизованном устройстве:
const profile = JSON.parse(await decryptFromCloudAsText(encrypted, cloudKey));
```

---

## 🎨 20 Дизайнерских Тем
В SDK встроен конфигуратор с 20 темами: Киберпанк, Ван Гог, Гауди, Матрица, Неон, Нео-Токио, Обсидиан и др.
Экспортируйте тему в 1 клик через встроенную студию тем.
