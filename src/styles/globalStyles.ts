// src/styles/globalStyles.ts
// Global design tokens — colors, typography and spacing shared across the app
import { StyleSheet } from 'react-native';
export const COLORS = {
primary: '#b718cd', // Main blue — used in header and footer
primaryDark: '#7d8da5',
white: '#ffffff',
background: '#9e4343',
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
  // Estilo base para as telas — garante um fundo consistente e padding horizontal

    screen: { 
    flex: 1,
    backgroundColor: '#91bedb',
    },

  bottomTabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    elevation: 10, // Prioridade no Android
    zIndex: 100,            
    backgroundColor: '#d7cbcb',
    borderRadius: 25,
    height: 65,
    borderTopWidth: 0, // Remove a linha cinzenta padrão
    
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  

  tabBar: {
    // Estas propriedades criam o efeito "pílula" flutuante
    position: 'absolute',
    bottom: 40,
    marginTop: 20, // Distância do fundo
    left: 10, // Margem esquerda
    right: 10, // Margem direita
    height: 50, // Altura da barra
    borderRadius: 80, // Valor alto para ser totalmente arredondado
    
    // Alinhamento dos itens
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    
    // Sombras (Shadows)
    elevation: 10,       // Sombra no Android
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,

    // Importante: remove a borda padrão do Navigator
    borderTopWidth: 0,
  },
  tabBarLabel: {
    fontSize: 12,
    fontFamily: 'Roboto', // Garante que tens esta fonte ou usa a padrão
    fontWeight: '500',
    marginBottom: 8,
  }
  
});
