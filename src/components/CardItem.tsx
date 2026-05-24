import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme, AppColors } from '../context/ThemeContext';

interface CardItemProps {
  item: any;
  initialMarked?: boolean;
  onToggleBookmark?: () => void;
}

const CardItem: React.FC<CardItemProps> = ({ item, initialMarked, onToggleBookmark }) => {
  const [isMarked, setIsMarked] = useState<boolean>(initialMarked || false);
  const { width, height } = useWindowDimensions();
  const { colors } = useTheme();
  const styles = createStyles(width, height, colors);

  useEffect(() => {
    setIsMarked(initialMarked || false);
  }, [initialMarked]);

  const handlePress = () => {
    setIsMarked(!isMarked);
    if (onToggleBookmark) onToggleBookmark();
  };

  const openPubMed = () => {
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
  const openMaps = () => {
    const affiliation = (item.Afiliacao || '').replace(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, '').trim();
    const query = encodeURIComponent(affiliation || item.nome || item.name || '');
    const url =
      Platform.OS === 'android'
        ? `maps://?q=${query}`
        : `geo:0,0?q=${query}`;

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(`https://www.google.com/maps/search/${query}`);
        }
      })
      .catch(err => console.error('Error trying to open Maps:', err));
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={openMaps}
            accessibilityLabel={`See location of ${item.nome} on the map`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="map-marker-outline" size={width * 0.06} color={colors.accent} />
          </TouchableOpacity>
          <Text style={styles.seeMapText}>View location</Text>
        </View>

        <TouchableOpacity onPress={handlePress}>
          <Icon
            name={isMarked ? 'bookmark' : 'bookmark-outline'}
            size={width * 0.06}
            color={colors.accent}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.centerText}>{item.nome}</Text>
        <Text style={styles.areaText}>Area: {item.area}</Text>

        <View style={styles.emailRow}>
          <Icon name="email-outline" size={width * 0.05} color={colors.accent} />
          <Text style={styles.emailText}>{item.email}</Text>
        </View>

        <TouchableOpacity
          style={styles.moredetailsBtn}
          onPress={openPubMed}
          disabled={!item.pmid && !item.doi}>
          <Text
            style={[
              styles.moredetailsText,
              !item.pmid && !item.doi && styles.disabledText,
            ]}>
            More details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (width: number, height: number, colors: AppColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.cardItem,
    borderRadius: width * 0.02,
    padding: width * 0.04,
    marginBottom: height * 0.025,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#666',
    paddingBottom: height * 0.012,
    marginBottom: height * 0.012,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeMapText: {
    color: colors.textOnCard,
    marginLeft: width * 0.02,

    fontWeight: '600',
    fontSize: width * 0.038,
  },
  cardContent: {
    marginTop: height * 0.006,
  },
  centerText: {
    color: colors.textOnCard,
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  areaText: {
    color: '#DDD',
    fontSize: width * 0.04,
    marginTop: height * 0.005,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.012,
  },
  emailText: {
    color: colors.textOnCard,
    marginLeft: width * 0.02,
    fontSize: width * 0.035,
  },

   moredetailsBtn: {
    marginTop: height * 0.025,
    alignSelf: 'flex-start',
  },
  moredetailsText: {
    color: colors.accent,

    textDecorationLine: 'underline',
    fontSize: width * 0.04,
    fontWeight: '500',
  },
  disabledText: {
    color: colors.textMuted,
    fontSize: width * 0.035,
    fontStyle: 'italic',
  },
});

export default CardItem;
