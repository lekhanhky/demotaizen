import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function FullScreenAlertScreen({ route, navigation }) {
  const { monitor } = route.params;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Rung liên tục
    const vibrateInterval = setInterval(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }, 1000);

    // Animation pulse cho icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animation shake cho màn hình
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      clearInterval(vibrateInterval);
    };
  }, []);

  const handleDismiss = () => {
    navigation.goBack();
  };

  const handleViewDetails = () => {
    navigation.replace('AlertMonitor');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Animated.View 
        style={[
          styles.content,
          { transform: [{ translateX: shakeAnim }] }
        ]}
      >
        {/* Icon cảnh báo */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="warning" size={120} color="#fff" />
        </Animated.View>

        {/* Tiêu đề */}
        <Text style={styles.title}>🚨 CẢNH BÁO KHẨN CẤP 🚨</Text>

        {/* Tên monitor */}
        <View style={styles.infoBox}>
          <Text style={styles.monitorName}>{monitor.name}</Text>
        </View>

        {/* Giá trị */}
        <View style={styles.valuesContainer}>
          <View style={styles.valueBox}>
            <Text style={styles.valueLabel}>Giá trị hiện tại</Text>
            <Text style={styles.currentValue}>{monitor.current_value}</Text>
          </View>
          
          <Ionicons name="arrow-forward" size={40} color="#fff" style={styles.arrow} />
          
          <View style={styles.valueBox}>
            <Text style={styles.valueLabel}>Ngưỡng cảnh báo</Text>
            <Text style={styles.thresholdValue}>{monitor.threshold_value}</Text>
          </View>
        </View>

        {/* Message */}
        <View style={styles.messageBox}>
          <Text style={styles.message}>{monitor.alert_message || 'Vượt ngưỡng cảnh báo!'}</Text>
        </View>

        {/* Thời gian */}
        <Text style={styles.time}>{new Date().toLocaleTimeString('vi-VN')}</Text>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.viewButton]}
            onPress={handleViewDetails}
          >
            <Ionicons name="eye" size={28} color="#fff" />
            <Text style={styles.buttonText}>Xem chi tiết</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.dismissButton]}
            onPress={handleDismiss}
          >
            <Ionicons name="close-circle" size={28} color="#fff" />
            <Text style={styles.buttonText}>Đã hiểu</Text>
          </TouchableOpacity>
        </View>

        {/* Swipe hint */}
        <Text style={styles.hint}>Vuốt xuống để đóng</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dc3545',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 24,
    width: '100%',
  },
  monitorName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  valuesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  valueBox: {
    flex: 1,
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  currentValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
  },
  thresholdValue: {
    fontSize: 48,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  arrow: {
    marginHorizontal: 8,
  },
  messageBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
  },
  message: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
  },
  time: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 40,
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
  },
  viewButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dismissButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  hint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 24,
  },
});
