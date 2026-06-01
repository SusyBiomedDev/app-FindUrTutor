import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CardItem from '../components/CardItem';
import Pagination from '../components/Pagination';
import { useSaved } from '../context/SavedContext';
import { useTheme, AppColors } from '../context/ThemeContext';
import { procurarPubmed, extrairCorrespondingAuthors } from '../services/pubmedService';

const PAGE_SIZE = 100;

const TableScreen = ({ route }: { route: any }) => {
  const keyword = route?.params?.keyword;

  const email = route?.params?.email;
  const location = route?.params?.location as string | undefined;
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { toggleSaved } = useSaved();
  const { width, height } = useWindowDimensions();
  const { colors } = useTheme();
  const styles = createStyles(width, height, colors);

  // Volta à página 1 quando a keyword muda
  useEffect(() => {
    setPage(1);
  }, [keyword]);

  // Carrega resultados ao mudar de página
  useEffect(() => {
    async function loadResults() {
      if (!keyword?.trim()) return;

      setLoading(true);
      setError(null);

      try {
        const retstart = (page - 1) * PAGE_SIZE;

        const { ids, total } = await procurarPubmed(keyword, PAGE_SIZE, email, retstart);
        setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));

        if (!ids || ids.length === 0) {
          setData([]);
          setError('No articles found for this keyword.');
          setLoading(false);
          return;
        }

        const results = await extrairCorrespondingAuthors(ids, 100, email, location);

        if (!results || results.length === 0) {
          setData([]);
          setError('No corresponding authors found in the target countries on this page.');
          setLoading(false);
          return;
        }

        setData(
          results.map(item => ({
            id:    item.id,
            nome:  item.Nome,
            area:  item.Título,
            email: item.Email,

            Afiliacao: item.Afiliacao,
            doi: item.DOI,
            pmid: item.PMID,
          }))
        );

      } catch (err: any) {
        console.error('Error on the search:', err);
        setError(err?.message || 'Error loading results.');
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [email, keyword, page]);

  const renderItem = ({ item }: { item: any }) => (
    <CardItem
      item={item}
      initialMarked={false}
      onToggleBookmark={() => toggleSaved(item)}
    />
  );

  return (
    <View style={styles.container}>

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Results for "{keyword}"</Text>
        <Icon name="magnify" size={28} color={colors.accent} />
      </View>

      {/* Loading */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.statusText}>Searching for articles...</Text>
        </View>

      ) : error ? (
        <View style={styles.loader}>
          <Text style={styles.statusText}>{error}</Text>
        </View>

      ) : data.length === 0 ? (
        <View style={styles.loader}>
          <Text style={styles.statusText}>No results found.</Text>
        </View>

      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        loading={loading}
        onPageChange={newPage => setPage(newPage)}
      />

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
      fontSize:   width * 0.065,
      fontWeight: 'bold',
      marginTop:  4,
      color:      colors.text,
      flex:       1,
      marginRight: 8,
    },
    listPadding: {
      paddingBottom: height * 0.1,
    },
    loader: {
      flex:           1,
      justifyContent: 'center',
      alignItems:     'center',
    },
    statusText: {
      marginTop: 12,
      color:     colors.text,
      fontSize:  width * 0.04,
      textAlign: 'center',
    },
  });

export default TableScreen;
