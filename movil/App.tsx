import React, { useState } from 'react';
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

type ScreenName = 'login' | 'register' | 'onboarding';

type Gender = 'Masculino' | 'Femenino' | 'Otro';

type Profile = {
  name: string;
  lastName: string;
  birthDate: string;
  gender: Gender;
  email: string;
  password: string;
};

const initialProfile: Profile = {
  name: '',
  lastName: '',
  birthDate: '',
  gender: 'Masculino',
  email: '',
  password: '',
};

const registeredEmails = ['registrado@dkfitt.com', 'paciente@dkfitt.com'];

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('register');
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerError, setRegisterError] = useState('');

  const updateProfile = (updates: Partial<Profile>) => {
    setProfile((current) => ({ ...current, ...updates }));
  };

  const handleRegister = () => {
    const required = [profile.name, profile.lastName, profile.birthDate, profile.email, profile.password];
    if (required.some((value) => !value.trim())) {
      setRegisterError('Completa nombre, apellido, fecha de nacimiento, correo y contraseña.');
      return;
    }

    const duplicateEmail = registeredEmails.includes(profile.email.trim().toLowerCase());
    if (duplicateEmail) {
      setRegisterError('Este correo ya está registrado. Usa otro para continuar.');
      return;
    }

    setRegisterError('');
    setEmail(profile.email);
    setPassword(profile.password);
    setScreen('onboarding');
  };

  const renderLoginScreen = () => (
    <ScreenFrame>
      <DecorativeShapes />
      <AuthCard title="DK Fitt" subtitle="La salud es vida" accent="Bienvenido de nuevo">
        <Field
          icon="✉"
          placeholder="Correo"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <Field
          icon="🔒"
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          showEye
        />
        <Text style={styles.linkRight}>Olvido su contraseña?</Text>
        <PrimaryButton
          label="Ingresar"
          onPress={() => {
            updateProfile({ email });
            setScreen('onboarding');
          }}
        />
        <Text style={styles.helperText}>No tienes una cuenta?</Text>
        <LinkButton label="Registrarte" onPress={() => setScreen('register')} />
      </AuthCard>
    </ScreenFrame>
  );

  const renderRegisterScreen = () => (
    <ScreenFrame>
      <DecorativeShapes />
      <AuthCard title="Crear Cuenta" subtitle="Completa tus datos para empezar" accent="HUM-01 Registro">
        <Field
          label="Nombre"
          placeholder="Nombre"
          value={profile.name}
          onChangeText={(text) => updateProfile({ name: text })}
          icon="👤"
        />
        <Field
          label="Apellido"
          placeholder="Apellido"
          value={profile.lastName}
          onChangeText={(text) => updateProfile({ lastName: text })}
          icon="👤"
        />
        <Field
          label="Fecha de nacimiento"
          placeholder="dd/mm/aaaa"
          value={profile.birthDate}
          onChangeText={(text) => updateProfile({ birthDate: text })}
          icon="📅"
        />
        <Text style={styles.sectionLabel}>Sexo</Text>
        <View style={styles.rowWrap}>
          {(['Masculino', 'Femenino', 'Otro'] as Gender[]).map((item) => (
            <Chip key={item} label={item} selected={profile.gender === item} onPress={() => toggleSingleValue('gender', item)} />
          ))}
        </View>
        <Field
          label="Correo electronico"
          placeholder="Correo electronico"
          value={profile.email}
          onChangeText={(text) => updateProfile({ email: text })}
          keyboardType="email-address"
          icon="✉"
        />
        <Field
          label="Contrasena"
          placeholder="Contrasena"
          value={profile.password}
          onChangeText={(text) => updateProfile({ password: text })}
          secureTextEntry
          showEye
          icon="🔒"
        />
        <PrimaryButton label="Crear Cuenta" onPress={handleRegister} />
        {registerError ? <Text style={styles.errorText}>{registerError}</Text> : null}
        <LinkRow
          prefix="Ya tienes una cuenta?"
          actionLabel="Iniciar sesion"
          onPress={() => setScreen('login')}
        />
      </AuthCard>
    </ScreenFrame>
  );

  const renderOnboardingIntro = () => (
    <ScreenFrame>
      <DecorativeShapes />
      <SimpleCard>
        <Text style={styles.brandTitle}>Registro completado</Text>
        <Text style={styles.subtitleCenter}>HUM-01 Registro de usuario</Text>
        <Text style={styles.centerText}>
          El paciente queda listo para entrar al flujo de onboarding inicial después de guardar sus datos.
        </Text>
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Nombre</Text>
            <Text style={styles.summaryValue}>{`${profile.name} ${profile.lastName}`.trim() || 'Pendiente'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Correo</Text>
            <Text style={styles.summaryValue}>{profile.email || email || 'Pendiente'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sexo</Text>
            <Text style={styles.summaryValue}>{profile.gender}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Nacimiento</Text>
            <Text style={styles.summaryValue}>{profile.birthDate || 'Pendiente'}</Text>
          </View>
        </View>
        <PrimaryButton label="Volver al login" onPress={() => setScreen('login')} />
      </SimpleCard>
    </ScreenFrame>
  );

  const renderScreen = () => {
    switch (screen) {
      case 'login':
        return renderLoginScreen();
      case 'register':
        return renderRegisterScreen();
      case 'onboarding':
        return renderOnboardingIntro();
      default:
        return renderLoginScreen();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fffaf0" />
      <ExpoStatusBar style="dark" />
      {renderScreen()}
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

function AuthCard({
  title,
  subtitle,
  accent,
  children,
}: {
  title: string;
  subtitle: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.authCard}>
      <View style={styles.logoWrap}>
        <View style={styles.logoRoof} />
        <Text style={styles.logoTitle}>DK Fitt</Text>
        <Text style={styles.logoTag}>La salud es vida</Text>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
      <View style={styles.accentBadge}>
        <Text style={styles.accentText}>{accent}</Text>
      </View>
      {children}
    </View>
  );
}

function SimpleCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.simpleCard}>{children}</View>;
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
  showEye,
  multiline,
  icon,
}: {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType'];
  secureTextEntry?: boolean;
  showEye?: boolean;
  multiline?: boolean;
  icon?: string;
}) {
  return (
    <View style={styles.fieldBlock}>
      {label ? <Text style={styles.sectionLabel}>{label}</Text> : null}
      <View style={[styles.inputRow, multiline && styles.multiLineInputRow]}>
        {icon ? <Text style={styles.fieldIcon}>{icon}</Text> : null}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9b9287"
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
        />
        {showEye ? <Text style={styles.eyeIcon}>◦</Text> : null}
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

function LinkButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.linkButton}>
      <Text style={styles.linkButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function LinkRow({
  prefix,
  actionLabel,
  onPress,
}: {
  prefix: string;
  actionLabel: string;
  onPress: () => void;
}) {
  return (
    <Text style={styles.helperText}>
      {prefix} <Text style={styles.inlineLink} onPress={onPress}>{actionLabel}</Text>
    </Text>
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
  authCard: {
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
  logoWrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logoRoof: {
    width: 68,
    height: 68,
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
    transform: [{ rotate: '45deg' }],
    backgroundColor: '#f1b600',
    marginBottom: 10,
  },
  logoTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0f0f0f',
  },
  logoTag: {
    fontSize: 16,
    color: '#7d756b',
    marginTop: 4,
  },
  cardTitle: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    color: '#1f1b14',
  },
  cardSubtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#796f61',
    marginTop: 4,
    marginBottom: 12,
  },
  accentBadge: {
    alignSelf: 'center',
    backgroundColor: '#fff6ce',
    borderColor: '#edd17a',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  accentText: {
    color: '#8b6a00',
    fontWeight: '700',
  },
  fieldBlock: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4d453b',
    marginBottom: 8,
  },
  inputRow: {
    minHeight: 56,
    borderWidth: 1.5,
    borderColor: '#b9aa97',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#fffdf9',
  },
  multiLineInputRow: {
    alignItems: 'flex-start',
    paddingTop: 12,
    minHeight: 84,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1c1711',
    paddingVertical: 10,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  fieldIcon: {
    fontSize: 18,
    marginRight: 10,
    color: '#857768',
  },
  eyeIcon: {
    fontSize: 16,
    color: '#857768',
    marginLeft: 8,
  },
  linkRight: {
    textAlign: 'right',
    color: '#857768',
    marginTop: 2,
    marginBottom: 14,
  },
  helperText: {
    color: '#857768',
    textAlign: 'center',
    marginTop: 14,
    fontSize: 15,
  },
  inlineLink: {
    color: '#4a3b00',
    fontWeight: '800',
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
  linkButton: {
    alignSelf: 'center',
    paddingVertical: 4,
  },
  linkButtonText: {
    color: '#4a3b00',
    fontWeight: '800',
    fontSize: 16,
  },
  errorText: {
    color: '#b00020',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '700',
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
  summaryBox: {
    marginBottom: 18,
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
});
