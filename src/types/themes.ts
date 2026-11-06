/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIP39-ABOARD-SDK - 20 Visual Theme Palettes
 * Cyberpunk + Antoni Gaudí + Vincent van Gogh Design System
 */

export interface SdkTheme {
  id: string;
  name: string;
  nameRu: string;
  nameEs: string;
  category: 'artistic' | 'cyberpunk' | 'dark' | 'neon';
  primary: string;      // Accent / CTA
  secondary: string;    // Secondary glow / highlight
  bgClass: string;      // Tailwind background style
  cardBgClass: string;  // Card background
  borderClass: string;  // Border color
  glowClass: string;    // Shadow glow
  textColor: string;    // Text accent
  previewGradient: string;
  description: string;
}

export const SDK_THEMES: SdkTheme[] = [
  {
    id: 'cyber-vangogh',
    name: 'Van Gogh Starry Cyber',
    nameRu: 'Ван Гог: Звездный Киберпанк',
    nameEs: 'Cíber Noche Estrellada Van Gogh',
    category: 'artistic',
    primary: '#FBBF24', // Sunflower Gold
    secondary: '#38BDF8', // Cobalt Sky
    bgClass: 'bg-[#060814]',
    cardBgClass: 'bg-[#0d1226]/90',
    borderClass: 'border-amber-500/30',
    glowClass: 'shadow-[0_0_25px_rgba(245,158,11,0.25)]',
    textColor: 'text-amber-300',
    previewGradient: 'from-blue-600 via-amber-400 to-emerald-500',
    description: 'Swirling cobalt starry skies, sunflower gold impasto, and cosmic cyberpunk nebulae.'
  },
  {
    id: 'gaudi-mosaic',
    name: 'Gaudí Trencadís Mosaic',
    nameRu: 'Гауди: Витражный Тренкадис',
    nameEs: 'Mosaico Trencadís Gaudí',
    category: 'artistic',
    primary: '#06B6D4', // Mediterranean Cyan
    secondary: '#F97316', // Terracotta Orange
    bgClass: 'bg-[#0a0c16]',
    cardBgClass: 'bg-[#12162a]/90',
    borderClass: 'border-cyan-500/30',
    glowClass: 'shadow-[0_0_25px_rgba(6,182,212,0.25)]',
    textColor: 'text-cyan-300',
    previewGradient: 'from-orange-500 via-cyan-400 to-purple-500',
    description: 'Parabolic architectural arches, organic curves, and illuminated ceramic stained glass.'
  },
  {
    id: 'matrix-emerald',
    name: 'Matrix Digital Rain',
    nameRu: 'Матрица: Зеленый Код',
    nameEs: 'Lluvia Digital Matrix',
    category: 'cyberpunk',
    primary: '#10B981', // Emerald Matrix Green
    secondary: '#00F0FF', // Cyan
    bgClass: 'bg-[#030906]',
    cardBgClass: 'bg-[#06170e]/90',
    borderClass: 'border-emerald-500/30',
    glowClass: 'shadow-[0_0_25px_rgba(16,185,129,0.3)]',
    textColor: 'text-emerald-400',
    previewGradient: 'from-emerald-600 via-green-400 to-teal-300',
    description: 'Cascading binary streams, phosphorescent HUD consoles, and obsidian terminal glass.'
  },
  {
    id: 'neo-tokyo-cyan',
    name: 'Neo-Tokyo Neon Cyan',
    nameRu: 'Нео-Токио: Кибернетический Неон',
    nameEs: 'Neo-Tokio Neón Cían',
    category: 'neon',
    primary: '#00F0FF',
    secondary: '#EC4899',
    bgClass: 'bg-[#090717]',
    cardBgClass: 'bg-[#140e2d]/90',
    borderClass: 'border-cyan-400/40',
    glowClass: 'shadow-[0_0_25px_rgba(0,240,255,0.3)]',
    textColor: 'text-cyan-300',
    previewGradient: 'from-cyan-400 via-pink-500 to-purple-600',
    description: 'High-contrast electric cyan and neon magenta streets under holographic rain.'
  },
  {
    id: 'sagrada-cathedral',
    name: 'Sagrada Cryptic Gold',
    nameRu: 'Саграда: Крипто-Собор',
    nameEs: 'Sagrada Oro Criptográfico',
    category: 'artistic',
    primary: '#EAB308',
    secondary: '#A855F7',
    bgClass: 'bg-[#0a0714]',
    cardBgClass: 'bg-[#170e2b]/90',
    borderClass: 'border-amber-400/30',
    glowClass: 'shadow-[0_0_25px_rgba(234,179,8,0.25)]',
    textColor: 'text-amber-300',
    previewGradient: 'from-amber-400 via-purple-500 to-rose-500',
    description: 'Cathedral of cryptographic truth with soaring vaults and violet stained-glass illumination.'
  },
  {
    id: 'monolithic-slate',
    name: 'Monolithic Stealth Dark',
    nameRu: 'Монолитный Стелс',
    nameEs: 'Monolito Sigiloso Oscuro',
    category: 'dark',
    primary: '#94A3B8',
    secondary: '#38BDF8',
    bgClass: 'bg-[#020408]',
    cardBgClass: 'bg-[#0a0f18]/90',
    borderClass: 'border-slate-700/60',
    glowClass: 'shadow-[0_0_20px_rgba(148,163,184,0.15)]',
    textColor: 'text-slate-200',
    previewGradient: 'from-slate-700 via-slate-500 to-sky-400',
    description: 'Ultra-minimalist brushed titanium, carbon slate, and razor-sharp cryptographic typography.'
  },
  {
    id: 'solar-flare',
    name: 'Solar Flare Cyber Amber',
    nameRu: 'Солнечная Вспышка: Амбер',
    nameEs: 'Llamarada Solar Ámbar',
    category: 'cyberpunk',
    primary: '#F97316',
    secondary: '#EF4444',
    bgClass: 'bg-[#0d0705]',
    cardBgClass: 'bg-[#1c0f0a]/90',
    borderClass: 'border-orange-500/40',
    glowClass: 'shadow-[0_0_25px_rgba(249,115,22,0.3)]',
    textColor: 'text-orange-300',
    previewGradient: 'from-amber-500 via-orange-500 to-red-600',
    description: 'Energetic solar plasma, glowing amber indicators, and warm radiation shields.'
  },
  {
    id: 'quantum-amethyst',
    name: 'Quantum Amethyst',
    nameRu: 'Квантовый Аметист',
    nameEs: 'Amatista Cuántica',
    category: 'neon',
    primary: '#C084FC',
    secondary: '#6366F1',
    bgClass: 'bg-[#090514]',
    cardBgClass: 'bg-[#150a2b]/90',
    borderClass: 'border-purple-500/40',
    glowClass: 'shadow-[0_0_25px_rgba(192,132,252,0.3)]',
    textColor: 'text-purple-300',
    previewGradient: 'from-purple-500 via-indigo-500 to-pink-500',
    description: 'Quantum superposition wavelengths with neon ultraviolet and amethyst crystal reflections.'
  },
  {
    id: 'bioluminescent-ocean',
    name: 'Abyssal Bioluminescence',
    nameRu: 'Биолюминесцентная Бездна',
    nameEs: 'Bioluminiscencia Abisal',
    category: 'artistic',
    primary: '#14B8A6',
    secondary: '#06B6D4',
    bgClass: 'bg-[#020b0e]',
    cardBgClass: 'bg-[#061b20]/90',
    borderClass: 'border-teal-500/40',
    glowClass: 'shadow-[0_0_25px_rgba(20,184,166,0.3)]',
    textColor: 'text-teal-300',
    previewGradient: 'from-teal-400 via-cyan-500 to-blue-600',
    description: 'Deep oceanic trench serenity with bioluminescent plankton and shimmering teal data paths.'
  },
  {
    id: 'crimson-terminal',
    name: 'Crimson Cyber Noir',
    nameRu: 'Багровый Кибер Нуар',
    nameEs: 'Cíber Negro Carmesí',
    category: 'dark',
    primary: '#F43F5E',
    secondary: '#FB7185',
    bgClass: 'bg-[#0c0407]',
    cardBgClass: 'bg-[#1c0810]/90',
    borderClass: 'border-rose-500/40',
    glowClass: 'shadow-[0_0_25px_rgba(244,63,94,0.3)]',
    textColor: 'text-rose-300',
    previewGradient: 'from-rose-600 via-red-500 to-orange-500',
    description: 'High-alert emergency enclave with deep obsidian carbon and ruby laser scanning lines.'
  },
  {
    id: 'blade-runner-sunset',
    name: 'Blade Runner 2049 Sunset',
    nameRu: 'Бегущий по лезвию 2049',
    nameEs: 'Atardecer Blade Runner 2049',
    category: 'cyberpunk',
    primary: '#FB923C',
    secondary: '#D946EF',
    bgClass: 'bg-[#120811]',
    cardBgClass: 'bg-[#220d1f]/90',
    borderClass: 'border-orange-400/40',
    glowClass: 'shadow-[0_0_25px_rgba(251,146,60,0.3)]',
    textColor: 'text-orange-200',
    previewGradient: 'from-amber-500 via-fuchsia-500 to-purple-800',
    description: 'Atmospheric dusty orange smog, glowing fuchsia neon, and industrial melancholia.'
  },
  {
    id: 'nordic-frost',
    name: 'Nordic Glacial Frost',
    nameRu: 'Нордический Ледник',
    nameEs: 'Glaciar Nórdico Escarchado',
    category: 'dark',
    primary: '#7DD3FC',
    secondary: '#E2E8F0',
    bgClass: 'bg-[#040810]',
    cardBgClass: 'bg-[#091222]/90',
    borderClass: 'border-sky-400/30',
    glowClass: 'shadow-[0_0_20px_rgba(125,211,252,0.25)]',
    textColor: 'text-sky-200',
    previewGradient: 'from-sky-300 via-blue-500 to-slate-800',
    description: 'Pristine arctic purity, crystalline frost borders, and cool ice-blue illumination.'
  },
  {
    id: 'acid-synthwave',
    name: 'Acid Retro Synthwave',
    nameRu: 'Кислотный Синтвейв',
    nameEs: 'Onda Sintética Ácida',
    category: 'neon',
    primary: '#A3E635',
    secondary: '#C026D3',
    bgClass: 'bg-[#08020e]',
    cardBgClass: 'bg-[#160624]/90',
    borderClass: 'border-lime-400/40',
    glowClass: 'shadow-[0_0_25px_rgba(163,230,53,0.3)]',
    textColor: 'text-lime-300',
    previewGradient: 'from-lime-400 via-fuchsia-600 to-purple-900',
    description: 'Electric lime wireframes against retro 80s outrun purple horizons.'
  },
  {
    id: 'golden-ratio',
    name: 'Golden Ratio Baroque',
    nameRu: 'Золотое Сечение Барокко',
    nameEs: 'Proporción Áurea Barroca',
    category: 'artistic',
    primary: '#D97706',
    secondary: '#FEF08A',
    bgClass: 'bg-[#0b0804]',
    cardBgClass: 'bg-[#181208]/90',
    borderClass: 'border-amber-600/40',
    glowClass: 'shadow-[0_0_25px_rgba(217,119,6,0.25)]',
    textColor: 'text-amber-200',
    previewGradient: 'from-amber-600 via-yellow-400 to-stone-800',
    description: 'Sacred geometric proportions, polished antique bronze, and royal mathematical symmetry.'
  },
  {
    id: 'barcelona-twilight',
    name: 'Barcelona Cyber Twilight',
    nameRu: 'Барселонские Сумерки',
    nameEs: 'Crepúsculo Cíber Barcelona',
    category: 'artistic',
    primary: '#38BDF8',
    secondary: '#FB7185',
    bgClass: 'bg-[#060917]',
    cardBgClass: 'bg-[#0e1633]/90',
    borderClass: 'border-sky-400/40',
    glowClass: 'shadow-[0_0_25px_rgba(56,189,248,0.3)]',
    textColor: 'text-sky-300',
    previewGradient: 'from-sky-400 via-rose-400 to-indigo-600',
    description: 'Mediterranean dusk breeze meeting Catalan ceramic vibrancy and modern cyber grids.'
  },
  {
    id: 'phosphor-crt',
    name: 'Retro Phosphor CRT',
    nameRu: 'Ретро Фосфорный ЭЛТ',
    nameEs: 'CRT Fósforo Retro',
    category: 'cyberpunk',
    primary: '#4ADE80',
    secondary: '#22C55E',
    bgClass: 'bg-[#020502]',
    cardBgClass: 'bg-[#051106]/90',
    borderClass: 'border-green-600/40',
    glowClass: 'shadow-[0_0_20px_rgba(74,222,128,0.25)]',
    textColor: 'text-green-400',
    previewGradient: 'from-green-500 via-emerald-600 to-black',
    description: 'Nostalgic 1982 green-screen phosphor monitors with subtle scanlines and military aesthetics.'
  },
  {
    id: 'void-singularity',
    name: 'Void Singularity',
    nameRu: 'Сингулярность Пустоты',
    nameEs: 'Singularidad del Vacío',
    category: 'dark',
    primary: '#60A5FA',
    secondary: '#818CF8',
    bgClass: 'bg-[#000104]',
    cardBgClass: 'bg-[#040813]/90',
    borderClass: 'border-blue-900/60',
    glowClass: 'shadow-[0_0_30px_rgba(96,165,250,0.2)]',
    textColor: 'text-blue-300',
    previewGradient: 'from-blue-700 via-indigo-900 to-black',
    description: 'Absolute event-horizon darkness punctuated only by coherent laser beam optics.'
  },
  {
    id: 'emerald-citadel',
    name: 'Emerald Citadel',
    nameRu: 'Изумрудная Цитадель',
    nameEs: 'Ciudadela Esmeralda',
    category: 'artistic',
    primary: '#059669',
    secondary: '#F59E0B',
    bgClass: 'bg-[#030906]',
    cardBgClass: 'bg-[#071910]/90',
    borderClass: 'border-emerald-600/40',
    glowClass: 'shadow-[0_0_25px_rgba(5,150,105,0.3)]',
    textColor: 'text-emerald-300',
    previewGradient: 'from-emerald-600 via-teal-500 to-amber-500',
    description: 'Polished imperial jade stone accented with brass cryptographic seals and deep forest shadows.'
  },
  {
    id: 'hyperdrive-iridescent',
    name: 'Hyperdrive Iridescent',
    nameRu: 'Гипердрайв Радужный',
    nameEs: 'Hiperimpulso Iridiscente',
    category: 'neon',
    primary: '#38BDF8',
    secondary: '#F472B6',
    bgClass: 'bg-[#070716]',
    cardBgClass: 'bg-[#100f28]/90',
    borderClass: 'border-pink-500/40',
    glowClass: 'shadow-[0_0_30px_rgba(244,114,182,0.3)]',
    textColor: 'text-pink-300',
    previewGradient: 'from-cyan-400 via-pink-400 to-amber-300',
    description: 'Dynamic light refractions through dichroic crystal glass at relativistic speeds.'
  },
  {
    id: 'cyber-samurai',
    name: 'Cyber Samurai Scarlet',
    nameRu: 'Кибер Самурай',
    nameEs: 'Cíber Samurái Escarlata',
    category: 'cyberpunk',
    primary: '#DC2626',
    secondary: '#EAB308',
    bgClass: 'bg-[#0b0304]',
    cardBgClass: 'bg-[#1b080a]/90',
    borderClass: 'border-red-600/40',
    glowClass: 'shadow-[0_0_25px_rgba(220,38,38,0.3)]',
    textColor: 'text-red-300',
    previewGradient: 'from-red-600 via-amber-500 to-neutral-900',
    description: 'Traditional Japanese lacquer scarlet, gilded gold kintsugi cracks, and Damascus steel.'
  }
];
