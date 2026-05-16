import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmbientGrain } from '../src/components/AmbientGrain';
import { QuoteCard } from '../src/components/QuoteCard';
import { QuietButton } from '../src/components/QuietButton';
import { useQuotes } from '../src/hooks/useQuotes';
import { palette } from '../src/theme/palette';
import { typography } from '../src/theme/typography';

type FilterMode = 'all' | 'favorites';

export default function LibraryScreen() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? palette.dark : palette.light;
  const { quotes } = useQuotes();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<FilterMode>('all');
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const unique = new Set<string>();
    quotes.forEach((quote) => quote.tags.forEach((item) => unique.add(item)));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [quotes]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return quotes.filter((quote) => {
      const matchesMode = mode === 'all' || quote.isFavorite;
      const matchesTag = !tag || quote.tags.includes(tag);
      const haystack = `${quote.text} ${quote.author} ${quote.source}`.toLowerCase();
      const matchesQuery = !needle || haystack.includes(needle);
      return matchesMode && matchesTag && matchesQuery;
    });
  }, [mode, query, quotes, tag]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.paper }]}>
      <AmbientGrain />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={[styles.navText, { color: colors.muted }]}>Home</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/settings')} hitSlop={12}>
            <Text style={[styles.navText, { color: colors.muted }]}>Settings</Text>
          </Pressable>
        </View>

        <Animated.View entering={FadeInDown.duration(550)} style={styles.header}>
          <Text style={[styles.title, { color: colors.ink }]}>Library</Text>
          <Text style={[styles.count, { color: colors.inkSoft }]}>{quotes.length ? `${quotes.length} saved quotes` : 'A blank margin, waiting.'}</Text>
        </Animated.View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search words, authors, books"
          placeholderTextColor={colors.muted}
          style={[styles.search, { borderColor: colors.hairline, color: colors.ink, backgroundColor: colors.card }]}
        />

        <View style={styles.filters}>
          <QuietButton label="All" onPress={() => setMode('all')} selected={mode === 'all'} />
          <QuietButton label="Favorites" onPress={() => setMode('favorites')} selected={mode === 'favorites'} />
          {tag ? <QuietButton label={`#${tag}`} onPress={() => setTag(null)} selected /> : null}
        </View>

        {tags.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tags}>
            {tags.map((item) => (
              <QuietButton key={item} label={item} onPress={() => setTag(item === tag ? null : item)} selected={item === tag} />
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.list}>
          {filtered.map((quote, index) => (
            <Animated.View key={quote.id} entering={FadeInDown.delay(index * 45).duration(450)}>
              <QuoteCard quote={quote} onPress={() => router.push(`/quote/${quote.id}`)} />
            </Animated.View>
          ))}
          {!filtered.length ? (
            <View style={[styles.empty, { borderColor: colors.hairline }]}>
              <Text style={[styles.emptyText, { color: colors.inkSoft }]}>No passage matches this quiet corner yet.</Text>
            </View>
          ) : null}
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
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navText: { fontSize: 15 },
  header: {
    marginTop: 44,
    marginBottom: 22,
  },
  title: {
    fontFamily: typography.serif,
    fontSize: 44,
    letterSpacing: 0,
  },
  count: {
    fontSize: 15,
    marginTop: 6,
  },
  search: {
    borderRadius: 8,
    borderWidth: 1,
    fontFamily: typography.sans,
    fontSize: 17,
    height: 56,
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  tags: {
    gap: 10,
    paddingVertical: 18,
  },
  list: {
    gap: 14,
    marginTop: 10,
  },
  empty: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    padding: 28,
  },
  emptyText: {
    fontFamily: typography.serif,
    fontSize: 20,
    lineHeight: 30,
    textAlign: 'center',
  },
});
