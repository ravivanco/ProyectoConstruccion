import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

type ScreenName = 'intro' | 'activity' | 'saved';

type ActivityLevel = 'Sedentaria' | 'Ligera' | 'Moderada' | 'Alta';

type Profile = {
  activity: ActivityLevel | '';
};

const activityLevels: ActivityLevel[] = ['Sedentaria', 'Ligera', 'Moderada', 'Alta'];
const activityProfileApi = {
  options: '/patient-profile/options',
  save: 'PUT /patient-profile/me',
};

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('intro');
  const [profile, setProfile] = useState<Profile>({ activity: '' });
  const [error, setError] = useState('');

  const progress = useMemo(() => (profile.activity ? 1 : 0.35), [profile.activity]);

  const saveActivity = () => {
    if (!profile.activity) {
      setError('Selecciona un nivel de actividad física para continuar.');
      return;
    }

    setError('');
    setScreen('saved');
  };

  const renderIntro = () => (
    <ScreenFrame>
      <DecorativeShapes />
      <SimpleCard>
        <Text style={styles.brandTitle}>Formulario inicial</Text>
        <Text style={styles.subtitleCenter}>HUM-04 Registro de actividad física</Text>
        <Text style={styles.centerText}>
          El sistema solicita el nivel de actividad física para estimar el gasto energético diario del paciente.
        </Text>
        <View style={styles.bannerBox}>
          <Text style={styles.bannerTitle}>Origen de datos</Text>
          <Text style={styles.bannerText}>
            La app obtiene los niveles desde {activityProfileApi.options} y luego los guarda en el perfil.
          </Text>
        </View>
        <View style={styles.bannerBox}>
          <Text style={styles.bannerTitle}>Estado del perfil</Text>
          <Text style={styles.bannerText}>Si el perfil está incompleto, se pide completar el formulario antes de continuar.</Text>
        </View>
        <ProgressBar value={progress} />
        <PrimaryButton label="Registrar actividad" onPress={() => setScreen('activity')} />
      </SimpleCard>
    </ScreenFrame>
  );

  const renderActivity = () => (
    <ScreenFrame scroll>
      <DecorativeShapes />
      <SimpleCard>
        <Text style={styles.stepTitle}>Paso 1 de 1</Text>
        <ProgressBar value={progress} />
        <Text style={styles.brandTitle}>Actividad física</Text>
        <Text style={styles.subtitleCenter}>Selecciona el nivel que mejor representa tu rutina diaria.</Text>
        <View style={styles.inlineApiBox}>
          <Text style={styles.inlineApiTitle}>Sincronización backend</Text>
          <Text style={styles.inlineApiText}>
            Al guardar, el nivel se envía con {activityProfileApi.save} y queda asociado al perfil.
          </Text>
        </View>
        <View style={styles.rowWrap}>
          {activityLevels.map((level) => (
            <Chip
              key={level}
              label={level}
              selected={profile.activity === level}
              onPress={() => {
                setError('');
                setProfile({ activity: level });
              }}
            />
          ))}
        </View>
        <Text style={styles.helperText}>Elige una sola opción para completar tu perfil.</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.footerRow}>
          <SecondaryButton label="Atrás" onPress={() => setScreen('intro')} />
          <PrimaryButton label="Guardar y seguir" onPress={saveActivity} flex />
        </View>
      </SimpleCard>
    </ScreenFrame>
  );

  const renderSaved = () => (
    <ScreenFrame scroll>
      <DecorativeShapes />
      <SimpleCard>
        <Text style={styles.brandTitle}>Actividad guardada</Text>
        <Text style={styles.subtitleCenter}>Perfil actualizado</Text>
        <Text style={styles.centerText}>
          El nivel de actividad física quedó listo para sincronizarse con el backend y ser usado en el cálculo nutricional.
        </Text>
        <View style={styles.summaryBox}>
          <SummaryRow label="Nivel de actividad" value={profile.activity || 'Pendiente'} />
          <SummaryRow label="Consulta" value={activityProfileApi.options} />
          <SummaryRow label="Guardado" value={activityProfileApi.save} />
        </View>
        <View style={styles.savedBadge}>
          <Text style={styles.savedBadgeText}>HUM-04 completado y guardado en el perfil del paciente.</Text>
        </View>
        <PrimaryButton
          label="Volver al inicio"
          onPress={() => {
            setProfile({ activity: '' });
            setScreen('intro');
          }}
        />
      </SimpleCard>
    </ScreenFrame>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fffaf0" />
      <ExpoStatusBar style="dark" />
      {screen === 'intro' ? renderIntro() : screen === 'activity' ? renderActivity() : renderSaved()}
    </SafeAreaView>
  );
}

function ScreenFrame({ children, scroll }: { children: React.ReactNode; scroll?: boolean }) {
  if (scroll) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    );
  }

  return <View style={styles.centered}>{children}</View>;
}

function DecorativeShapes() {
  return (
    <>
      <View style={styles.shapeTopLeft} />
      <View style={styles.shapeBottomRight} />
      <View style={styles.shapeSide} />
    </>
  );
}

function SimpleCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.simpleCard}>{children}</View>;
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

function PrimaryButton({
  label,
  onPress,
  flex,
}: {
  label: string;
  onPress: () => void;
  flex?: boolean;
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.primaryButton, flex && styles.flexButton]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.secondaryButton}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, value * 100))}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fffaf0',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 28,
  },
  simpleCard: {
    marginHorizontal: 20,
    padding: 22,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    shadowColor: '#b28b18',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  brandTitle: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '900',
    color: '#181512',
    marginBottom: 4,
  },
  subtitleCenter: {
    textAlign: 'center',
    fontSize: 16,
    color: '#796f61',
    marginBottom: 14,
  },
  centerText: {
    textAlign: 'center',
    color: '#6f6559',
    lineHeight: 22,
    marginBottom: 18,
  },
  bannerBox: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e6ce85',
    backgroundColor: '#fff7d4',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#7b5d00',
    marginBottom: 4,
  },
  bannerText: {
    color: '#6b5a24',
    lineHeight: 20,
  },
  inlineApiBox: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ead8b0',
    backgroundColor: '#fffdf8',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  inlineApiTitle: {
    color: '#7b5d00',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  inlineApiText: {
    color: '#6b5a24',
    lineHeight: 20,
  },
  stepTitle: {
    color: '#8f7f69',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#efe5cf',
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#f1b600',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  chip: {
    borderWidth: 1.4,
    borderColor: '#b9aa97',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: '#fffdf9',
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#fff4c4',
    borderColor: '#d0a400',
  },
  chipText: {
    color: '#574d41',
    fontWeight: '700',
  },
  chipTextSelected: {
    color: '#7b5d00',
  },
  helperText: {
    color: '#857768',
    textAlign: 'center',
    marginTop: 6,
    fontSize: 14,
  },
  errorText: {
    color: '#b00020',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#f1b600',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#d39e00',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    paddingHorizontal: 18,
  },
  flexButton: {
    flex: 1,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#fff8e0',
    borderWidth: 1,
    borderColor: '#e6ce85',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: '#5c4b00',
    fontSize: 16,
    fontWeight: '800',
  },
  summaryBox: {
    marginBottom: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ead8b0',
    overflow: 'hidden',
  },
  summaryRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1e5c9',
  },
  summaryLabel: {
    color: '#7a6d5c',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryValue: {
    color: '#1e1812',
    fontSize: 15,
    fontWeight: '700',
  },
  savedBadge: {
    alignSelf: 'center',
    backgroundColor: '#fff6ce',
    borderColor: '#edd17a',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  savedBadgeText: {
    color: '#8b6a00',
    fontWeight: '700',
    textAlign: 'center',
  },
  shapeTopLeft: {
    position: 'absolute',
    top: 46,
    left: 24,
    width: 76,
    height: 76,
    backgroundColor: '#f1b600',
    transform: [{ rotate: '25deg' }],
    borderRadius: 4,
    opacity: 0.95,
  },
  shapeBottomRight: {
    position: 'absolute',
    right: 28,
    bottom: 94,
    width: 78,
    height: 78,
    backgroundColor: '#f1b600',
    transform: [{ rotate: '20deg' }],
    borderRadius: 4,
    opacity: 0.95,
  },
  shapeSide: {
    position: 'absolute',
    right: -18,
    top: 258,
    width: 54,
    height: 54,
    backgroundColor: '#b29134',
    transform: [{ rotate: '45deg' }],
    borderRadius: 4,
    opacity: 0.88,
  },
});
