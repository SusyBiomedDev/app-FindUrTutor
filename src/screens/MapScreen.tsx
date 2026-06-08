import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  StyleSheet, View, Text, ActivityIndicator,
  Animated, TouchableOpacity, useWindowDimensions, Linking,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme, AppColors } from '../context/ThemeContext';
import { useSearch } from '../context/SearchContext';
import Geolocation from '@react-native-community/geolocation';
import { useIsFocused } from '@react-navigation/native';
import { TutorPin } from '../types/tutor';
import { geocodeBatch, fetchNearbyMedicalCenters } from '../services/geocodingService';


export default function MapScreen() {
  const { data, loading, error, hasSearched, params, focusedPin, setFocusedPin } = useSearch();
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const styles = createStyles(width, height, colors);

  const [suggestedPins, setSuggestedPins] = useState<TutorPin[]>([]);

  const [pins, setPins] = useState<TutorPin[]>([]);
  const [geocoding, setGeocoding] = useState(false);
  const [selectedPin, setSelectedPin] = useState<TutorPin | null>(null);

  const isFocused = useIsFocused();
  const mapRef = useRef<MapView>(null);
  const cardAnim    = useRef(new Animated.Value(0)).current;
  const lastDataLen = useRef(0);

  useEffect(() => {
    // Start with default location immediately, then refine with GPS if available
    fetchNearbyMedicalCenters().then(setSuggestedPins);

    Geolocation.getCurrentPosition(
      async (pos) => {
        const nearby = await fetchNearbyMedicalCenters(pos.coords);
        setSuggestedPins(nearby);
      },
      () => {},
      { enableHighAccuracy: false, timeout: 5000 },
    );
  }, []);

  // Sync suggestedPins → pins whenever they update (and no active search)
  useEffect(() => {
    if (!hasSearched) setPins(suggestedPins);
  }, [suggestedPins, hasSearched]);

  const showCard = useCallback((pin: TutorPin) => {
    setSelectedPin(pin);
    Animated.spring(cardAnim, {
      toValue: 1, useNativeDriver: true, tension: 60, friction: 10,
    }).start();
  }, [cardAnim]);

  const hideCard = useCallback(() => {
    Animated.timing(cardAnim, {
      toValue: 0, duration: 200, useNativeDriver: true,
    }).start(() => setSelectedPin(null));
  }, [cardAnim]);

  // Reset pins when a new search starts (loading true) or when cleared (hasSearched false)
  useEffect(() => {
    if (loading) {
      setPins([]);
      lastDataLen.current = 0;
      hideCard();
    }
  }, [loading]);

  // Also reset when params change (new keyword submitted)
  useEffect(() => {
    setPins([]);
    lastDataLen.current = 0;
    hideCard();
  }, [params.keyword]);

  // Center on focusedPin when navigating from CardItem
  useEffect(() => {
    if (!isFocused) return;
    if (!focusedPin) {
      if (!hasSearched) setPins(suggestedPins);
      return;
    }

    const handleFocus = async () => {
      let pin = focusedPin;

      // If no coords yet, geocode now
      if (!pin.latitude && !pin.longitude) {
        const results = await geocodeBatch([pin]);
        if (results.length === 0) return;
        pin = results[0] as TutorPin;
      }

      // Ensure pin is in the pins list
      setPins(prev => {
        const exists = prev.find(p => p.id === pin.id);
        return exists ? prev : [...prev, pin];
      });

      // Animate to pin
      mapRef.current?.animateToRegion({
        latitude:       pin.latitude,
        longitude:      pin.longitude,
        latitudeDelta:  0.05,
        longitudeDelta: 0.05,
      }, 800);

      // Open card after animation
      setTimeout(() => {
        showCard(pin);
        setFocusedPin(null);
      }, 900);
    };

    handleFocus();
  }, [isFocused, focusedPin]);

  // Geocode whenever data changes
  useEffect(() => {
    if (!hasSearched) {
      setPins(suggestedPins);
      lastDataLen.current = 0;
      return;
    }
    if (data.length === 0 || data.length === lastDataLen.current) return;

    const newItems = data.slice(lastDataLen.current);
    const isFirst  = lastDataLen.current === 0;
    lastDataLen.current = data.length;

    setGeocoding(true);

    geocodeBatch(newItems).then((newPins) => {
      setPins(prev => isFirst ? newPins as TutorPin[] : [...prev, ...newPins as TutorPin[]]);

      if (newPins.length > 0) {
        mapRef.current?.fitToCoordinates(
          newPins.map(p => ({ latitude: p.latitude, longitude: p.longitude })),
          { edgePadding: { top: 80, right: 40, bottom: 220, left: 40 }, animated: true },
        );
      }
      setGeocoding(false);
    });
  }, [data, hasSearched]);

  const cardTranslateY = cardAnim.interpolate({
    inputRange: [0, 1], outputRange: [400, 0],
  });

  const isBusy = loading || geocoding;

  const getDirections = (pin: TutorPin) => {
    const destination = (pin.latitude && pin.longitude)
      ? `${pin.latitude},${pin.longitude}`
      : encodeURIComponent(pin.afiliacao);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    Linking.openURL(url).catch(() => {});
  };

  const openEmail = (email: string) => Linking.openURL(`mailto:${email}`);
  const openDOI   = (doi: string)   => Linking.openURL(`https://doi.org/${doi}`);
  const openPMID  = (pmid: string)  => Linking.openURL(`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`);

  const goToUserLocation = () => {
    Geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.animateToRegion({
          latitude:       pos.coords.latitude,
          longitude:      pos.coords.longitude,
          latitudeDelta:  0.05,
          longitudeDelta: 0.05,
        }, 800);
      },
      () => {},
      { enableHighAccuracy: false, timeout: 5000 },
    );
  };

  return (
    <View style={styles.container}>

      <MapView
        key={`${params.keyword}-${params.location}` || 'default'}
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        showsUserLocation
        initialRegion={{
          latitude: 38.7223, longitude: -9.1393,
          latitudeDelta: 5.0, longitudeDelta: 5.0,
        }}
        onPress={hideCard}
        toolbarEnabled={false}
        showsMyLocationButton={false}
        mapPadding={{ top: 0, right: 0, bottom: 130, left: 0 }}
      >
        {pins.map(pin => (
          <Marker
            key={pin.id}
            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
            tracksViewChanges={false}
            onPress={(e) => {
              e.stopPropagation();
              showCard(pin);
            }}
          >
            <View style={styles.markerOuter}>
              <View style={styles.markerInner}>
                <Icon
                  name={hasSearched ? 'account-circle' : 'star-circle'}
                  size={16}
                  color={colors.accent}
                />
              </View>
              <View style={styles.markerTail} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Suggestion badge */}
      {!hasSearched && (
        <View style={styles.badge}>
          <Icon name="lightbulb-on-outline" size={14} color={colors.accent} />
          <Text style={[styles.badgeText, { color: colors.text }]}>
            Suggested centers near you
          </Text>
        </View>
      )}

      {/* Results badge */}
      {hasSearched && !isBusy && !error && (
        <View style={styles.badge}>
          <Icon name="map-marker-multiple-outline" size={14} color={colors.accent} />
          <Text style={[styles.badgeText, { color: colors.text }]}>
            {pins.length} location{pins.length !== 1 ? 's' : ''} for "{params.keyword}"
          </Text>
        </View>
      )}

      {/* Loader */}
      {isBusy && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loaderText, { color: colors.text }]}>
            {loading ? 'Searching…' : 'Placing pins…'}
          </Text>
        </View>
      )}

      {/* Error toast */}
      {!!error && (
        <View style={styles.errorToast}>
          <Icon name="alert-circle-outline" size={16} color="#fff" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* My location button */}
      <TouchableOpacity style={styles.locationBtn} onPress={goToUserLocation}>
        <Icon name="crosshairs-gps" size={22} color={colors.accent} />
      </TouchableOpacity>

      {/* Detail card */}
      {selectedPin && (
        <Animated.View
          style={[styles.card, { transform: [{ translateY: cardTranslateY }], opacity: cardAnim }]}
        >
          <View style={styles.cardHandle} />

          <Text style={[styles.cardName,  { color: colors.text   }]}>{selectedPin.nome}</Text>
          <Text style={[styles.cardArea,  { color: colors.accent }]}>{selectedPin.area}</Text>

          {/* Affiliation */}
          <View style={styles.cardRow}>
            <Icon name="office-building-outline" size={14} color={'#888'} />
            <Text style={[styles.cardMeta, { color: colors.text }]} numberOfLines={2}>
              {selectedPin.afiliacao}
            </Text>
          </View>

    {/*alteration */}

          {!!selectedPin.email && (
          <TouchableOpacity style={styles.cardRow} onPress={() => openEmail(selectedPin.email!)}>
            <Icon name="email-outline" size={14} color={colors.accent} />
            <Text style={[styles.cardMeta, styles.cardLink, { color: colors.accent }]}>
              {selectedPin.email}
            </Text>
          </TouchableOpacity>
        )}
 

          {/* DOI — tappable */}
          {!!selectedPin.doi && (
            <TouchableOpacity style={styles.cardRow} onPress={() => openDOI(selectedPin.doi!)}>
              <Icon name="link-variant" size={14} color={colors.accent} />
              <Text style={[styles.cardMeta, styles.cardLink, { color: colors.accent }]} numberOfLines={1}>
                DOI: {selectedPin.doi}
              </Text>
            </TouchableOpacity>
          )}

          {/* PMID — tappable */}
          {!!selectedPin.pmid && (
            <TouchableOpacity style={styles.cardRow} onPress={() => openPMID(selectedPin.pmid!)}>
              <Icon name="identifier" size={14} color={colors.accent} />
              <Text style={[styles.cardMeta, styles.cardLink, { color: colors.accent }]}>
                PMID: {selectedPin.pmid}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.cardActionBtn, { borderColor: colors.accent }]}
              onPress={() => getDirections(selectedPin)}
            >
              <Icon name="directions" size={16} color={colors.accent} />
              <Text style={[styles.cardActionText, { color: colors.accent }]}>Directions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cardActionBtnFilled, { backgroundColor: colors.accent }]}
              onPress={hideCard}
            >
              <Text style={styles.cardActionTextFilled}>Close</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

    </View>
  );
}

const createStyles = (width: number, height: number, colors: AppColors) =>
  StyleSheet.create({
    container: { flex: 1 },

    badge: {
      position: 'absolute', top: height * 0.06, alignSelf: 'center',
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: colors.background, borderRadius: 20,
      paddingHorizontal: 14, paddingVertical: 6,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.12, shadowRadius: 4, elevation: 3,
    },
    badgeText: { fontSize: width * 0.032, fontWeight: '500' },

    loaderOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.35)',
      alignItems: 'center', justifyContent: 'center', gap: 12,
    },
    loaderText: { fontSize: width * 0.04, fontWeight: '600' },

    errorToast: {
      position: 'absolute', bottom: height * 0.05,
      left: width * 0.08, right: width * 0.08,
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: '#e53e3e', borderRadius: 12,
      paddingHorizontal: 16, paddingVertical: 10,
    },
    errorText: { color: '#fff', fontSize: width * 0.035, flex: 1 },

    markerOuter: { alignItems: 'center' },
    markerInner: {
      backgroundColor: colors.background, borderRadius: 20, padding: 5,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
    },
    markerTail: {
      width: 0, height: 0,
      borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 7,
      borderLeftColor: 'transparent', borderRightColor: 'transparent',
      borderTopColor: colors.background, marginTop: -1,
    },

    card: {
      position: 'absolute', bottom: 120, left: 0, right: 0,
      backgroundColor: colors.background,
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      paddingHorizontal: width * 0.06, paddingTop: 12,
      paddingBottom: height * 0.03,
      shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.12, shadowRadius: 12, elevation: 10,
    },
    cardHandle: {
      width: 40, height: 4, borderRadius: 2,
      backgroundColor: '#ccc',
      alignSelf: 'center', marginBottom: 16,
    },
    cardName:  { fontSize: width * 0.048, fontWeight: '700', marginBottom: 2 },
    cardArea:  { fontSize: width * 0.036, fontWeight: '600', marginBottom: 12 },
    cardRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
    cardMeta:  { fontSize: width * 0.034, flex: 1, lineHeight: width * 0.048 },
    cardLink:  { textDecorationLine: 'underline' },
    closeBtn: {
      marginTop: 16, borderWidth: 1.5, borderRadius: 12,
      paddingVertical: 10, alignItems: 'center',
    },
    cardActions: {
      flexDirection: 'row',
      gap:           10,
      marginTop:     16,
    },
    cardActionBtn: {
      flex:            1,
      flexDirection:   'row',
      alignItems:      'center',
      justifyContent:  'center',
      gap:             6,
      borderWidth:     1.5,
      borderRadius:    12,
      paddingVertical: 10,
    },
    cardActionText: {
      fontSize:   width * 0.035,
      fontWeight: '600',
    },
    cardActionBtnFilled: {
      flex:            1,
      alignItems:      'center',
      justifyContent:  'center',
      borderRadius:    12,
      paddingVertical: 10,
    },
    cardActionTextFilled: {
      fontSize:   width * 0.035,
      fontWeight: '600',
      color:      '#fff',
    },
    closeBtnText: { fontSize: width * 0.035, fontWeight: '600' },

    locationBtn: {
      position:        'absolute',
      bottom:          140,
      right:           width * 0.04,
      width:           44,
      height:          44,
      borderRadius:    22,
      backgroundColor: colors.background,
      alignItems:      'center',
      justifyContent:  'center',
      shadowColor:     '#000',
      shadowOffset:    { width: 0, height: 2 },
      shadowOpacity:   0.15,
      shadowRadius:    4,
      elevation:       5,
    },
  });
