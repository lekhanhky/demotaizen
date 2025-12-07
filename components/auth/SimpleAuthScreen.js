import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  StyleSheet,
  Alert 
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { clearAuthData } from '../../utils/authHelper';
import { Eye, EyeOff, ArrowLeft, RefreshCw } from 'lucide-react-native';

export default function SimpleAuthScreen() {
  const [currentView, setCurrentView] = useState('welcome'); // welcome, signin, signup, reset
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { signIn, signUp, resetPassword } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const handleClearAuthData = async () => {
    Alert.alert(
      'Clear Auth Data',
      'This will clear all authentication data. Use this if you\'re experiencing login issues.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const success = await clearAuthData();
            setLoading(false);
            if (success) {
              Alert.alert('Success', 'Auth data cleared. Please try logging in again.');
              clearForm();
              setCurrentView('welcome');
            } else {
              Alert.alert('Error', 'Failed to clear auth data.');
            }
          }
        }
      ]
    );
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    
    if (error) {
      setError(error.message || 'Failed to sign in');
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);
    const { error } = await signUp(email, password);
    setLoading(false);
    
    if (error) {
      setError(error.message || 'Failed to create account');
    } else {
      Alert.alert('Success', 'Please check your email to verify your account');
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError(null);
    const { error } = await resetPassword(email);
    setLoading(false);
    
    if (error) {
      setError(error.message || 'Failed to send reset email');
    } else {
      Alert.alert('Success', 'Password reset email sent!');
      setCurrentView('signin');
    }
  };

  const switchView = (view) => {
    setCurrentView(view);
    clearForm();
  };

  // Welcome Screen
  if (currentView === 'welcome') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>TAIZEN</Text>
          </View>

          <Text style={styles.title}>Sign In</Text>

          <View style={styles.quickLoginContainer}>
            <TouchableOpacity
              style={styles.quickLoginButton}
              onPress={() => {
                setEmail('admin@gmail.com');
                setPassword('123456');
                switchView('signin');
              }}
            >
              <Text style={styles.quickLoginText}>👤 Admin</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickLoginButton}
              onPress={() => {
                setEmail('user@gmail.com');
                setPassword('123456');
                switchView('signin');
              }}
            >
              <Text style={styles.quickLoginText}>👥 User</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => switchView('signin')}
            style={styles.loginButton}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => switchView('signup')}
            style={styles.signupButton}
          >
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => switchView('reset')}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Auth Forms
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Back Button */}
        {currentView !== 'signin' && (
          <TouchableOpacity
            onPress={() => switchView(currentView === 'reset' ? 'signin' : 'welcome')}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>TAIZEN</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {currentView === 'signin' && 'Sign In'}
          {currentView === 'signup' && 'Sign Up'}
          {currentView === 'reset' && 'Reset Password'}
        </Text>

        {/* Quick Login for Sign In */}
        {currentView === 'signin' && (
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
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        {/* Password Input */}
        {currentView !== 'reset' && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={currentView === 'signup' ? 'Create password' : 'Password'}
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Confirm Password Input */}
        {currentView === 'signup' && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="#666"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={styles.eyeText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={() => {
            if (currentView === 'signin') handleSignIn();
            else if (currentView === 'signup') handleSignUp();
            else if (currentView === 'reset') handleResetPassword();
          }}
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#000" />
              <Text style={styles.loadingText}>
                {currentView === 'signin' && 'Signing in...'}
                {currentView === 'signup' && 'Signing up...'}
                {currentView === 'reset' && 'Sending...'}
              </Text>
            </View>
          ) : (
            <Text style={styles.loginButtonText}>
              {currentView === 'signin' && 'Sign In'}
              {currentView === 'signup' && 'Sign Up'}
              {currentView === 'reset' && 'Send Reset Link'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Secondary Actions */}
        {currentView === 'signin' && (
          <>
            <TouchableOpacity
              style={[styles.signupButton, loading && styles.loginButtonDisabled]}
              onPress={() => switchView('signup')}
              disabled={loading}
            >
              <Text style={styles.signupButtonText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => switchView('reset')}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </>
        )}

        {currentView === 'signup' && (
          <TouchableOpacity
            style={[styles.signupButton, loading && styles.loginButtonDisabled]}
            onPress={() => switchView('signin')}
            disabled={loading}
          >
            <Text style={styles.signupButtonText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        )}

        {currentView === 'reset' && (
          <TouchableOpacity
            style={[styles.signupButton, loading && styles.loginButtonDisabled]}
            onPress={() => switchView('signin')}
            disabled={loading}
          >
            <Text style={styles.signupButtonText}>Back to Sign In</Text>
          </TouchableOpacity>
        )}

        {/* Clear Auth Data Button - Show when there's an error */}
        {error && error.includes('refresh') && (
          <TouchableOpacity
            onPress={handleClearAuthData}
            style={styles.clearButton}
            disabled={loading}
          >
            <RefreshCw size={16} color="#636E72" />
            <Text style={styles.clearButtonText}>Clear Auth Data</Text>
          </TouchableOpacity>
        )}
      </View>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
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
  errorContainer: {
    backgroundColor: 'rgba(248, 165, 165, 0.2)',
    borderWidth: 1,
    borderColor: '#F8A5A5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    color: '#F8A5A5',
    fontSize: 14,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});