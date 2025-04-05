import { StyleSheet, Dimensions, Platform } from 'react-native';
import { colors } from './colors';

export const typography = {
  // Use system fonts only
  fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  
  // Font weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  } as const,
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

export const globalStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.deepBlack,
  },
  
  screenContainer: {
    flex: 1,
    backgroundColor: colors.deepBlack,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  
  // Card styles
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  
  glassCard: {
    backgroundColor: colors.white10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.white20,
    overflow: 'hidden',
  },
  
  // Text styles with explicit system font
  heading1: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto', // Explicitly set system font
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.tight,
  },
  
  heading2: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto', // Explicitly set system font
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.tight,
  },
  
  heading3: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto', // Explicitly set system font
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.normal,
  },
  
  bodyText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto', // Explicitly set system font
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.normal,
  },
  
  bodyTextSmall: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto', // Explicitly set system font
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    color: colors.textMuted,
    lineHeight: 18,
  },
  
  bodyTextLarge: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto', // Explicitly set system font
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  
  buttonText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto', // Explicitly set system font
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  
  captionText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto', // Explicitly set system font
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    color: colors.textMuted,
  },
  
  // Button styles
  buttonPrimary: {
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonSecondary: {
    backgroundColor: colors.buttonSecondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonDisabled: {
    backgroundColor: colors.buttonDisabled,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  
  // Common layout styles
  centeredContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  // Spacing
  padding: {
    padding: 16,
  },
  
  paddingHorizontal: {
    paddingHorizontal: 16,
  },
  
  paddingVertical: {
    paddingVertical: 16,
  },
  
  margin: {
    margin: 16,
  },
  
  marginHorizontal: {
    marginHorizontal: 16,
  },
  
  marginVertical: {
    marginVertical: 16,
  },
  
  // Shadow
  shadow: {
    shadowColor: colors.vibrantPurple,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  
  shadowLight: {
    shadowColor: colors.deepBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  
  // Input styles
  input: {
    backgroundColor: colors.cardBackgroundAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    width: '100%',
    marginVertical: 16,
  },
  
  errorMessage: {
    color: colors.error,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default { typography, globalStyles };
