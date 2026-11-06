# Полное руководство разработчика: Интеграция @bip39-auth/core
## Безопасный некастодиальный онбординг пользователей без номера телефона и Email

> **Библиотека:** `@bip39-auth/core` v1.0.0  
> **Стандарты:** BIP-39, BIP-44, SLIP-0010, WebCrypto AES-256-GCM, PBKDF2 (100 000 итераций), WebAuthn (Passkeys / FIDO2 / Android BiometricPrompt)  
> **Модель доверия:** Zero-Knowledge, 100% Client-Side, Non-Custodial, Duress-Resistant ($5 Wrench Attack Defense)

---

## 1. Зачем заменять Email и Телефон (SMS) на BIP-39?

Традиционная аутентификация через телефонные номера и Email страдает от критических архитектурных уязвимостей:
1. **Экономика (SMS-расходы):** Отправка OTP через Twilio или локальных SMS-шлюзов стоит $0.05–$0.15 за сообщение, создавая огромные счета и риск SMS-фрод атак (SMS toll fraud).
2. **Уязвимость к SIM-Swap:** Злоумышленник может перевыпустить SIM-карту через оператора связи и перехватить аккаунт жертвы.
3. **Утечки баз данных и GDPR:** Хранение персональных данных (телефоны, email) создает постоянную юридическую ответственность и риск утечки.
4. **Фишинг и перехват:** Пароли и коды подтверждения легко перехватываются фишинговыми прокси (Modlishka / Evilginx).

### Преимущества BIP-39 Self-Sovereign Identity:
- **Бесплатный онбординг:** 0 затрат на SMS-провайдеров и почтовые сервисы.
- **Полная анонимность:** Сервер не хранит ни телефонов, ни email, ни паролей.
- **Математическая стойкость:** 128 / 256 бит чистой энтропии против любых словарей перебора.
- **Аппаратная изоляция:** Ключи зашифрованы через WebCrypto AES-GCM или хранятся в защищенном чипе StrongBox / Titan M2 на Android.
- **Защита от силового принуждения ($5 Wrench Attack):** Панический PIN мгновенно и безвозвратно уничтожает все данные.

---

## 2. Архитектура библиотеки `@bip39-auth/core`

```
┌─────────────────────────────────────────────────────────────┐
│                    Браузер / Мобильный клиент                │
│                                                             │
│  1. Генерация мнемоники (CSPRNG 12/24 слов)                 │
│  2. Верификация записи (с авто-откатом и сменой слов)       │
│  3. Установка Master PIN + Панического PIN (Duress)         │
│  4. Экспорт Cold Storage PDF-паспорта с QR-кодом            │
│  5. Шифрование хранилища (WebCrypto AES-256-GCM + PBKDF2)   │
│  6. Привязка аппаратной биометрии (WebAuthn / Biometric)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
               EIP-191 Честный крипто-пруф (ECDSA)
               (Никакие приватные ключи не передаются!)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Сервер приложения (Backend)              │
│                                                             │
│  1. Генерация одноразового challenge (nonce + timestamp)    │
│  2. Проверка подписи: verifyBIP39Login(...)                 │
│  3. Восстановление публичного адреса (0x...) как User ID    │
│  4. Выпуск HTTP-only Secure Session Cookie / JWT            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Исправленный алгоритм верификации сид-фразы

Библиотека реализует строгий протокол защиты от невнимательности пользователя:
1. Система выбирает 3 случайных номера слов (например, #3, #7, #11) и для каждого предлагает 5 кнопок (1 верное слово + 4 дистрактора из канонического словаря BIP-39).
2. **В случае ошибки выбора слова:**
   - Интерфейс немедленно подсвечивает ошибочный выбор и выдает тактильный/визуальный отклик ошибки.
   - Пользователь **автоматически возвращается на шаг назад** к экрану чтения фразы (`StepMnemonicDisplay`).
   - На экране отображается баннер с предупреждением: *«Вы ошиблись при выборе слова. Внимательно перепроверьте запись»*.
3. **При повторной попытке:**
   - Алгоритм `generateVerificationChallenges(words, excludedIndices)` **гарантированно выбирает другие по порядку слова** (например, #1, #5, #9) и генерирует **совершенно новый набор случайных вариантов-дистракторов**.
   - Это исключает возможность угадывания методом перебора.

---

## 4. Быстрый старт: Установка и Интеграция в React / Next.js

### 4.1 Установка зависимостей
```bash
npm install @scure/bip32 @scure/base @noble/curves @noble/hashes canvas-confetti jspdf qrcode
npm install -D @types/canvas-confetti
```

### 4.2 Подключение провайдера в `App.tsx` / `layout.tsx`
```tsx
import React from 'react';
import { BIP39AuthProvider } from './lib/bip39-auth-core';

export default function App() {
  return (
    <BIP39AuthProvider
      config={{
        appName: 'Sovereign Web3 Portal',
        defaultWordCount: 12, // 12 или 24 слова
        allowPanicPin: true,  // Панический PIN активен
        allowPdfExport: true  // Генерация PDF-паспорта
      }}
      onDuressWipe={() => {
        console.warn('Внимание: Активирован панический сброс данных!');
      }}
    >
      <MainAppContent />
    </BIP39AuthProvider>
  );
}
```

### 4.3 Использование хука `useBIP39Auth()`
```tsx
import React from 'react';
import { useBIP39Auth } from './lib/bip39-auth-core';

export function UserProfileHeader() {
  const {
    isAuthenticated,
    session,
    hasVault,
    openOnboarding,
    unlockWithPin,
    lockSession,
    logoutAndWipe
  } = useBIP39Auth();

  if (!isAuthenticated) {
    return (
      <div className="flex gap-2">
        <button onClick={openOnboarding} className="btn-primary">
          Создать суверенный аккаунт (BIP-39)
        </button>
        {hasVault && (
          <button onClick={() => unlockWithPin(prompt('Введите PIN') || '')}>
            Войти по PIN
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="user-badge">
      <span>ID: {session?.primaryAddress}</span>
      <button onClick={lockSession}>Заблокировать</button>
      <button onClick={logoutAndWipe} className="text-red-500">Удалить аккаунт</button>
    </div>
  );
}
```

---

## 5. Серверная проверка подлинности (Backend Login Verification)

Пользователь подтверждает владение аккаунтом без пароля путем подписания одноразового challenge.

### 5.1 Генерация Challenge на сервере (Express / Next.js API)
```ts
// GET /api/auth/challenge
import crypto from 'crypto';

export async function handleGetChallenge(req, res) {
  const nonce = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  
  // Сохраняем nonce во временную сессию/Redis с TTL 5 минут
  req.session.authNonce = nonce;
  req.session.nonceTimestamp = timestamp;

  res.json({
    nonce,
    timestamp,
    domain: req.headers.host,
    statement: 'Sign in to Sovereign Portal with BIP-39 Vault'
  });
}
```

### 5.2 Проверка подписи на сервере
```ts
// POST /api/auth/verify
import { verifyBIP39Login } from './lib/bip39-auth-core/server/verifier';

export async function handleVerifyLogin(req, res) {
  const { challenge, signature, expectedAddress } = req.body;

  // 1. Проверяем, что nonce совпадает с выданным
  if (challenge.nonce !== req.session.authNonce) {
    return res.status(400).json({ error: 'Недействительный или устаревший nonce' });
  }

  // 2. Проверяем криптографическую подпись EIP-191 Secp256k1
  const result = verifyBIP39Login({ challenge, signature, expectedAddress });

  if (result.authenticated && result.userId) {
    // Авторизация успешна! Устанавливаем HTTP-only Cookie
    req.session.userId = result.userId;
    req.session.authNonce = null; // инвалидируем одноразовый nonce
    return res.json({ success: true, userId: result.userId });
  }

  return res.status(401).json({ error: result.error || 'Неверная подпись' });
}
```

---

## 6. Android Native & Jetpack Compose Рекомендации

При портировании на нативный Android:
1. **Защита экрана от захвата и шпионского ПО:**
   В `MainActivity.kt` активируйте:
   ```kotlin
   window.setFlags(
       WindowManager.LayoutParams.FLAG_SECURE,
       WindowManager.LayoutParams.FLAG_SECURE
   )
   ```
2. **Аппаратный чип безопасности Android Keystore:**
   ```kotlin
   val masterKey = MasterKey.Builder(context)
       .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
       .setRequestStrongBoxBacked(true) // Использовать чип Titan M2 / StrongBox
       .build()
   ```
3. **Панический сброс (Duress Wipe):**
   При вводе панического кода:
   ```kotlin
   encryptedPrefs.edit().clear().commit()
   context.cacheDir.deleteRecursively()
   context.filesDir.deleteRecursively()
   activity.finishAffinity() // Закрыть все процессы без сохранения состояния
   ```

---

## 7. Модель угроз и протокол безопасности

| Вектор угрозы | Традиционный подход (Phone/Email) | Защита в @bip39-auth/core |
|---|---|---|
| **Утечка базы пользователей** | Хакеры получают все телефоны и пароли | В базе хранятся только публичные адреса (0x...) |
| **SIM-Swap атака** | Угон аккаунта через салон сотовой связи | Номер телефона не используется вообще |
| **Фишинг паролей** | Поддельный сайт крадет пароль | Подпись привязана к домену (`domain` в payload) |
| **Силовое принуждение** | Жертву заставляют ввести пароль/SMS | Ввод Панического PIN обнуляет ключи за 10 мс |
| **Шпионское ПО на устройстве** | Чтение экрана и кейлоггер | Blur-Shield на десктопе + FLAG_SECURE на Android |

---

## 8. Сквозное Zero-Knowledge шифрование в облачных хранилищах (AWS S3, Firebase, Supabase, Google Cloud, IPFS)

Одной из самых мощных возможностей `@bip39-auth/core` является использование мастер-сид фразы не только для идентификации профиля, но и для **детерминированной генерации симметричных ключей шифрования AES-256-GCM** для любых облачных хранилищ:

### Как это работает:
1. **Математическая изоляция (HKDF-SHA256):**
   Из мастер-сида через стандарт HKDF с уникальным `namespace` приложения (например, `s3_photos_v1` или `user_chat_history`) выводится 256-битный ключ AES-GCM.
2. **Локальное шифрование до отправки в сеть:**
   Файл или JSON-документ шифруется в памяти браузера/телефона через аппаратный WebCrypto SubtleCrypto / Rust Enclave.
3. **Хранение в облаке:**
   В базу данных или S3 бакет отправляется только шифротекст (`ciphertextBase64`) и вектор инициализации (`ivBase64`). Облачный провайдер не имеет ключа и физически не может прочитать данные пользователя (Zero-Knowledge).
4. **Бесшовное восстановление на любом устройстве:**
   Пользователь вводит свои 12 слов на новом устройстве -> ключ шифрования мгновенно регенерируется с точностью до бита -> файлы из облака мгновенно расшифровываются.

### Пример кода (готово к использованию прямо сейчас):

```typescript
import {
  mnemonicToSeedHex,
  deriveCloudStorageKey,
  encryptForCloud,
  decryptFromCloudAsText
} from '@bip39-auth/core';

// 1. Получаем мастер-сид из введённой мнемоники
const seedHex = await mnemonicToSeedHex(userMnemonic);
const seedBytes = new Uint8Array(Buffer.from(seedHex, 'hex'));

// 2. Детерминированно получаем ключ шифрования для облачного хранилища
const cloudKey = deriveCloudStorageKey(seedBytes, 'my_app_drive_v1');

// 3. Шифруем пользовательские данные перед отправкой в S3 / Firebase / Supabase
const sensitiveProfile = JSON.stringify({
  fullName: 'Алексей Смирнов',
  passportNumber: '4012 345678',
  privateNotes: 'Конфиденциальные заметки'
});

const encryptedPayload = await encryptForCloud(sensitiveProfile, cloudKey, 'my_app_drive_v1');

// 4. Отправляем в облако ТОЛЬКО зашифрованный блоб
await fetch('https://api.your-cloud-storage.com/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: '0x1A2b...7c', // Публичный адрес пользователя
    data: encryptedPayload.ciphertextBase64,
    iv: encryptedPayload.ivBase64
  })
});

// 5. Расшифровка на любом устройстве пользователя:
const decryptedText = await decryptFromCloudAsText(encryptedPayload, cloudKey);
console.log('Расшифровано локально:', JSON.parse(decryptedText));
```

