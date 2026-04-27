import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { globalStyles } from '../styles/globalStyles';
import CardItem from '../components/CardItem';
import { procurarPubmed, extrairCorrespondingAuthors } from '../services/pubmedService';

const TableScreen = ({ route }: { route: any }) => {
  const keyword = route?.params?.keyword;
  const email = route?.params?.email;
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResults() {
      setLoading(true);
      setError(null);

      try {
        console.log('Buscando PubMed para:', keyword);
        const ids = await procurarPubmed(keyword, 100, email);
        console.log('IDs encontrados:', ids?.length || 0, ids);

        if (!ids || ids.length === 0) {
          setError('Nenhum artigo encontrado para essa palavra-chave.');
          setLoading(false);
          return;
        }

        console.log('Extraindo autores...');
        const results = await extrairCorrespondingAuthors(ids, 50, email);
        console.log('Autores encontrados:', results?.length || 0);

        if (!results || results.length === 0) {
          setError('Nenhum autor encontrado nos países alvo.');
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
        setError(err?.message || 'Erro ao carregar os resultados.');
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [keyword]);

  const renderItem = ({ item }: { item: any }) => <CardItem item={item} />;

  return (
    <View style={[globalStyles.screen, styles.container]}>
      <View style={styles.header}>
        <Text style={styles.title}>Results for “{keyword}”</Text>
        <Icon name="magnify" size={28} color="#6200EE" />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#6200EE" />
          <Text style={styles.statusText}>Buscando artigos...</Text>
        </View>
      ) : error ? (
        <View style={styles.loader}>
          <Text style={styles.statusText}>{error}</Text>
        </View>
      ) : data.length === 0 ? (
        <View style={styles.loader}>
          <Text style={styles.statusText}>Nenhum resultado encontrado.</Text>
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
    paddingBottom: 100,
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
});

export default TableScreen;