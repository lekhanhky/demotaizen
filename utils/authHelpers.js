import { supabase } from '../lib/supabase';

// Helper function với timeout và retry
export const signInWithTimeout = async (email, password, timeoutMs = 30000, retries = 2) => {
  let lastError;
  
  for (let i = 0; i <= retries; i++) {
    try {
      const result = await Promise.race([
        supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), timeoutMs)
        ),
      ]);
      
      // If successful, return result
      return result;
    } catch (error) {
      lastError = error;
      
      // If not timeout error or out of retries, throw error
      if (error.message !== 'Timeout' || i === retries) {
        throw error;
      }
      
      // Đợi 500ms trước khi thử lại
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  throw lastError;
};

export const signUpWithTimeout = async (email, password, userData, timeoutMs = 30000, retries = 2) => {
  let lastError;
  
  for (let i = 0; i <= retries; i++) {
    try {
      const result = await Promise.race([
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
      
      return result;
    } catch (error) {
      lastError = error;
      
      if (error.message !== 'Timeout' || i === retries) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw lastError;
};

// Check Supabase connection
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
