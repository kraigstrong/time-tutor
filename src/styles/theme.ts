import { Platform, type ViewStyle } from 'react-native';

export const palette = {
  background: '#F6EFE3',
  backgroundAccent: '#FBE0C8',
  surface: '#FFF9F2',
  surfaceMuted: '#F3E6D5',
  ink: '#12355B',
  inkMuted: '#5B6C7D',
  coral: '#E97A5F',
  teal: '#2E8B8B',
  gold: '#F1BD63',
  success: '#2E8B57',
  danger: '#B64757',
  ring: '#D6C3AE',
  white: '#FFFFFF',
};

export const fontFamily = {
  display: Platform.select({
    ios: 'Avenir Next',
    android: 'sans-serif-medium',
    default: 'System',
  }),
  body: Platform.select({
    ios: 'Avenir Next',
    android: 'sans-serif',
    default: 'System',
  }),
};

export const shadows = {
  card: {
    shadowColor: '#12355B',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  } satisfies ViewStyle,
};
