/* ============================================================
   ResiConnect — Design Tokens (miroir JS de src/index.css)
   À utiliser dans les composants/pages stylés en inline.
   La source de vérité côté CSS reste src/index.css.
   ============================================================ */

export const colors = {
  primary: {
    50: '#ecfdf7',
    100: '#d1faec',
    200: '#a6f2da',
    300: '#6de4c3',
    400: '#33cca6',
    500: '#14b890', // marque principale
    600: '#0c9576', // hover
    700: '#0c7860',
    800: '#0d5f4e',
    900: '#0b4d40',
  },
  secondary: {
    500: '#1e293b',
    600: '#172033',
    700: '#0f172a',
  },
  accent: {
    400: '#fbbf64',
    500: '#f59e0b',
    600: '#d97706',
  },
  bg: '#f5f7fa',
  bgSoft: '#eef2f7',
  surface: '#ffffff',
  surface2: '#f1f5f9',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',
  text: '#0f172a',
  textMuted: '#475569',
  textSubtle: '#64748b',
  textInvert: '#f8fafc',
  success: '#16a34a',
  successBg: '#dcfce7',
  successText: '#15803d',
  error: '#dc2626',
  errorBg: '#fee2e2',
  errorText: '#b91c1c',
  warning: '#d97706',
  warningBg: '#fef3c7',
  warningText: '#b45309',
  info: '#2563eb',
  infoBg: '#dbeafe',
  infoText: '#1d4ed8',
};

export const space = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64,
};

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 24, full: 999,
};

export const shadow = {
  xs: '0 1px 2px rgba(15, 23, 42, 0.06)',
  sm: '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)',
  md: '0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)',
  lg: '0 12px 28px rgba(15, 23, 42, 0.12), 0 4px 8px rgba(15, 23, 42, 0.05)',
  xl: '0 24px 56px rgba(15, 23, 42, 0.18)',
  primary: '0 8px 24px rgba(20, 184, 144, 0.30)',
};

export const font = {
  heading: "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
  body: "'Inter', system-ui, -apple-system, 'Segoe UI', 'Roboto', sans-serif",
};

export const zIndex = {
  dropdown: 100,
  sticky: 200,
  overlay: 900,
  modal: 1000,
  toast: 1100,
};

const theme = { colors, space, radius, shadow, font, zIndex };
export default theme;
