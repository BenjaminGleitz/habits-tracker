import { View, Text, StyleSheet, Alert, Pressable } from 'react-native';
import { signOut } from '../services/authService';
import { colors, spacing } from '../theme';

export default function SettingsScreen() {
  async function handleLogout() {
    const { error } = await signOut();

    if (error) {
      Alert.alert('Erreur', error.message);
    }
  }

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Paramètres</Text>

        <Pressable style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </Pressable>
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
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: spacing.md,
    color: colors.text,
  },
  logoutButton: {
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutButtonPressed: { backgroundColor: colors.dangerPressed },
  logoutButtonText: { color: '#fff', fontWeight: '700' },
});
