import React, { useEffect } from 'react';
import { StatusBar, LogBox, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './navigation/AppNavigator';
import apiClient from './api/apiClient';

// Enable react-native-screens for better navigation performance
enableScreens();

// Ignore specific warnings that might be caused by dependencies
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

export default function App() {
  useEffect(() => {
    // Configure the API client based on the environment
    if (__DEV__) {
      // In development, point to the local API
      // For iOS simulator
      const baseUrl = Platform.OS === 'ios' 
        ? 'http://localhost:5000/api'
        : 'http://10.0.2.2:5000/api'; // For Android emulator
      
      apiClient.setBaseUrl(baseUrl);
    } else {
      // In production, point to the deployed API
      apiClient.setBaseUrl('https://autokoreakosova-api.replit.app/api');
    }
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <AppNavigator />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}