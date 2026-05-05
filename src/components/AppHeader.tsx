import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Athom from '../assets/images/athom.png';
import Icon from 'react-native-vector-icons/Ionicons';
import { Alert } from 'react-native';

export const AppHeader = () => (
  <View style={styles.container}>


    <TouchableOpacity 
        style={styles.notificationIcon} 
        onPress={() => Alert.alert('You have new notifications!')}
      >
        <Icon name="notifications-outline" size={25} color="#000" />
      
        <View style={styles.dot} />
      </TouchableOpacity>
    
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
    marginTop: 80,
    marginLeft: 30,   
  },
  Athom: {
    width: 50,
    height: 50,
    marginRight: 40,
    marginLeft: 5,
    marginTop: 90,
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

