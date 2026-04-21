// src/screens/HomeScreen.tsx
// Main landing screen — displays a welcome message
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppHeader from '../components/AppHeader';
import AppFooter from '../components/AppFooter';
import { globalStyles, COLORS, FONTS }
from '../styles/globalStyles';
const HomeScreen = ({ navigation }: any) => (
<View style={globalStyles.screen}>
<AppHeader title="Home" navigation={navigation}
/>
<View style={globalStyles.centeredContainer}>
<Text style={styles.greeting}>Hello
World!</Text>
<Text style={styles.subtitle}>
Welcome to our page!
</Text>
</View>
<AppFooter
navigation={navigation}
activeScreen="Home"
/>
</View>
);
const styles = StyleSheet.create({
greeting: {
fontSize: 32,
fontFamily: FONTS.bold,
color: COLORS.text,
},
subtitle: {
fontSize: FONTS.size.body,
color: COLORS.textLight,
marginTop: 8,
},
});
export default HomeScreen;