import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { LocationSwitch } from '../components/LocationSwitch';
import AppNavigator  from '../navigation/AppNavigator';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <AppHeader />
      
      {/* Barra de Busca */}
      <View style={styles.searchBar}>
        <TextInput placeholder="Search..." style={styles.input} />
      </View>

      {/* Barra de Filtro */}
      <View style={styles.filterBar}>
        <TextInput placeholder="Location" style={styles.input} />
      </View>

      <LocationSwitch />        
      
    </View>


  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#e0e0e0' },
  searchBar: {
    backgroundColor: '#f3e8ff',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginVertical: 10,
    height: 50,
    justifyContent: 'center'
  },
  filterBar: {
    backgroundColor: '#f3e8ff',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginVertical: 10,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center'
  },
  input: { flex: 1 }
});

export default HomeScreen;