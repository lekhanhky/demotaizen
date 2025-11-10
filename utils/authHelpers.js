import { supabase } from '../lib/supabase';

// Helper function với timeout
export const signInWithTimeout = async (email, password, timeoutMs = 15000) => {
  return Promise.race([
    supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    ),
  ]);
};

export const signUpWithTimeout = async (email, password, userData, timeoutMs = 15000) => {
  return Promise.race([
    supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: userData,
      },
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    ),
  ]);
};

// Kiểm tra kết nối Supabase
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await Promise.race([
      supabase.from('user_profiles').select('count').limit(1),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      ),
    ]);
    return !error;
  } catch (error) {
    return false;
  }
};
