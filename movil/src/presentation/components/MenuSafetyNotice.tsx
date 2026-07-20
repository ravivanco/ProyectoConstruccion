import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function MenuSafetyNotice() {
  return <View style={styles.notice}>
    <Text style={styles.icon}>✓</Text>
    <View style={styles.content}><Text style={styles.title}>Menús verificados para ti</Text><Text style={styles.text}>Las opciones recibidas fueron filtradas por el backend considerando alergias, restricciones alimenticias y condiciones registradas en tu perfil.</Text></View>
  </View>;
}

const styles = StyleSheet.create({
  notice: { flexDirection: 'row', backgroundColor: '#EAF7F0', borderWidth: 1, borderColor: '#74B58D', borderRadius: 16, padding: 14, marginBottom: 10 },
  icon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#2D8A55', color: '#FFF', textAlign: 'center', textAlignVertical: 'center', fontWeight: '900', marginRight: 10 },
  content: { flex: 1 },
  title: { color: colors.text, fontWeight: '900' },
  text: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 3 },
});
