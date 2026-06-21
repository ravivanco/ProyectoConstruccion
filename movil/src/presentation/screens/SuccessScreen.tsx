import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '../components/ui';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';
export function SuccessScreen() { const { reset } = useApp(); return <View style={styles.container}><Card><Text style={styles.icon}>✓</Text><Text style={styles.title}>Perfil completado</Text><Text style={styles.text}>Tu formulario se guardó correctamente y ya está disponible para la nutricionista.</Text><Button label="Volver al inicio" onPress={reset} /></Card></View>; }
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: 20 }, icon: { alignSelf: 'center', color: '#FFF', backgroundColor: colors.primary, width: 62, height: 62, borderRadius: 31, textAlign: 'center', textAlignVertical: 'center', fontSize: 34, fontWeight: '900' }, title: { textAlign: 'center', color: colors.text, fontSize: 27, fontWeight: '900', marginTop: 16 }, text: { textAlign: 'center', color: colors.muted, lineHeight: 21, marginVertical: 12 } });
