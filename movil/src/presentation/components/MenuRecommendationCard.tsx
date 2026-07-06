import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function MenuRecommendationCard({ calories, dailyTarget }: { calories: number; dailyTarget: number }) {
  const percentage = dailyTarget > 0 ? Math.min(Math.round((calories / dailyTarget) * 100), 100) : 0;
  return <View style={styles.card}>
    <View style={styles.badge}><Text style={styles.badgeText}>RECOMENDADO PARA TI</Text></View>
    <Text style={styles.title}>Menú personalizado</Text>
    <Text style={styles.text}>Esta selección fue generada para acercarse a tus necesidades energéticas y preferencias.</Text>
    <View style={styles.metrics}><Text style={styles.calories}>{Math.round(calories)} kcal</Text><Text style={styles.target}>de {Math.round(dailyTarget)} kcal diarias</Text></View>
    <View style={styles.track}><View style={[styles.progress, { width: `${percentage}%` }]} /></View>
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#F2F8EC', borderWidth: 1, borderColor: colors.primary, borderRadius: 16, padding: 14, marginBottom: 10 },
  badge: { alignSelf: 'flex-start', backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },
  title: { color: colors.text, fontSize: 17, fontWeight: '900', marginTop: 10 },
  text: { color: colors.muted, lineHeight: 19, marginTop: 4 },
  metrics: { flexDirection: 'row', alignItems: 'baseline', marginTop: 12 },
  calories: { color: colors.primaryDark, fontSize: 21, fontWeight: '900' },
  target: { color: colors.muted, fontSize: 12, marginLeft: 6 },
  track: { height: 7, backgroundColor: '#DCE8D3', borderRadius: 4, overflow: 'hidden', marginTop: 8 },
  progress: { height: '100%', backgroundColor: colors.primary },
});
