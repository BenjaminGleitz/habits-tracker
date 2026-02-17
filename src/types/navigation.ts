export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  HabitDetail: { habitId: string };
  HabitForm: undefined | { habitId?: string };
  Settings: undefined;
};

