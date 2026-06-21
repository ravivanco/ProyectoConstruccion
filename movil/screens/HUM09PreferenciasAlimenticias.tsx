import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

export default function HUM09PreferenciasAlimenticias({ navigation }: any) {
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);

  const togglePreferencia = (id: string) => {
    if (seleccionadas.includes(id)) {
      setSeleccionadas(seleccionadas.filter((p) => p !== id));
    } else {
      setSeleccionadas([...seleccionadas, id]);
    }
  };

  const handleContinuar = () => {
    navigation.navigate('HUM10');
  };

  const alimentos = [
    // Proteinas
    'Pollo', 'Carne de Res', 'Pescado', 'Huevos', 'Legumbres', 'Atun', 'Pavo',
    // Carbohidratos
    'Arroz', 'Pan', 'Pasta', 'Papas', 'Avena', 'Quinoa', 'Batata',
    // Lacteos
    'Leche', 'Yogur', 'Queso', 'Cuna', 'Mantequilla', 'Crema', 'Requeson',
    // Vegetales
    'Brocoli', 'Zanahorias', 'Espinacas', 'Cebollas', 'Pimientos', 'Lechuga'
  ];

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
          <Text style={styles.titulo}>Paso 5/7</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View style={[styles.progressBar, { width: '71.43%' }]} />
          </View>
        </View>

        {/* Pregunta */}
        <Text style={styles.pregunta}>Que alimentos le gusta consumir con frecuencia?</Text>
        <Text style={styles.descripcion}>
          Selecciona todos los que formen parte de tu rutina habitual.
        </Text>

        {/* Pilulas */}
        <View style={styles.pillaContainer}>
          {alimentos.map((alimento) => (
            <TouchableOpacity
              key={alimento}
              style={[
                styles.pilla,
                seleccionadas.includes(alimento) && styles.pillaSeleccionada,
              ]}
              onPress={() => togglePreferencia(alimento)}
            >
              <Text
                style={[
                  styles.pillaTexto,
                  seleccionadas.includes(alimento) && styles.pillaTextoSeleccionado,
                ]}
              >
                {alimento}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
  pillaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  pilla: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 5,
  },
  pillaSeleccionada: {
    borderColor: '#FFC107',
    backgroundColor: '#FFC107',
  },
  pillaTexto: {
    fontSize: 13,
    color: '#000',
  },
  pillaTextoSeleccionado: {
    color: '#fff',
    fontWeight: 'bold',
  },
  botonContinuar: {
    backgroundColor: '#FFC107',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  botonTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
