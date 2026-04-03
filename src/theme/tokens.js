// Hormonia Design Tokens — Cute & Girly Theme
// Inspired by cherry blossoms, soft pinks, and hand-crafted warmth

export const Colors = {
  // Primary Blush Pinks
  pink50: '#FFF5F7',
  pink100: '#FFE4EC',
  pink200: '#FFB6C9',
  pink300: '#FF8DAB',
  pink400: '#FF6B8A',
  pink500: '#F75D8C',
  pink600: '#E84577',
  pink700: '#D43A65',

  // Soft Lavenders
  lavender50: '#F8F0FF',
  lavender100: '#EDE0F7',
  lavender200: '#D9BFF0',
  lavender300: '#C4A0E8',
  lavender400: '#A97DD4',
  lavender500: '#8E5FBF',

  // Warm Creams
  cream50: '#FFFDF8',
  cream100: '#FFF8ED',
  cream200: '#FFEED4',
  cream300: '#FFE0B8',

  // Mint / Green
  mint50: '#F0FFF4',
  mint100: '#E0F8EA',
  mint200: '#B2ECCC',
  mint300: '#7DD6A8',
  mint400: '#56C596',
  mint500: '#3DA87A',

  // Sky Blue
  sky100: '#E5F2FC',
  sky300: '#8DC8F0',
  sky500: '#4AA3D9',

  // Warm Coral
  coral100: '#FFE8E2',
  coral300: '#FFB09E',
  coral500: '#F96B4F',

  // Sunny Yellow
  sunny100: '#FFF8E1',
  sunny300: '#FFE082',
  sunny500: '#FFD166',

  // Neutrals
  white: '#FFFFFF',
  bg: '#FFF5F7',
  cardBg: '#FFFFFF',
  cardAlt: '#FFF0F3',
  textPrimary: '#3D2C3E',
  textSecondary: '#8A7A8C',
  textMuted: '#BCA8BD',
  textOnAccent: '#FFFFFF',
  border: 'rgba(247, 93, 140, 0.08)',
  divider: 'rgba(247, 93, 140, 0.06)',

  // Status
  success: '#56C596',
  warning: '#FFD166',
  error: '#FF6B8A',
  info: '#4AA3D9',
}

export const Fonts = {
  heading: 'Nunito_700Bold',
  subheading: 'Nunito_600SemiBold',
  body: 'Nunito_400Regular',
  bodyMedium: 'Nunito_500Medium',
  light: 'Nunito_300Light',
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
}

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
}

export const Shadows = {
  sm: {
    shadowColor: '#3D2C3E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#3D2C3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#3D2C3E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
  },
  glow: {
    shadowColor: '#F75D8C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
}
