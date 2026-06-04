import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Linking, useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, AppColors } from '../context/ThemeContext';
import { useSearch } from '../context/SearchContext';
import { TutorPin } from '../types/tutor';

interface CardItemProps {
  item:              any;
  initialMarked?:    boolean;
  onToggleBookmark?: () => void;
}

const CardItem: React.FC<CardItemProps> = ({ item, initialMarked, onToggleBookmark }) => {
  const [isMarked, setIsMarked] = useState<boolean>(initialMarked || false);
  const { width, height }       = useWindowDimensions();
  const { colors }              = useTheme();
  const styles                  = createStyles(width, height, colors);
  const navigation              = useNavigation<any>();
  const { setFocusedPin }       = useSearch();

  useEffect(() => {
    setIsMarked(initialMarked || false);
  }, [initialMarked]);

  const handleBookmark = () => {
    setIsMarked(!isMarked);
    if (onToggleBookmark) onToggleBookmark();
  };

  // Open PubMed article
  const openPubMed = () => {
    const url = item.pmid
      ? `https://pubmed.ncbi.nlm.nih.gov/${item.pmid}`
      : item.doi
        ? `https://doi.org/${item.doi}`
        : '';
    if (url) Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
  };

  // Open email client
  const openEmail = () => {
    if (item.email) Linking.openURL(`mailto:${item.email}`);
  };

  // Open Google Maps with directions to affiliation
  const getDirections = () => {
    const afiliacao = (item.afiliacao || item.Afiliacao || '').replace(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, '').trim();
    const query     = encodeURIComponent(afiliacao || item.nome || '');
    const url       = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
    Linking.openURL(url).catch(err => console.error('Error opening Maps:', err));
  };

  // Navigate to MapScreen and focus this pin
  const viewOnMap = async () => {
    // Geocode on the fly if we don't have coords yet
    // For items from search results, we geocode in MapScreen already,
    // so we pass the afiliacao and let MapScreen handle it.
    // We store what we have and let MapScreen geocode if needed.
    const pin: TutorPin = {
      id:        item.id,
      nome:      item.nome,
      area:      item.area,
      email:     item.email,
      afiliacao: item.afiliacao || item.Afiliacao || '',
      doi:       item.doi,
      pmid:      item.pmid,
      latitude:  item.latitude  ?? 0,
      longitude: item.longitude ?? 0,
    };
    setFocusedPin(pin);
    navigation.navigate('Map');
  };

  return (
    <View style={styles.card}>

      {/* Header */}
      <View style={styles.cardHeader}>
        <TouchableOpacity
          style={styles.row}
          onPress={viewOnMap}
          accessibilityLabel={`View ${item.nome} on map`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="map-marker-outline" size={width * 0.06} color={colors.accent} />
          <Text style={styles.seeMapText}>View on map</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleBookmark} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon
            name={isMarked ? 'bookmark' : 'bookmark-outline'}
            size={width * 0.06}
            color={colors.accent}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.nameText}>{item.nome}</Text>
        <Text style={styles.areaText} numberOfLines={2}>{item.area}</Text>

        {/* Email — tappable */}
        <TouchableOpacity style={styles.emailRow} onPress={openEmail}>
          <Icon name="email-outline" size={width * 0.05} color={colors.accent} />
          <Text style={styles.emailText}>{item.email}</Text>
        </TouchableOpacity>

        {/* Directions */}
        <TouchableOpacity style={styles.directionsBtn} onPress={getDirections}>
          <Icon name="directions" size={width * 0.05} color={colors.accent} />
          <Text style={styles.directionText}>Get directions</Text>
        </TouchableOpacity>

        {/* More details → PubMed */}
        <TouchableOpacity
          style={styles.moredetailsBtn}
          onPress={openPubMed}
          disabled={!item.pmid && !item.doi}
        >
          <Text style={[
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

const createStyles = (width: number, height: number, colors: AppColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.cardItem,
      borderRadius:    width * 0.02,
      padding:         width * 0.04,
      marginBottom:    height * 0.025,
    },
    cardHeader: {
      flexDirection:     'row',
      justifyContent:    'space-between',
      alignItems:        'center',
      borderBottomWidth: 0.5,
      borderBottomColor: '#666',
      paddingBottom:     height * 0.012,
      marginBottom:      height * 0.012,
    },
    row: {
      flexDirection: 'row',
      alignItems:    'center',
    },
    seeMapText: {
      color:      colors.accent,
      marginLeft: width * 0.02,
      fontWeight: '600',
      fontSize:   width * 0.038,
    },
    cardContent: {
      marginTop: height * 0.006,
    },
    nameText: {
      color:      colors.textOnCard,
      fontSize:   width * 0.045,
      fontWeight: 'bold',
    },
    areaText: {
      color:     '#DDD',
      fontSize:  width * 0.038,
      marginTop: height * 0.005,
      fontStyle: 'italic',
    },
    emailRow: {
      flexDirection: 'row',
      alignItems:    'center',
      marginTop:     height * 0.012,
    },
    emailText: {
      color:          colors.textOnCard,
      marginLeft:     width * 0.02,
      fontSize:       width * 0.035,
      textDecorationLine: 'underline',
    },
    directionsBtn: {
      flexDirection: 'row',
      alignItems:    'center',
      marginTop:     height * 0.012,
    },
    directionText: {
      color:              colors.accent,
      marginLeft:         width * 0.02,
      fontSize:           width * 0.038,
      fontWeight:         '600',
      textDecorationLine: 'underline',
    },
    moredetailsBtn: {
      marginTop:  height * 0.025,
      alignSelf:  'flex-start',
    },
    moredetailsText: {
      color:              colors.accent,
      textDecorationLine: 'underline',
      fontSize:           width * 0.04,
      fontWeight:         '500',
    },
    disabledText: {
      color:     colors.textMuted,
      fontSize:  width * 0.035,
      fontStyle: 'italic',
    },
  });

export default CardItem;
