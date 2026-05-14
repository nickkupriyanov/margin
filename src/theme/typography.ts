import { Platform } from 'react-native';

export const typography = {
  serif: Platform.select({
    ios: 'Georgia',
    default: 'serif',
  }),
  sans: Platform.select({
    ios: 'Avenir Next',
    default: 'sans-serif',
  }),
};
