import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import type { Session } from '@supabase/supabase-js';

import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { supabase } from '../services/supabaseClient';

export default function RootNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1) récupérer la session au démarrage
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setIsLoading(false);
    });

    // 2) écouter les changements (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    // écran vide simple (on stylisera après)
    return null;
  }

  return (
      <NavigationContainer>
        {session ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
  );
}
