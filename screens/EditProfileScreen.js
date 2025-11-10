import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

export default function EditProfileScreen({ navigation, onProfileUpdated }) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setUserProfile(data);
          setDisplayName(data.display_name || '');
          setUsername(data.username || '');
          setBio(data.bio || '');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedAvatar(result.assets[0]);
    }
  };

  const uploadAvatar = async (uri, userId) => {
    const fileExt = uri.split('.').pop();
    const fileName = `avatars/${userId}/${Date.now()}.${fileExt}`;
    
    const base64 = await readAsStringAsync(uri, {
      encoding: 'base64',
    });

    const arrayBuffer = decode(base64);

    const { error } = await supabase.storage
      .from('media')
      .upload(fileName, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên hiển thị');
      return;
    }

    if (!username.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên người dùng');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let avatarUrl = userProfile?.avatar_url;
      if (selectedAvatar) {
        setUploadProgress(50);
        avatarUrl = await uploadAvatar(selectedAvatar.uri, user.id);
        setUploadProgress(100);
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          display_name: displayName.trim(),
          username: username.trim().toLowerCase(),
          bio: bio.trim() || null,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      Alert.alert('Thành công', 'Đã cập nhật hồ sơ!');
      if (onProfileUpdated) onProfileUpdated();
      if (navigation?.goBack) navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.code === '23505') {
        Alert.alert('Lỗi', 'Tên người dùng đã tồn tại. Vui lòng chọn tên khác.');
      } else {
        Alert.alert('Lỗi', 'Không thể cập nhật hồ sơ. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Text style={[styles.cancelButton, { color: theme.text }]}>Hủy</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Chỉnh sửa hồ sơ</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Lưu</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={[styles.coverPhoto, { backgroundColor: theme.primary }]} />
          
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickAvatar} style={styles.avatarContainer}>
              <Image
                source={{ 
                  uri: selectedAvatar?.uri || userProfile?.avatar_url || 'https://i.pravatar.cc/150?img=3' 
                }}
                style={styles.avatar}
              />
              <View style={styles.avatarOverlay}>
                <Ionicons name="camera" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          {loading && uploadProgress > 0 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${uploadProgress}%`, backgroundColor: theme.primary }]} />
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.secondaryText }]}>Tên hiển thị</Text>
              <TextInput
                style={[styles.input, { 
                  color: theme.text, 
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.border 
                }]}
                placeholder="Nhập tên hiển thị"
                placeholderTextColor={theme.secondaryText}
                value={displayName}
                onChangeText={setDisplayName}
                maxLength={50}
              />
              <Text style={[styles.charCount, { color: theme.secondaryText }]}>
                {displayName.length}/50
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.secondaryText }]}>Tên người dùng</Text>
              <TextInput
                style={[styles.input, { 
                  color: theme.text, 
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.border 
                }]}
                placeholder="Nhập tên người dùng"
                placeholderTextColor={theme.secondaryText}
                value={username}
                onChangeText={(text) => setUsername(text.toLowerCase())}
                maxLength={30}
                autoCapitalize="none"
              />
              <Text style={[styles.charCount, { color: theme.secondaryText }]}>
                {username.length}/30
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.secondaryText }]}>Tiểu sử</Text>
              <TextInput
                style={[styles.textArea, { 
                  color: theme.text, 
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.border 
                }]}
                placeholder="Viết vài dòng về bạn"
                placeholderTextColor={theme.secondaryText}
                value={bio}
                onChangeText={setBio}
                multiline
                maxLength={160}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, { color: theme.secondaryText }]}>
                {bio.length}/160
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    fontSize: 16,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  coverPhoto: {
    height: 120,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: -40,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    height: 3,
    backgroundColor: '#e1e8ed',
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  textArea: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
});
