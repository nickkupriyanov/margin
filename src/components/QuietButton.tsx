import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, useColorScheme } from 'react-native';
import { palette } from '../theme/palette';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  selected?: boolean;
  minWidth?: number;
};

export function QuietButton({ label, onPress, disabled, selected, minWidth }: Props) {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? palette.dark : palette.light;

  async function handlePress() {
    if (disabled) return;
    Haptics.selectionAsync();
    onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: selected ? colors.pressed : colors.card,
          borderColor: selected ? colors.accent : colors.hairline,
          minWidth,
          opacity: disabled ? 0.42 : 1,
        },
        pressed && !disabled ? { transform: [{ translateY: 1 }], backgroundColor: colors.pressed } : null,
      ]}
    >
      <Text style={[styles.label, { color: selected ? colors.accent : colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  label: {
    fontSize: 14,
  },
});
