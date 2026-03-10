import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Pressable, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import { signUp } from '../services/authService';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setLoading(true);
    const { error } = await signUp(email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }

    Alert.alert('Compte créé', 'Tu peux maintenant te connecter.');
    navigation.navigate('Login');
  }

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Inscription</Text>
        <Text style={styles.subtitle}>Crée ton compte pour commencer.</Text>

        <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
        />

        <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
        />

        <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]} onPress={handleRegister}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Créer le compte</Text>}
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.secondaryButtonText}>Retour Login</Text>
        </Pressable>
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.sm, backgroundColor: colors.background },
  title: { fontSize: 30, fontWeight: '800', color: colors.text },
  subtitle: { marginBottom: spacing.md, color: colors.textMuted },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  primaryButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
});
