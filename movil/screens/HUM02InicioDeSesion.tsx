import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';

export default function HUM02InicioDeSesion({ navigation }: any) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const handleLogin = () => {
    if (!correo || !contrasena) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    Alert.alert('Exito', 'Sesion iniciada');
    // Navegar al perfil o formulario
    navigation.navigate('HUM03');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoTexto}>DK Fitt</Text>
          <Text style={styles.logoSubtexto}>La salud es vida</Text>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          {/* Correo */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>✉</Text>
            <TextInput
              style={styles.input}
              placeholder="Correo"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={correo}
              onChangeText={setCorreo}
            />
          </View>

          {/* Contrasena */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Contrasena"
              placeholderTextColor="#999"
              secureTextEntry={!mostrarContrasena}
              value={contrasena}
              onChangeText={setContrasena}
            />
            <TouchableOpacity
              onPress={() => setMostrarContrasena(!mostrarContrasena)}
              style={styles.eyeIcon}
            >
              <Text>👁</Text>
            </TouchableOpacity>
          </View>

          {/* Enlace recuperar contrasena */}
          <TouchableOpacity style={styles.olvidoContainer}>
            <Text style={styles.olvidoTexto}>Olvido su contrasena?</Text>
          </TouchableOpacity>

          {/* Boton Ingresar */}
          <TouchableOpacity
            style={styles.botonIngresar}
            onPress={handleLogin}
          >
            <Text style={styles.botonTexto}>Ingresar</Text>
          </TouchableOpacity>

          {/* Enlace registro */}
          <View style={styles.registroLink}>
            <Text style={styles.registroText}>No tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('HUM01')}>
              <Text style={styles.registroLinkText}>Registrate</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
    marginTop: 40,
  },
  logoTexto: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  logoSubtexto: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#000',
  },
  eyeIcon: {
    padding: 10,
  },
  olvidoContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  olvidoTexto: {
    fontSize: 12,
    color: '#999',
  },
  botonIngresar: {
    backgroundColor: '#FFC107',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  botonTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  registroLink: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registroText: {
    fontSize: 14,
    color: '#999',
  },
  registroLinkText: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
  },
});
