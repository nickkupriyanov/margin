import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Quote } from '../types/quote';
import { palette } from '../theme/palette';
import { typography } from '../theme/typography';

type Props = {
  quote: Quote | null;
  large?: boolean;
  onPress?: () => void;
};

export function QuoteCard({ quote, large, onPress }: Props) {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? palette.dark : palette.light;

  if (!quote) {
    return (
      <View style={[styles.card, large && styles.large, { backgroundColor: colors.card, borderColor: colors.hairline }]}>
        <Text style={[styles.empty, { color: colors.inkSoft }]}>A saved line will appear here.</Text>
      </View>
    );
  }

  const source = [quote.author || 'Unknown', quote.source].filter(Boolean).join(', ');
  const quoteLength = quote.text.trim().length;
  const isLongQuote = quoteLength > 220;
  const isVeryLongQuote = quoteLength > 420;
  const quoteTone = large
    ? isVeryLongQuote
      ? styles.quoteLargeCompact
      : isLongQuote
        ? styles.quoteLargeBalanced
        : styles.quoteLarge
    : styles.quote;
  const cardTone = large && isLongQuote ? styles.largeLong : null;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        large && styles.large,
        cardTone,
        { backgroundColor: colors.card, borderColor: colors.hairline },
        pressed && onPress ? { transform: [{ translateY: 2 }], backgroundColor: colors.pressed } : null,
      ]}
    >
      <Text
        numberOfLines={large && isVeryLongQuote ? 10 : undefined}
        style={[styles.quote, quoteTone, { color: colors.ink }]}
      >
        {quote.text}
      </Text>
      <View style={styles.metaRow}>
        <Text style={[styles.source, { color: colors.inkSoft }]}>{source}</Text>
        {quote.isFavorite ? <Text style={[styles.mark, { color: colors.accent }]}>Loved</Text> : null}
      </View>
      {!large && quote.tags.length ? (
        <Text numberOfLines={1} style={[styles.tags, { color: colors.muted }]}>{quote.tags.map((tag) => `#${tag}`).join(' ')}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 22,
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 34,
  },
  largeLong: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  quote: {
    fontFamily: typography.serif,
    fontSize: 22,
    lineHeight: 32,
    letterSpacing: 0,
  },
  quoteLarge: {
    fontSize: 32,
    lineHeight: 47,
  },
  quoteLargeBalanced: {
    fontSize: 26,
    lineHeight: 38,
  },
  quoteLargeCompact: {
    fontSize: 22,
    lineHeight: 32,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 24,
  },
  source: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  mark: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tags: {
    fontSize: 12,
    marginTop: 14,
  },
  empty: {
    fontFamily: typography.serif,
    fontSize: 22,
    lineHeight: 32,
    textAlign: 'center',
  },
});
