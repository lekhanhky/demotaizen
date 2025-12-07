import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

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

// Handle auth state changes and errors
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('Supabase auth event:', event);
  
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully');
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out, clearing storage');
    // Clear all auth data from storage
    try {
      await AsyncStorage.multiRemove([
        'supabase.auth.token',
        'sb-' + supabaseUrl.split('//')[1].split('.')[0] + '-auth-token'
      ]);
    } catch (error) {
      console.log('Error clearing auth storage:', error);
    }
  }
});

// Add global error handler for auth errors
const originalRequest = supabase.auth.signInWithPassword;
supabase.auth.signInWithPassword = async (...args) => {
  try {
    return await originalRequest.apply(supabase.auth, args);
  } catch (error) {
    if (error.message?.includes('refresh_token_not_found') || 
        error.message?.includes('Invalid Refresh Token')) {
      console.log('Refresh token error, clearing session');
      await supabase.auth.signOut();
    }
    throw error;
  }
};
