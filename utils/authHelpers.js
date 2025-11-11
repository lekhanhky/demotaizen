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
      
      // Nếu thành công, trả về kết quả
      return result;
    } catch (error) {
      lastError = error;
      
      // Nếu không phải lỗi timeout hoặc đã hết lần thử, throw error
      if (error.message !== 'Timeout' || i === retries) {
        throw error;
      }
      
      // Đợi 1 giây trước khi thử lại
      await new Promise(resolve => setTimeout(resolve, 1000));
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
