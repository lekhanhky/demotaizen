import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Linking,
  ScrollView,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';

const PermissionRequestModal = ({ visible, onAllPermissionsGranted }) => {
  const [permissions, setPermissions] = useState({
    notifications: { granted: false, checking: false },
    audio: { granted: false, checking: false },
    mediaLibrary: { granted: false, checking: false }
  });

  const [allChecked, setAllChecked] = useState(true); // Set to true since we're not checking initially

  // Debug log khi component mount
  useEffect(() => {
    console.log('🔍 PermissionRequestModal - Component mounted with visible:', visible);
  }, []);

  // Debug log khi visible thay đổi
  useEffect(() => {
    console.log('🔍 PermissionRequestModal - Visible changed to:', visible);
    // Don't auto-check permissions when modal becomes visible
    // User needs to manually grant each permission
  }, [visible]);

  // Danh sách quyền cần thiết
  const permissionList = [
    {
      key: 'notifications',
      title: 'Notifications',
      description: 'Receive important notifications from the app',
      icon: 'notifications-outline',
      required: true
    },
    {
      key: 'audio',
      title: 'Microphone',
      description: 'Record audio for chat and voice calls',
      icon: 'mic-outline',
      required: true
    },
    {
      key: 'mediaLibrary',
      title: 'Photo Library',
      description: 'Access photos and videos to share',
      icon: 'images-outline',
      required: true
    }
  ];

  // Kiểm tra trạng thái quyền hiện tại
  const checkPermissions = async () => {
    console.log('🔍 PermissionRequestModal - checkPermissions started');
    try {
      // Kiểm tra notification permission
      console.log('🔍 Checking notification permission...');
      const notificationStatus = await Notifications.getPermissionsAsync();
      console.log('🔍 Notification status:', notificationStatus);
      
      // Kiểm tra audio permission
      console.log('🔍 Checking audio permission...');
      const audioStatus = await Audio.getPermissionsAsync();
      console.log('🔍 Audio status:', audioStatus);
      
      // Kiểm tra media library permission
      console.log('🔍 Checking media library permission...');
      const mediaStatus = await MediaLibrary.getPermissionsAsync();
      console.log('🔍 Media status:', mediaStatus);

      const newPermissions = {
        notifications: { 
          granted: notificationStatus.status === 'granted', 
          checking: false 
        },
        audio: { 
          granted: audioStatus.status === 'granted', 
          checking: false 
        },
        mediaLibrary: { 
          granted: mediaStatus.status === 'granted', 
          checking: false 
        }
      };

      console.log('🔍 Setting permissions:', newPermissions);
      setPermissions(newPermissions);
      setAllChecked(true);
    } catch (error) {
      console.error('🔍 Error checking permissions:', error);
      setPermissions({
        notifications: { granted: false, checking: false },
        audio: { granted: false, checking: false },
        mediaLibrary: { granted: false, checking: false }
      });
      setAllChecked(true);
    }
  };

  // Yêu cầu quyền cụ thể
  const requestPermission = async (permissionType) => {
    // Set checking state
    setPermissions(prev => ({
      ...prev,
      [permissionType]: {
        ...prev[permissionType],
        checking: true
      }
    }));

    try {
      let result;
      
      switch (permissionType) {
        case 'notifications':
          result = await Notifications.requestPermissionsAsync();
          break;
        case 'audio':
          result = await Audio.requestPermissionsAsync();
          break;
        case 'mediaLibrary':
          result = await MediaLibrary.requestPermissionsAsync();
          break;
        default:
          return;
      }

      // Cập nhật trạng thái quyền
      setPermissions(prev => ({
        ...prev,
        [permissionType]: {
          granted: result.status === 'granted',
          checking: false
        }
      }));

      if (result.status === 'denied') {
        Alert.alert(
          'Permission Denied',
          'You can grant this permission in Settings > Apps > DemoTaizen',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } catch (error) {
      console.error(`Error requesting ${permissionType} permission:`, error);
      // Reset checking state on error
      setPermissions(prev => ({
        ...prev,
        [permissionType]: {
          granted: false,
          checking: false
        }
      }));
    }
  };

  // Yêu cầu tất cả quyền
  const requestAllPermissions = async () => {
    console.log('🔍 Requesting all permissions...');
    for (const permission of permissionList) {
      if (!permissions[permission.key]?.granted) {
        await requestPermission(permission.key);
        // Add small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  // Kiểm tra xem tất cả quyền đã được cấp chưa
  const allPermissionsGranted = () => {
    return permissionList.every(permission => 
      permissions[permission.key]?.granted === true
    );
  };

  // Xử lý khi nhấn "Tiếp tục"
  const handleContinue = () => {
    console.log('🔍 PermissionRequestModal - handleContinue called');
    if (allPermissionsGranted()) {
      console.log('🔍 All permissions granted, calling onAllPermissionsGranted');
      onAllPermissionsGranted();
    } else {
      console.log('🔍 Not all permissions granted, showing alert');
      Alert.alert(
        'Permissions Required',
        'Please grant all necessary permissions to use the app.',
        [{ text: 'OK' }]
      );
    }
  };

  // Bỏ qua (cho phép sử dụng app mà không cần tất cả quyền)
  const handleSkip = () => {
    console.log('🔍 PermissionRequestModal - handleSkip called');
    Alert.alert(
      'Skip permissions?',
      'Some features may not work properly without the required permissions.',
      [
        { text: 'Go Back', style: 'cancel' },
        { 
          text: 'Skip', 
          onPress: () => {
            console.log('🔍 User chose to skip permissions');
            onAllPermissionsGranted();
          }
        }
      ]
    );
  };

  useEffect(() => {
    // Remove auto-check when modal becomes visible
    // Permissions start as not granted and user must manually grant them
  }, [visible]);

  const renderPermissionItem = (permission) => {
    const permissionState = permissions[permission.key];
    const isGranted = permissionState?.granted;
    const isChecking = permissionState?.checking;

    return (
      <View key={permission.key} style={styles.permissionItem}>
        <View style={styles.permissionIconContainer}>
          <LinearGradient
            colors={isGranted ? ['#4CAF50', '#45A049'] : ['#333', '#555']} // Gray when not granted
            style={styles.permissionIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons 
              name={permission.icon} 
              size={24} 
              color={isGranted ? "#fff" : "#888"} // White when granted, gray when not
            />
          </LinearGradient>
        </View>
        
        <View style={styles.permissionContent}>
          <Text style={styles.permissionTitle}>{permission.title}</Text>
          <Text style={styles.permissionDescription}>{permission.description}</Text>
        </View>

        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => requestPermission(permission.key)}
          disabled={isChecking || isGranted}
        >
          <LinearGradient
            colors={isGranted ? ['#4CAF50', '#45A049'] : ['#333', '#555']} // Gray gradient when not granted
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isChecking ? (
              <Text style={[styles.buttonText, { color: '#fff' }]}>Checking...</Text>
            ) : isGranted ? (
              <Ionicons name="checkmark" size={16} color="#fff" />
            ) : (
              <Text style={[styles.buttonText, { color: '#888' }]}>Grant</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent={true}
      onShow={() => console.log('🔍 PermissionRequestModal - Modal onShow called')}
      onDismiss={() => console.log('🔍 PermissionRequestModal - Modal onDismiss called')}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#FFD700', '#B8860B', '#DAA520']}
            style={styles.logoCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="shield-checkmark-outline" size={48} color="#000" />
          </LinearGradient>
          <Text style={styles.title}>Grant Permissions</Text>
          <Text style={styles.subtitle}>
            The app needs some permissions to work properly
          </Text>
        </View>

        <ScrollView 
          style={styles.permissionsList} 
          contentContainerStyle={styles.permissionsListContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.permissionsContainer}>
            {permissionList.map(renderPermissionItem)}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.requestAllButtonWrapper}
            onPress={requestAllPermissions}
            disabled={!allChecked}
          >
            <LinearGradient
              colors={['#FFD700', '#B8860B', '#DAA520']}
              style={styles.requestAllButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.requestAllButtonText}>Grant All Permissions</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueButtonWrapper}
              onPress={handleContinue}
            >
              <LinearGradient
                colors={allPermissionsGranted() ? ['#FFD700', '#B8860B', '#DAA520'] : ['#333', '#555']}
                style={styles.continueButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[
                  styles.continueButtonText,
                  allPermissionsGranted() ? styles.continueButtonTextEnabled : styles.continueButtonTextDisabled
                ]}>
                  Continue
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Black background like login
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700', // Gold color like login
    marginTop: 16,
    textAlign: 'center',
    textShadowColor: '#B8860B',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#888', // Gray text like login
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  permissionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  permissionsListContent: {
    alignItems: 'center',
  },
  permissionsContainer: {
    width: '85%',
    maxWidth: 305,
    borderWidth: 1,
    borderColor: '#FFD700', // Gold border like login form
    borderRadius: 15,
    padding: 20,
    backgroundColor: 'transparent',
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 12,
  },
  permissionIconContainer: {
    marginRight: 16,
  },
  permissionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionContent: {
    flex: 1,
    marginRight: 12,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff', // White text
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 13,
    color: '#888', // Gray text
    lineHeight: 18,
  },
  permissionButton: {
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  buttonGradient: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  grantedButton: {
    // Removed - using gradient instead
  },
  pendingButton: {
    // Removed - using gradient instead
  },
  buttonText: {
    color: '#000', // Black text on gold gradient
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  requestAllButtonWrapper: {
    borderRadius: 25,
    marginBottom: 16,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  requestAllButton: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  requestAllButtonText: {
    color: '#000', // Black text on gold gradient
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  skipButtonText: {
    color: '#888', // Gray text like login
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  continueButtonWrapper: {
    flex: 1,
    borderRadius: 25,
    marginLeft: 8,
  },
  continueButton: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextEnabled: {
    color: '#000', // Black text on gold gradient
  },
  continueButtonTextDisabled: {
    color: '#888', // Gray text on dark gradient
  },
});

export default PermissionRequestModal;