import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackgroundComponent } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { globalStyles } from '../styles/globalStyles';

// Dados fictícios baseados na tua imagem
const DATA = [
  {
    id: '1',
    nome: 'Centro A',
    area: 'y',
    email: 'email@uni.pt',
  },
  {
    id: '2',
    nome: 'Centro B',
    area: 'x',
    email: 'contacto@lab.pt',
  },
];

const TableScreen = ({ navigation }: { navigation: any }) => {
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {/* Cabeçalho do Card */}
      <View style={styles.cardHeader}>
        <View style={styles.row}>
          <Icon name="map-outline" size={24} color="#9D86E1" />
          <Text style={styles.verMapaText}>Ver mapa</Text>
        </View>
        <TouchableOpacity>
          <Icon name="bookmark-outline" size={24} color="#9D86E1" />
        </TouchableOpacity>
      </View>

      {/* Conteúdo do Card */}
      <View style={styles.cardContent}>
        <Text style={styles.centroText}>{item.nome}</Text>
        <Text style={styles.areaText}>Área: {item.area}</Text>
        
        <View style={styles.emailRow}>
          <Icon name="email-outline" size={20} color="#9D86E1" />
          <Text style={styles.emailText}>{item.email}</Text>
        </View>

        <TouchableOpacity style={styles.maisDetalhesBtn}>
          <Text style={styles.maisDetalhesText}>Mais detalhes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[globalStyles.screen, styles.container]}>
      <View style={styles.header}>
        <Text style={styles.title}>Resultados</Text>
        <Icon name="magnify" size={28} color="#6200EE" />
      </View>

      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  listPadding: {
    paddingBottom: 100, // Espaço para não ficar atrás da barra inferior
  },
  card: {
    backgroundColor: '#4A4A4A', // Cor escura do card
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#666',
    paddingBottom: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verMapaText: {
    color: '#FFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  cardContent: {
    marginTop: 5,
  },
  centroText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  areaText: {
    color: '#DDD',
    fontSize: 16,
    marginTop: 4,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  emailText: {
    color: '#ffffff',
    marginLeft: 8,
  },
  maisDetalhesBtn: {
    marginTop: 20,
    alignSelf: 'flex-start',
  },
  maisDetalhesText: {
    color: '#9D86E1',
    textDecorationLine: 'underline',
    fontSize: 16,
    fontWeight: '500',
  },

});

export default TableScreen;