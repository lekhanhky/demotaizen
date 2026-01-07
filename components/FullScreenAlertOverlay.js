import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

export default function FullScreenAlertOverlay({ visible, monitor, onDismiss }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    let sound = null;

    // Phát âm thanh cảnh báo liên tục
    const playAlertSound = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        const { sound: alertSound } = await Audio.Sound.createAsync(
          { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
          { shouldPlay: true, isLooping: true, volume: 1.0 }
        );
        sound = alertSound;
      } catch (error) {
        console.error('Error playing alert sound:', error);
      }
    };

    playAlertSound();

    // Rung liên tục
    const vibrateInterval = setInterval(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }, 1000);

    // Animation pulse
    const pulseAnimation = Animated.loop(
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
    );
    pulseAnimation.start();

    // Animation shake
    const shakeAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    );
    shakeAnimation.start();

    return () => {
      clearInterval(vibrateInterval);
      pulseAnimation.stop();
      shakeAnimation.stop();
      // Dừng âm thanh khi đóng
      if (sound) {
        sound.stopAsync();
        sound.unloadAsync();
      }
    };
  }, [visible]);

  if (!monitor) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onDismiss}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Animated.View style={[styles.content, { transform: [{ translateX: shakeAnim }] }]}>
          <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons name="warning" size={120} color="#fff" />
          </Animated.View>

          <Text style={styles.title}>🚨 URGENT ALERT 🚨</Text>

          <View style={styles.valuesContainer}>
            <View style={styles.valueBox}>
              <Text style={styles.valueLabel}>Current Value</Text>
              <Text style={styles.currentValue}>{monitor.current_value}</Text>
            </View>
            
            <Ionicons name="arrow-forward" size={40} color="#fff" style={styles.arrow} />
            
            <View style={styles.valueBox}>
              <Text style={styles.valueLabel}>Alert Threshold</Text>
              <Text style={styles.thresholdValue}>{monitor.threshold_value}</Text>
            </View>
          </View>

          <Text style={styles.time}>{new Date().toLocaleTimeString('en-US')}</Text>

          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <Ionicons name="close-circle" size={32} color="#fff" />
            <Text style={styles.buttonText}>Got it</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#17a2b8', // Màu xanh dương nhạt
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
  dismissButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    gap: 12,
    width: '100%',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
});
