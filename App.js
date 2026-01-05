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
import NewLoginScreen from './screens/NewLoginScreen';
import HomeScreen from './screens/HomeScreen';
import PermissionRequestModal from './components/PermissionRequestModal';
import FullScreenAlertOverlay from './components/FullScreenAlertOverlay';
import { setAlertCallback } from './services/globalAlertManager';

// Component chính với AuthProvider
function AppContent() {
  const { user } = useAuth();
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [fullScreenAlert, setFullScreenAlert] = useState(null);

  // Setup global alert callback
  useEffect(() => {
    setAlertCallback((monitor) => {
      console.log('🚨 Showing full-screen alert for:', monitor.name);
      setFullScreenAlert(monitor);
    });
  }, []);

  // Debug logs
  useEffect(() => {
    console.log('🔍 Debug - App state changed:', { 
      hasUser: !!user, 
      permissionsGranted, 
      showPermissionModal 
    });
  }, [user, permissionsGranted, showPermissionModal]);

  // Hiển thị modal quyền khi user đăng nhập lần đầu
  useEffect(() => {
    console.log('🔍 Debug - User effect triggered:', { hasUser: !!user, permissionsGranted });
    
    if (user && !permissionsGranted) {
      console.log('� Debug - Saetting showPermissionModal to true');
      setShowPermissionModal(true);
    } else if (!user) {
      // Reset states khi logout
      setShowPermissionModal(false);
      setPermissionsGranted(false);
    }
  }, [user, permissionsGranted]);

  // Setup monitoring khi user thay đổi và đã có quyền
  useEffect(() => {
    if (user && permissionsGranted) {
      // Tự động tạo profile nếu chưa có
      ensureUserProfile(user.id);
      
      // Khởi động alert monitoring service
      console.log('🔔 Starting alert monitoring for logged in user');
      startAlertMonitoring();
      
      // Đăng ký background service
      registerBackgroundAlertTask();
    } else {
      // Dừng alert monitoring khi user đăng xuất hoặc chưa có quyền
      console.log('🔕 Stopping alert monitoring');
      stopAlertMonitoring();
    }

    return () => {
      stopAlertMonitoring();
    };
  }, [user, permissionsGranted]);

  const handleLogout = async () => {
    console.log('🔍 Debug - Logging out');
    await supabase.auth.signOut();
  };

  const handlePermissionsGranted = () => {
    console.log('🔍 Debug - Permissions granted, hiding modal');
    setShowPermissionModal(false);
    setPermissionsGranted(true);
  };

  // Debug current state
  console.log('🔍 Debug - Current render state:', { 
    hasUser: !!user, 
    permissionsGranted, 
    showPermissionModal,
    willShowModal: user && !permissionsGranted
  });

  if (!user) {
    console.log('🔍 Debug - Showing NewLoginScreen');
    return <NewLoginScreen />;
  }

  // Hiển thị HomeScreen nếu đã có quyền
  if (permissionsGranted) {
    console.log('🔍 Debug - Showing HomeScreen');
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

  // Hiển thị modal yêu cầu quyền
  console.log('🔍 Debug - Showing permission modal with visible:', showPermissionModal);
  return (
    <>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8BA888" />
      </View>
      <PermissionRequestModal
        visible={showPermissionModal}
        onAllPermissionsGranted={handlePermissionsGranted}
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
