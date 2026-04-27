import React from 'react';
// 1. Adicionei 'Text' aqui nos imports
import { View, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { LocationSwitch } from '../components/LocationSwitch';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() { 
  const navigation = useNavigation<any>();

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
      
      {/* Botão de Busca - Adicionei TouchableOpacity para navegação */}
      <View style={styles.ButtonResultText}>
        <TouchableOpacity onPress={() => navigation.navigate('TableScreen')}>
          <Text style={styles.textStyle}>SEARCH</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#91bedb' 
  },
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
  input: { 
    flex: 1 
  },
  ButtonResultText: {
    backgroundColor: '#6246ea',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginTop: 20,
  },
  textStyle: {
    color: '#FFFFFF', // Se o fundo for azul claro, branco pode sumir.
    fontSize: 18,
    textAlign: 'center',    
  },
});
