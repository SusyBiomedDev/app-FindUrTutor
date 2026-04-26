import React from 'react';
import { View, StyleSheet, TextInput, Button } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { LocationSwitch } from '../components/LocationSwitch';
import { useNavigation } from '@react-navigation/native';



// 1. Escolha UMA forma de declarar (aqui usamos a mais comum)
export default function HomeScreen() { 
  
  const navigation = useNavigation();
  

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
      
      {/* Botão de Busca */}
        <View style={styles.ButtonResultText}>
        <Button title="Search" color="#6246ea"></Button>
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#ebe2e29f' },
  searchBar: {
    backgroundColor: '#f3e8ff',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginVertical: 10,
    height: 50,
    justifyContent: 'center'
  },
  ButtonResultText: {
    backgroundColor: '#6246ea',
    borderRadius: 30,
    paddingHorizontal: 20,
    marginVertical: 1,
    marginHorizontal: 1,
    height: 35,
    textAlign: 'center',
    alignContent: 'center',
    alignItems: 'center',
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

