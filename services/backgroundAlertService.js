import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { supabase } from '../lib/supabase';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const BACKGROUND_ALERT_TASK = 'BACKGROUND_ALERT_TASK';

// Cấu hình notification
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

// Định nghĩa background task
TaskManager.defineTask(BACKGROUND_ALERT_TASK, async () => {
  try {
    console.log('🔍 Background task checking alerts...');
    
    // Check monitors
    const { data, error } = await supabase
      .from('alert_monitor')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    // Check each monitor
    for (const monitor of data || []) {
      if (monitor.current_value > monitor.threshold_value) {
        console.log('🚨 Alert detected in background:', monitor.name);
        
        // Send notification
        await sendAlertNotification(monitor);
        
        // Rung điện thoại
        try {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          );
        } catch (e) {
          console.log('Haptics error:', e);
        }
      }
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Gửi notification
const sendAlertNotification = async (monitor) => {
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
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Register background task
export const registerBackgroundAlertTask = async () => {
  try {
    // Check notification permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    // Cấu hình notification channel cho Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alerts', {
        name: 'Cảnh báo khẩn cấp',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: true,
        enableVibrate: true,
        enableLights: true,
        lightColor: '#FF0000',
      });
    }

    // Register background fetch
    await BackgroundFetch.registerTaskAsync(BACKGROUND_ALERT_TASK, {
      minimumInterval: 15 * 60, // 15 phút (tối thiểu cho Android)
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log('✅ Background alert task registered');
    return true;
  } catch (error) {
    console.error('Error registering background task:', error);
    return false;
  }
};

// Unregister background task
export const unregisterBackgroundAlertTask = async () => {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_ALERT_TASK);
    console.log('Background alert task unregistered');
  } catch (error) {
    console.error('Error unregistering background task:', error);
  }
};

// Check background task status
export const getBackgroundTaskStatus = async () => {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_ALERT_TASK);
    
    return {
      status,
      isRegistered,
      statusText: status === BackgroundFetch.BackgroundFetchStatus.Available 
        ? 'Available' 
        : 'Restricted',
    };
  } catch (error) {
    console.error('Error getting background task status:', error);
    return null;
  }
};

// Send test notification
export const sendTestNotification = async () => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Test Notification',
        body: 'Background alert service is running!',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
  }
};
