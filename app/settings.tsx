import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmbientGrain } from '../src/components/AmbientGrain';
import { QuietButton } from '../src/components/QuietButton';
import { useQuotes } from '../src/hooks/useQuotes';
import { settingsStore, useWidgetPreference } from '../src/storage/settings';
import { palette } from '../src/theme/palette';
import { typography } from '../src/theme/typography';

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? palette.dark : palette.light;
  const { syncWidget } = useQuotes();
  const [preference, setPreference] = useWidgetPreference();

  function choose(value: 'random' | 'favorites') {
    settingsStore.set('widgetPreference', value);
    setPreference(value);
    syncWidget(value);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.paper }]}>
      <AmbientGrain />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={[styles.navText, { color: colors.muted }]}>Library</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.ink }]}>Settings</Text>
          <Text style={[styles.copy, { color: colors.inkSoft }]}>Only the few things that shape the ritual.</Text>
        </View>

        <View style={[styles.section, { borderColor: colors.hairline }]}>
          <Text style={[styles.label, { color: colors.muted }]}>Widget quote</Text>
          <Text style={[styles.sectionTitle, { color: colors.ink }]}>What should return to you?</Text>
          <View style={styles.buttons}>
            <QuietButton label="Random" onPress={() => choose('random')} selected={preference === 'random'} />
            <QuietButton label="Favorites" onPress={() => choose('favorites')} selected={preference === 'favorites'} />
          </View>
        </View>

        <View style={[styles.section, { borderColor: colors.hairline }]}>
          <Text style={[styles.label, { color: colors.muted }]}>Storage</Text>
          <Text style={[styles.note, { color: colors.inkSoft }]}>Quotes live locally in SQLite. Widgets read a small native snapshot from the App Group container.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: 24,
    paddingBottom: 42,
  },
  navText: { fontSize: 15 },
  header: {
    marginTop: 52,
    marginBottom: 32,
  },
  title: {
    fontFamily: typography.serif,
    fontSize: 44,
    letterSpacing: 0,
  },
  copy: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  section: {
    borderTopWidth: 1,
    paddingVertical: 24,
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontFamily: typography.serif,
    fontSize: 26,
    lineHeight: 34,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  note: {
    fontSize: 16,
    lineHeight: 25,
  },
});
