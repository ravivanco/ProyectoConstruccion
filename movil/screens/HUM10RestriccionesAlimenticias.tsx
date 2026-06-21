import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

export default function HUM10RestriccionesAlimenticias({ navigation }: any) {
  const [texto, setTexto] = useState('');

  const handleContinuar = () => {
    navigation.navigate('HUM11');
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
          <Text style={styles.titulo}>Paso 6/7</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View style={[styles.progressBar, { width: '85.71%' }]} />
          </View>
        </View>

        {/* Pregunta */}
        <Text style={styles.pregunta}>
          Hay alimentos que no le gustan o que prefiere evitar?
        </Text>
        <Text style={styles.descripcion}>
          Compartenos cualquier restriccion o preferencia especial.
        </Text>

        {/* TextArea */}
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Especifique cual.."
            placeholderTextColor="#ccc"
            multiline
            numberOfLines={8}
            value={texto}
            onChangeText={setTexto}
            textAlignVertical="top"
          />
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
  textAreaContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
  },
  textArea: {
    fontSize: 14,
    color: '#000',
    maxHeight: 150,
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
