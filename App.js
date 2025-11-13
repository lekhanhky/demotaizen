import { StatusBar } from 'expo-status-bar';
import { supabase } from './lib/supabase';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './contexts/ThemeContext';
import { ensureUserProfile } from './utils/profileHelper';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session với timeout để tránh treo
    const checkSession = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (session?.user) {
          // Tự động tạo profile nếu chưa có
          await ensureUserProfile(session.user.id);
        }
        setSession(session);
      } catch (error) {
        console.log('Session check error:', error);
        // Nếu timeout hoặc lỗi, coi như chưa login
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Tự động tạo profile khi user login
        await ensureUserProfile(session.user.id);
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Show loading state while checking session
  if (loading) {
    return null; // hoặc có thể thêm splash screen
  }

  if (!session) {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <LoginScreen />
          <StatusBar style="light" />
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <HomeScreen onLogout={handleLogout} />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
