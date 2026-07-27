import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CalorieDashboard } from '../../domain/models/CalorieDashboard';
import { NutritionPlanStatus } from '../../domain/models/NutritionPlan';
import { PatientProfile } from '../../domain/models/Profile';
import { PlanStatusCard } from '../components/PlanStatusCard';
import { Button, Card } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

export function HomeScreen({ onOpenPlan, onOpenCalories, onOpenExercises, onOpenProgress, onOpenMealAlerts, onOpenProfile }: { onOpenPlan(): void; onOpenCalories(): void; onOpenExercises(): void; onOpenProgress(): void; onOpenMealAlerts(): void; onOpenProfile(): void }) {
  const { getCalorieDashboard, getPlanStatus, getProfile, reset } = useApp();
  const [status, setStatus] = useState<NutritionPlanStatus | null>(null);
  const [calorieDashboard, setCalorieDashboard] = useState<CalorieDashboard | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadStatus = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [planStatus, dashboard, loadedProfile] = await Promise.all([getPlanStatus(), getCalorieDashboard(), getProfile()]);
      setStatus(planStatus);
      setCalorieDashboard(dashboard);
      setPatientProfile(loadedProfile);
    }
    catch { setError('No se pudo actualizar el estado de Mi Plan.'); }
    finally { setLoading(false); }
  }, [getCalorieDashboard, getPlanStatus, getProfile]);
  useEffect(() => { void loadStatus(); }, [loadStatus]);

  return <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStatus} />}>
    <Text style={styles.brand}>DK-FITT</Text>
    <Text style={styles.title}>Hola, este es tu espacio</Text>
    <Card>
      <Text style={styles.cardTitle}>Mi Plan</Text>
      <Text style={styles.text}>Consulta el estado de tu planificación nutricional.</Text>
      <Text style={styles.highlight}>Tratamiento: {formatTreatmentStatus(patientProfile?.treatmentStatus)}</Text>
      <View style={styles.status}>{loading ? <ActivityIndicator color={colors.primary} /> : status ? <PlanStatusCard status={status} /> : <Text style={styles.empty}>{error || 'Aún no tienes un plan asignado.'}</Text>}</View>
      <Button label="Ver Mi Plan" onPress={onOpenPlan} />
    </Card>
    <Card>
      <Text style={styles.cardTitle}>Control calórico</Text>
      <Text style={styles.text}>Revisa tu meta energética, comidas y alimentos adicionales de hoy.</Text>
      {calorieDashboard ? <Text style={styles.highlight}>Requerimiento actualizado: {Math.round(calorieDashboard.plannedCalories)} kcal</Text> : <Text style={styles.text}>Sin actualización calórica disponible todavía.</Text>}
      <Button label="Ver control calórico" onPress={onOpenCalories} />
    </Card>
    <Card>
      <Text style={styles.cardTitle}>Ejercicios</Text>
      <Text style={styles.text}>Consulta el catálogo, recomendaciones y ejercicios programados.</Text>
      <Button label="Ver ejercicios" onPress={onOpenExercises} />
    </Card>
    <Card>
      <Text style={styles.cardTitle}>Progreso</Text>
      <Text style={styles.text}>Registra tu peso diario y revisa tu evolución.</Text>
      <Button label="Ver progreso" onPress={onOpenProgress} />
    </Card>
    <Card>
      <Text style={styles.cardTitle}>Alertas de comidas</Text>
      <Text style={styles.text}>Activa recordatorios locales para desayuno, colaciones, almuerzo y cena.</Text>
      <Button label="Configurar alertas" onPress={onOpenMealAlerts} />
    </Card>
    <Card>
      <Text style={styles.cardTitle}>Mi perfil</Text>
      <Text style={styles.text}>Consulta tu información personal, clínica básica y estado del formulario.</Text>
      <Button label="Ver perfil" onPress={onOpenProfile} />
    </Card>
    <Button secondary label="Cerrar sesión" onPress={reset} />
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 48, gap: 14 },
  brand: { color: colors.primaryDark, fontSize: 20, fontWeight: '900' },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 8, marginBottom: 24 },
  cardTitle: { color: colors.text, fontSize: 22, fontWeight: '800' },
  text: { color: colors.muted, lineHeight: 21, marginTop: 8 },
  highlight: { color: colors.primaryDark, fontWeight: '900', marginTop: 10 },
  status: { marginTop: 16 },
  empty: { color: colors.muted, textAlign: 'center', paddingVertical: 12 },
});

function formatTreatmentStatus(status?: string) {
  if (status === 'active') return 'Activo';
  if (status === 'suspended') return 'Suspendido';
  if (status === 'finished') return 'Finalizado';
  return 'Pendiente';
}
