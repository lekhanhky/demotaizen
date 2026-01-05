import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { signUpWithTimeout } from '../utils/authHelpers';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !username || !displayName) {
      Alert.alert('Error', 'Please fill in all information');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Password confirmation does not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // Kiểm tra kết nối mạng
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      Alert.alert(
        'No Internet Connection',
        'Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    
    try {
      const userData = {
        username: username.trim().toLowerCase(),
        display_name: displayName.trim(),
      };

      // Sử dụng timeout 15 giây
      const { data, error } = await signUpWithTimeout(email, password, userData, 15000);

      if (error) {
        setLoading(false);
        
        // Xử lý các loại lỗi cụ thể
        if (error.message.includes('already registered')) {
          Alert.alert('Đăng ký thất bại', 'Email này đã được đăng ký');
        } else if (error.message.includes('Password should be')) {
          Alert.alert('Đăng ký thất bại', 'Mật khẩu không đủ mạnh');
        } else {
          Alert.alert('Đăng ký thất bại', error.message);
        }
        return;
      }

      setLoading(false);
      Alert.alert(
        'Đăng ký thành công!',
        'Vui lòng kiểm tra email để xác nhận tài khoản.',
        [{ text: 'OK', onPress: () => navigation?.goBack() }]
      );
    } catch (error) {
      setLoading(false);
      
      if (error.message === 'Timeout') {
        Alert.alert(
          'Hết thời gian chờ',
          'Đăng ký mất quá nhiều thời gian. Vui lòng kiểm tra kết nối mạng và thử lại.'
        );
      } else {
        Alert.alert(
          'Lỗi kết nối',
          'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.'
        );
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>𝕏</Text>
          </View>

          <Text style={styles.title}>Tạo tài khoản</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Tên hiển thị"
              placeholderTextColor="#666"
              value={displayName}
              onChangeText={setDisplayName}
              maxLength={50}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Tên người dùng"
              placeholderTextColor="#666"
              value={username}
              onChangeText={(text) => setUsername(text.toLowerCase())}
              autoCapitalize="none"
              maxLength={30}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu"
              placeholderTextColor="#666"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.signupButtonText}>Đăng ký</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Text style={styles.loginLink}>Đã có tài khoản? Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15202b',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    color: '#1d9bf0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  input: {
    backgroundColor: '#192734',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#38444d',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  eyeText: {
    fontSize: 20,
  },
  signupButton: {
    backgroundColor: '#1d9bf0',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    color: '#1d9bf0',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});
