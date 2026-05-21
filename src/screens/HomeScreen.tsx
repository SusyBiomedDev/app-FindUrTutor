import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { LocationSwitch } from '../components/LocationSwitch';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');

  return (
    <View style={styles.container}>
      <AppHeader />

      <View style={styles.searchBar}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search PubMed keyword..."
          style={styles.input}
          returnKeyType="search"
        />
      </View>

      <View style={styles.filterBar}>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Location filter (optional)"
          style={styles.input}
        />
      </View>

      <View style={styles.filterBar}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Your email (required for PubMed)"
          style={styles.input}
          keyboardType="email-address"
        />
      </View>

      <LocationSwitch />

      <View style={styles.ButtonResultText}>
        <TouchableOpacity
          onPress={() => {
            if (!email.trim()) {
              Alert.alert('Email obrigatório', 'Por favor, insira seu email para continuar');
              return;
            }
            navigation.navigate('TableScreen', {
              keyword: searchQuery.trim() || 'cancer',
              location: location.trim(),
              email: email.trim(),
            });
          }}
        >
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
    backgroundColor:'#91bedb' ,
  },
  searchBar: {
    backgroundColor: '#f3e8ff',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginVertical: 10,
    height: 50,
    justifyContent: 'center',
  },
  filterBar: {
    backgroundColor: '#f3e8ff',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginVertical: 10,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
  },
  ButtonResultText: {
    backgroundColor: '#6246ea',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginTop: 20,
    marginRight: 100,
    marginLeft: 100,
  },
  textStyle: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
});
