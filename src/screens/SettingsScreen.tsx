import { View, Text, StyleSheet, Alert, Pressable } from 'react-native';
import { signOut } from '../services/authService';
import { colors, elevation, radii, spacing } from '../theme';

export default function SettingsScreen() {
  async function handleLogout() {
    const { error } = await signOut();

    if (error) {
      Alert.alert('Erreur', error.message);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Paramètres</Text>
        <Text style={styles.subtitle}>Tu peux gérer ta session ici.</Text>

        <Pressable style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    padding: spacing.lg,
    ...elevation.card,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: spacing.xs,
    color: colors.text,
  },
  subtitle: {
    marginBottom: spacing.md,
    color: colors.textMuted,
  },
  logoutButton: {
    backgroundColor: colors.danger,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutButtonPressed: { backgroundColor: colors.dangerPressed },
  logoutButtonText: { color: '#fff', fontWeight: '700' },
});
