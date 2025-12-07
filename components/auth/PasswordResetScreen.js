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
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function PasswordResetScreen({
  onSubmit,
  onBack,
  loading,
  error,
  success,
}) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

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

  const handleSubmit = async () => {
    if (validateEmail(email)) {
      await onSubmit(email);
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
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          disabled={loading}
        >
          <ArrowLeft size={24} color="#636E72" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Animated.View entering={FadeInDown.delay(0)}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email to receive a password reset link
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100)} style={styles.formContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {success && (
            <View style={styles.successContainer}>
              <Text style={styles.successTitle}>Check your email</Text>
              <Text style={styles.successText}>
                We've sent a password reset link to {email}
              </Text>
            </View>
          )}

          {!success && (
            <>
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

              <TouchableOpacity
                onPress={handleSubmit}
                style={styles.submitButton}
                activeOpacity={0.9}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {success && (
            <TouchableOpacity
              onPress={onBack}
              style={styles.submitButton}
              activeOpacity={0.9}
            >
              <Text style={styles.submitButtonText}>Back to Sign In</Text>
            </TouchableOpacity>
          )}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backText: {
    color: '#636E72',
    fontSize: 16,
    marginLeft: 8,
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
  successContainer: {
    backgroundColor: 'rgba(168, 213, 186, 0.2)',
    borderWidth: 1,
    borderColor: '#A8D5BA',
    borderRadius: 16,
    padding: 16,
  },
  successTitle: {
    color: '#2D3436',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  successText: {
    color: '#636E72',
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
  fieldError: {
    color: '#F8A5A5',
    fontSize: 12,
    marginLeft: 4,
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
});