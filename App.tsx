import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { SavedProvider } from './src/context/SavedContext';

export default function App() {
  return (
    <SavedProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SavedProvider>
  );
}