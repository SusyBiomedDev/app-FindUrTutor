import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


interface ItemProps {
  id: string;
  nome: string;
  area: string;
  email: string;
  doi?: string;
  pmid?: string;
}


interface CardItemProps {
  item: any; 
  initialMarked?: boolean; 
  onToggleBookmark?: () => void; 
}

const CardItem: React.FC<CardItemProps> = ({ item, initialMarked, onToggleBookmark }) => {

  const [isMarked, setIsMarked] = useState<boolean>(initialMarked || false);

  const handlePress = () => {
    setIsMarked(!isMarked);
   
    if (onToggleBookmark) {
      onToggleBookmark();
    }
    
  };

  const abrirPubMed = () => {
    let url = '';
    
    // Prioridade: PMID > DOI
    if (item.pmid) {
      url = `https://pubmed.ncbi.nlm.nih.gov/${item.pmid}`;
    } else if (item.doi) {
      url = `https://doi.org/${item.doi}`;
    }
    
    if (url) {
      Linking.openURL(url).catch(err => console.error('Erro ao abrir URL:', err));
    }
  };

  return (
    <View style={styles.card}>
     
      <View style={styles.cardHeader}>
        <View style={styles.row}>
          <Icon name="map-marker-outline" size={24} color="#9D86E1" />
          <Text style={styles.verMapaText}>View article</Text>
        </View>
        
       
        <TouchableOpacity onPress={() => setIsMarked(!isMarked)}>
          <Icon 
            name={isMarked ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={isMarked ? "#4A3A8C" : "#9D86E1"} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.centroText}>{item.nome}</Text>
        <Text style={styles.areaText}>Area: {item.area}</Text>
        
        <View style={styles.emailRow}>
          <Icon name="email-outline" size={20} color="#9D86E1" />
          <Text style={styles.emailText}>{item.email}</Text>
        </View>

        <TouchableOpacity 
          style={styles.maisDetalhesBtn}
          onPress={abrirPubMed}
          disabled={!item.pmid && !item.doi}
        >
          <Text style={[styles.maisDetalhesText, (!item.pmid && !item.doi) && styles.disabledText]}>
            More details
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100, 
  },
  card: {
    backgroundColor: '#4A4A4A', 
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
  disabledText: {
    color: '#999', // Uma cor cinza para parecer desativado
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default CardItem;