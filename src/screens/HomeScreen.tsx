import React, { useState, useEffect } from 'react';
import {View, StyleSheet, TextInput, TouchableOpacity, Text, Alert,useWindowDimensions, Platform, PermissionsAndroid,} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { LocationSwitch } from '../components/LocationSwitch';
import { useNavigation } from '@react-navigation/native';
import { useTheme, AppColors } from '../context/ThemeContext';
import { useSearch } from '../context/SearchContext';
import Geolocation from '@react-native-community/geolocation';

export default function HomeScreen() {
  const navigation    = useNavigation<any>();
  const { runSearch } = useSearch();

  // Estado local do formulário — apenas este ecrã precisa destes valores.
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [useLocation, setUseLocation] = useState(false);

  // `useWindowDimensions` permite que o layout reaja a rotações de ecrã.
  const { width, height } = useWindowDimensions();
  const { colors } = useTheme();
  // Os estilos são recriados quando as dimensões ou o tema mudam.
  const styles = createStyles(width, height, colors);

  // ── Geolocalização ────────────────────────────────────────────────────────
  // Reage a mudanças no switch de localização:
  //   OFF → limpa o campo país imediatamente
  //   ON  → pede permissão (Android) e obtém o país via GPS + Nominatim
  useEffect(() => {

    if (!useLocation) {
      setLocation('');
      return;
    }

    const requestAndFetch = async () => {
      // No Android é obrigatório pedir permissão em runtime antes de usar GPS.
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
            // Geocodificação inversa via Nominatim (OpenStreetMap) — gratuito, sem chave.
            // Apenas para obter o PAÍS; a geocodificação de afiliações usa Google API.
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              { headers: { 'Accept-Language': 'en', 'User-Agent': 'FindUrTutor/1.0' } },
            );
            const data = await res.json();
            setLocation(data?.address?.country ?? '');
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
  }, [useLocation]); // só corre quando o switch muda

  // Edição manual do campo país desativa o switch automaticamente,
  // para evitar inconsistência entre o texto e a geolocalização ativa.
  const handleLocationChange = (text: string) => {
    setLocation(text);
    if (useLocation) setUseLocation(false);
  };

  // ── Submissão do formulário ───────────────────────────────────────────────
  const handleSearch = () => {
    // Validação básica antes de disparar a pesquisa.
    if (!searchQuery.trim()) {
      Alert.alert('Keyword necessary', 'Please enter a keyword to search');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Email necessary', 'Please enter your email to continue');
      return;
    }

    // Delega a lógica de pesquisa ao SearchContext (single source of truth).
    runSearch({
      keyword: searchQuery.trim(),
      email: email.trim(),
      location: location.trim(),
    });

    // Navega para os resultados — o contexto já está a carregar os dados.
    navigation.navigate('TableScreen');
  };

  return (
    <View style={styles.container}>
      <AppHeader />

      {/* Campo de pesquisa principal */}
      <View style={styles.searchBar}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search PubMed keyword..."
          placeholderTextColor="#5f5f5fac"
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={handleSearch} // permite submeter com o teclado
        />
      </View>

      {/* País — opcional; preenchido automaticamente pelo GPS se o switch estiver ativo */}
      <View style={styles.filterBar}>
        <TextInput
          value={location}
          onChangeText={handleLocationChange}
          placeholder="Country (optional)"
          placeholderTextColor="#5f5f5fac"
          style={styles.input}
        />
      </View>

      {/* Email — obrigatório para a API PubMed identificar o cliente */}
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

      {/* Toggle de geolocalização */}
      <LocationSwitch value={useLocation} onChange={setUseLocation} />

      {/* Botão de pesquisa */}
      <TouchableOpacity style={styles.button} onPress={handleSearch} activeOpacity={0.85}>
        <Text style={styles.buttonText}>SEARCH</Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilos em função das dimensões e cores — permite responsividade e theming.
const createStyles = (width: number, height: number, colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1, padding: width * 0.05, backgroundColor: colors.background,
    },
    searchBar: {
      backgroundColor: colors.input, borderRadius: width * 0.06,
      paddingHorizontal: width * 0.04, marginVertical: height * 0.012,
      height: height * 0.065, justifyContent: 'center',
    },
    filterBar: {
      backgroundColor: colors.input, borderRadius: width * 0.06,
      paddingHorizontal: width * 0.04, marginVertical: height * 0.008,
      height: height * 0.055, flexDirection: 'row', alignItems: 'center',
    },
    input: { flex: 1, fontSize: width * 0.038, color: colors.text },
    button: {
      backgroundColor: colors.primary, borderRadius: width * 0.06,
      alignItems: 'center', justifyContent: 'center',
      padding: height * 0.013, marginTop: height * 0.025,
      marginHorizontal: width * 0.25,
    },
    buttonText: { color: '#ffffff', fontSize: width * 0.045, textAlign: 'center' },
  });
