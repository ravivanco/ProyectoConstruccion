import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PatientProfile } from '../../domain/models/Profile';
import { Button, Card, Field } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

export function ProfileScreen({ onBack }: { onBack(): void }) {
  const { getProfile, profile, saveProfile } = useApp();
  const [loadedProfile, setLoadedProfile] = useState<PatientProfile | null>(profile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PatientProfile>(profile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const loaded = await getProfile();
      setLoadedProfile(loaded);
      setDraft(loaded ?? profile);
    }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'No se pudo consultar tu perfil.'); }
    finally { setLoading(false); }
  }, [getProfile]);

  useEffect(() => { void load(); }, [load]);

  const current = loadedProfile ?? profile;

  async function save() {
    await saveProfile(draft);
    setLoadedProfile(draft);
    setEditing(false);
  }

  return <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Mi perfil</Text>
    {loading ? <Card><ActivityIndicator color={colors.primary} /><Text style={styles.center}>Consultando tu información personal…</Text></Card> : null}
    {!loading && error ? <Card><Text style={styles.cardTitle}>No pudimos cargar tu perfil</Text><Text style={styles.center}>{error}</Text><Button label="Reintentar" onPress={load} /></Card> : null}
    {!loading && !error ? <>
      <Card>
        <Text style={styles.cardTitle}>Datos personales</Text>
        <Info label="Nombre" value={current.fullName} />
        <Info label="Correo" value={current.email} />
        <Info label="Teléfono" value={current.phone} />
        <Info label="Formulario inicial" value={current.completed ? 'Completo' : 'Pendiente'} />
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Datos clínicos básicos</Text>
        <Info label="Edad" value={current.age ? `${current.age} años` : undefined} />
        <Info label="Sexo" value={current.sex === 'female' ? 'Femenino' : current.sex === 'male' ? 'Masculino' : undefined} />
        <Info label="Estatura" value={current.heightCm ? `${current.heightCm} cm` : undefined} />
        <Info label="Peso" value={current.weightKg ? `${current.weightKg} kg` : undefined} />
        <Info label="Actividad física" value={current.activityLevel} />
        <Info label="Objetivo nutricional" value={current.nutritionGoal} />
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Hábitos y preferencias</Text>
        {editing ? <>
          <Field label="Condiciones médicas" value={joinList(draft.medicalConditions) ?? ''} onChangeText={(text) => setDraft((value) => ({ ...value, medicalConditions: splitList(text) }))} />
          <Field label="Alergias" value={joinList(draft.allergies) ?? ''} onChangeText={(text) => setDraft((value) => ({ ...value, allergies: splitList(text) }))} />
          <Field label="Intolerancias" value={joinList(draft.intolerances) ?? ''} onChangeText={(text) => setDraft((value) => ({ ...value, intolerances: splitList(text) }))} />
          <Field label="Deportes o actividad" value={joinList(draft.sports) ?? ''} onChangeText={(text) => setDraft((value) => ({ ...value, sports: splitList(text) }))} />
          <Field label="Preferencias alimenticias" value={joinList(draft.foodPreferences) ?? ''} onChangeText={(text) => setDraft((value) => ({ ...value, foodPreferences: splitList(text) }))} />
          <Field label="Restricciones alimenticias" value={joinList(draft.foodRestrictions) ?? ''} onChangeText={(text) => setDraft((value) => ({ ...value, foodRestrictions: splitList(text) }))} />
          <Button label="Guardar cambios" onPress={() => { void save(); }} />
          <Button secondary label="Cancelar edición" onPress={() => { setDraft(current); setEditing(false); }} />
        </> : <>
          <Info label="Condiciones" value={joinList(current.medicalConditions)} />
          <Info label="Alergias" value={joinList(current.allergies)} />
          <Info label="Intolerancias" value={joinList(current.intolerances)} />
          <Info label="Deportes" value={joinList(current.sports)} />
          <Info label="Preferencias" value={joinList(current.foodPreferences)} />
          <Info label="Restricciones" value={joinList(current.foodRestrictions)} />
          <Button label="Editar perfil inicial" onPress={() => { setDraft(current); setEditing(true); }} />
        </>}
      </Card>
    </> : null}
    <Button secondary label="Volver al inicio" onPress={onBack} />
  </ScrollView>;
}

function Info({ label, value }: { label: string; value?: string }) {
  return <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value || 'No registrado'}</Text></View>;
}

function joinList(values: string[]) {
  return values.length ? values.join(', ') : undefined;
}

function splitList(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 48, gap: 14 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900' },
  cardTitle: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 10 },
  center: { color: colors.muted, lineHeight: 21, textAlign: 'center', marginTop: 10 },
  infoRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 10 },
  infoLabel: { color: colors.muted, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  infoValue: { color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 3 },
});
