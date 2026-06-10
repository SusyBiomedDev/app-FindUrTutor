import React from 'react';
import { View, Text, StyleSheet, FlatList, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CardItem from '../components/CardItem';
import { useSaved, SavedItem } from '../context/SavedContext';
import { useTheme, AppColors } from '../context/ThemeContext';

const SavedScreen = () => {
  const { savedItems, toggleSaved } = useSaved();
  const { width, height } = useWindowDimensions();
  const { colors } = useTheme();
  const styles = createStyles(width, height, colors);

  const renderItem = ({ item }: { item: SavedItem }) => (
    <CardItem
      item={item}
      onToggleBookmark={() => toggleSaved(item)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
        <Icon name="bookmark-check" size={width * 0.07} color={colors.accent} />
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {savedItems.length}{' '}
          {savedItems.length === 1 ? 'Saved item' : 'Saved items'}
        </Text>
      </View>

      <FlatList
        data={savedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listPadding,
          savedItems.length === 0 && { flex: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bookmark-off-outline" size={width * 0.13} color="#CCC" />
            <Text style={styles.emptyText}>
              You haven't saved any centers/tutors yet.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const createStyles = (width: number, height: number, colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: height * 0.06,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.025,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: colors.text,
  },
  statsContainer: {
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.018,
  },
  statsText: {
    fontSize: width * 0.035,
    color: colors.text,
    fontWeight: '600',
  },
  listPadding: {
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.025,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: height * 0.012,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: width * 0.04,
  },
});

export default SavedScreen;
