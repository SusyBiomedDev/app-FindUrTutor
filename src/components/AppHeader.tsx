import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Athom from '../assets/images/athom.png';

export const AppHeader = () => (
  <View style={styles.container}>
    {/* Adiciona o componente Image antes ou depois do texto */}
    
    <Text style={styles.logoText}>FindUrTutor</Text>

    <Image 
      source={Athom} 
      style={styles.Athom} 
    />
    
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
    paddingVertical: 30,    
  },
  logoText: {
    fontSize: 35,
    fontFamily: 'cursive',
    color: '#6246ea',  
    marginTop: 80,   
  },
  Athom: {
    width: 50,
    height: 50,
    marginRight: 30,
    marginLeft: 10,
    marginTop: 80,
  }
});

