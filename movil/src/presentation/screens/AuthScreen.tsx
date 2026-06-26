import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Sex } from '../../domain/models/Auth';
import { ApiError } from '../../infrastructure/api/HttpClient';
import { Button, Card, Choice, Field } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

const sexLabels: Record<Sex, string> = { female: 'Femenino', male: 'Masculino', other: 'Otro' };
export function AuthScreen() {
  const { login, register } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', sex: '' as Sex | '', birthDate: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setMessage('');
    if (!form.email.trim() || !form.password) return setMessage('Completa el correo y la contraseña.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setMessage('Ingresa un correo válido.');
    if (mode === 'register' && (!form.firstName.trim() || !form.lastName.trim() || !form.sex || !/^\d{4}-\d{2}-\d{2}$/.test(form.birthDate))) return setMessage('Completa nombres, apellidos, sexo y fecha en formato AAAA-MM-DD.');
    setLoading(true);
    try {
      if (mode === 'login') await login({ email: form.email.trim(), password: form.password });
      else await register({ ...form, sex: form.sex as Sex, email: form.email.trim(), firstName: form.firstName.trim(), lastName: form.lastName.trim() });
    } catch (error) { setMessage(error instanceof ApiError && error.status === 401 ? 'Correo o contraseña incorrectos.' : error instanceof Error ? error.message : 'Ocurrió un error inesperado.'); }
    finally { setLoading(false); }
  };
  return <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
    <Text style={styles.brand}>DK-FITT</Text><Text style={styles.subtitle}>{mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta de paciente'}</Text><Card>
      {mode === 'register' ? <><Field label="Nombres" value={form.firstName} onChangeText={(firstName) => setForm({ ...form, firstName })} /><Field label="Apellidos" value={form.lastName} onChangeText={(lastName) => setForm({ ...form, lastName })} /></> : null}
      <Field label="Correo" autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={(email) => setForm({ ...form, email })} /><Field label="Contraseña" secureTextEntry value={form.password} onChangeText={(password) => setForm({ ...form, password })} />
      {mode === 'register' ? <><Text style={styles.label}>Sexo</Text><View>{(['female', 'male', 'other'] as Sex[]).map((sex) => <Choice key={sex} label={sexLabels[sex]} selected={form.sex === sex} onPress={() => setForm({ ...form, sex })} />)}</View><Field label="Fecha de nacimiento" placeholder="AAAA-MM-DD" value={form.birthDate} onChangeText={(birthDate) => setForm({ ...form, birthDate })} /></> : null}
      {message ? <Text style={styles.error}>{message}</Text> : null}<Button disabled={loading} label={loading ? 'Procesando…' : mode === 'login' ? 'Iniciar sesión' : 'Registrarme'} onPress={submit} /><Button secondary label={mode === 'login' ? 'Crear una cuenta' : 'Ya tengo una cuenta'} onPress={() => { setMessage(''); setMode(mode === 'login' ? 'register' : 'login'); }} />
    </Card></ScrollView></KeyboardAvoidingView>;
}
const styles = StyleSheet.create({ flex: { flex: 1 }, container: { flexGrow: 1, justifyContent: 'center', padding: 20 }, brand: { color: colors.primaryDark, fontSize: 34, fontWeight: '900', textAlign: 'center' }, subtitle: { color: colors.muted, textAlign: 'center', marginBottom: 24, fontSize: 16 }, label: { color: colors.text, fontWeight: '700', marginBottom: 6 }, error: { color: colors.danger, textAlign: 'center', marginTop: 4 } });
