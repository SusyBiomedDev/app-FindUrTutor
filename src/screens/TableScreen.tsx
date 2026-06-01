import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CardItem from '../components/CardItem';
import { useSaved } from '../context/SavedContext';
import { useNavigation } from '@react-navigation/native';
import { useTheme, AppColors } from '../context/ThemeContext';
import { procurarPubmed, extrairCorrespondingAuthors } from '../services/pubmedService';

const PUBMED_FETCH_SIZE = 100;

type ResultItem = {
  id: string;
  nome: string;
  area: string;
  email: string;
  Afiliacao: string;
  doi?: string;
  pmid?: string;
};

const TableScreen = ({ route }: { route: any }) => {
  const keyword  = route?.params?.keyword;
  const email    = route?.params?.email;
  const location = route?.params?.location as string | undefined;

  const [data,         setData]         = useState<ResultItem[]>([]);
  const [pubmedOffset, setPubmedOffset] = useState(0);
  const [pubmedTotal,  setPubmedTotal]  = useState(0);
  const [loading,      setLoading]      = useState(false);
  const [loadingMore,  setLoadingMore]  = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const navigation = useNavigation<any>();
  const isFetching = useRef(false);

  const { toggleSaved } = useSaved();
  const { width, height } = useWindowDimensions();
  const { colors } = useTheme();
  const styles = createStyles(width, height, colors);

  const mapResults = (results: any[]): ResultItem[] =>
    results.map(item => ({
      id:        item.id,
      nome:      item.Nome,
      area:      item.Título,
      email:     item.Email,
      Afiliacao: item.Afiliacao,
      doi:       item.DOI,
      pmid:      item.PMID,
    }));


  // Carregamento inicial — mostra resultados assim que o primeiro lote chega
  useEffect(() => {
    if (!keyword?.trim()) return;

    setData([]);
    setPubmedOffset(0);
    setPubmedTotal(0);
    setError(null);
    setLoading(true);
    isFetching.current = false;

    let cancelled = false;

    async function loadInitial() {
      let currentOffset = 0;
      let currentTotal  = 0;
      let foundAny      = false;

      try {
        while (true) {
          if (cancelled) return;
          if (currentTotal > 0 && currentOffset >= currentTotal) break;

          const { ids, total } = await procurarPubmed(keyword, PUBMED_FETCH_SIZE, email, currentOffset);
          currentTotal   = total;
          currentOffset += PUBMED_FETCH_SIZE;

          if (!ids || ids.length === 0) break;

          const results = await extrairCorrespondingAuthors(ids, 100, email, location);

          if (results && results.length > 0) {
            const mapped = mapResults(results);
            setData(prev => [...prev, ...mapped]);
            setPubmedOffset(currentOffset);
            setPubmedTotal(currentTotal);

            if (!foundAny) {
              foundAny = true;
              setLoading(false); // mostra a lista mal chegam os primeiros resultados
            }
            break; // para e espera que o utilizador faça scroll
          }

          setPubmedOffset(currentOffset);
          setPubmedTotal(currentTotal);
        }

        if (!foundAny && !cancelled) {
          setError('No corresponding authors found in the target countries.');
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('Error on the search:', err);
          setError(err?.message || 'Error loading results.');
          setLoading(false);
        }
      }
    }

    loadInitial();
    return () => { cancelled = true; };
  }, [keyword]);

  // Carrega mais quando o utilizador chega ao fim da lista
  async function loadMore() {
    if (isFetching.current || loadingMore) return;
    if (pubmedOffset >= pubmedTotal && pubmedTotal > 0) return;

    isFetching.current = true;
    setLoadingMore(true);

    let currentOffset = pubmedOffset;
    let currentTotal  = pubmedTotal;

    try {
      while (true) {
        if (currentTotal > 0 && currentOffset >= currentTotal) break;

        const { ids, total } = await procurarPubmed(keyword, PUBMED_FETCH_SIZE, email, currentOffset);
        currentTotal   = total;
        currentOffset += PUBMED_FETCH_SIZE;

        if (!ids || ids.length === 0) break;

        const results = await extrairCorrespondingAuthors(ids, 100, email, location);

        setPubmedOffset(currentOffset);
        setPubmedTotal(currentTotal);

        if (results && results.length > 0) {
          setData(prev => [...prev, ...mapResults(results)]);
          break; // mostra este lote e para — próximo scroll carrega mais
        }
      }
    } catch (err: any) {
      console.warn('Error loading more:', err?.message);
    } finally {
      setLoadingMore(false);
      isFetching.current = false;
    }
  }

  const renderItem = ({ item }: { item: ResultItem }) => (
    <CardItem
      item={item}
      initialMarked={false}
      onToggleBookmark={() => toggleSaved(item)}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>Results for "{keyword}"</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Icon name="magnify" size={28} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.statusText}>Searching for articles...</Text>
        </View>

      ) : error ? (
        <View style={styles.loader}>
          <Text style={styles.statusText}>{error}</Text>
        </View>

      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
        />
      )}

    </View>
  );
};

const createStyles = (width: number, height: number, colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex:              1,
      paddingHorizontal: width * 0.05,
      paddingTop:        height * 0.06,
      backgroundColor:   colors.background,
    },
    header: {
      flexDirection:  'row',
      alignItems:     'center',
      marginBottom:   height * 0.025,
      justifyContent: 'space-between',
    },
    title: {
      fontSize:    width * 0.065,
      fontWeight:  'bold',
      marginTop:   4,
      color:       colors.text,
      flex:        1,
      marginRight: 8,
    },
    listPadding: {
      paddingBottom: height * 0.15,
    },
    loader: {
      flex:           1,
      justifyContent: 'center',
      alignItems:     'center',
    },
    footer: {
      paddingVertical: 20,
      alignItems:      'center',
      gap:             8,
    },
    footerText: {
      color:    colors.text,
      fontSize: width * 0.035,
    },
    statusText: {
      marginTop: 12,
      color:     colors.text,
      fontSize:  width * 0.04,
      textAlign: 'center',
    },
  });

export default TableScreen;
