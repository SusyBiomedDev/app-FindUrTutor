import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Linking, useWindowDimensions,} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, AppColors } from '../context/ThemeContext';
import { useSearch } from '../context/SearchContext';
import { TutorPin }  from '../types/tutor';

interface CardItemProps {
  item: any;            
  initialMarked?: boolean;        // estado inicial do marcador (true no SavedScreen)
  onToggleBookmark?: () => void;     // callback para o componente pai gerir o estado
}

const CardItem: React.FC<CardItemProps> = ({ item, initialMarked, onToggleBookmark }) => {
  // Estado local do bookmark — sincronizado com "initialMarked" via useEffect.
  const [isMarked, setIsMarked] = useState<boolean>(initialMarked || false);
  const { width, height } = useWindowDimensions();
  const { colors } = useTheme();
  const styles = createStyles(width, height, colors);
  const navigation = useNavigation<any>();
  const { setFocusedPin } = useSearch();

  // Sincroniza o estado visual do marcador quando o prop muda externamente
  // (ex: ao remover dos favoritos no SavedScreen, o card desaparece,
  // mas este efeito garante consistência se o item for reutilizado).
  useEffect(() => {
    setIsMarked(initialMarked || false);
  }, [initialMarked]);

  // Alterna o estado visual e notifica o componente pai.
  // O estado de persistência é gerido pelo SavedContext — o CardItem apenas reflete.
  const handleBookmark = () => {
    setIsMarked(!isMarked);
    if (onToggleBookmark) onToggleBookmark();
  };

  // Abre o artigo no PubMed: prefere PMID, usa DOI como fallback.
  const openPubMed = () => {
    const url = item.pmid
      ? `https://pubmed.ncbi.nlm.nih.gov/${item.pmid}`
      : item.doi
        ? `https://doi.org/${item.doi}`
        : '';
    if (url) Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
  };

  // Abre o cliente de email nativo.
  const openEmail = () => {
    if (item.email) Linking.openURL(`mailto:${item.email}`);
  };

  // Abre o Google Maps com direções para a afiliação do investigador.
  // Remove o email da string da afiliação antes de usar como destino.
  const getDirections = () => {
    const afiliacao = (item.afiliacao || item.Afiliacao || '')
      .replace(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, '')
      .trim();
    const query = encodeURIComponent(afiliacao || item.nome || '');
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${query}`)
      .catch(err => console.error('Error opening Maps:', err));
  };

  // Navega para o MapScreen e centra o mapa neste investigador.
  // Usa "setFocusedPin" no SearchContext para comunicar com o MapScreen.
  // Se as coordenadas não estiverem disponíveis (item da lista), o MapScreen geocodifica on-the-fly.
  const viewOnMap = async () => {
    const pin: TutorPin = {
      id: item.id,
      nome: item.nome,
      area: item.area,
      email: item.email,
      afiliacao: item.afiliacao || item.Afiliacao || '',
      doi: item.doi,
      pmid: item.pmid,
      latitude: item.latitude  ?? 0,
      longitude: item.longitude ?? 0,
    };
    setFocusedPin(pin);          // comunica o pin ao MapScreen via contexto
    navigation.navigate('Map');  // navega para o tab do mapa
  };

  return (
    <View style={styles.card}>

      {/* Cabeçalho: botão "Ver no mapa" (esquerda) + marcador/bookmark (direita) */}
      <View style={styles.cardHeader}>
        <TouchableOpacity
          style={styles.row}
          onPress={viewOnMap}
          accessibilityLabel={`View ${item.nome} on map`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} // área de toque alargada
        >
          <Icon name="map-marker-outline" size={width * 0.06} color={colors.accent} />
          <Text style={styles.seeMapText}>View on map</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleBookmark}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {/* Ícone preenchido se guardado, outline se não */}
          <Icon
            name={isMarked ? 'bookmark' : 'bookmark-outline'}
            size={width * 0.06}
            color={colors.accent}
          />
        </TouchableOpacity>
      </View>

      {/* Conteúdo principal do card */}
      <View style={styles.cardContent}>
        <Text style={styles.nameText}>{item.nome}</Text>
        {/* Título do artigo — limitado a 2 linhas para não expandir demasiado o card */}
        <Text style={styles.areaText} numberOfLines={2}>{item.area}</Text>

        {/* Email clicável */}
        <TouchableOpacity style={styles.emailRow} onPress={openEmail}>
          <Icon name="email-outline" size={width * 0.05} color={colors.accent} />
          <Text style={styles.emailText}>{item.email}</Text>
        </TouchableOpacity>

        {/* Direções via Google Maps */}
        <TouchableOpacity style={styles.directionsBtn} onPress={getDirections}>
          <Icon name="directions" size={width * 0.05} color={colors.accent} />
          <Text style={styles.directionText}>Get directions</Text>
        </TouchableOpacity>

        {/* Link para o artigo no PubMed — desativado se não houver PMID nem DOI */}
        <TouchableOpacity
          style={styles.moredetailsBtn}
          onPress={openPubMed}
          disabled={!item.pmid && !item.doi}
        >
          <Text style={[
            styles.moredetailsText,
            !item.pmid && !item.doi && styles.disabledText, // estilo diferente se desativado
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
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      borderBottomWidth: 0.5, borderBottomColor: '#666',
      paddingBottom: height * 0.012, marginBottom: height * 0.012,
    },
    row:         { flexDirection: 'row', alignItems: 'center' },
    seeMapText:  { color: colors.accent, marginLeft: width * 0.02, fontWeight: '600', fontSize: width * 0.038 },
    cardContent: { marginTop: height * 0.006 },
    nameText:    { color: colors.textOnCard, fontSize: width * 0.045, fontWeight: 'bold' },
    areaText:    { color: '#DDD', fontSize: width * 0.038, marginTop: height * 0.005, fontStyle: 'italic' },
    emailRow:    { flexDirection: 'row', alignItems: 'center', marginTop: height * 0.012 },
    emailText:   { color: colors.textOnCard, marginLeft: width * 0.02, fontSize: width * 0.035, textDecorationLine: 'underline' },
    directionsBtn: { flexDirection: 'row', alignItems: 'center', marginTop: height * 0.012 },
    directionText: { color: colors.accent, marginLeft: width * 0.02, fontSize: width * 0.038, fontWeight: '600', textDecorationLine: 'underline' },
    moredetailsBtn:  { marginTop: height * 0.025, alignSelf: 'flex-start' },
    moredetailsText: { color: colors.accent, textDecorationLine: 'underline', fontSize: width * 0.04, fontWeight: '500' },
    disabledText:    { color: colors.textMuted, fontSize: width * 0.035, fontStyle: 'italic' },
  });

export default CardItem;
