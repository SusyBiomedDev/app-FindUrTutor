// src/components/AppFooter.tsx
// Blue bottom navigation bar with Home and Contacts icon buttons
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, FONTS } from '../styles/globalStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
interface FooterProps {
navigation: any;
activeScreen: string;
}
const AppFooter: React.FC<FooterProps> = ({ navigation, activeScreen }) => {
const tabs = [
{ name: 'Home', icon: 'home', screen: 'Home' },
{ name: 'Contacts', icon: 'contacts', screen: 'Contacts' },
{ name: 'Gallery', icon: 'image', screen: 'Gallery' },
];
return (
<SafeAreaView edges={['bottom']} style={styles.safeArea}>
<View style={styles.footer}>
{tabs.map((tab) => {
const isActive = activeScreen === tab.screen;
return (
<TouchableOpacity
key={tab.name}
style={styles.tab}
onPress={() => navigation.navigate(tab.screen)}
>
<Icon
name={tab.icon}
size={24}
color={isActive ? COLORS.white : 'rgba(255,255,255,0.6)'}
/>
<Text style={[styles.label, isActive && styles.labelActive]}>
{tab.name}
</Text>
</TouchableOpacity>
);
})}
</View>
</SafeAreaView>
);
};
const styles = StyleSheet.create({
safeArea: {
backgroundColor: COLORS.primary,
},
footer: {
backgroundColor: COLORS.primary,
height: 70,
flexDirection: 'row',
justifyContent: 'space-around',
alignItems: 'center',
borderTopWidth: 1,
borderTopColor: COLORS.primaryDark,
elevation: 8,
},
tab: {
alignItems: 'center',
justifyContent: 'center',
flex: 1,
paddingVertical: 8,
},
label: {
fontSize: FONTS.size.small,
color: 'rgba(255,255,255,0.6)',
marginTop: 2,
},
labelActive: {
color: COLORS.white,
fontFamily: FONTS.bold,
},
});
export default AppFooter;