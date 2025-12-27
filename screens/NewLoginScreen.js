import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image 
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import SimpleAuthScreen from '../components/auth/SimpleAuthScreen';

export default function NewLoginScreen() {
  const { loading, signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoggingIn(true);
    setError('');
    
    const { error } = await signIn(username, password);
    
    setIsLoggingIn(false);
    
    if (error) {
      setError(error.message || 'Login failed');
    }
  };

  // Luôn hiển thị form login đơn giản
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/splash-icon.png')} 
            style={styles.iconImage}
            resizeMode="contain"
          />
          <Text style={styles.logo}>TAIZEN</Text>
        </View>

        <Text style={styles.title}>Sign In</Text>

        <View style={styles.quickLoginContainer}>
          <TouchableOpacity
            style={styles.quickLoginButton}
            onPress={() => {
              setUsername('admin@gmail.com');
              setPassword('123456');
            }}
            disabled={isLoggingIn || loading}
          >
            <Text style={styles.quickLoginText}>👤 Admin</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickLoginButton}
            onPress={() => {
              setUsername('user@gmail.com');
              setPassword('123456');
            }}
            disabled={isLoggingIn || loading}
          >
            <Text style={styles.quickLoginText}>👥 User</Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username or Email"
            placeholderTextColor="#888"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoggingIn && !loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoggingIn && !loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.loginButton, (isLoggingIn || loading) && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoggingIn || loading}
        >
          {isLoggingIn || loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.loadingText}>
                {loading ? 'Initializing...' : 'Signing in...'}
              </Text>
            </View>
          ) : (
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  iconImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
    shadowColor: '#8BA888',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    fontSize: 48,
    color: '#8BA888',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: '#8BA888',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  quickLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  quickLoginButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#8BA888',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 80,
  },
  quickLoginText: {
    color: '#8BA888',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#2d1b1b',
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    textAlign: 'center',
  },
});