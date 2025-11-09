import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const lightTheme = {
  background: '#ffffff',
  secondaryBackground: '#f7f9f9',
  text: '#0f1419',
  secondaryText: '#536471',
  border: '#e1e8ed',
  primary: '#1d9bf0',
  headerBackground: '#ffffff',
  postBackground: '#ffffff',
  inputBackground: '#f7f9f9',
  placeholderText: '#8899a6',
  modalOverlay: 'rgba(91, 112, 131, 0.4)',
  likeColor: '#f91880',
  activeText: '#0f1419',
  hoverBackground: '#f7f9f9',
  shadowColor: '#000',
  cardShadow: 'rgba(0, 0, 0, 0.08)',
  iconColor: '#536471',
  activeIconColor: '#1d9bf0',
};

export const darkTheme = {
  background: '#15202b',
  secondaryBackground: '#192734',
  text: '#ffffff',
  secondaryText: '#8899a6',
  border: '#38444d',
  primary: '#1d9bf0',
  headerBackground: '#15202b',
  postBackground: '#15202b',
  inputBackground: '#253341',
  placeholderText: '#6e767d',
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
  likeColor: '#f91880',
  activeText: '#ffffff',
  hoverBackground: '#1c2732',
  shadowColor: '#000',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
  iconColor: '#8899a6',
  activeIconColor: '#1d9bf0',
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
