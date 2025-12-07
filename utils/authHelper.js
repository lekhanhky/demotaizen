import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

/**
 * Clear all authentication data from storage
 * Useful when dealing with corrupted sessions or refresh token errors
 */
export const clearAuthData = async () => {
  try {
    console.log('🧹 Clearing all auth data...');
    
    // Get all keys from AsyncStorage
    const keys = await AsyncStorage.getAllKeys();
    
    // Filter auth-related keys
    const authKeys = keys.filter(key => 
      key.includes('supabase') || 
      key.includes('auth') ||
      key.includes('sb-')
    );
    
    // Remove auth keys
    if (authKeys.length > 0) {
      await AsyncStorage.multiRemove(authKeys);
      console.log('✅ Cleared auth keys:', authKeys);
    }
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    console.log('✅ Auth data cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
    return false;
  }
};

/**
 * Handle refresh token errors
 */
export const handleRefreshTokenError = async (error) => {
  if (error?.message?.includes('refresh_token_not_found') || 
      error?.message?.includes('Invalid Refresh Token') ||
      error?.message?.includes('Refresh Token Not Found')) {
    
    console.log('🔄 Handling refresh token error...');
    await clearAuthData();
    return true;
  }
  return false;
};

/**
 * Safe session getter with error handling
 */
export const getSafeSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('Session error:', error.message);
      await handleRefreshTokenError(error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.log('Failed to get session:', error);
    await handleRefreshTokenError(error);
    return null;
  }
};