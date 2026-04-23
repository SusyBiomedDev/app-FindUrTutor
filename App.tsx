import React from 'react'; // Mantém apenas este
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './android/app/src/navigation/AppNavigator';


export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}