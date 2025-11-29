import { supabase } from '../lib/supabase';
import { showQuickAlert } from '../utils/alertHelper';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';

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
        console.log('📊 Alert monitor detected change:', payload);
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
        console.log('📊 New alert monitor added:', payload);
        handleAlertCheck(payload.new);
      }
    )
    .subscribe((status) => {
      console.log('Alert monitoring subscription status:', status);
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
  if (!monitor.is_active) {
    console.log('Monitor is inactive, skipping');
    return;
  }

  console.log(`Checking: ${monitor.name} - ${monitor.current_value} vs ${monitor.threshold_value}`);

  if (monitor.current_value > monitor.threshold_value) {
    console.log('🚨 ALERT TRIGGERED!');
    
    // Rung điện thoại
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (e) {
      console.log('Haptics error:', e);
    }
    
    // Gửi notification
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
            type: 'alert'
          },
        },
        trigger: null, // Gửi ngay lập tức
      });
      console.log('✅ Notification sent');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
    
    // Cũng hiển thị alert nếu app đang mở
    try {
      showQuickAlert(
        'EMERGENCY',
        `${monitor.name}\n\nGiá trị: ${monitor.current_value}\nNgưỡng: ${monitor.threshold_value}\n\n${monitor.alert_message || 'Vượt ngưỡng cảnh báo!'}`,
        [{ text: 'Đã hiểu' }]
      );
    } catch (e) {
      console.log('Alert error:', e);
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
