/**
 * ME — The Life Game | Design System
 * Dark mode default, minimalist, clean
 */

export const COLORS = {
  // Backgrounds
  bg:       '#0F0F0F',
  surface:  '#1A1A1A',
  elevated: '#242424',

  // Text
  text:     '#F0EFE8',
  muted:    '#888780',
  hint:     '#555550',

  // Borders
  border:   'rgba(240,239,232,0.12)',
  borderMd: 'rgba(240,239,232,0.25)',

  // Accent (purple-ish, consistent with brand)
  accent:   '#7F77DD',
  accentBg: 'rgba(127,119,221,0.15)',

  // Semantic
  success: '#1D9E75',
  warning: '#EF9F27',
  danger:  '#E24B4A',
  info:    '#378ADD',
};

export const FONTS = {
  regular: 'System',
  bold:    'System',
  mono:    'Courier',
};

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const RADIUS = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  full: 999,
};

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
};
