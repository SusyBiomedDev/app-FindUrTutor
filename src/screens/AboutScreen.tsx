import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme, AppColors } from '../context/ThemeContext';

const AboutScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const styles = createStyles(width, height, colors);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={24} color={colors.text} />
        <Text style={styles.backText}>Settings</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>About</Text>

        <Text style={styles.body}>
          This app was developed to help researchers find corresponding authors in specific locations based on PubMed searches. This was a project developed by https://github.com/SusyBiomedDev and https://github.com/Uri-Bee in the context of the course "Mobile App Development" at the ISLA Gaia Instituto politécnico em Vila Nova de Gaia, Portugal. We hope this tool can facilitate networking and collaboration among researchers worldwide!
        </Text>
      </ScrollView>
    </View>
  );
};

const createStyles = (width: number, height: number, colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: height * 0.06,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.02,
  },
  backText: {
    fontSize: width * 0.04,
    color: '#ffffff',
    marginLeft: 6,
  },
  content: {
    paddingHorizontal: width * 0.06,
    paddingBottom: height * 0.1,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: height * 0.03,
  },
  body: {
    fontSize: width * 0.042,
    color: '#ffffff',
    lineHeight: width * 0.065,
  },
});

export default AboutScreen;
