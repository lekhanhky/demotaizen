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
import { Eye, EyeOff, Check } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SignUpForm({
  onSubmit,
  onSwitchToSignIn,
  loading,
  error,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsError, setTermsError] = useState('');

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

  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 33;
    if (password.length >= 10) strength += 33;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength += 17;
    if (/[0-9]/.test(password)) strength += 17;
    return Math.min(strength, 100);
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength < 40) return '#F8A5A5';
    if (strength < 70) return '#F8D5A5';
    return '#A8D5BA';
  };

  const handleSubmit = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!termsAccepted) {
      setTermsError('You must accept the terms and conditions');
      return;
    }
    setTermsError('');

    if (isEmailValid && isPasswordValid && isConfirmPasswordValid) {
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
        <Animated.View entering={FadeInDown.delay(0)}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100)} style={styles.formContainer}>
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
                placeholder="Create a password"
                placeholderTextColor="#B2BEC3"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) validatePassword(text);
                  if (confirmPassword) validateConfirmPassword(confirmPassword);
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
            {password && !passwordError && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: `${getPasswordStrength()}%`,
                        backgroundColor: getPasswordStrengthColor(),
                      }
                    ]}
                  />
                </View>
                <Text style={styles.strengthText}>
                  Password strength: {getPasswordStrength() < 40 ? 'Weak' : getPasswordStrength() < 70 ? 'Medium' : 'Strong'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, confirmPasswordError && styles.inputError]}
                placeholder="Confirm your password"
                placeholderTextColor="#B2BEC3"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) validateConfirmPassword(text);
                }}
                onBlur={() => validateConfirmPassword(confirmPassword)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#636E72" />
                ) : (
                  <Eye size={20} color="#636E72" />
                )}
              </TouchableOpacity>
            </View>
            {confirmPasswordError && (
              <Text style={styles.fieldError}>{confirmPasswordError}</Text>
            )}
          </View>

          <View>
            <TouchableOpacity
              onPress={() => setTermsAccepted(!termsAccepted)}
              style={styles.checkboxContainer}
              disabled={loading}
            >
              <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                {termsAccepted && <Check size={16} color="white" />}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {termsError && (
              <Text style={styles.fieldError}>{termsError}</Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.submitButton}
            activeOpacity={0.9}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>Already have an account? </Text>
            <TouchableOpacity onPress={onSwitchToSignIn} disabled={loading}>
              <Text style={styles.switchLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
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
  strengthContainer: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
  },
  strengthText: {
    color: '#636E72',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#B2BEC3',
    backgroundColor: 'white',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#8BA888',
    borderColor: '#8BA888',
  },
  termsText: {
    color: '#636E72',
    fontSize: 14,
    flex: 1,
  },
  termsLink: {
    color: '#8BA888',
    textDecorationLine: 'underline',
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