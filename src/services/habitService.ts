import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';

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

export async function deleteHabit(id: string) {
  return supabase.from('habits').delete().eq('id', id);
}
