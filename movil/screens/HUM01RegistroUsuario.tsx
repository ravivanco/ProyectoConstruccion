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

export default function HUM01RegistroUsuario({ navigation }: any) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState<string | null>(null);
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const handleRegistro = () => {
    if (!nombre || !apellido || !fechaNacimiento || !sexo || !correo || !contrasena) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    Alert.alert('Exito', 'Registro completado');
    // Navegar al flujo de onboarding
    navigation.navigate('HUM03');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo y titulo */}
        <View style={styles.header}>
          <Text style={styles.titulo}>Crear Cuenta</Text>
          <Text style={styles.subtitulo}>Completa tus datos para empezar</Text>
        </View>

        {/* Nombre */}
        <Text style={styles.label}>Nombre</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor="#999"
            value={nombre}
            onChangeText={setNombre}
          />
        </View>

        {/* Apellido */}
        <Text style={styles.label}>Apellido</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Apellido"
            placeholderTextColor="#999"
            value={apellido}
            onChangeText={setApellido}
          />
        </View>

        {/* Fecha de nacimiento */}
        <Text style={styles.label}>Fecha de nacimiento</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="dd/mm/aaaa"
            placeholderTextColor="#999"
            value={fechaNacimiento}
            onChangeText={setFechaNacimiento}
          />
        </View>

        {/* Edad (auto-calculada) */}
        <Text style={styles.label}>Edad</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Se calcula automaticamente"
            placeholderTextColor="#999"
            editable={false}
          />
        </View>

        {/* Sexo */}
        <Text style={styles.label}>Sexo</Text>
        <View style={styles.sexoContainer}>
          <TouchableOpacity
            style={[
              styles.sexoButton,
              sexo === 'masculino' && styles.sexoButtonActive,
            ]}
            onPress={() => setSexo('masculino')}
          >
            <Text
              style={[
                styles.sexoText,
                sexo === 'masculino' && styles.sexoTextActive,
              ]}
            >
              Masculino
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sexoButton,
              sexo === 'femenino' && styles.sexoButtonActive,
            ]}
            onPress={() => setSexo('femenino')}
          >
            <Text
              style={[
                styles.sexoText,
                sexo === 'femenino' && styles.sexoTextActive,
              ]}
            >
              Femenino
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sexoButton,
              sexo === 'otro' && styles.sexoButtonActive,
            ]}
            onPress={() => setSexo('otro')}
          >
            <Text
              style={[
                styles.sexoText,
                sexo === 'otro' && styles.sexoTextActive,
              ]}
            >
              Otro
            </Text>
          </TouchableOpacity>
        </View>

        {/* Correo electronico */}
        <Text style={styles.label}>Correo electronico</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Correo electronico"
            placeholderTextColor="#999"
            keyboardType="email-address"
            value={correo}
            onChangeText={setCorreo}
          />
        </View>

        {/* Contrasena */}
        <Text style={styles.label}>Contrasena</Text>
        <View style={styles.inputContainer}>
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

        {/* Boton Crear Cuenta */}
        <TouchableOpacity
          style={styles.botonCrear}
          onPress={handleRegistro}
        >
          <Text style={styles.botonTexto}>Crear Cuenta</Text>
        </TouchableOpacity>

        {/* Enlace a login */}
        <View style={styles.loginLink}>
          <Text style={styles.loginText}>Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('HUM02')}>
            <Text style={styles.loginLinkText}>Iniciar sesion</Text>
          </TouchableOpacity>
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
  },
  header: {
    marginBottom: 30,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subtitulo: {
    fontSize: 14,
    color: '#999',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: 15,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#000',
  },
  eyeIcon: {
    padding: 10,
  },
  sexoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sexoButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  sexoButtonActive: {
    borderColor: '#FFC107',
    backgroundColor: '#FFF9E6',
  },
  sexoText: {
    fontSize: 14,
    color: '#666',
  },
  sexoTextActive: {
    color: '#FFC107',
    fontWeight: 'bold',
  },
  botonCrear: {
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
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#999',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
  },
});
