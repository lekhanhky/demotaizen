import { Alert, Vibration, Platform } from 'react-native';
import { Audio } from 'expo-av';

// Tạo âm thanh chuông cảnh báo
const createAlertSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      // Sử dụng âm thanh hệ thống hoặc có thể thêm file âm thanh riêng
      require('../assets/alert-sound.mp3'),
      { shouldPlay: false }
    );
    return sound;
  } catch (error) {
    console.log('Không thể tải âm thanh cảnh báo:', error);
    return null;
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
}) => {
  try {
    // Bật âm thanh nếu cần
    if (sound) {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
      
      const alertSound = await createAlertSound();
      if (alertSound) {
        await alertSound.playAsync();
        // Tự động dọn dẹp sau khi phát xong
        alertSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            alertSound.unloadAsync();
          }
        });
      }
    }

    // Rung điện thoại nếu cần
    if (vibrate) {
      if (Platform.OS === 'android') {
        Vibration.vibrate(vibrationPattern);
      } else {
        // iOS chỉ hỗ trợ rung đơn giản
        Vibration.vibrate();
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
  },
  
  // Cảnh báo thông thường
  WARNING: {
    title: '⚠️ Cảnh báo',
    vibrationPattern: [0, 500, 200, 500],
    sound: true,
    vibrate: true,
  },
  
  // Thông báo quan trọng
  IMPORTANT: {
    title: '🔔 Thông báo quan trọng',
    vibrationPattern: [0, 300],
    sound: true,
    vibrate: true,
  },
  
  // Cảnh báo khẩn cấp
  EMERGENCY: {
    title: '🚨 KHẨN CẤP',
    vibrationPattern: [0, 200, 100, 200, 100, 200, 100, 200],
    sound: true,
    vibrate: true,
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
