import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
// Imagem local do ícone/logótipo da app.
import Athom from '../assets/images/athom.png';


export const AppHeader = () => (
  <View style={styles.container}>
    {/* Nome da aplicação com fonte cursive — corresponde à identidade visual */}
    <Text style={styles.logoText}>FindUrTutor</Text>

    {/* Ícone do átomo ao lado do nome */}
    <Image source={Athom} style={styles.Athom} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    marginBottom:   10,
    marginTop:      20,
    paddingVertical: 20,
  },

  logoText: {
    fontSize:   30,
    fontFamily: 'cursive',   // ⚠️ 'cursive' pode não estar disponível em todos os dispositivos;
    color:      '#6246ea',   // considerar incluir uma fonte customizada via react-native-fonts.
  },
  Athom: {
    width:      50,
    height:     50,
    marginLeft: 8,
  },
  // Os estilos abaixo (notificationIcon, dot) estão definidos mas não são usados no JSX.
  // Podem ser removidos para limpeza do código.
  notificationIcon: { position: 'absolute', top: 40, right: 10 },
  dot: {
    position: 'absolute', right: 2, top: 2,
    backgroundColor: '#6246ea', width: 8, height: 8, borderRadius: 4,
  },
});

