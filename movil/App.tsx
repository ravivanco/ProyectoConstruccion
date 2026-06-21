import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

type ScreenName = 'intro' | 'step' | 'saved';

type OnboardingProfile = {
  activity: string;
  conditions: string[];
  allergies: string;
  objective: string;
};

type StepConfig = {
  key: string;
  title: string;
  subtitle: string;
  kind: 'single' | 'multi' | 'text';
  options?: string[];
  allowNone?: boolean;
  placeholder?: string;
};

const steps: StepConfig[] = [
  {
    key: 'activity',
    title: 'Actividad física',
    subtitle: 'Selecciona el nivel que mejor representa tu rutina diaria.',
    kind: 'single',
    options: ['Sedentaria', 'Ligera', 'Moderada', 'Alta'],
  },
  {
    key: 'conditions',
    title: 'Condiciones médicas',
    subtitle: 'Marca una o varias condiciones, o elige Ninguna si no aplica.',
    kind: 'multi',
    options: ['Hipertensión', 'Diabetes', 'Gastritis', 'Colesterol alto', 'Ninguna'],
    allowNone: true,
  },
  {
    key: 'allergies',
    title: 'Alergias e intolerancias',
    subtitle: 'Registra alergias o intolerancias alimentarias para tu perfil.',
    kind: 'text',
    placeholder: 'Escribe alergias o intolerancias',
  },
  {
    key: 'objective',
    title: 'Objetivo nutricional',
    subtitle: 'Indica cuál es tu objetivo principal.',
    kind: 'single',
    options: ['Bajar peso', 'Mantener peso', 'Ganar masa muscular'],
  },
];

const initialProfile: OnboardingProfile = {
  activity: '',
  conditions: [],
  allergies: '',
  objective: '',
};

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('intro');
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<OnboardingProfile>(initialProfile);
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  const progress = useMemo(() => (currentStep + 1) / steps.length, [currentStep]);

  const currentConfig = steps[currentStep];
  const completed = [profile.activity, profile.conditions.join(', '), profile.allergies, profile.objective];
  const isProfileComplete = completed.every((value) => value.trim().length > 0);

  const goToNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((value) => value + 1);
      setError('');
      return;
    }

    setSavedMessage('');
    setScreen('saved');
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((value) => value - 1);
      setError('');
      return;
    }

    setScreen('intro');
  };

  const handleContinue = () => {
    if (currentConfig.kind === 'single') {
      const value = currentConfig.key === 'activity' ? profile.activity : profile.objective;
      if (!value.trim()) {
        setError('Selecciona una opción para continuar.');
        return;
      }
    }

    if (currentConfig.kind === 'multi') {
      if (profile.conditions.length === 0) {
        setError('Selecciona al menos una condición o elige Ninguna.');
        return;
      }
    }

    if (currentConfig.kind === 'text' && !profile.allergies.trim()) {
      setError('Escribe tus alergias o intolerancias, o indica que no tienes.');
      return;
    }

    goToNext();
  };

  const renderIntro = () => (
    <ScreenFrame>
      <DecorativeShapes />
      <SimpleCard>
        <Text style={styles.brandTitle}>Formulario inicial</Text>
        <Text style={styles.subtitleCenter}>HUM-03 Inicio del perfil</Text>
        <Text style={styles.centerText}>
          El sistema detecta que tu perfil está incompleto y solicita completar el onboarding antes de recibir un plan nutricional.
        </Text>
        <View style={styles.bannerBox}>
          <Text style={styles.bannerTitle}>Perfil incompleto</Text>
          <Text style={styles.bannerText}>Debes completar los pasos del formulario inicial para continuar.</Text>
        </View>
        <ProgressBar value={0.2} />
        <PrimaryButton label="Iniciar formulario" onPress={() => setScreen('step')} />
      </SimpleCard>
    </ScreenFrame>
  );

  const renderStep = () => (
    <ScreenFrame scroll>
      <DecorativeShapes />
      <SimpleCard>
        <Text style={styles.stepTitle}>Paso {currentStep + 1} de {steps.length}</Text>
        <ProgressBar value={progress} />
        <Text style={styles.brandTitle}>{currentConfig.title}</Text>
        <Text style={styles.subtitleCenter}>{currentConfig.subtitle}</Text>
        {currentConfig.kind === 'single' ? renderSingleStep(currentConfig) : null}
        {currentConfig.kind === 'multi' ? renderMultiStep(currentConfig) : null}
        {currentConfig.kind === 'text' ? renderTextStep(currentConfig) : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.footerRow}>
          <SecondaryButton label="Atrás" onPress={goToPrevious} />
          <PrimaryButton label="Siguiente" onPress={handleContinue} flex />
        </View>
      </SimpleCard>
    </ScreenFrame>
  );

  const renderSaved = () => (
    <ScreenFrame scroll>
      <DecorativeShapes />
      <SimpleCard>
        <Text style={styles.brandTitle}>Formulario guardado</Text>
        <Text style={styles.subtitleCenter}>Perfil inicial completado</Text>
        <Text style={styles.centerText}>
          La información se guardó correctamente y el paciente puede continuar con el flujo nutricional.
        </Text>
        <View style={styles.summaryBox}>
          <SummaryRow label="Actividad física" value={profile.activity} />
          <SummaryRow label="Condiciones" value={profile.conditions.join(', ')} />
          <SummaryRow label="Alergias" value={profile.allergies} />
          <SummaryRow label="Objetivo" value={profile.objective} />
        </View>
        <View style={styles.savedBadge}>
          <Text style={styles.savedBadgeText}>Perfil completado y listo para sincronizarse con backend.</Text>
        </View>
        <PrimaryButton
          label="Volver al inicio"
          onPress={() => {
            setScreen('intro');
            setCurrentStep(0);
          }}
        />
      </SimpleCard>
    </ScreenFrame>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fffaf0" />
      <ExpoStatusBar style="dark" />
      {screen === 'intro' ? renderIntro() : screen === 'step' ? renderStep() : renderSaved()}
    </SafeAreaView>
  );

  function renderSingleStep(config: StepConfig) {
    const value = config.key === 'activity' ? profile.activity : profile.objective;

    return (
      <View style={styles.rowWrap}>
        {(config.options || []).map((option) => (
          <Chip
            key={option}
            label={option}
            selected={value === option}
            onPress={() => {
              setError('');
              if (config.key === 'activity') {
                setProfile((current) => ({ ...current, activity: option }));
              } else {
                setProfile((current) => ({ ...current, objective: option }));
              }
            }}
          />
        ))}
      </View>
    );
  }

  function renderMultiStep(config: StepConfig) {
    return (
      <View style={styles.rowWrap}>
        {(config.options || []).map((option) => {
          const selected = profile.conditions.includes(option);
          const isNone = option === 'Ninguna';
          return (
            <Chip
              key={option}
              label={option}
              selected={selected}
              onPress={() => {
                setError('');
                if (isNone) {
                  setProfile((current) => ({ ...current, conditions: ['Ninguna'] }));
                  return;
                }

                setProfile((current) => ({
                  ...current,
                  conditions: current.conditions.includes('Ninguna')
                    ? [option]
                    : current.conditions.includes(option)
                      ? current.conditions.filter((item) => item !== option)
                      : [...current.conditions.filter((item) => item !== 'Ninguna'), option],
                }));
              }}
            />
          );
        })}
      </View>
    );
  }

  function renderTextStep(config: StepConfig) {
    return (
      <View style={styles.textStepWrap}>
        <Field
          placeholder={config.placeholder || 'Escribe información'}
          value={profile.allergies}
          onChangeText={(text) => {
            setError('');
            setProfile((current) => ({ ...current, allergies: text }));
          }}
          multiline
        />
        <Text style={styles.helperText}>Si no tienes alergias, puedes escribir “Ninguna”.</Text>
      </View>
    );
  }
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

function Field({
  placeholder,
  value,
  onChangeText,
  multiline,
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldBlock}>
      <View style={[styles.inputRow, multiline && styles.multilineInputRow]}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9b9287"
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
        />
      </View>
    </View>
  );
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
      <Text style={styles.summaryValue}>{value || 'Pendiente'}</Text>
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
  textStepWrap: {
    marginTop: 4,
  },
  fieldBlock: {
    marginBottom: 12,
  },
  inputRow: {
    minHeight: 84,
    borderWidth: 1.5,
    borderColor: '#b9aa97',
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fffdf9',
    justifyContent: 'center',
  },
  multilineInputRow: {
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1c1711',
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  multilineInput: {
    minHeight: 60,
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
