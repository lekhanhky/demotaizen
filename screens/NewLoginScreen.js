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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
          <LinearGradient
            colors={['#FFD700', '#B8860B', '#DAA520']} // Gold gradient from light to dark
            style={styles.logoCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Image 
              source={require('../assets/splash-icon.png')} 
              style={styles.iconImage}
              resizeMode="contain"
            />
          </LinearGradient>
          <View style={styles.logoTextContainer}>
            <Text style={styles.logo}>TAIZEN</Text>
          </View>
        </View>

        <View style={styles.quickLoginContainer}>
          <TouchableOpacity
            style={styles.quickLoginButtonWrapper}
            onPress={() => {
              setUsername('admin@gmail.com');
              setPassword('123456');
            }}
            disabled={isLoggingIn || loading}
          >
            <LinearGradient
              colors={['#FFD700', '#B8860B', '#DAA520']} // Gold gradient
              style={styles.quickLoginButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="person" size={16} color="#000" />
              <Text style={styles.quickLoginText}>Admin</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickLoginButtonWrapper}
            onPress={() => {
              setUsername('user@gmail.com');
              setPassword('123456');
            }}
            disabled={isLoggingIn || loading}
          >
            <LinearGradient
              colors={['#FFD700', '#B8860B', '#DAA520']} // Gold gradient
              style={styles.quickLoginButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="person" size={16} color="#000" />
              <Text style={styles.quickLoginText}>User</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.formContainer}>
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
            style={styles.loginButtonWrapper}
            onPress={handleLogin}
            disabled={isLoggingIn || loading}
          >
            <LinearGradient
              colors={['#FFD700', '#B8860B', '#DAA520']} // Gold gradient
              style={[styles.loginButton, (isLoggingIn || loading) && styles.loginButtonDisabled]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isLoggingIn || loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#000" size="small" />
                  <Text style={styles.loadingText}>
                    {loading ? 'Initializing...' : 'Signing in...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomLinks}>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Create Account</Text>
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFD700', // Light gold border
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoTextContainer: {
    marginTop: 10,
  },
  logo: {
    fontSize: 48,
    color: '#FFD700', // Light gold color
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: '#B8860B',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  iconImage: {
    width: 80,
    height: 80,
  },
  formContainer: {
    width: '85%',
    maxWidth: 305,
    borderWidth: 1,
    borderColor: '#FFD700', // Light gold border
    borderRadius: 15,
    padding: 20,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 17, // Decreased by 2 more
    fontSize: 16,
    color: '#ffffff',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loginButtonWrapper: {
    marginTop: 10,
    width: '100%',
    borderRadius: 12,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButton: {
    borderRadius: 12,
    padding: 17,
    alignItems: 'center',
    width: '100%',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
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
  quickLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
    marginBottom: 30,
    width: '100%',
  },
  quickLoginButtonWrapper: {
    borderRadius: 25,
  },
  quickLoginButton: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickLoginText: {
    color: '#000', // Changed to black for better contrast on gold background
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#2d1b1b',
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '85%',
    maxWidth: 305,
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '100%',
    marginTop: 30,
  },
  linkButton: {
    padding: 10,
  },
  linkText: {
    color: '#888',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});