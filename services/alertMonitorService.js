import { supabase } from '../lib/supabase';
import { showQuickAlert } from '../utils/alertHelper';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { AppState } from 'react-native';
import { showFullScreenAlert } from './globalAlertManager';

let monitorChannel = null;
let isMonitoring = false;

// Khởi động service theo dõi cảnh báo
export const startAlertMonitoring = async () => {
  if (isMonitoring) {
    console.log('Alert monitoring already running');
    return;
  }

  console.log('🚀 Starting alert monitoring service...');
  
  // Yêu cầu quyền notification
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('⚠️ Notification permission not granted');
    } else {
      console.log('✅ Notification permission granted');
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
  
  isMonitoring = true;

  // Subscribe to realtime changes
  monitorChannel = supabase
    .channel('global_alert_monitor')
    .on('postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'alert_monitor'
      },
      (payload) => {
        console.log('🔥 UPDATE EVENT RECEIVED:', JSON.stringify(payload.new));
        handleAlertCheck(payload.new);
      }
    )
    .on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'alert_monitor'
      },
      (payload) => {
        console.log('🔥 INSERT EVENT RECEIVED:', JSON.stringify(payload.new));
        handleAlertCheck(payload.new);
      }
    )
    .subscribe((status, err) => {
      if (err) {
        console.error('❌ Subscription error:', err);
      }
      console.log('📡 Alert monitoring subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed to realtime updates');
      }
    });

  // Kiểm tra ngay lập tức khi khởi động
  checkAllMonitors();
};

// Dừng service
export const stopAlertMonitoring = () => {
  if (monitorChannel) {
    console.log('🛑 Stopping alert monitoring service...');
    supabase.removeChannel(monitorChannel);
    monitorChannel = null;
    isMonitoring = false;
  }
};

// Kiểm tra một monitor
const handleAlertCheck = async (monitor) => {
  console.log('🔍 handleAlertCheck called with:', {
    name: monitor.name,
    current: monitor.current_value,
    threshold: monitor.threshold_value,
    active: monitor.is_active
  });

  if (!monitor.is_active) {
    console.log('⏸️ Monitor is inactive, skipping');
    return;
  }

  console.log(`✅ Checking: ${monitor.name} - ${monitor.current_value} vs ${monitor.threshold_value}`);

  if (monitor.current_value > monitor.threshold_value) {
    console.log('🚨🚨🚨 ALERT TRIGGERED! 🚨🚨🚨');
    console.log(`Value ${monitor.current_value} exceeds threshold ${monitor.threshold_value}`);
    
    // Rung điện thoại
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.log('📳 Haptics triggered');
    } catch (e) {
      console.log('❌ Haptics error:', e);
    }
    
    // Kiểm tra app state
    const appState = AppState.currentState;
    console.log('📱 App state:', appState);
    
    if (appState === 'active') {
      // App đang mở - Hiển thị full-screen alert
      console.log('🔵 App is active - Showing full-screen alert');
      try {
        showFullScreenAlert(monitor);
        console.log('✅ Full-screen alert shown');
      } catch (error) {
        console.error('❌ Error showing full-screen alert:', error);
      }
    } else {
      // App đang đóng hoặc background - Gửi notification
      console.log('📬 Sending notification');
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🚨 CẢNH BÁO KHẨN CẤP',
            body: `${monitor.name}: ${monitor.current_value} > ${monitor.threshold_value}\n\n${monitor.alert_message || 'Vượt ngưỡng cảnh báo!'}`,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
            vibrate: [0, 250, 250, 250],
            data: { 
              monitorId: monitor.id,
              type: 'alert',
              monitor: JSON.stringify(monitor)
            },
          },
          trigger: null,
        });
        console.log('✅ Notification sent');
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  }
};

// Kiểm tra tất cả monitors
const checkAllMonitors = async () => {
  try {
    const { data, error } = await supabase
      .from('alert_monitor')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    console.log(`Checking ${data?.length || 0} monitors...`);
    
    data?.forEach(monitor => {
      if (monitor.current_value > monitor.threshold_value) {
        console.log(`⚠️ Found alert: ${monitor.name}`);
        handleAlertCheck(monitor);
      }
    });
  } catch (error) {
    console.error('Error checking monitors:', error);
  }
};

// Kiểm tra trạng thái
export const isAlertMonitoringActive = () => {
  return isMonitoring;
};

// Export để có thể gọi từ bên ngoài
export const checkMonitorsNow = checkAllMonitors;
