import { StatusBar } from 'expo-status-bar';
import { supabase } from './lib/supabase';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './contexts/ThemeContext';
import { ensureUserProfile } from './utils/profileHelper';
import { startAlertMonitoring, stopAlertMonitoring } from './services/alertMonitorService';
import { registerBackgroundAlertTask } from './services/backgroundAlertService';
import * as Notifications from 'expo-notifications';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import PermissionScreen from './screens/PermissionScreen';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);

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
    // Check session với timeout để tránh treo
    const checkSession = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 10000) // Tăng timeout lên 10 giây
        );
        
        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
        
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
        setSession(session);
      } catch (error) {
        console.log('Session check error:', error);
        // Nếu timeout, thử lấy session từ storage trước
        try {
          const { data: { session: fallbackSession } } = await supabase.auth.getSession();
          setSession(fallbackSession);
        } catch (fallbackError) {
          console.log('Fallback session check failed:', fallbackError);
          setSession(null);
        }
      } finally {
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
    return null; // hoặc có thể thêm splash screen
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
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
