import { StatusBar } from 'expo-status-bar';
import { supabase } from './lib/supabase';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ensureUserProfile } from './utils/profileHelper';
import { startAlertMonitoring, stopAlertMonitoring } from './services/alertMonitorService';
import { registerBackgroundAlertTask } from './services/backgroundAlertService';
import * as Notifications from 'expo-notifications';
import NewLoginScreen from './screens/NewLoginScreen';
import HomeScreen from './screens/HomeScreen';
import PermissionScreen from './screens/PermissionScreen';
import FullScreenAlertOverlay from './components/FullScreenAlertOverlay';
import { setAlertCallback } from './services/globalAlertManager';

// Component chính với AuthProvider
function AppContent() {
  const { user, session } = useAuth();
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

  // Setup monitoring khi user thay đổi
  useEffect(() => {
    if (user) {
      // Tự động tạo profile nếu chưa có
      ensureUserProfile(user.id);
      
      // Khởi động alert monitoring service
      console.log('🔔 Starting alert monitoring for logged in user');
      startAlertMonitoring();
      
      // Đăng ký background service
      registerBackgroundAlertTask();
    } else {
      // Dừng alert monitoring khi user đăng xuất
      console.log('🔕 Stopping alert monitoring');
      stopAlertMonitoring();
    }

    return () => {
      stopAlertMonitoring();
    };
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handlePermissionGranted = () => {
    setHasNotificationPermission(true);
  };

  // Show loading state while checking permission
  if (checkingPermission) {
    console.log('Checking permission...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8BA888" />
      </View>
    );
  }

  console.log('App state:', { user: !!user, hasNotificationPermission });

  if (!user) {
    console.log('Showing NewLoginScreen');
    return <NewLoginScreen />;
  }

  // Hiển thị màn hình yêu cầu quyền nếu chưa có
  if (!hasNotificationPermission) {
    console.log('Showing PermissionScreen');
    return (
      <>
        <PermissionScreen onPermissionGranted={handlePermissionGranted} />
        <StatusBar style="auto" />
      </>
    );
  }

  console.log('Showing HomeScreen');

  return (
    <>
      <HomeScreen onLogout={handleLogout} />
      <FullScreenAlertOverlay 
        visible={!!fullScreenAlert}
        monitor={fullScreenAlert}
        onDismiss={() => setFullScreenAlert(null)}
      />
      <StatusBar style="auto" />
    </>
  );
}

// Component wrapper với providers
export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
