// Test script to check permissions
// Run: node scripts/test-permissions.js

const permissions = [
  'android.permission.RECORD_AUDIO',
  'android.permission.READ_EXTERNAL_STORAGE', 
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_VIDEO',
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.VIBRATE',
  'android.permission.INTERNET',
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.WAKE_LOCK',
  'android.permission.RECEIVE_BOOT_COMPLETED',
  'android.permission.MODIFY_AUDIO_SETTINGS',
  'android.permission.SYSTEM_ALERT_WINDOW'
];

console.log('🔍 List of permissions in AndroidManifest.xml:');
console.log('=====================================');

permissions.forEach((permission, index) => {
  const permissionName = permission.split('.').pop();
  const isDangerous = [
    'RECORD_AUDIO',
    'READ_EXTERNAL_STORAGE', 
    'READ_MEDIA_IMAGES',
    'READ_MEDIA_VIDEO',
    'WRITE_EXTERNAL_STORAGE',
    'SYSTEM_ALERT_WINDOW'
  ].includes(permissionName);
  
  console.log(`${index + 1}. ${permissionName}`);
  console.log(`   - Type: ${isDangerous ? '🔴 Dangerous (requires confirmation)' : '🟢 Normal (auto-granted)'}`);
  console.log(`   - Full name: ${permission}`);
  console.log('');
});

console.log('📱 Permissions to be requested in popup:');
console.log('=====================================');
console.log('1. 🎤 RECORD_AUDIO - Audio recording');
console.log('2. 📁 READ_EXTERNAL_STORAGE/READ_MEDIA_* - File access');
console.log('3. 🔔 POST_NOTIFICATIONS - Notifications (Android 13+)');
console.log('');

console.log('✅ To test:');
console.log('1. Build APK: expo build:android or eas build --platform android');
console.log('2. Install on real device');
console.log('3. Login and check popup appears');
console.log('4. Test grant/deny permissions');