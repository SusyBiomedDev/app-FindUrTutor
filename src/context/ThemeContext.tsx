import React, { createContext, useContext, useState } from 'react';

// Paleta de cores para o tema claro.
// Cada propriedade tem um propósito semântico (ex: "primary", "accent")
// em vez de nomes literais de cor — facilita a manutenção e a troca de paleta.
const lightColors = {
  background:   '#91bedb',
  card:         '#ffffff',
  section:      '#e6e6e6',
  cardItem:     '#4A4A4A',
  input:        '#ffffff',
  primary:      '#6246ea',  // cor principal: botões, barra de navegação
  accent:       '#9D86E1',  // cor de destaque: ícones, links
  text:         '#333333',
  textLight:    '#888888',
  textMuted:    '#999999',
  textOnCard:   '#ffffff',
  border:       '#fffafa',
  tabBar:       '#6246ea',
  tabBarActive: '#d3d3d3',
  tabBarInactive: '#000000',
};

// Paleta de cores para o tema escuro.
// Mantém exatamente as mesmas chaves que "lightColors" o TypeScript garante isso
// através do tipo "AppColors", derivado de "typeof lightColors".
const darkColors = {
  background: '#121212',
  card: '#1e1e1e',
  section: '#1e1e1e',
  cardItem: '#2a2a2a',
  input: '#2a2a2a',
  primary: '#9D86E1',
  accent: '#9D86E1',
  text: '#ffffff',
  textLight: '#9D86E1',
  textMuted: '#666666',
  textOnCard: '#ffffff',
  border: '#333333',
  tabBar: '#1e1e1e',
  tabBarActive: '#9D86E1',
  tabBarInactive: '#666666',
};

// Tipo derivado diretamente de "lightColors".
// Garante que "darkColors" tem sempre todas as mesmas propriedades (verificado em tempo de compilação).
export type AppColors = typeof lightColors;

interface ThemeContextType {
  isDark:      boolean;
  colors:      AppColors;
  toggleTheme: () => void;
}

// Valor padrão: tema claro como base.
const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // "isDark" é o único estado necessário — tudo o resto é derivado.
  const [isDark, setIsDark] = useState(false);

  // Inverte o tema atual. O React re-renderiza todos os consumidores com as novas cores.
  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? darkColors : lightColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Melhoria possível: persistir "isDark" em AsyncStorage para recordar a preferência
// entre sessões (apenas um "useEffect" adicional com setItem/getItem).

// Hook personalizado para consumir o tema em qualquer componente.
export const useTheme = () => useContext(ThemeContext);
