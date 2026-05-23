import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


interface CardItemProps {
  item: any;
  initialMarked?: boolean;
  onToggleBookmark?: () => void;
}

const CardItem: React.FC<CardItemProps> = ({ item, initialMarked, onToggleBookmark }) => {
  const [isMarked, setIsMarked] = useState<boolean>(initialMarked || false);

  useEffect(() => {
    setIsMarked(initialMarked || false);
  }, [initialMarked]);

  const handlePress = () => {
    setIsMarked(!isMarked);
    if (onToggleBookmark) {
      onToggleBookmark();
    }
  };

  const abrirPubMed = () => {
    let url = '';
    if (item.pmid) {
      url = `https://pubmed.ncbi.nlm.nih.gov/${item.pmid}`;
    } else if (item.doi) {
      url = `https://doi.org/${item.doi}`;
    }
    if (url) {
      Linking.openURL(url).catch(err => console.error('Erro ao abrir URL:', err));
    }
  };

  // Abre o Maps nativo 
  // Usa o nome + instituição do investigador como query de pesquisa.
  const abrirMaps = () => {
    const query = encodeURIComponent(item.nome || item.name || '');
    const url =
      Platform.OS === 'android'
        ? `maps://?q=${query}`
        : `geo:0,0?q=${query}`;

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback: Google Maps web
          Linking.openURL(`https://www.google.com/maps/search/${query}`);
        }
      })
      .catch(err => console.error('Error trying to open Maps:', err));
  };

  return (
    //icone de localização — abre o Maps ao clicar
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={abrirMaps}
            accessibilityLabel={`See location of ${item.nome} on the map`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="map-marker-outline" size={24} color="#9D86E1" />
          </TouchableOpacity>
          <Text style={styles.verMapaText}>View article</Text>
        </View>

        <TouchableOpacity onPress={handlePress}>
          <Icon
            name={isMarked ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isMarked ? '#4A3A8C' : '#9D86E1'}
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
          disabled={!item.pmid && !item.doi}>
          <Text
            style={[
              styles.maisDetalhesText,
              !item.pmid && !item.doi && styles.disabledText,
            ]}>
            More details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default CardItem;
