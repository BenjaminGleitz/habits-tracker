import { Pressable, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppStackParamList } from '../types/navigation';

import HomeScreen from '../screens/HomeScreen';
import HabitDetailScreen from '../screens/HabitDetailScreen';
import HabitFormScreen from '../screens/HabitFormScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surfaceStrong },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'Habits',
          headerRight: () => (
            <Pressable onPress={() => navigation.navigate('Settings')}>
              <Text style={{ fontSize: 20 }}>⚙️</Text>
            </Pressable>
          ),
        })}
      />
      <Stack.Screen name="HabitDetail" component={HabitDetailScreen} options={{ title: 'Détail' }} />
      <Stack.Screen name="HabitForm" component={HabitFormScreen} options={{ title: 'Habitude' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Paramètres' }} />
    </Stack.Navigator>
  );
}
