import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { AppProvider, useApp } from './src/presentation/context/AppContext';
import { AuthScreen } from './src/presentation/screens/AuthScreen';
import { OnboardingScreen } from './src/presentation/screens/OnboardingScreen';
import { SuccessScreen } from './src/presentation/screens/SuccessScreen';

function AppContent() {
  const { session } = useApp();
  return <SafeAreaView style={styles.container}><StatusBar style="dark" />{!session.authenticated ? <AuthScreen /> : session.completed ? <SuccessScreen /> : <OnboardingScreen />}</SafeAreaView>;
}

export default function App() { return <AppProvider><AppContent /></AppProvider>; }
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F8FAF7' } });
