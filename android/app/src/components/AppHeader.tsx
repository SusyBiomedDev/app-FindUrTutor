import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const AppHeader = () => (
  <View style={styles.container}>
    <Text style={styles.logoText}>FindUrTutor</Text>
    {/* Aqui viria o seu ícone de átomo */}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  logoText: {
    fontSize: 32,
    fontFamily: 'Cursive', // Ajuste para a sua fonte
    color: '#6246ea',
  },
});