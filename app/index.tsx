import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmbientGrain } from '../src/components/AmbientGrain';
import { QuoteCard } from '../src/components/QuoteCard';
import { QuietButton } from '../src/components/QuietButton';
import { useQuotes } from '../src/hooks/useQuotes';
import { palette } from '../src/theme/palette';
import { typography } from '../src/theme/typography';

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? palette.dark : palette.light;
  const { quotes, featuredQuote, toggleFavorite, chooseRandomQuote } = useQuotes();

  const subtitle = useMemo(() => {
    if (!quotes.length) return 'A quiet place for lines worth returning to.';
    return quotes.length === 1 ? '1 saved passage' : `${quotes.length} saved passages`;
  }, [quotes.length]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.paper }]}>
      <AmbientGrain />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(700)} style={styles.top}>
          <View>
            <Text style={[styles.kicker, { color: colors.muted }]}>Cozy Quotes</Text>
            <Text style={[styles.subtitle, { color: colors.inkSoft }]}>{subtitle}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/library')}
            style={({ pressed }) => [styles.libraryLink, pressed && { opacity: 0.64 }]}
          >
            <Text style={[styles.libraryText, { color: colors.ink }]}>Library</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(700)} style={styles.quoteWrap}>
          <QuoteCard
            quote={featuredQuote}
            large
            onPress={() => featuredQuote?.id && router.push(`/quote/${featuredQuote.id}`)}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(650)} style={styles.actions}>
          <QuietButton label="Add quote" onPress={() => router.push('/add')} />
          <QuietButton label="Another" onPress={chooseRandomQuote} disabled={!quotes.length} />
          <QuietButton
            label={featuredQuote?.isFavorite ? 'Loved' : 'Favorite'}
            onPress={() => featuredQuote && toggleFavorite(featuredQuote.id)}
            disabled={!featuredQuote || featuredQuote.id === 'fallback'}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    minHeight: '100%',
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 34,
  },
  top: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kicker: {
    fontFamily: typography.serif,
    fontSize: 30,
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  libraryLink: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  libraryText: {
    fontSize: 14,
  },
  quoteWrap: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 520,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
});
