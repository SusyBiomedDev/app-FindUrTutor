import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { globalStyles } from '../styles/globalStyles';
import CardItem from '../components/CardItem';
import { useSaved } from '../context/SavedContext';
import { procurarPubmed, extrairCorrespondingAuthors } from '../services/pubmedService';

const PAGE_SIZE = 100;

const TableScreen = ({ route }: { route: any }) => {
  const keyword = route?.params?.keyword;
  const email = route?.params?.email;
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toggleSaved, isSaved } = useSaved();

  useEffect(() => {
    setPage(1);
  }, [keyword]);

  useEffect(() => {
    async function loadResults() {
      setLoading(true);
      setError(null);

      try {
        const retstart = (page - 1) * PAGE_SIZE;
        const { ids, total } = await procurarPubmed(keyword, PAGE_SIZE, email, retstart);
        setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));

        if (!ids || ids.length === 0) {
          setData([]);
          setError('No articles found for this keyword in the last 10 years.');
          setLoading(false);
          return;
        }

        const results = await extrairCorrespondingAuthors(ids, 100, email);

        if (!results || results.length === 0) {
          setData([]);
          setError('No corresponding authors found in the target countries on this page.');
          setLoading(false);
          return;
        }

        setData(
          results.map((item) => ({
            id: item.id,
            nome: item.Nome,
            area: item.Título,
            email: item.Email,
            doi: item.DOI,
            pmid: item.PMID,
          }))
        );
      } catch (err: any) {
        console.error('Erro na busca:', err);
        setError(err?.message || 'Error loading results.');
      } finally {
        setLoading(false);
      }
    }

    if (keyword) loadResults();
  }, [keyword, page]);

  const renderItem = ({ item }: { item: any }) => (
    <CardItem
      item={item}
      initialMarked={isSaved(item.id)}
      onToggleBookmark={() => toggleSaved(item)}
    />
  );

  return (
    <View style={[globalStyles.screen, styles.container]}>
      <View style={styles.header}>
        <Text style={styles.title}>Results for "{keyword}"</Text>
        <Icon name="magnify" size={28} color="#6200EE" />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#6200EE" />
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
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.pagination}>
        <TouchableOpacity
          style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
          onPress={() => setPage(p => Math.max(1, p - 1))}
          disabled={page <= 1 || loading}
        >
          <Icon name="chevron-left" size={27} color={page <= 1 ? '#ccc' : '#6200EE'} />
        </TouchableOpacity>

        <Text style={styles.pageLabel}>
          Page {page} / {totalPages}
        </Text>

        <TouchableOpacity
          style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
          onPress={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages || loading}
        >
          <Icon name="chevron-right" size={27} color={page >= totalPages ? '#ccc' : '#6200EE'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 50,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    flex: 1,
    marginRight: 10,
  },
  listPadding: {
    paddingBottom: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    marginTop: 12,
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 16,
    bottom: 120,
  },
  pageBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f0ff',
  },
  pageBtnDisabled: {
    backgroundColor: '#f5f5f5',
  },
  pageLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    minWidth: 90,
    textAlign: 'center',
  },
});

export default TableScreen;
