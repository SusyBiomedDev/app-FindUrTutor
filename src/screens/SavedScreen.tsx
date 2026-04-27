import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { globalStyles } from '../styles/globalStyles';
import CardItem from '../components/CardItem';


const INITIAL_DATA = [
  { id: '1', nome: 'Centro A', area: 'y', email: 'email@uni.pt' },
  { id: '2', nome: 'Centro B', area: 'x', email: 'contacto@lab.pt' },
];

const SavedScreen = ({ navigation }: { navigation: any }) => {

  const [savedItems, setSavedItems] = useState(INITIAL_DATA);

 
  const handleRemove = (id: string) => {
    setSavedItems((prev) => prev.filter(item => item.id !== id));
  };

  const renderItem = ({ item }: { item: any }) => (
    <CardItem 
      item={item} 
      initialMarked={true} 
      onToggleBookmark={() => handleRemove(item.id)} 
    />
  );

  return (
    <View style={[globalStyles.screen, styles.container]}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
        <Icon name="bookmark-check" size={28} color="#6200EE" />
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