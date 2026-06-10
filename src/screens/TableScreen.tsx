import React from 'react';
import {View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, useWindowDimensions,} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CardItem from '../components/CardItem';
import { useSaved } from '../context/SavedContext';
import { useNavigation } from '@react-navigation/native';
import { useTheme, AppColors } from '../context/ThemeContext';
import { useSearch } from '../context/SearchContext';
import { Tutor }   from '../types/tutor';

const TableScreen = () => {
  // Lê do SearchContext — fonte única de verdade para os dados de pesquisa.
  const { params, data, loading, loadingMore, error, hasSearched, loadMore } = useSearch();

  const navigation = useNavigation<any>();
  const { toggleSaved } = useSaved();
  const { width, height } = useWindowDimensions();
  const { colors } = useTheme();
  const styles = createStyles(width, height, colors);

  // Renderiza um card por investigador.
  // "initialMarked={false}"" porque os itens não vêm pré-marcados na lista de resultados.
  const renderItem = ({ item }: { item: Tutor }) => (
    <CardItem
      item={item}
      onToggleBookmark={() => toggleSaved(item)}
    />
  );

  // Rodapé da lista: indicador de loading durante o carregamento de mais resultados.
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

      {/* Cabeçalho: título da pesquisa + ícone para voltar à HomeScreen */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          Results for "{params.keyword}"
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Icon name="magnify" size={28} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Estados possíveis do ecrã, por ordem de prioridade: */}

      {/* 1) Sem pesquisa — ecrã inicial antes de qualquer interação */}
      {!hasSearched ? (
        <View style={styles.loader}>
          <Icon name="magnify" size={48} color={colors.accent} />
          <Text style={styles.statusText}>Enter a keyword to search</Text>
        </View>

      /* 2) A carregar — pesquisa em curso */
      ) : loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.statusText}>Searching for articles...</Text>
        </View>

      /* 3) Erro — mensagem da API ou de rede */
      ) : error ? (
        <View style={styles.loader}>
          <Text style={styles.statusText}>{error}</Text>
        </View>

      /* 4) Resultados — lista com scroll infinito */
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          // Chave composta com index para evitar colisões caso o mesmo id apareça em páginas diferentes.
          keyExtractor={(item, index) => `${item.id}_${index}`}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          // Scroll infinito: chama `loadMore` quando o utilizador chega a 30% do fim da lista.
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
      flex: 1, paddingHorizontal: width * 0.05,
      paddingTop: height * 0.06, backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row', alignItems: 'center',
      marginBottom: height * 0.025, justifyContent: 'space-between',
    },
    title: {
      fontSize: width * 0.065, fontWeight: 'bold',
      marginTop: 4, color: colors.text, flex: 1, marginRight: 8,
    },
    listPadding: { paddingBottom: height * 0.15 }, // espaço para a tab bar flutuante
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    footer: { paddingVertical: 20, alignItems: 'center', gap: 8 },
    footerText: { color: colors.text, fontSize: width * 0.035 },
    statusText: { marginTop: 12, color: colors.text, fontSize: width * 0.04, textAlign: 'center' },
  });

export default TableScreen;
