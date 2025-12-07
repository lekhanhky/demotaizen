import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { handleRefreshTokenError, getSafeSession } from '../utils/authHelper';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session with error handling
    const getInitialSession = async () => {
      try {
        const session = await getSafeSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.log('Failed to get initial session:', error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      } else if (event === 'SIGNED_IN') {
        console.log('User signed in');
      }

      // Handle refresh token errors
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.log('Token refresh failed, signing out');
        await supabase.auth.signOut();
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        await handleRefreshTokenError(error);
      }
      
      return { error };
    } catch (error) {
      await handleRefreshTokenError(error);
      return { error };
    }
  };

  const signUp = async (email, password) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        await handleRefreshTokenError(error);
      }
      
      return { error };
    } catch (error) {
      await handleRefreshTokenError(error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.log('Sign out error:', error);
      // Force clear even if signOut fails
      await handleRefreshTokenError(error);
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        await handleRefreshTokenError(error);
      }
      
      return { error };
    } catch (error) {
      await handleRefreshTokenError(error);
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}