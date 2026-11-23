import { Pressable, StyleSheet, Text, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

interface Props { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean }

export function BaseButton({ label, onPress, disabled, secondary }: Props) {
  const dark = useColorScheme() === 'dark';
  const palette = Colors[dark ? 'dark' : 'light'];
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }}
      disabled={disabled} onPress={onPress}
      style={({ pressed }) => [
        styles.button, { borderColor: palette.tint, backgroundColor: secondary ? palette.background : palette.tint },
        (disabled || pressed) && styles.dimmed,
      ]}>
      <Text style={[styles.label, { color: secondary ? palette.text : palette.background }]}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: { minHeight: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 12 },
  dimmed: { opacity: 0.6 },
  label: { fontWeight: '600', textAlign: 'center' },
});
