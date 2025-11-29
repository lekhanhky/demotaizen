import { Alert, Vibration, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

// Phát âm thanh cảnh báo
const playAlertSound = async (alertType = 'WARNING') => {
  try {
    // Cấu hình audio mode
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      allowsRecordingIOS: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // Sử dụng âm thanh notification từ URL công khai
    // Đây là âm thanh beep/alert miễn phí
    const alertSoundUrl = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
    
    // Phát âm thanh nhiều lần tùy theo loại cảnh báo
    const beepCount = alertType === 'EMERGENCY' ? 3 : alertType === 'DANGER' ? 2 : 1;
    
    for (let i = 0; i < beepCount; i++) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: alertSoundUrl },
          { shouldPlay: true, volume: 1.0 },
          null,
          true // Download first
        );
        
        // Đợi âm thanh phát xong (khoảng 500ms)
        await new Promise(resolve => setTimeout(resolve, 500));
        await sound.unloadAsync();
        
        // Nghỉ giữa các beep
        if (i < beepCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (err) {
        console.log('Lỗi phát beep:', err);
      }
    }
    
    return true;
  } catch (error) {
    console.log('Không thể phát âm thanh:', error);
    return false;
  }
};

// Hàm cảnh báo chính
export const showAlert = async ({
  title = 'Cảnh báo',
  message = '',
  vibrate = true,
  sound = true,
  buttons = [{ text: 'OK' }],
  vibrationPattern = [0, 500, 200, 500], // Rung 2 lần
  alertType = 'WARNING', // Loại cảnh báo để xác định số lần beep
}) => {
  try {
    // Phát âm thanh trước (không chặn)
    if (sound) {
      playAlertSound(alertType).catch(err => console.log('Sound error:', err));
    }

    // Rung điện thoại nếu cần (dùng Haptics cho trải nghiệm tốt hơn)
    if (vibrate) {
      try {
        // Sử dụng Haptics cho rung mượt mà hơn
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning
        );
        
        // Thêm pattern rung tùy chỉnh
        if (Platform.OS === 'android') {
          Vibration.vibrate(vibrationPattern);
        } else {
          // iOS: rung nhiều lần theo pattern
          const vibrationCount = Math.floor(vibrationPattern.length / 2);
          for (let i = 0; i < vibrationCount; i++) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      } catch (error) {
        console.log('Lỗi rung:', error);
        // Fallback về Vibration thông thường
        Vibration.vibrate(vibrationPattern);
      }
    }

    // Hiển thị popup cảnh báo
    Alert.alert(title, message, buttons, {
      cancelable: false,
    });
  } catch (error) {
    console.error('Lỗi khi hiển thị cảnh báo:', error);
    // Fallback: chỉ hiển thị Alert thông thường
    Alert.alert(title, message, buttons);
  }
};

// Các loại cảnh báo preset
export const AlertTypes = {
  // Cảnh báo nguy hiểm
  DANGER: {
    title: '⚠️ Cảnh báo nguy hiểm',
    vibrationPattern: [0, 400, 200, 400, 200, 400],
    sound: true,
    vibrate: true,
    alertType: 'DANGER',
  },
  
  // Cảnh báo thông thường
  WARNING: {
    title: '⚠️ Cảnh báo',
    vibrationPattern: [0, 500, 200, 500],
    sound: true,
    vibrate: true,
    alertType: 'WARNING',
  },
  
  // Thông báo quan trọng
  IMPORTANT: {
    title: '🔔 Thông báo quan trọng',
    vibrationPattern: [0, 300],
    sound: true,
    vibrate: true,
    alertType: 'WARNING',
  },
  
  // Cảnh báo khẩn cấp
  EMERGENCY: {
    title: '🚨 KHẨN CẤP',
    vibrationPattern: [0, 200, 100, 200, 100, 200, 100, 200],
    sound: true,
    vibrate: true,
    alertType: 'EMERGENCY',
  },
};

// Hàm cảnh báo nhanh với preset
export const showQuickAlert = async (type, message, buttons) => {
  const preset = AlertTypes[type] || AlertTypes.WARNING;
  await showAlert({
    ...preset,
    message,
    buttons,
  });
};

// Hàm dừng rung (nếu cần)
export const stopVibration = () => {
  Vibration.cancel();
};
