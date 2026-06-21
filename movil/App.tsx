import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

type ScreenName = 'login' | 'onboarding' | 'dashboard';

type UserAccount = {
  email: string;
  password: string;
  profileComplete: boolean;
  fullName: string;
};

const mockAccounts: UserAccount[] = [
  {
    email: 'paciente@dkfitt.com',
    password: '123456',
    profileComplete: false,
    fullName: 'Paciente Demo',
  },
  {
    email: 'completo@dkfitt.com',
    password: '123456',
    profileComplete: true,
    fullName: 'Paciente Completo',
  },
];

const initialLogin = {
  email: '',
  password: '',
};

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('login');
  const [email, setEmail] = useState(initialLogin.email);
  const [password, setPassword] = useState(initialLogin.password);
  const [error, setError] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [destination, setDestination] = useState<'onboarding' | 'dashboard' | ''>('');
  const [sessionName, setSessionName] = useState('');

  const handleLogin = () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      setError('Completa correo y contraseña para continuar.');
      return;
    }

    const account = mockAccounts.find(
      (item) => item.email.toLowerCase() === normalizedEmail && item.password === normalizedPassword,
    );

    if (!account) {
      setError('Credenciales incorrectas. Verifica tus datos e intenta de nuevo.');
      setAuthToken('');
      setDestination('');
      setSessionName('');
      return;
    }

    const generatedToken = `jwt-${normalizedEmail}-${Date.now()}`;
    const nextDestination = account.profileComplete ? 'dashboard' : 'onboarding';

    setError('');
    setAuthToken(generatedToken);
    setDestination(nextDestination);
    setSessionName(account.fullName);
    setScreen(nextDestination);
  };

  const renderLoginScreen = () => (
    <ScreenFrame>
      <DecorativeShapes />
      <AuthCard title="DK Fitt" subtitle="La salud es vida" accent="HUM-02 Inicio de sesión">
        <Field
          icon="✉"
          placeholder="Correo"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
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
        <PrimaryButton label="Ingresar" onPress={handleLogin} />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Text style={styles.helperText}>Solo usuarios registrados pueden iniciar sesión.</Text>
        <Text style={styles.helperTextSmall}>Prueba: paciente@dkfitt.com / 123456</Text>
      </AuthCard>
    </ScreenFrame>
  );

  const renderOnboardingScreen = () => (
    <ScreenFrame>
      <DecorativeShapes />
      <SimpleCard>
        <Text style={styles.brandTitle}>Token guardado</Text>
        <Text style={styles.subtitleCenter}>Guardado seguro en el dispositivo</Text>
        <Text style={styles.centerText}>
          El paciente {sessionName || 'registrado'} fue redirigido al flujo de onboarding porque su perfil todavía está incompleto.
        </Text>
        <StatusBox label="Token JWT" value={authToken || 'Sin token'} />
        <StatusBox label="Destino" value={destination === 'onboarding' ? 'Onboarding inicial' : 'No definido'} />
        <PrimaryButton label="Volver al login" onPress={() => setScreen('login')} />
      </SimpleCard>
    </ScreenFrame>
  );

  const renderDashboardScreen = () => (
    <ScreenFrame>
      <DecorativeShapes />
      <SimpleCard>
        <Text style={styles.brandTitle}>Sesión activa</Text>
        <Text style={styles.subtitleCenter}>Acceso correcto al dashboard</Text>
        <Text style={styles.centerText}>
          El paciente {sessionName || 'registrado'} fue autenticado y su perfil está completo, por eso se redirige al dashboard.
        </Text>
        <StatusBox label="Token JWT" value={authToken || 'Sin token'} />
        <StatusBox label="Destino" value={destination === 'dashboard' ? 'Dashboard principal' : 'No definido'} />
        <PrimaryButton label="Cerrar sesión" onPress={() => setScreen('login')} />
      </SimpleCard>
    </ScreenFrame>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fffaf0" />
      <ExpoStatusBar style="dark" />
      {screen === 'login' ? renderLoginScreen() : screen === 'onboarding' ? renderOnboardingScreen() : renderDashboardScreen()}
    </SafeAreaView>
  );
}

function ScreenFrame({ children }: { children: React.ReactNode }) {
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
  autoCapitalize,
  icon,
}: {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType'];
  secureTextEntry?: boolean;
  showEye?: boolean;
  autoCapitalize?: React.ComponentProps<typeof TextInput>['autoCapitalize'];
  icon?: string;
}) {
  return (
    <View style={styles.fieldBlock}>
      {label ? <Text style={styles.sectionLabel}>{label}</Text> : null}
      <View style={styles.inputRow}>
        {icon ? <Text style={styles.fieldIcon}>{icon}</Text> : null}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9b9287"
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
        />
        {showEye ? <Text style={styles.eyeIcon}>◦</Text> : null}
      </View>
    </View>
  );
}

function StatusBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statusBox}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.primaryButton}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
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
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1c1711',
    paddingVertical: 10,
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
  helperTextSmall: {
    color: '#a09789',
    textAlign: 'center',
    marginTop: 6,
    fontSize: 13,
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
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
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
  statusBox: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ead8b0',
    backgroundColor: '#fffdf8',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  statusLabel: {
    color: '#7a6d5c',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statusValue: {
    color: '#1e1812',
    fontSize: 15,
    fontWeight: '700',
  },
});
