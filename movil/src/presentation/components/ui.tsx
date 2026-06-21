import React, { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../theme';

export function Field({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput placeholderTextColor="#929A90" style={[styles.input, error ? styles.inputError : null]} {...props} />{error ? <Text style={styles.error}>{error}</Text> : null}</View>;
}
export function Button({ label, onPress, secondary, disabled }: { label: string; onPress(): void; secondary?: boolean; disabled?: boolean }) {
  return <Pressable disabled={disabled} onPress={onPress} style={[styles.button, secondary ? styles.secondary : null, disabled ? styles.disabled : null]}><Text style={[styles.buttonText, secondary ? styles.secondaryText : null]}>{label}</Text></Pressable>;
}
export function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress(): void }) {
  return <Pressable onPress={onPress} style={[styles.choice, selected ? styles.choiceSelected : null]}><Text style={[styles.choiceText, selected ? styles.choiceTextSelected : null]}>{label}</Text></Pressable>;
}
export function Card({ children }: PropsWithChildren) { return <View style={styles.card}>{children}</View>; }

const styles = StyleSheet.create({
  field: { marginBottom: 14 }, label: { color: colors.text, fontWeight: '700', marginBottom: 6 }, input: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, color: colors.text, backgroundColor: '#FFF' }, inputError: { borderColor: colors.danger }, error: { color: colors.danger, fontSize: 12, marginTop: 4 },
  button: { minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, backgroundColor: colors.primary, marginTop: 10 }, buttonText: { color: '#FFF', fontWeight: '800', fontSize: 16 }, secondary: { backgroundColor: '#FFF', borderWidth: 1, borderColor: colors.primary }, secondaryText: { color: colors.primaryDark }, disabled: { opacity: 0.5 },
  choice: { borderWidth: 1, borderColor: colors.border, backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 10 }, choiceSelected: { borderColor: colors.primary, backgroundColor: '#F0F7E8' }, choiceText: { color: colors.text, fontWeight: '600' }, choiceTextSelected: { color: colors.primaryDark }, card: { borderRadius: 20, backgroundColor: colors.surface, padding: 20, borderWidth: 1, borderColor: colors.border },
});
