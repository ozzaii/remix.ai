export const colors = {
  // Primary Colors - Enhanced for GOD-TIER TECH-GIANT DIAMOND LEVEL styling
  deepBlack: '#000000',
  darkBlue: '#0A0E1D', // Darker for more premium feel
  vibrantPurple: '#B347FF', // More vibrant
  electricBlue: '#2D7FFF', // More saturated
  neonBlue: '#00D1FF', // Brighter
  primary: '#7C12E5', // More vibrant primary
  primaryDark: '#5A0DAA', // Deeper primary dark
  backgroundDark: '#080B16', // Darker background for premium feel
  backgroundLight: '#1A2540', // Richer background light
  
  // Diamond Level Accent Colors
  diamond: '#00FFFF', // Cyan accent for diamond highlights
  gold: '#FFD700', // Gold accent for premium elements
  ultraViolet: '#9932CC', // Ultra violet for special elements
  
  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#E2E8F0',
  textMuted: '#94A3B8',
  
  // UI Element Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Button States
  buttonPrimary: '#A855F7',
  buttonPrimaryHover: '#9333EA',
  buttonSecondary: '#3B82F6',
  buttonSecondaryHover: '#2563EB',
  buttonDisabled: '#64748B',
  
  // Visualization Colors
  kickDrum: '#F43F5E',
  snare: '#10B981',
  hiHat: '#F59E0B',
  bass: '#3B82F6',
  activeStep: '#A855F7',
  inactiveStep: '#1E293B',
  
  // Card and Container Colors
  cardBackground: '#111827',
  cardBackgroundAlt: '#1E293B',
  cardBorder: '#2D3748',
  
  // Overlay and Modal Colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  modalBackground: '#111827',
  
  // White with opacity for layering
  white10: 'rgba(255, 255, 255, 0.1)',
  white20: 'rgba(255, 255, 255, 0.2)',
  white50: 'rgba(255, 255, 255, 0.5)',
};

export const gradients = {
  // Enhanced gradients for GOD-TIER styling
  purpleToBlue: ['#B347FF', '#2D7FFF'],
  darkBackground: ['#000000', '#0A0E1D'],
  purpleToNeonBlue: ['#B347FF', '#00D1FF'],
  darkToLight: ['#080B16', '#1A2540'],
  glassEffect: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)'],
  
  // Diamond Level Gradients
  diamondGlow: ['#00FFFF', '#7C12E5'],
  goldAccent: ['#FFD700', '#FF8C00'],
  ultraPremium: ['#9932CC', '#B347FF'],
  techGiant: ['#080B16', '#2D7FFF'],
  godTier: ['#7C12E5', '#00FFFF'],
} as const;

export default { colors, gradients };
