import React, { useState } from 'react';
import { View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import WelcomeScreen from './WelcomeScreen';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import PasswordResetScreen from './PasswordResetScreen';

export default function AuthScreen() {
  const [currentView, setCurrentView] = useState('welcome');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();

  const handleSignIn = async (email, password) => {
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error.message || 'Failed to sign in. Please try again.');
    }
  };

  const handleSignUp = async (email, password) => {
    setLoading(true);
    setError(null);
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) {
      setError(error.message || 'Failed to create account. Please try again.');
    }
  };

  const handleResetPassword = async (email) => {
    setLoading(true);
    setError(null);
    setResetSuccess(false);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setError(error.message || 'Failed to send reset email. Please try again.');
    } else {
      setResetSuccess(true);
    }
  };

  const switchView = (view) => {
    setCurrentView(view);
    setError(null);
    setResetSuccess(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {currentView === 'welcome' && (
        <WelcomeScreen
          onSignIn={() => switchView('signin')}
          onSignUp={() => switchView('signup')}
        />
      )}
      {currentView === 'signin' && (
        <SignInForm
          onSubmit={handleSignIn}
          onForgotPassword={() => switchView('reset')}
          onSwitchToSignUp={() => switchView('signup')}
          loading={loading}
          error={error}
        />
      )}
      {currentView === 'signup' && (
        <SignUpForm
          onSubmit={handleSignUp}
          onSwitchToSignIn={() => switchView('signin')}
          loading={loading}
          error={error}
        />
      )}
      {currentView === 'reset' && (
        <PasswordResetScreen
          onSubmit={handleResetPassword}
          onBack={() => switchView('signin')}
          loading={loading}
          error={error}
          success={resetSuccess}
        />
      )}
    </View>
  );
}