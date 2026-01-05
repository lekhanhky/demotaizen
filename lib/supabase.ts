// Polyfill moved to index.js to avoid conflicts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://axufdobdvktrpwhvbpdv.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dWZkb2Jkdmt0cnB3aHZicGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDU0NDksImV4cCI6MjA3ODE4MTQ0OX0.QZTmbidVs-MQXqZCa4LOJnJC11f2W3Vj2K9z-L_7__I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-react-native',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Auth state changes are handled in AuthContext.js to avoid duplicate listeners

// Auth error handling is managed in AuthContext.js and authHelper.js
