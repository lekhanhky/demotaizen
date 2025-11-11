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
  Modal,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { signInWithTimeout } from '../utils/authHelpers';
import SignupScreen from './SignupScreen';

export default function LoginScreen() {
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    // Kiểm tra kết nối mạng
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      Alert.alert(
        'Không có kết nối mạng',
        'Vui lòng kiểm tra kết nối internet và thử lại.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);

    try {
      // Sử dụng timeout 30 giây với 2 lần thử lại
      const { data, error } = await signInWithTimeout(email, password, 30000, 2);

      if (error) {
        setLoading(false);
        
        // Xử lý các loại lỗi cụ thể
        if (error.message.includes('Invalid login credentials')) {
          Alert.alert('Đăng nhập thất bại', 'Email hoặc mật khẩu không đúng');
        } else if (error.message.includes('Email not confirmed')) {
          Alert.alert('Chưa xác nhận email', 'Vui lòng kiểm tra email và xác nhận tài khoản');
        } else {
          Alert.alert('Đăng nhập thất bại', error.message);
        }
        return;
      }

      // Đăng nhập thành công
      console.log('Đăng nhập thành công:', data.user?.email);
      // Loading sẽ tự tắt khi chuyển màn hình
    } catch (error) {
      setLoading(false);
      
      if (error.message === 'Timeout') {
        Alert.alert(
          'Hết thời gian chờ',
          'Đăng nhập mất quá nhiều thời gian. Vui lòng kiểm tra kết nối mạng và thử lại.'
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
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>𝕏</Text>
        </View>

        <Text style={styles.title}>Đăng Nhập</Text>

        <View style={styles.quickLoginContainer}>
          <TouchableOpacity
            style={styles.quickLoginButton}
            onPress={() => {
              setEmail('admin@gmail.com');
              setPassword('123456');
            }}
          >
            <Text style={styles.quickLoginText}>👤 Admin</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickLoginButton}
            onPress={() => {
              setEmail('user@gmail.com');
              setPassword('123456');
            }}
          >
            <Text style={styles.quickLoginText}>👥 User</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email hoặc số điện thoại"
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

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#000" />
              <Text style={styles.loadingText}>Đang đăng nhập...</Text>
            </View>
          ) : (
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowSignup(true)}>
          <Text style={styles.signupLink}>Chưa có tài khoản? Đăng ký</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showSignup}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSignup(false)}
      >
        <SignupScreen navigation={{ goBack: () => setShowSignup(false) }} />
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 25,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  eyeText: {
    fontSize: 20,
  },
  loginButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#000',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  loginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: '#1d9bf0',
    textAlign: 'center',
    fontSize: 14,
  },
  signupLink: {
    color: '#1d9bf0',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
    fontWeight: '600',
  },
  quickLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  quickLoginButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 100,
  },
  quickLoginText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
