import { StyleSheet, Text, TextInput, View, useColorScheme, type TextInputProps } from 'react-native';
import { Colors } from '@/constants/theme';

interface Props extends TextInputProps { label: string }

export function BaseInput({ label, ...props }: Props) {
  const palette = Colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
      <TextInput {...props} accessibilityLabel={label}
        style={[styles.input, { borderColor: palette.icon, color: palette.text }]} placeholderTextColor={palette.icon} />
    </View>
  );
}
const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600' },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, fontSize: 16 },
});
