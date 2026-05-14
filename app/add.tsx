import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmbientGrain } from '../src/components/AmbientGrain';
import { QuietButton } from '../src/components/QuietButton';
import { useQuotes } from '../src/hooks/useQuotes';
import { CozyPalette, palette } from '../src/theme/palette';
import { typography } from '../src/theme/typography';

export default function AddQuoteScreen() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? palette.dark : palette.light;
  const { addQuote } = useQuotes();
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [source, setSource] = useState('');
  const [tags, setTags] = useState('');

  async function pasteQuote() {
    const clipboard = await Clipboard.getStringAsync();
    if (clipboard.trim()) {
      setText(clipboard.trim());
      Haptics.selectionAsync();
    }
  }

  async function save() {
    if (!text.trim()) return;
    await addQuote({
      text: text.trim(),
      author: author.trim(),
      source: source.trim(),
      tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.paper }]}>
      <AmbientGrain />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.nav}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Text style={[styles.navText, { color: colors.muted }]}>Close</Text>
            </Pressable>
            <Pressable onPress={save} disabled={!text.trim()} hitSlop={12}>
              <Text style={[styles.navText, { color: text.trim() ? colors.ink : colors.muted }]}>Save</Text>
            </Pressable>
          </View>

          <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
            <Text style={[styles.title, { color: colors.ink }]}>Add a passage</Text>
            <Text style={[styles.copy, { color: colors.inkSoft }]}>Let the quote breathe. A source is enough; everything else can stay quiet.</Text>
          </Animated.View>

          <View style={styles.form}>
            <TextInput
              multiline
              placeholder="Paste or type the quote here."
              placeholderTextColor={colors.muted}
              value={text}
              onChangeText={setText}
              style={[styles.quoteInput, { color: colors.ink, borderColor: colors.hairline, backgroundColor: colors.card }]}
            />
            <View style={styles.row}>
              <QuietButton label="Paste" onPress={pasteQuote} />
            </View>
            <Field label="Author" value={author} onChangeText={setAuthor} colors={colors} />
            <Field label="Book or source" value={source} onChangeText={setSource} colors={colors} />
            <Field label="Tags, separated by commas" value={tags} onChangeText={setTags} colors={colors} />
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
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.muted}
        style={[styles.input, { color: colors.ink, borderColor: colors.hairline }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  keyboard: { flex: 1 },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navText: {
    fontSize: 15,
  },
  header: {
    marginTop: 52,
    marginBottom: 30,
  },
  title: {
    fontFamily: typography.serif,
    fontSize: 38,
    letterSpacing: 0,
  },
  copy: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
    maxWidth: 310,
  },
  form: {
    gap: 20,
  },
  quoteInput: {
    borderRadius: 8,
    borderWidth: 1,
    fontFamily: typography.serif,
    fontSize: 23,
    lineHeight: 34,
    minHeight: 220,
    padding: 20,
    textAlignVertical: 'top',
  },
  row: {
    alignItems: 'flex-start',
  },
  field: {
    gap: 8,
  },
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
});
