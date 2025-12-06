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
import { supabase } from '../lib/supabase';
import SignupScreen from './SignupScreen';

export default function LoginScreen1() {
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Đăng nhập thất bại', error.message);
    }
    
    setLoading(false);
  }

  async function signUpWithEmail() {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    setLoading(true);
    
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Đăng ký thất bại', error.message);
    }
    if (!session) {
      Alert.alert('Kiểm tra email', 'Vui lòng kiểm tra hộp thư để xác nhận tài khoản!');
    }
    
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>TAIZEN</Text>
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
            autoCapitalize="none"
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
          onPress={signInWithEmail}
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

        <TouchableOpacity
          style={[styles.signupButton, loading && styles.loginButtonDisabled]}
          onPress={signUpWithEmail}
          disabled={loading}
        >
          <Text style={styles.signupButtonText}>Đăng ký</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
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
  signupButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: '#1d9bf0',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
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
