import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RNBootSplash from 'react-native-bootsplash';
import AppNavigator from './src/navigation/AppNavigator';
import { SavedProvider } from './src/context/SavedContext';
import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <SavedProvider>
        <NavigationContainer
          onReady={() => {
            RNBootSplash.hide({ fade: true });
          }}
        >
          <AppNavigator />
        </NavigationContainer>
      </SavedProvider>
    </ThemeProvider>
  );
}
