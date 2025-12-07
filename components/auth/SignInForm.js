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
  StyleSheet 
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

export default function SignInForm({
  onSubmit,
  onForgotPassword,
  onSwitchToSignUp,
  loading,
  error,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
      await onSubmit(email, password);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.formContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailError && styles.inputError]}
              placeholder="your@email.com"
              placeholderTextColor="#B2BEC3"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) validateEmail(text);
              }}
              onBlur={() => validateEmail(email)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            {emailError && (
              <Text style={styles.fieldError}>{emailError}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, passwordError && styles.inputError]}
                placeholder="Enter your password"
                placeholderTextColor="#B2BEC3"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) validatePassword(text);
                }}
                onBlur={() => validatePassword(password)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#636E72" />
                ) : (
                  <Eye size={20} color="#636E72" />
                )}
              </TouchableOpacity>
            </View>
            {passwordError && (
              <Text style={styles.fieldError}>{passwordError}</Text>
            )}
          </View>

          <TouchableOpacity onPress={onForgotPassword} disabled={loading}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.submitButton}
            activeOpacity={0.9}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onSwitchToSignUp} disabled={loading}>
              <Text style={styles.switchLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
  },
  title: {
    color: '#2D3436',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#636E72',
    fontSize: 16,
    marginBottom: 40,
  },
  formContainer: {
    gap: 24,
  },
  errorContainer: {
    backgroundColor: 'rgba(248, 165, 165, 0.2)',
    borderWidth: 1,
    borderColor: '#F8A5A5',
    borderRadius: 16,
    padding: 16,
  },
  errorText: {
    color: '#D64545',
    fontSize: 14,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    color: '#636E72',
    fontSize: 14,
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: '#2D3436',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderWidth: 2,
    borderColor: '#F8A5A5',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingRight: 56,
    color: '#2D3436',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  fieldError: {
    color: '#F8A5A5',
    fontSize: 12,
    marginLeft: 4,
  },
  forgotPassword: {
    color: '#8BA888',
    fontSize: 14,
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: '#8BA888',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  switchText: {
    color: '#636E72',
    fontSize: 14,
  },
  switchLink: {
    color: '#8BA888',
    fontSize: 14,
    fontWeight: '600',
  },
});