import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uksohredtmawnazmxkhs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrc29ocmVkdG1hd25hem14a2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMjIwNzgsImV4cCI6MjA4Njg5ODA3OH0.DKxiBM7GpvTu9HdF1NfUZWKJ9CRg8_aPxD1D4uv-zIc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
