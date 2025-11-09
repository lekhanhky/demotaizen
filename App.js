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

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Tự động tạo profile nếu chưa có
        await ensureUserProfile(session.user.id);
      }
      setSession(session);
    });

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
