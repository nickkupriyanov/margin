import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmbientGrain } from '../../src/components/AmbientGrain';
import { QuietButton } from '../../src/components/QuietButton';
import { useQuotes } from '../../src/hooks/useQuotes';
import { CozyPalette, palette } from '../../src/theme/palette';
import { typography } from '../../src/theme/typography';

export default function QuoteDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? palette.dark : palette.light;
  const { quotes, updateQuote, deleteQuote, toggleFavorite } = useQuotes();
  const quote = quotes.find((item) => item.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(quote?.text ?? '');
  const [author, setAuthor] = useState(quote?.author ?? '');
  const [source, setSource] = useState(quote?.source ?? '');
  const [tags, setTags] = useState((quote?.tags ?? []).join(', '));

  if (!quote) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.paper }]}>
        <AmbientGrain />
        <View style={styles.missing}>
          <Text style={[styles.missingText, { color: colors.ink }]}>This passage is no longer here.</Text>
          <QuietButton label="Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const currentQuote = quote;

  async function save() {
    await updateQuote(currentQuote.id, {
      text: text.trim(),
      author: author.trim(),
      source: source.trim(),
      tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    });
    setIsEditing(false);
    Haptics.selectionAsync();
  }

  function confirmDelete() {
    Alert.alert('Delete quote?', 'This removes the passage from your local library.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteQuote(currentQuote.id);
          router.replace('/library');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.paper }]}>
      <AmbientGrain />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.nav}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Text style={[styles.navText, { color: colors.muted }]}>Library</Text>
            </Pressable>
            <Pressable onPress={() => (isEditing ? save() : setIsEditing(true))} hitSlop={12}>
          <Text style={[styles.navText, { color: colors.ink }]}>{isEditing ? 'Save' : 'Edit'}</Text>
            </Pressable>
          </View>

          <Animated.View entering={FadeIn.duration(600)} style={styles.body}>
            {isEditing ? (
              <View style={styles.form}>
                <TextInput multiline value={text} onChangeText={setText} style={[styles.editQuote, { color: colors.ink, borderColor: colors.hairline }]} />
                <Field label="Author" value={author} onChangeText={setAuthor} colors={colors} />
                <Field label="Source" value={source} onChangeText={setSource} colors={colors} />
                <Field label="Tags" value={tags} onChangeText={setTags} colors={colors} />
              </View>
            ) : (
              <>
                <Text style={[styles.quote, { color: colors.ink }]}>{currentQuote.text}</Text>
                <Text style={[styles.source, { color: colors.inkSoft }]}>
                  {currentQuote.author || 'Unknown'}{currentQuote.source ? `, ${currentQuote.source}` : ''}
                </Text>
                <View style={styles.tags}>
                  {currentQuote.tags.map((tag) => (
                    <Text key={tag} style={[styles.tag, { color: colors.muted, borderColor: colors.hairline }]}>#{tag}</Text>
                  ))}
                </View>
              </>
            )}
          </Animated.View>

          <View style={styles.actions}>
            <QuietButton label={currentQuote.isFavorite ? 'Loved' : 'Favorite'} onPress={() => toggleFavorite(currentQuote.id)} selected={currentQuote.isFavorite} />
            <QuietButton label="Delete" onPress={confirmDelete} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  colors: CozyPalette;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} style={[styles.input, { color: colors.ink, borderColor: colors.hairline }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  keyboard: { flex: 1 },
  content: {
    minHeight: '100%',
    padding: 24,
    paddingBottom: 42,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navText: { fontSize: 15 },
  body: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 560,
  },
  quote: {
    fontFamily: typography.serif,
    fontSize: 31,
    lineHeight: 45,
    letterSpacing: 0,
  },
  source: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 26,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 22,
  },
  tag: {
    borderRadius: 999,
    borderWidth: 1,
    fontSize: 13,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  form: {
    gap: 20,
  },
  editQuote: {
    borderBottomWidth: 1,
    fontFamily: typography.serif,
    fontSize: 27,
    lineHeight: 40,
    minHeight: 220,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  field: { gap: 8 },
  label: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  input: {
    borderBottomWidth: 1,
    fontSize: 18,
    paddingBottom: 12,
  },
  missing: {
    alignItems: 'center',
    flex: 1,
    gap: 20,
    justifyContent: 'center',
    padding: 24,
  },
  missingText: {
    fontFamily: typography.serif,
    fontSize: 26,
    textAlign: 'center',
  },
});
