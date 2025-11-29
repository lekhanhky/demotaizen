import { supabase } from '../lib/supabase';
import { showQuickAlert } from '../utils/alertHelper';

let monitorChannel = null;
let isMonitoring = false;

// Khởi động service theo dõi cảnh báo
export const startAlertMonitoring = () => {
  if (isMonitoring) {
    console.log('Alert monitoring already running');
    return;
  }

  console.log('🚀 Starting alert monitoring service...');
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
const handleAlertCheck = (monitor) => {
  if (!monitor.is_active) {
    console.log('Monitor is inactive, skipping');
    return;
  }

  console.log(`Checking: ${monitor.name} - ${monitor.current_value} vs ${monitor.threshold_value}`);

  if (monitor.current_value > monitor.threshold_value) {
    console.log('🚨 ALERT TRIGGERED!');
    
    showQuickAlert(
      'EMERGENCY',
      `${monitor.name}\n\nGiá trị: ${monitor.current_value}\nNgưỡng: ${monitor.threshold_value}\n\n${monitor.alert_message || 'Vượt ngưỡng cảnh báo!'}`,
      [{ text: 'Đã hiểu' }]
    );
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
