// src/styles/globalStyles.ts
// Global design tokens — colors, typography and spacing shared across the app
import { StyleSheet } from 'react-native';
export const COLORS = {
primary: '#1565C0', // Main blue — used in header and footer
primaryDark: '#0D47A1',
white: '#FFFFFF',
background: '#F5F5F5',
text: '#212121',
textLight: '#757575',
border: '#E0E0E0',
};
export const FONTS = {
regular: 'Roboto-Regular',
bold: 'Roboto-Bold',
size: {
small: 12,
body: 14,
title: 18,
header: 20,
},
};
export const globalStyles = StyleSheet.create({
screen: {
flex: 1,
backgroundColor: COLORS.background,
},
centeredContainer: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
},
title: {
fontSize: FONTS.size.title,
fontFamily: FONTS.bold,
color: COLORS.text,
marginBottom: 12,
},
});