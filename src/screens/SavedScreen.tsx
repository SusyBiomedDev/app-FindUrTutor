import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { globalStyles } from '../styles/globalStyles';
import CardItem from '../components/CardItem';
import { useSaved } from '../context/SavedContext';

const SavedScreen = ({ navigation }: { navigation: any }) => {
  const { savedItems, toggleSaved } = useSaved();

  const renderItem = ({ item }: { item: any }) => (
    <CardItem
      item={item}
      initialMarked={true}
      onToggleBookmark={() => toggleSaved(item)}
    />
  );

  return (
    <View style={[globalStyles.screen, styles.container]}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
        <Icon name="bookmark-check" size={28} color="#6200EE" />
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {savedItems.length} {savedItems.length === 1 ? 'item guardado' : 'itens guardados'}
        </Text>
      </View>

      <FlatList
        data={savedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bookmark-off-outline" size={50} color="#CCC" />
            <Text style={styles.emptyText}>Ainda não tens centros guardados.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  statsText: {
    fontSize: 14,
    color: '#6200EE',
    fontWeight: '600',
  },
  listPadding: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 10,
  }
});

export default SavedScreen;