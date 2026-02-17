import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import type { Habit } from '../types/habit';

export async function getHabits(session: Session) {
  const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

  return { data, error };
}

export async function createHabit(
    session: Session,
    title: string,
    description?: string
) {
  const { data, error } = await supabase.from('habits').insert({
    title,
    description,
    user_id: session.user.id,
  });

  return { data, error };
}

export async function getHabitById(id: string) {
  const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('id', id)
      .single();

  return { data: data as Habit | null, error };
}

export async function updateHabit(id: string, updates: { title: string; description?: string | null }) {
  const { data, error } = await supabase
      .from('habits')
      .update({
        title: updates.title,
        description: updates.description ?? null,
      })
      .eq('id', id)
      .select()
      .single();

  return { data: data as Habit | null, error };
}

export async function deleteHabit(id: string) {
  return supabase.from('habits').delete().eq('id', id);
}
