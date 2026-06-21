import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';

export default function HUM03FormularioInicial({ navigation }: any) {
  const [pasoActual, setPasoActual] = useState(1);
  const [formData, setFormData] = useState({
    actividad: null,
    condiciones: [],
    alergias: '',
    objetivo: null,
    preferencias: [],
    restricciones: '',
    deporte: [],
  });

  const totalPasos = 7;
  const progreso = (pasoActual / totalPasos) * 100;

  const handleSiguiente = () => {
    if (pasoActual < totalPasos) {
      setPasoActual(pasoActual + 1);
    } else {
      // Sincronizar con backend
      Alert.alert('Exito', 'Formulario completado');
      navigation.navigate('HUM11');
    }
  };

  const handleAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1);
    }
  };

  const renderPaso = () => {
    switch (pasoActual) {
      case 1:
        return <Paso1Actividad />;
      case 2:
        return <Paso2Condiciones />;
      case 3:
        return <Paso3Alergias />;
      case 4:
        return <Paso4Objetivo />;
      case 5:
        return <Paso5Preferencias />;
      case 6:
        return <Paso6Restricciones />;
      case 7:
        return <Paso7Deporte />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Boton atras y titulo */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleAnterior} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>Paso {pasoActual}/{totalPasos}</Text>
        </View>

        {/* Barra de progreso */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressBar,
                { width: `${progreso}%` },
              ]}
            />
          </View>
        </View>

        {/* Contenido del paso */}
        {renderPaso()}

        {/* Boton continuar */}
        <TouchableOpacity
          style={styles.botonContinuar}
          onPress={handleSiguiente}
        >
          <Text style={styles.botonTexto}>Continuar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Componentes para cada paso
function Paso1Actividad() {
  const [seleccionada, setSeleccionada] = useState<string | null>(null);

  return (
    <View>
      <Text style={styles.pregunta}>Cual es tu nivel de actividad fisica?</Text>
      <Text style={styles.descripcion}>Selecciona la opcion que mejor describe tu rutina actual.</Text>

      {[
        { id: 'sedentario', titulo: 'Sedentario', desc: 'Poca o ninguna actividad fisica.' },
        { id: 'bajo', titulo: 'Bajo', desc: 'Caminar tareas domesticas, subir escaleras.' },
        { id: 'mediano', titulo: 'Mediano', desc: 'Deportes, gimnasio 1-2 veces por semana' },
        { id: 'alto', titulo: 'Alto', desc: 'Entrenamiento intenso, gimnasio 5-6 veces por semana' },
      ].map((opcion) => (
        <TouchableOpacity
          key={opcion.id}
          style={[
            styles.tarjeta,
            seleccionada === opcion.id && styles.tarjetaSeleccionada,
          ]}
          onPress={() => setSeleccionada(opcion.id)}
        >
          <View style={styles.tarjetaContent}>
            <Text style={styles.tarjetaTitulo}>{opcion.titulo}</Text>
            <Text style={styles.tarjetaDesc}>{opcion.desc}</Text>
          </View>
          <View
            style={[
              styles.radioButton,
              seleccionada === opcion.id && styles.radioButtonSeleccionado,
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Paso2Condiciones() {
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);

  const toggleCondicion = (id: string) => {
    if (seleccionadas.includes(id)) {
      setSeleccionadas(seleccionadas.filter((c) => c !== id));
    } else {
      setSeleccionadas([...seleccionadas, id]);
    }
  };

  return (
    <View>
      <Text style={styles.pregunta}>Padece de una condicion medica?</Text>
      <Text style={styles.descripcion}>Esta informacion nos ayuda a personalizar mejor su plan.</Text>

      {[
        { id: 'diabetes', titulo: 'Diabetes', desc: 'Control de azucar y alimentacion estable' },
        { id: 'hipertension', titulo: 'Hipertension arterial', desc: 'Monitoreo de sodio y presion arterial' },
        { id: 'hipotiroidismo', titulo: 'Hipotiroidismo', desc: 'Ajuste de energia y balance metabolico' },
        { id: 'resistencia', titulo: 'Resistencia a la insulina', desc: 'Seleccion de carbohidratos de bajo impacto' },
        { id: 'ninguna', titulo: 'Ninguna', desc: 'No tengo condiciones medicas actualmente' },
      ].map((opcion) => (
        <TouchableOpacity
          key={opcion.id}
          style={[
            styles.tarjeta,
            seleccionadas.includes(opcion.id) && styles.tarjetaSeleccionada,
          ]}
          onPress={() => toggleCondicion(opcion.id)}
        >
          <View style={styles.tarjetaContent}>
            <Text style={styles.tarjetaTitulo}>{opcion.titulo}</Text>
            <Text style={styles.tarjetaDesc}>{opcion.desc}</Text>
          </View>
          <View
            style={[
              styles.checkButton,
              seleccionadas.includes(opcion.id) && styles.checkButtonSeleccionado,
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Paso3Alergias() {
  const [texto, setTexto] = useState('');

  return (
    <View>
      <Text style={styles.pregunta}>Tienes alguna alergia o intolerancia?</Text>
      <Text style={styles.descripcion}>Escribe los alimentos o ingredientes que debes evitar.</Text>
      
      <View style={styles.textAreaContainer}>
        {/* TextArea placeholder */}
        <Text style={styles.textAreaPlaceholder}>Describe cual ..</Text>
      </View>
    </View>
  );
}

function Paso4Objetivo() {
  const [seleccionada, setSeleccionada] = useState<string | null>(null);

  return (
    <View>
      <Text style={styles.pregunta}>Cual es tu objetivo?</Text>
      <Text style={styles.descripcion}>Elige la meta principal que quieres alcanzar.</Text>

      {[
        { id: 'perder', titulo: 'Reducir peso', desc: 'Plan enfocado en deficit calorifico controlado' },
        { id: 'ganar', titulo: 'Ganar musculo', desc: 'Mayor aporte proteico y calorias de calidad' },
        { id: 'habitos', titulo: 'Mejorar habitos', desc: 'Alimentacion balanceada y sostenible' },
      ].map((opcion) => (
        <TouchableOpacity
          key={opcion.id}
          style={[
            styles.tarjeta,
            seleccionada === opcion.id && styles.tarjetaSeleccionada,
          ]}
          onPress={() => setSeleccionada(opcion.id)}
        >
          <View style={styles.tarjetaContent}>
            <Text style={styles.tarjetaTitulo}>{opcion.titulo}</Text>
            <Text style={styles.tarjetaDesc}>{opcion.desc}</Text>
          </View>
          <View
            style={[
              styles.radioButton,
              seleccionada === opcion.id && styles.radioButtonSeleccionado,
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Paso5Preferencias() {
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);

  const togglePreferencia = (id: string) => {
    if (seleccionadas.includes(id)) {
      setSeleccionadas(seleccionadas.filter((p) => p !== id));
    } else {
      setSeleccionadas([...seleccionadas, id]);
    }
  };

  return (
    <View>
      <Text style={styles.pregunta}>Que alimentos le gusta consumir con frecuencia?</Text>
      <Text style={styles.descripcion}>Selecciona todos los que formen parte de tu rutina habitual.</Text>

      <View style={styles.pillaContainer}>
        {[
          'Pollo', 'Carne de Res', 'Pescado', 'Huevos', 'Legumbres', 'Atun',
          'Pavo', 'Arroz', 'Pan', 'Pasta', 'Papas', 'Avena', 'Quinoa', 'Batata',
          'Leche', 'Yogur', 'Queso', 'Cuna', 'Mantequilla', 'Crema', 'Requeson',
          'Brocoli', 'Zanahorias', 'Espinacas', 'Cebollas', 'Pimientos', 'Lechuga'
        ].map((alimento) => (
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
    </View>
  );
}

function Paso6Restricciones() {
  const [texto, setTexto] = useState('');

  return (
    <View>
      <Text style={styles.pregunta}>Hay alimentos que no le gustan o que prefiere evitar?</Text>
      <Text style={styles.descripcion}>Compartenos cualquier restriccion o preferencia especial.</Text>
      
      <View style={styles.textAreaContainer}>
        <Text style={styles.textAreaPlaceholder}>Especifique cual..</Text>
      </View>
    </View>
  );
}

function Paso7Deporte() {
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);

  const toggleDeporte = (id: string) => {
    if (seleccionadas.includes(id)) {
      setSeleccionadas(seleccionadas.filter((d) => d !== id));
    } else {
      setSeleccionadas([...seleccionadas, id]);
    }
  };

  return (
    <View>
      <Text style={styles.pregunta}>Practicas actualmente algun deporte?</Text>
      <Text style={styles.descripcion}>Si no practicas uno hoy, elige el que te gustaria comenzar.</Text>

      {[
        { id: 'gimnasio', titulo: 'Gimnasio', desc: 'Entrenamiento de fuerza y pesas' },
        { id: 'running', titulo: 'Running', desc: 'Carreras o trotes en ruta o cinta' },
        { id: 'futbol', titulo: 'Futbol', desc: 'Partidos o entrenamientos semanales' },
        { id: 'basquet', titulo: 'Basquet', desc: 'Juego recreativo o competitivo' },
        { id: 'ciclismo', titulo: 'Ciclismo', desc: 'Rutas al aire libre o bicicleta fija' },
        { id: 'natacion', titulo: 'Natacion', desc: 'Sesiones de nado por distancia o tiempo' },
      ].map((opcion) => (
        <TouchableOpacity
          key={opcion.id}
          style={[
            styles.tarjeta,
            seleccionadas.includes(opcion.id) && styles.tarjetaSeleccionada,
          ]}
          onPress={() => toggleDeporte(opcion.id)}
        >
          <View style={styles.tarjetaContent}>
            <Text style={styles.tarjetaTitulo}>{opcion.titulo}</Text>
            <Text style={styles.tarjetaDesc}>{opcion.desc}</Text>
          </View>
          <View
            style={[
              styles.checkButton,
              seleccionadas.includes(opcion.id) && styles.checkButtonSeleccionado,
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
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
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tarjetaSeleccionada: {
    borderColor: '#FFC107',
    backgroundColor: '#FFF9E6',
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
  checkButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  checkButtonSeleccionado: {
    borderColor: '#FFC107',
    backgroundColor: '#FFC107',
  },
  pillaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
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
  textAreaContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 15,
    minHeight: 120,
    justifyContent: 'flex-start',
  },
  textAreaPlaceholder: {
    fontSize: 14,
    color: '#ccc',
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
