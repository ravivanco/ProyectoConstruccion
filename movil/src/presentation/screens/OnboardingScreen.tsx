import React, { ReactNode, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityLevel, NutritionGoal, PatientProfile } from '../../domain/models/Profile';
import { Button, Card, Choice, Field } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

const activities: Array<[ActivityLevel, string]> = [['sedentary', 'Sedentaria'], ['light', 'Ligera'], ['moderate', 'Moderada'], ['high', 'Alta']];
const goals: Array<[NutritionGoal, string]> = [['lose_weight', 'Bajar de peso'], ['maintain_weight', 'Mantener peso'], ['gain_muscle', 'Ganar masa muscular']];
const catalogs = { medicalConditions: ['Hipertensión', 'Diabetes', 'Gastritis', 'Colesterol alto'], sports: ['Caminata', 'Gimnasio', 'Ciclismo', 'Fútbol', 'Natación'], foodPreferences: ['Vegetales', 'Frutas', 'Carnes', 'Pescados', 'Legumbres'] } as const;
type ListKey = 'medicalConditions' | 'allergies' | 'intolerances' | 'sports' | 'foodPreferences' | 'foodRestrictions';
const toggle = (values: string[], value: string) => values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

export function OnboardingScreen() {
  const { profile, updateProfile, completeProfile } = useApp();
  const [step, setStep] = useState(0);
  const [drafts, setDrafts] = useState({ allergies: '', intolerances: '', foodRestrictions: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const total = 8;

  const multi = (key: ListKey, options: readonly string[], allowNone = true) => {
    const selected = profile[key];
    return <>{options.map((option) => <Choice key={option} label={option} selected={selected.includes(option)} onPress={() => updateProfile({ [key]: toggle(selected.filter((item) => item !== 'Ninguna'), option) })} />)}{allowNone ? <Choice label="Ninguna" selected={selected.includes('Ninguna')} onPress={() => updateProfile({ [key]: selected.includes('Ninguna') ? [] : ['Ninguna'] })} /> : null}</>;
  };
  const manualList = (key: 'allergies' | 'intolerances' | 'foodRestrictions') => {
    const add = () => { const value = drafts[key].trim(); if (!value) return; updateProfile({ [key]: [...profile[key].filter((item) => item !== 'Ninguna'), value] }); setDrafts({ ...drafts, [key]: '' }); };
    return <><Field label="Agregar manualmente" value={drafts[key]} onChangeText={(value) => setDrafts({ ...drafts, [key]: value })} placeholder="Escribe una opción" /><Button secondary label="Agregar" onPress={add} />{profile[key].map((value) => <Choice key={value} label={`${value} · tocar para quitar`} selected onPress={() => updateProfile({ [key]: profile[key].filter((item) => item !== value) })} />)}<Choice label="Ninguna" selected={profile[key].includes('Ninguna')} onPress={() => updateProfile({ [key]: ['Ninguna'] })} /></>;
  };
  const screens: Array<{ title: string; description: string; content: ReactNode }> = [
    { title: 'Actividad física', description: 'Selecciona tu nivel habitual.', content: activities.map(([value, label]) => <Choice key={value} label={label} selected={profile.activityLevel === value} onPress={() => updateProfile({ activityLevel: value })} />) },
    { title: 'Condiciones médicas', description: 'Selecciona una o varias condiciones.', content: multi('medicalConditions', catalogs.medicalConditions) },
    { title: 'Alergias e intolerancias', description: 'Registra cada dato o indica que no aplica.', content: <><Text style={styles.section}>Alergias</Text>{manualList('allergies')}<Text style={styles.section}>Intolerancias</Text>{manualList('intolerances')}</> },
    { title: 'Objetivo nutricional', description: 'Elige tu meta principal.', content: goals.map(([value, label]) => <Choice key={value} label={label} selected={profile.nutritionGoal === value} onPress={() => updateProfile({ nutritionGoal: value })} />) },
    { title: 'Deporte habitual', description: 'Puedes seleccionar varias actividades.', content: multi('sports', catalogs.sports) },
    { title: 'Preferencias alimenticias', description: 'Selecciona los alimentos que prefieres.', content: multi('foodPreferences', catalogs.foodPreferences, false) },
    { title: 'Restricciones alimenticias', description: 'Agrega alimentos que deseas evitar.', content: manualList('foodRestrictions') },
    { title: 'Revisa tu información', description: 'Al finalizar se enviará el perfil completo.', content: <Summary profile={profile} /> },
  ];
  const current = screens[step];
  if (!current) return null;
  const next = async () => {
    setError('');
    if (step === 0 && !profile.activityLevel) return setError('Selecciona un nivel de actividad.');
    if (step === 3 && !profile.nutritionGoal) return setError('Selecciona un objetivo nutricional.');
    if (step < total - 1) return setStep(step + 1);
    setLoading(true);
    try { await completeProfile(); } catch (caught) { setError(caught instanceof Error ? caught.message : 'No se pudo guardar el formulario.'); } finally { setLoading(false); }
  };
  return <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled"><Text style={styles.progress}>Paso {step + 1} de {total}</Text><View style={styles.track}><View style={[styles.fill, { width: `${((step + 1) / total) * 100}%` }]} /></View><Text style={styles.title}>{current.title}</Text><Text style={styles.description}>{current.description}</Text><Card>{current.content}{error ? <Text style={styles.error}>{error}</Text> : null}<View style={styles.actions}>{step > 0 ? <Button secondary label="Atrás" onPress={() => { setError(''); setStep(step - 1); }} /> : null}<Button disabled={loading} label={step === total - 1 ? loading ? 'Guardando…' : 'Finalizar formulario' : 'Continuar'} onPress={next} /></View></Card></ScrollView>;
}

function Summary({ profile }: { profile: PatientProfile }) {
  const rows = [['Actividad', profile.activityLevel], ['Condiciones', profile.medicalConditions.join(', ')], ['Alergias', profile.allergies.join(', ')], ['Intolerancias', profile.intolerances.join(', ')], ['Objetivo', profile.nutritionGoal], ['Deportes', profile.sports.join(', ')], ['Preferencias', profile.foodPreferences.join(', ')], ['Restricciones', profile.foodRestrictions.join(', ')]];
  return <>{rows.map(([label, value]) => <View key={label} style={styles.summary}><Text style={styles.summaryLabel}>{label}</Text><Text style={styles.summaryValue}>{value || 'Sin información'}</Text></View>)}</>;
}
const styles = StyleSheet.create({ container: { padding: 20, paddingBottom: 40 }, progress: { color: colors.primaryDark, fontWeight: '800' }, track: { height: 8, borderRadius: 8, backgroundColor: colors.border, overflow: 'hidden', marginVertical: 10 }, fill: { height: 8, backgroundColor: colors.primary }, title: { color: colors.text, fontWeight: '900', fontSize: 28, marginTop: 10 }, description: { color: colors.muted, marginBottom: 20 }, section: { fontSize: 17, fontWeight: '800', color: colors.text, marginVertical: 12 }, error: { color: colors.danger, textAlign: 'center', marginTop: 12 }, actions: { marginTop: 8 }, summary: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 10 }, summaryLabel: { color: colors.muted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }, summaryValue: { color: colors.text, marginTop: 3 } });
