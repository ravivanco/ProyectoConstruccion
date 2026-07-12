import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { AppProvider, useApp } from './src/presentation/context/AppContext';
import { AuthScreen } from './src/presentation/screens/AuthScreen';
import { CalorieControlScreen } from './src/presentation/screens/CalorieControlScreen';
import { ExercisesScreen } from './src/presentation/screens/ExercisesScreen';
import { HomeScreen } from './src/presentation/screens/HomeScreen';
import { MyPlanScreen } from './src/presentation/screens/MyPlanScreen';
import { OnboardingScreen } from './src/presentation/screens/OnboardingScreen';
import { ProgressScreen } from './src/presentation/screens/ProgressScreen';

function PatientArea() {
  const [screen, setScreen] = useState<'home' | 'plan' | 'calories' | 'exercises' | 'progress'>('home');
  if (screen === 'plan') return <MyPlanScreen onBack={() => setScreen('home')} />;
  if (screen === 'calories') return <CalorieControlScreen onBack={() => setScreen('home')} />;
  if (screen === 'exercises') return <ExercisesScreen onBack={() => setScreen('home')} />;
  if (screen === 'progress') return <ProgressScreen onBack={() => setScreen('home')} />;
  return <HomeScreen onOpenPlan={() => setScreen('plan')} onOpenCalories={() => setScreen('calories')} onOpenExercises={() => setScreen('exercises')} onOpenProgress={() => setScreen('progress')} />;
}

function AppContent() {
  const { session } = useApp();
  return <SafeAreaView style={styles.container}><StatusBar style="dark" />{!session.authenticated ? <AuthScreen /> : session.completed ? <PatientArea /> : <OnboardingScreen />}</SafeAreaView>;
}

export default function App() { return <AppProvider><AppContent /></AppProvider>; }
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F8FAF7' } });
