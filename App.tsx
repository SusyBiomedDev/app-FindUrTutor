import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RNBootSplash from 'react-native-bootsplash';

import AppNavigator from './src/navigation/AppNavigator';
import { SavedProvider } from './src/context/SavedContext';

export default function App() {
  return (
    <SavedProvider>
      <NavigationContainer
      
      //serve para esconder o splash screen da app.
        onReady={() => {
          RNBootSplash.hide({ fade: true });
        }}
      >
        <AppNavigator />
      </NavigationContainer>
    </SavedProvider>
  );
}
