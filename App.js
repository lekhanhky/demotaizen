import { StatusBar } from 'expo-status-bar';
import { supabase } from './lib/supabase';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './contexts/ThemeContext';
import { ensureUserProfile } from './utils/profileHelper';
import { startAlertMonitoring, stopAlertMonitoring } from './services/alertMonitorService';
import { registerBackgroundAlertTask } from './services/backgroundAlertService';
import * as Notifications from 'expo-notifications';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import PermissionScreen from './screens/PermissionScreen';
import FullScreenAlertOverlay from './components/FullScreenAlertOverlay';
import { setAlertCallback } from './services/globalAlertManager';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);
  const [fullScreenAlert, setFullScreenAlert] = useState(null);

  // Setup global alert callback
  useEffect(() => {
    setAlertCallback((monitor) => {
      console.log('🚨 Showing full-screen alert for:', monitor.name);
      setFullScreenAlert(monitor);
    });
  }, []);

  // Check notification permission khi session thay đổi
  useEffect(() => {
    const checkNotificationPermission = async () => {
      if (session) {
        try {
          const { status } = await Notifications.getPermissionsAsync();
          console.log('📱 Notification permission status:', status);
          setHasNotificationPermission(status === 'granted');
        } catch (error) {
          console.error('Error checking notification permission:', error);
          setHasNotificationPermission(false);
        }
      }
      setCheckingPermission(false);
    };

    checkNotificationPermission();
  }, [session]);

  // Check session một lần khi mount
  useEffect(() => {
    let mounted = true;
    
    // Check session với timeout để tránh treo
    const checkSession = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (!mounted) return;
        
        if (session?.user) {
          // Tự động tạo profile nếu chưa có
          await ensureUserProfile(session.user.id);
          
          // Khởi động alert monitoring service
          console.log('🔔 Starting alert monitoring on app start');
          startAlertMonitoring();
          
          // Đăng ký background service
          console.log('📱 Registering background alert service');
          await registerBackgroundAlertTask();
        }
        
        if (mounted) {
          setSession(session);
          setLoading(false);
        }
      } catch (error) {
        console.log('Session check error:', error);
        
        if (!mounted) return;
        
        // Nếu timeout hoặc lỗi, set session null và cho phép hiển thị login
        setSession(null);
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Tự động tạo profile khi user login
        await ensureUserProfile(session.user.id);
        
        // Khởi động alert monitoring service khi user đăng nhập
        console.log('🔔 Starting alert monitoring for logged in user');
        startAlertMonitoring();
        
        // Đăng ký background service
        registerBackgroundAlertTask();
      } else {
        // Dừng alert monitoring khi user đăng xuất
        console.log('🔕 Stopping alert monitoring');
        stopAlertMonitoring();
      }
      setSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      stopAlertMonitoring();
    };
  }, []); // Chỉ chạy một lần khi mount

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handlePermissionGranted = () => {
    setHasNotificationPermission(true);
  };

  // Show loading state while checking session
  if (loading || checkingPermission) {
    console.log('Loading...', { loading, checkingPermission });
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1d9bf0" />
      </View>
    );
  }

  console.log('App state:', { session: !!session, hasNotificationPermission });

  if (!session) {
    console.log('Showing LoginScreen');
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <LoginScreen />
          <StatusBar style="light" />
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  // Hiển thị màn hình yêu cầu quyền nếu chưa có
  if (!hasNotificationPermission) {
    console.log('Showing PermissionScreen');
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <PermissionScreen onPermissionGranted={handlePermissionGranted} />
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  console.log('Showing HomeScreen');

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <HomeScreen onLogout={handleLogout} />
        <FullScreenAlertOverlay 
          visible={!!fullScreenAlert}
          monitor={fullScreenAlert}
          onDismiss={() => setFullScreenAlert(null)}
        />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
