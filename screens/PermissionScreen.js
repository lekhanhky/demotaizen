import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../contexts/ThemeContext';

export default function PermissionScreen({ onPermissionGranted }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const requestPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status === 'granted') {
        console.log('✅ Notification permission granted');
        onPermissionGranted();
      } else {
        console.log('❌ Notification permission denied');
        alert('Cần cấp quyền thông báo để nhận cảnh báo khẩn cấp');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      alert('Lỗi khi yêu cầu quyền: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={120} color={theme.primary} />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>
          Cho phép thông báo
        </Text>

        <Text style={[styles.description, { color: theme.secondaryText }]}>
          Để nhận cảnh báo khẩn cấp ngay cả khi app đang đóng, vui lòng cho phép quyền thông báo.
        </Text>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#28a745" />
            <Text style={[styles.featureText, { color: theme.text }]}>
              Nhận cảnh báo realtime
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#28a745" />
            <Text style={[styles.featureText, { color: theme.text }]}>
              Rung + âm thanh cảnh báo
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#28a745" />
            <Text style={[styles.featureText, { color: theme.text }]}>
              Theo dõi ngay cả khi app đóng
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.allowButton, { backgroundColor: theme.primary }]}
          onPress={requestPermission}
        >
          <Text style={styles.allowButtonText}>Cho phép thông báo</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.skipButton}
          onPress={onPermissionGranted}
        >
          <Text style={[styles.skipButtonText, { color: theme.secondaryText }]}>
            Bỏ qua (không khuyến nghị)
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresList: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
  },
  allowButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  allowButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 14,
  },
});
