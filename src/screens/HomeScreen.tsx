import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Alert, useWindowDimensions, Platform, PermissionsAndroid } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { LocationSwitch } from '../components/LocationSwitch';
import { useNavigation } from '@react-navigation/native';
import { useTheme, AppColors } from '../context/ThemeContext';
import Geolocation from '@react-native-community/geolocation';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [useLocation, setUseLocation] = useState(false);
  const { width, height } = useWindowDimensions();
  const { colors } = useTheme();
  const styles = createStyles(width, height, colors);

  useEffect(() => {
    if (!useLocation) return;

    const requestAndFetch = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission denied', 'Location permission is required.');
          setUseLocation(false);
          return;
        }
      }

      Geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              { headers: { 'Accept-Language': 'en', 'User-Agent': 'FindUrTutor/1.0' } },
            );
            const data = await res.json();
            const country = data?.address?.country || '';
            setLocation(country);
          } catch {
            Alert.alert('Error', 'Could not determine location name.');
            setUseLocation(false);
          }
        },
        () => {
          Alert.alert('Error', 'Could not get current position.');
          setUseLocation(false);
        },
        { enableHighAccuracy: false, timeout: 10000 },
      );
    };

    requestAndFetch();
  }, [useLocation]);

  const handleLocationChange = (text: string) => {
    setLocation(text);
    if (useLocation) setUseLocation(false);
  };

  return (
    <View style={styles.container}>
      <AppHeader />

      <View style={styles.searchBar}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search PubMed keyword..."
          placeholderTextColor="#5f5f5fac"
          style={styles.input}
          returnKeyType="search"
        />
      </View>

      <View style={styles.filterBar}>
        <TextInput
          value={location}
          onChangeText={handleLocationChange}
          placeholder="Country (optional)"
          placeholderTextColor="#5f5f5fac"
          style={styles.input}
        />
      </View>

      <View style={styles.filterBar}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email (required for PubMed)"
          placeholderTextColor="#5f5f5fac"
          style={styles.input}
          keyboardType="email-address"
        />
      </View>

      <LocationSwitch
       value={useLocation}
      onChange={setUseLocation} />

      <TouchableOpacity
        style={styles.ButtonResultText}
        onPress={() => {
          if (!searchQuery.trim()) {
            Alert.alert('Keyword necessary', 'Please enter a keyword to search');
            return;
          }
          if (!email.trim()) {
            Alert.alert('Email necessary', 'Please enter your email to continue');
            return;
          }
          navigation.navigate('TableScreen', {
            keyword: searchQuery.trim(),
            location: location.trim(),
            email: email.trim(),
          });
        }}
      >
        <Text style={styles.textStyle}>SEARCH</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (width: number, height: number, colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.05,
    backgroundColor: colors.background,
  },
  searchBar: {
    backgroundColor: colors.input,
    borderRadius: width * 0.06,
    paddingHorizontal: width * 0.04,
    marginVertical: height * 0.012,
    height: height * 0.065,
    justifyContent: 'center',
  },
  filterBar: {
    backgroundColor: colors.input,
    borderRadius: width * 0.06,
    paddingHorizontal: width * 0.04,
    marginVertical: height * 0.008,
    height: height * 0.055,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: width * 0.038,
    color: colors.text,
  },
  ButtonResultText: {
    backgroundColor: colors.primary,
    borderRadius: width * 0.06,
    alignItems: 'center',
    justifyContent: 'center',
    padding: height * 0.013,
    marginTop: height * 0.025,
    marginHorizontal: width * 0.25,
  },
  textStyle: {
    color: '#ffffff',
    fontSize: width * 0.045,
    textAlign: 'center',
  },
});
