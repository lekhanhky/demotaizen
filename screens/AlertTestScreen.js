import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { showAlert, showQuickAlert, AlertTypes, stopVibration } from '../utils/alertHelper';

export default function AlertTestScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const testBasicAlert = () => {
    showAlert({
      title: 'Cảnh báo cơ bản',
      message: 'Đây là cảnh báo với rung và âm thanh',
      vibrate: true,
      sound: true,
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        { text: 'OK', onPress: () => console.log('OK pressed') }
      ],
    });
  };

  const testDangerAlert = () => {
    showQuickAlert(
      'DANGER',
      'Phát hiện hoạt động bất thường! Vui lòng kiểm tra ngay.',
      [
        { text: 'Bỏ qua', style: 'cancel' },
        { text: 'Kiểm tra', onPress: () => console.log('Checking...') }
      ]
    );
  };

  const testWarningAlert = () => {
    showQuickAlert(
      'WARNING',
      'Bạn có chắc chắn muốn thực hiện hành động này?',
      [
        { text: 'Không', style: 'cancel' },
        { text: 'Có', onPress: () => console.log('Confirmed') }
      ]
    );
  };

  const testImportantAlert = () => {
    showQuickAlert(
      'IMPORTANT',
      'Bạn có tin nhắn quan trọng mới!',
      [{ text: 'Xem ngay' }]
    );
  };

  const testEmergencyAlert = () => {
    showQuickAlert(
      'EMERGENCY',
      'CẢNH BÁO KHẨN CẤP! Cần hành động ngay lập tức!',
      [
        { text: 'Đã hiểu', onPress: () => stopVibration() }
      ]
    );
  };

  const testCustomAlert = () => {
    showAlert({
      title: '🎉 Tùy chỉnh',
      message: 'Cảnh báo với pattern rung tùy chỉnh',
      vibrate: true,
      sound: true,
      vibrationPattern: [0, 100, 50, 100, 50, 100, 50, 100],
      buttons: [{ text: 'Tuyệt vời!' }],
    });
  };

  const testNoVibration = () => {
    showAlert({
      title: '🔇 Không rung',
      message: 'Chỉ có âm thanh, không rung',
      vibrate: false,
      sound: true,
      buttons: [{ text: 'OK' }],
    });
  };

  const testNoSound = () => {
    showAlert({
      title: '📳 Không âm thanh',
      message: 'Chỉ rung, không có âm thanh',
      vibrate: true,
      sound: false,
      buttons: [{ text: 'OK' }],
    });
  };

  const testSoundOnly = async () => {
    // Test âm thanh trực tiếp
    try {
      const { Audio } = require('expo-av');
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
        { shouldPlay: true, volume: 1.0 }
      );
      
      console.log('Đang phát âm thanh test...');
      setTimeout(() => sound.unloadAsync(), 1000);
    } catch (error) {
      console.error('Lỗi test âm thanh:', error);
      Alert.alert('Lỗi', 'Không thể phát âm thanh: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Test Cảnh Báo</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Cảnh báo Preset</Text>
        
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={testDangerAlert}>
          <Ionicons name="warning" size={24} color="#fff" />
          <Text style={styles.buttonText}>Cảnh báo Nguy hiểm</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.warningButton]} onPress={testWarningAlert}>
          <Ionicons name="alert-circle" size={24} color="#fff" />
          <Text style={styles.buttonText}>Cảnh báo Thông thường</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.importantButton]} onPress={testImportantAlert}>
          <Ionicons name="notifications" size={24} color="#fff" />
          <Text style={styles.buttonText}>Thông báo Quan trọng</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.emergencyButton]} onPress={testEmergencyAlert}>
          <Ionicons name="flash" size={24} color="#fff" />
          <Text style={styles.buttonText}>Cảnh báo Khẩn cấp</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: 24, color: theme.text }]}>Tùy chỉnh</Text>

        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={testBasicAlert}>
          <Ionicons name="information-circle" size={24} color="#fff" />
          <Text style={styles.buttonText}>Cảnh báo Cơ bản</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={testCustomAlert}>
          <Ionicons name="settings" size={24} color="#fff" />
          <Text style={styles.buttonText}>Pattern Tùy chỉnh</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={testNoVibration}>
          <Ionicons name="volume-high" size={24} color="#fff" />
          <Text style={styles.buttonText}>Chỉ Âm thanh</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={testNoSound}>
          <Ionicons name="phone-portrait" size={24} color="#fff" />
          <Text style={styles.buttonText}>Chỉ Rung</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: 24, color: theme.text }]}>Debug</Text>

        <TouchableOpacity style={[styles.button, { backgroundColor: '#17a2b8' }]} onPress={testSoundOnly}>
          <Ionicons name="musical-notes" size={24} color="#fff" />
          <Text style={styles.buttonText}>Test Âm thanh (Debug)</Text>
        </TouchableOpacity>

        <View style={[styles.infoBox, { backgroundColor: theme.inputBackground }]}>
          <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
          <Text style={[styles.infoText, { color: theme.secondaryText }]}>
            Lưu ý: Âm thanh và rung phụ thuộc vào cài đặt điện thoại của bạn. Kiểm tra volume và quyền của app.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  warningButton: {
    backgroundColor: '#fd7e14',
  },
  importantButton: {
    backgroundColor: '#0d6efd',
  },
  emergencyButton: {
    backgroundColor: '#d63384',
  },
  primaryButton: {
    backgroundColor: theme.primary || '#1d9bf0',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    marginLeft: 8,
  },
});
