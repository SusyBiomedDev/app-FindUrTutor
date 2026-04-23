import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Importa os teus ecrãs reais
import HomeScreen from '../screens/HomeScreen';
import TableScreen from '../screens/TableScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4A4459',   // Cor do ícone selecionado
        tabBarInactiveTintColor: '#49454F', // Cor do ícone inativo
        tabBarStyle: styles.tabBar,         // O estilo da barra branca
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen 
        name="Definitions" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color }) => <Icon name="cog-outline" color={color} size={26} />,
        }}
      />
      <Tab.Screen 
        name="Saved" 
        component={TableScreen} 
        options={{
          tabBarIcon: ({ color }) => <Icon name="bookmark-outline" color={color} size={26} />,
        }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color }) => <Icon name="bell-outline" color={color} size={26} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    // ESTE É O SEGREDO PARA O ASPETO DA IMAGEM:
    
    bottom: 30,          // Eleva a barra (efeito flutuante)
    left: 20,            // Margem lateral esquerda
    right: 20,           // Margem lateral direita
    height: 70,          // Altura da barra
    backgroundColor: '#FFFFFF',
    borderRadius: 35,    // Bordas muito arredondadas (estilo pílula)
    zIndex: 1000, // Força a ficar na frente
    elevation: 10,
    
    // Alinhamento
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    // Sombras (Shadows)
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
    
    // Remove a linha cinzenta de cima
    borderTopWidth: 0,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    paddingBottom: 10,
  }
 
});