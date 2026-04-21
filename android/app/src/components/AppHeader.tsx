// src/components/AppHeader.tsx
// Reusable blue top header with app title and hamburger menu toggle
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { COLORS, FONTS } from '../styles/globalStyles';
interface AppHeaderProps {
title: string;
navigation: DrawerNavigationProp<any>;
}
const AppHeader: React.FC<AppHeaderProps> = ({ title, navigation }) => {
return (
<SafeAreaView edges={['top']} style={styles.safeArea}>
<View style={styles.header}>
<TouchableOpacity
onPress={() => navigation.toggleDrawer()}
style={styles.menuButton}
>
<Icon name="menu" size={24} color={COLORS.white} />
</TouchableOpacity>
<Text style={styles.title}>{title}</Text>
</View>
</SafeAreaView>
);
};
const styles = StyleSheet.create({
safeArea: {
backgroundColor: COLORS.primary,
},
header: {
height: 56,
flexDirection: 'row',
alignItems: 'center',
paddingHorizontal: 16,
backgroundColor: COLORS.primary,
elevation: 4,
},
menuButton: {
marginRight: 16,
},
title: {
color: COLORS.white,
fontSize: FONTS.size.header,
fontFamily: FONTS.bold,
},
});
export default AppHeader;