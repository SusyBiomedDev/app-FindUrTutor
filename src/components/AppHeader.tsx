import React from 'react';
import { View, Text, StyleSheet, Image,} from 'react-native';
import Athom from '../assets/images/athom.png';



export const AppHeader = () => (
  <View style={styles.container}>
    
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
    marginBottom: 10,
    marginTop: 20,
    paddingVertical: 20,
  },
  notificationIcon: {
    position: 'absolute',
    top: 40,
    right: 10,
  },
  logoText: {
    fontSize: 30,
    fontFamily: 'cursive',
    color: '#6246ea',
  },
  Athom: {
    width: 50,
    height: 50,
    marginLeft: 8,
  },
  dot: {
    position: 'absolute',
    right: 2,
    top: 2,
    backgroundColor: '#6246ea',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

