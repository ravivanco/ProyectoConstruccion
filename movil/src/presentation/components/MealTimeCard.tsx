import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MealConfig } from '../../domain/models/WeeklyMenu';
import { colors } from '../theme';

export function MealTimeCard({ meal }: { meal: MealConfig }) {
  const totalCalories = meal.assignedMenus.reduce((total, menu) => total + menu.calories, 0);
  return <View style={styles.card}>
    <View style={styles.header}>
      <View><Text style={styles.name}>{meal.name}</Text><Text style={styles.time}>{meal.suggestedTime}</Text></View>
      <Text style={styles.calories}>{Math.round(totalCalories)} kcal</Text>
    </View>
    {meal.assignedMenus.length
      ? meal.assignedMenus.map((menu) => <View key={menu.id} style={styles.menu}><Text style={styles.menuName}>{menu.name}</Text><Text style={styles.menuMeta}>{menu.portion || 'Porción indicada'} · {Math.round(menu.calories)} kcal</Text></View>)
      : <Text style={styles.empty}>Sin comida asignada.</Text>}
  </View>;
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, backgroundColor: '#FFF', marginTop: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: colors.text, fontSize: 16, fontWeight: '900' },
  time: { color: colors.muted, fontSize: 12, marginTop: 2 },
  calories: { color: colors.primaryDark, fontWeight: '900' },
  menu: { borderTopWidth: 1, borderTopColor: '#EEF1EC', marginTop: 10, paddingTop: 10 },
  menuName: { color: colors.text, fontWeight: '700' },
  menuMeta: { color: colors.muted, fontSize: 12, marginTop: 3 },
  empty: { color: colors.muted, fontStyle: 'italic', marginTop: 10 },
});
