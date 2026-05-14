import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { QuotesProvider } from '../src/hooks/useQuotes';
import { palette } from '../src/theme/palette';

export default function RootLayout() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? palette.dark : palette.light;

  return (
    <QuotesProvider>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.paper },
          animation: 'fade_from_bottom',
        }}
      />
    </QuotesProvider>
  );
}
