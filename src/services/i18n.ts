/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIP39-ABOARD-SDK - Internationalization (i18n) Engine
 * Supported Languages: English (Default), Russian, Spanish.
 */

export type AppLanguage = 'en' | 'ru' | 'es';

export interface Translations {
  appName: string;
  tagline: string;
  welcomeAboard: string;
  topics: {
    splash: string;
    onboarding: string;
    wallet: string;
    themes: string;
    intel: string;
    security: string;
    android: string;
    rust: string;
    sdk: string;
    docs: string;
  };
  banners: {
    heroTitle: string;
    heroSubtitle: string;
    styleTag: string;
    viewInFull: string;
  };
  configurator: {
    title: string;
    subtitle: string;
    selectTheme: string;
    exportCode: string;
    copied: string;
    wordCountLabel: string;
    panicPinLabel: string;
    cloudE2EELabel: string;
    languageLabel: string;
    presetPreview: string;
  };
  duress: {
    title: string;
    description: string;
    panicWipe: string;
  };
}

export const I18N_DICTIONARY: Record<AppLanguage, Translations> = {
  en: {
    appName: 'BIP39-ABOARD-SDK',
    tagline: 'Sovereign Zero-Knowledge Onboarding & Cloud E2EE Engine',
    welcomeAboard: 'Welcome Aboard!',
    topics: {
      splash: 'Splash',
      onboarding: 'Onboarding',
      wallet: 'Vault',
      themes: '20 Themes 🎨',
      intel: 'AML & Web3 🔍',
      security: 'Security',
      android: 'Android',
      rust: 'Rust 🦀',
      sdk: 'SDK & AI',
      docs: 'Audit & Docs'
    },
    banners: {
      heroTitle: 'Decentralized Sovereign Sanctum',
      heroSubtitle: 'Cyberpunk + Antoni Gaudí + Vincent van Gogh Masterwork',
      styleTag: 'Impasto Stars · Organic Arches · Matrix Rain',
      viewInFull: 'View Art'
    },
    configurator: {
      title: 'SDK Theme & Setup Studio',
      subtitle: 'Pick from 20 visual palettes, configure E2EE cloud storage, and export drop-in code in 1 click.',
      selectTheme: 'Select Theme Palette (20 presets):',
      exportCode: 'Copy Integration Snippet',
      copied: 'Copied to Clipboard!',
      wordCountLabel: 'Mnemonic Words:',
      panicPinLabel: 'Duress Panic PIN Protection:',
      cloudE2EELabel: 'Cloud Storage E2EE (AWS / Firebase / Supabase):',
      languageLabel: 'Default SDK Language:',
      presetPreview: 'Live Interactive Theme Preview'
    },
    duress: {
      title: 'Duress Panic Defense',
      description: 'Physical $5 wrench attack mitigation: entering panic PIN wipes keys and physical RAM in 10ms.',
      panicWipe: 'Emergency Wipe Active'
    }
  },
  ru: {
    appName: 'BIP39-ABOARD-SDK',
    tagline: 'Суверенный онбординг и сквозное E2EE шифрование облачных данных',
    welcomeAboard: 'Добро пожаловать на борт!',
    topics: {
      splash: 'Заставка',
      onboarding: 'Онбординг',
      wallet: 'Хранилище',
      themes: '20 Тем 🎨',
      intel: 'AML & Кошельки 🔍',
      security: 'Безопасность',
      android: 'Android',
      rust: 'Rust 🦀',
      sdk: 'SDK & AI',
      docs: 'Аудит & Доки'
    },
    banners: {
      heroTitle: 'Децентрализованное Крипто-Святилище',
      heroSubtitle: 'Шедевр в стиле Киберпанк + Антони Гауди + Винсент Ван Гог',
      styleTag: 'Звездный импасто · Органические своды · Код Матрицы',
      viewInFull: 'Открыть Арт'
    },
    configurator: {
      title: 'Студия настройки и 20 тем SDK',
      subtitle: 'Выберите из 20 палитр оформления, настройте облачное шифрование и скопируйте готовый код в 1 клик.',
      selectTheme: 'Выберите палитру оформления (20 пресетов):',
      exportCode: 'Скопировать готовый код',
      copied: 'Код скопирован!',
      wordCountLabel: 'Количество слов мнемоники:',
      panicPinLabel: 'Панический PIN ($5 Wrench Attack):',
      cloudE2EELabel: 'Сквозное шифрование облака (S3 / Firebase / Supabase):',
      languageLabel: 'Язык интерфейса SDK:',
      presetPreview: 'Интерактивный предпросмотр темы'
    },
    duress: {
      title: 'Защита от принуждения (Duress Mode)',
      description: 'Защита от силового вымогательства: ввод панического PIN за 10 мс физически уничтожает все ключи.',
      panicWipe: 'Аварийное уничтожение активировано'
    }
  },
  es: {
    appName: 'BIP39-ABOARD-SDK',
    tagline: 'Motor de incorporación soberana y cifrado E2EE en la nube',
    welcomeAboard: '¡Bienvenido a bordo!',
    topics: {
      splash: 'Inicio',
      onboarding: 'Incorporación',
      wallet: 'Bóveda',
      themes: '20 Temas 🎨',
      intel: 'AML & Billeteras 🔍',
      security: 'Seguridad',
      android: 'Android',
      rust: 'Rust 🦀',
      sdk: 'SDK & IA',
      docs: 'Auditoría & Docs'
    },
    banners: {
      heroTitle: 'Santuario Criptográfico Soberano',
      heroSubtitle: 'Obra maestra de Cyberpunk + Antoni Gaudí + Vincent van Gogh',
      styleTag: 'Estrellas Impasto · Arcos Orgánicos · Lluvia Matrix',
      viewInFull: 'Ver Arte'
    },
    configurator: {
      title: 'Estudio de Configuración y 20 Temas SDK',
      subtitle: 'Elija entre 20 paletas visuales, configure cifrado en la nube y copie código listo en 1 clic.',
      selectTheme: 'Seleccione paleta de diseño (20 temas):',
      exportCode: 'Copiar código de integración',
      copied: '¡Copiado al portapapeles!',
      wordCountLabel: 'Palabras de la mnemotécnica:',
      panicPinLabel: 'PIN de pánico ante coacción:',
      cloudE2EELabel: 'Cifrado E2EE en la nube (AWS / Firebase / Supabase):',
      languageLabel: 'Idioma por defecto del SDK:',
      presetPreview: 'Vista previa interactiva del tema'
    },
    duress: {
      title: 'Defensa ante coacción física',
      description: 'Mitigación de ataque de llave inglesa: el PIN de pánico borra claves y memoria RAM en 10ms.',
      panicWipe: 'Borrado de emergencia activo'
    }
  }
};
