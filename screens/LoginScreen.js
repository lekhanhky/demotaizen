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

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Đăng nhập thất bại', error.message);
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
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
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
});
