export type Habit = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  frequency: string | null;
  color: string | null;
  created_at: string;
};
