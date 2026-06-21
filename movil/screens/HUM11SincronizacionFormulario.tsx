import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

export default function HUM11SincronizacionFormulario({ navigation }: any) {
  const handleTerminar = () => {
    // Guardar formulario y navegar al home
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.titulo}>Paso 7/7</Text>
        </View>

        {/* Progress bar - completa */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View style={[styles.progressBar, { width: '100%' }]} />
          </View>
        </View>

        {/* Contenedor de confirmacion */}
        <View style={styles.confirmacionContainer}>
          {/* Icono checkmark */}
          <View style={styles.checkCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>

          {/* Titulo */}
          <Text style={styles.tituloConfirmacion}>Formulario Completado</Text>

          {/* Descripcion */}
          <Text style={styles.descripcion}>
            Excelente! Tu perfil ha sido sincronizado correctamente. La nutricionista revisara tu informacion y preparara tu plan personalizado.
          </Text>

          {/* Resumen de datos */}
          <View style={styles.resumenContainer}>
            <View style={styles.resumenItem}>
              <Text style={styles.resumenLabel}>Estado:</Text>
              <Text style={styles.resumenValor}>Perfil completado</Text>
            </View>
            <View style={styles.resumenItem}>
              <Text style={styles.resumenLabel}>Proxima accion:</Text>
              <Text style={styles.resumenValor}>Espera el plan personalizado</Text>
            </View>
            <View style={styles.resumenItem}>
              <Text style={styles.resumenLabel}>Sincronizacion:</Text>
              <Text style={styles.resumenValor}>Completada con exito</Text>
            </View>
          </View>
        </View>

        {/* Botones de accion */}
        <TouchableOpacity
          style={styles.botonTerminar}
          onPress={handleTerminar}
        >
          <Text style={styles.botonTexto}>Ir a Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonEditar}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.botonEditarTexto}>Editar Formulario</Text>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  progressContainer: {
    marginBottom: 40,
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
  confirmacionContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkMark: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
  },
  tituloConfirmacion: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  descripcion: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  resumenContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 15,
  },
  resumenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  resumenLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },
  resumenValor: {
    fontSize: 13,
    color: '#000',
    fontWeight: 'bold',
  },
  botonTerminar: {
    backgroundColor: '#FFC107',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  botonTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  botonEditar: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FFC107',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  botonEditarTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFC107',
  },
});
