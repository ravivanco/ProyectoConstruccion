import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

export function HomeScreen({ onOpenPlan }: { onOpenPlan(): void }) {
  const { reset } = useApp();
  return <View style={styles.container}>
    <Text style={styles.brand}>DK-FITT</Text>
    <Text style={styles.title}>Hola, este es tu espacio</Text>
    <Card>
      <Text style={styles.cardTitle}>Mi Plan</Text>
      <Text style={styles.text}>Consulta el estado de tu planificación nutricional.</Text>
      <Button label="Ver Mi Plan" onPress={onOpenPlan} />
    </Card>
    <Button secondary label="Cerrar sesión" onPress={reset} />
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 48 },
  brand: { color: colors.primaryDark, fontSize: 20, fontWeight: '900' },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 8, marginBottom: 24 },
  cardTitle: { color: colors.text, fontSize: 22, fontWeight: '800' },
  text: { color: colors.muted, lineHeight: 21, marginTop: 8 },
});
