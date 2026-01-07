import AsyncStorage from '@react-native-async-storage/async-storage';

const PERMISSIONS_KEY = 'permissions_granted';

export const savePermissionsGranted = async () => {
  try {
    await AsyncStorage.setItem(PERMISSIONS_KEY, 'true');
    console.log('✅ Permissions saved to storage');
    return true;
  } catch (error) {
    console.error('❌ Error saving permissions:', error);
    return false;
  }
};

export const loadPermissionsGranted = async () => {
  try {
    const value = await AsyncStorage.getItem(PERMISSIONS_KEY);
    const granted = value === 'true';
    console.log('📱 Loaded permissions from storage:', granted);
    return granted;
  } catch (error) {
    console.error('❌ Error loading permissions:', error);
    return false;
  }
};

export const resetPermissions = async () => {
  try {
    await AsyncStorage.removeItem(PERMISSIONS_KEY);
    console.log('🔄 Permissions reset - will show modal again');
    return true;
  } catch (error) {
    console.error('❌ Error resetting permissions:', error);
    return false;
  }
};

export const checkPermissionsStatus = async () => {
  try {
    const value = await AsyncStorage.getItem(PERMISSIONS_KEY);
    console.log('🔍 Current permissions status:', value);
    return value;
  } catch (error) {
    console.error('❌ Error checking permissions:', error);
    return null;
  }
};