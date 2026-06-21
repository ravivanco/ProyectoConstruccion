import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

export default function HUM07ObjetivoNutricional({ navigation }: any) {
  const [seleccionada, setSeleccionada] = useState<string | null>(null);

  const handleContinuar = () => {
    navigation.navigate('HUM08');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>Paso 4/7</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View style={[styles.progressBar, { width: '57.14%' }]} />
          </View>
        </View>

        {/* Pregunta */}
        <Text style={styles.pregunta}>Cual es tu objetivo?</Text>
        <Text style={styles.descripcion}>
          Elige la meta principal que quieres alcanzar.
        </Text>

        {/* Opciones */}
        {[
          {
            id: 'perder',
            titulo: 'Reducir peso',
            desc: 'Plan enfocado en deficit calorifico controlado',
            icon: '⚖',
            selected: seleccionada === 'perder',
          },
          {
            id: 'ganar',
            titulo: 'Ganar musculo',
            desc: 'Mayor aporte proteico y calorias de calidad',
            icon: '💪',
            selected: seleccionada === 'ganar',
          },
          {
            id: 'habitos',
            titulo: 'Mejorar habitos',
            desc: 'Alimentacion balanceada y sostenible',
            icon: '✨',
            selected: seleccionada === 'habitos',
          },
        ].map((opcion) => (
          <TouchableOpacity
            key={opcion.id}
            style={[
              styles.tarjeta,
              opcion.selected && styles.tarjetaSeleccionada,
            ]}
            onPress={() => setSeleccionada(opcion.id)}
          >
            <View style={styles.tarjetaIcon}>
              <Text style={styles.icon}>{opcion.icon}</Text>
            </View>
            <View style={styles.tarjetaContent}>
              <Text style={styles.tarjetaTitulo}>{opcion.titulo}</Text>
              <Text style={styles.tarjetaDesc}>{opcion.desc}</Text>
            </View>
            <View
              style={[
                styles.radioButton,
                opcion.selected && styles.radioButtonSeleccionado,
              ]}
            />
          </TouchableOpacity>
        ))}

        {/* Boton continuar */}
        <TouchableOpacity
          style={styles.botonContinuar}
          onPress={handleContinuar}
        >
          <Text style={styles.botonTexto}>Continuar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFC107',
  },
  pregunta: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  descripcion: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  tarjeta: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tarjetaSeleccionada: {
    borderColor: '#FFC107',
    backgroundColor: '#FFF9E6',
  },
  tarjetaIcon: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    fontSize: 32,
  },
  tarjetaContent: {
    flex: 1,
  },
  tarjetaTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  tarjetaDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  radioButtonSeleccionado: {
    borderColor: '#FFC107',
    backgroundColor: '#FFC107',
  },
  botonContinuar: {
    backgroundColor: '#FFC107',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  botonTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
