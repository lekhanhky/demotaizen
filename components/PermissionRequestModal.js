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
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';

const PermissionRequestModal = ({ visible, onAllPermissionsGranted }) => {
  const [permissions, setPermissions] = useState({
    notifications: { granted: false, checking: true },
    audio: { granted: false, checking: true },
    mediaLibrary: { granted: false, checking: true }
  });

  const [allChecked, setAllChecked] = useState(false);

  // Debug log khi component mount
  useEffect(() => {
    console.log('🔍 PermissionRequestModal - Component mounted with visible:', visible);
  }, []);

  // Debug log khi visible thay đổi
  useEffect(() => {
    console.log('🔍 PermissionRequestModal - Visible changed to:', visible);
    if (visible) {
      console.log('🔍 PermissionRequestModal - Starting permission check...');
      checkPermissions();
    }
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
    }
  };

  // Yêu cầu tất cả quyền
  const requestAllPermissions = async () => {
    for (const permission of permissionList) {
      if (!permissions[permission.key]?.granted) {
        await requestPermission(permission.key);
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
    if (visible) {
      checkPermissions();
    }
  }, [visible]);

  const renderPermissionItem = (permission) => {
    const permissionState = permissions[permission.key];
    const isGranted = permissionState?.granted;
    const isChecking = permissionState?.checking;

    return (
      <View key={permission.key} style={styles.permissionItem}>
        <View style={styles.permissionIcon}>
          <Ionicons 
            name={permission.icon} 
            size={24} 
            color={isGranted ? '#4CAF50' : '#757575'} 
          />
        </View>
        
        <View style={styles.permissionContent}>
          <Text style={styles.permissionTitle}>{permission.title}</Text>
          <Text style={styles.permissionDescription}>{permission.description}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.permissionButton,
            isGranted ? styles.grantedButton : styles.pendingButton
          ]}
          onPress={() => requestPermission(permission.key)}
          disabled={isChecking || isGranted}
        >
          {isChecking ? (
            <Text style={styles.buttonText}>Checking...</Text>
          ) : isGranted ? (
            <Ionicons name="checkmark" size={16} color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Grant</Text>
          )}
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
          <Ionicons name="shield-checkmark-outline" size={48} color="#8BA888" />
          <Text style={styles.title}>Grant Permissions</Text>
          <Text style={styles.subtitle}>
            The app needs some permissions to work properly
          </Text>
        </View>

        <ScrollView style={styles.permissionsList} showsVerticalScrollIndicator={false}>
          {permissionList.map(renderPermissionItem)}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.requestAllButton}
            onPress={requestAllPermissions}
            disabled={!allChecked}
          >
            <Text style={styles.requestAllButtonText}>Grant All Permissions</Text>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.continueButton,
                allPermissionsGranted() ? styles.continueButtonEnabled : styles.continueButtonDisabled
              ]}
              onPress={handleContinue}
            >
              <Text style={[
                styles.continueButtonText,
                allPermissionsGranted() ? styles.continueButtonTextEnabled : styles.continueButtonTextDisabled
              ]}>
                Continue
              </Text>
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
    backgroundColor: '#FAF8F5',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  permissionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  permissionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 18,
  },
  permissionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  grantedButton: {
    backgroundColor: '#4CAF50',
  },
  pendingButton: {
    backgroundColor: '#8BA888',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  requestAllButton: {
    backgroundColor: '#8BA888',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 16,
  },
  requestAllButtonText: {
    color: '#fff',
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
    color: '#7F8C8D',
    fontSize: 16,
    fontWeight: '500',
  },
  continueButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginLeft: 8,
  },
  continueButtonEnabled: {
    backgroundColor: '#27AE60',
  },
  continueButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextEnabled: {
    color: '#fff',
  },
  continueButtonTextDisabled: {
    color: '#7F8C8D',
  },
});

export default PermissionRequestModal;