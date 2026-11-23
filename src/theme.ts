export const colors = {
  violet: '#5B3DF5',
  violetDeep: '#3A1FB0',
  night: '#1A0C45',
  ink: '#120830',
  stageTop: '#9277FF',
  stageMid: '#6A47FA',
  stageBottom: '#5530E8',
  lime: '#D4FF3A',
  black: '#0E0B1A',
  white: '#FFFFFF',
  lavender: '#D9D1FF',
  muted: '#B7B0CF',
  glass: 'rgba(255,255,255,0.14)',
  glassSoft: 'rgba(255,255,255,0.08)',
  glassBorder: 'rgba(255,255,255,0.14)',
  cardMuted: '#F1EEFA',
  textOnWhite: '#4A4560',
  labelOnWhite: '#625D78',
  accentOnWhite: '#6A47FA',
  textOnLime: '#2E3800',
  limeLabel: '#3A4700',
  /** Signal and outcome colours: good, weak, poor (document: green, yellow, red). */
  good: '#7CC400',
  weak: '#F5B83D',
  poor: '#FF5C6C',
};

/** Background gradients, top to bottom. */
export const gradients = {
  intro: [colors.violet, colors.violetDeep, colors.night, colors.ink] as const,
  introStops: [0, 0.38, 0.72, 1] as const,
  viewer: [colors.violetDeep, colors.night, colors.ink] as const,
  viewerStops: [0, 0.55, 1] as const,
  stage: [colors.stageTop, colors.stageMid, colors.stageBottom] as const,
  bright: [colors.violet, colors.violetDeep, colors.night] as const,
  brightStops: [0, 0.4, 1] as const,
  emergency: [colors.night, colors.ink, colors.black] as const,
  emergencyStops: [0, 0.6, 1] as const,
};

export const fonts = {
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
};

export const radius = {
  pill: 999,
  card: 32,
  step: 28,
};
