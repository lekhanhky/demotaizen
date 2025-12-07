import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function WelcomeScreen({ onSignIn, onSignUp }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>A</Text>
        </View>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Sign in to continue your journey</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={onSignIn}
          style={styles.primaryButton}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSignUp}
          style={styles.secondaryButton}
          activeOpacity={0.9}
        >
          <Text style={styles.secondaryButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our{' '}
          <Text style={styles.link}>Terms of Service</Text> and{' '}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#8BA888',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    color: '#2D3436',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: '#636E72',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#8BA888',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: '#8BA888',
  },
  secondaryButtonText: {
    color: '#8BA888',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 48,
  },
  footerText: {
    color: '#636E72',
    fontSize: 12,
    textAlign: 'center',
  },
  link: {
    textDecorationLine: 'underline',
  },
});