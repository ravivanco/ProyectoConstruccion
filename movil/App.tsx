import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { AppProvider, useApp } from './src/presentation/context/AppContext';
import { AuthScreen } from './src/presentation/screens/AuthScreen';
import { CalorieControlScreen } from './src/presentation/screens/CalorieControlScreen';
import { HomeScreen } from './src/presentation/screens/HomeScreen';
import { MyPlanScreen } from './src/presentation/screens/MyPlanScreen';
import { OnboardingScreen } from './src/presentation/screens/OnboardingScreen';

function PatientArea() {
  const [screen, setScreen] = useState<'home' | 'plan' | 'calories'>('home');
  if (screen === 'plan') return <MyPlanScreen onBack={() => setScreen('home')} />;
  if (screen === 'calories') return <CalorieControlScreen onBack={() => setScreen('home')} />;
  return <HomeScreen onOpenPlan={() => setScreen('plan')} onOpenCalories={() => setScreen('calories')} />;
}

function AppContent() {
  const { session } = useApp();
  return <SafeAreaView style={styles.container}><StatusBar style="dark" />{!session.authenticated ? <AuthScreen /> : session.completed ? <PatientArea /> : <OnboardingScreen />}</SafeAreaView>;
}

export default function App() { return <AppProvider><AppContent /></AppProvider>; }
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F8FAF7' } });
