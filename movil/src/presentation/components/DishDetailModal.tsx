import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Dish } from '../../domain/models/Dish';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';
import { Button, Card } from './ui';

export function DishDetailModal({ dishId, onClose }: { dishId: string | null; onClose(): void }) {
  const { getDish } = useApp();
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!dishId) return;
    let active = true;
    setDish(null); setError(''); setLoading(true);
    getDish(dishId).then((result) => { if (active) setDish(result); }).catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar la receta.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [dishId, getDish]);

  return <Modal visible={Boolean(dishId)} animationType="slide" onRequestClose={onClose}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>DETALLE DE COMIDA</Text>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {!loading && error ? <Card><Text style={styles.center}>{error}</Text></Card> : null}
      {!loading && !error && !dish ? <Card><Text style={styles.center}>La receta no está disponible.</Text></Card> : null}
      {dish ? <>
        <Text style={styles.title}>{dish.name}</Text>
        <Text style={styles.meta}>{dish.defaultPortion || 'Porción indicada'} · {Math.round(dish.calories)} kcal</Text>
        <Card><Text style={styles.section}>Ingredientes</Text>{dish.ingredients.length ? dish.ingredients.map((ingredient, index) => <View key={`${ingredient.name}-${index}`} style={styles.ingredient}><Text style={styles.ingredientName}>{ingredient.name}</Text><Text style={styles.quantity}>{ingredient.quantity}</Text></View>) : <Text style={styles.center}>Sin ingredientes registrados.</Text>}</Card>
        <Card><Text style={styles.section}>Preparación</Text><Text style={styles.preparation}>{dish.preparation || 'La preparación aún no fue registrada.'}</Text></Card>
      </> : null}
      <Button secondary label="Cerrar detalle" onPress={onClose} />
    </ScrollView>
  </Modal>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: 20, paddingTop: 48, gap: 14 },
  eyebrow: { color: colors.primaryDark, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900' },
  meta: { color: colors.muted },
  section: { color: colors.text, fontSize: 20, fontWeight: '900', marginBottom: 12 },
  ingredient: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#EEF1EC', paddingVertical: 10 },
  ingredientName: { color: colors.text, flex: 1, fontWeight: '600' },
  quantity: { color: colors.primaryDark, fontWeight: '800', marginLeft: 12 },
  preparation: { color: colors.muted, lineHeight: 22 },
  center: { color: colors.muted, textAlign: 'center', lineHeight: 21 },
});
