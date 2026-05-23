import React, { createContext, useContext, useState } from 'react';

const lightColors = {
  background: '#91bedb',
  card: '#ffffff',
  section: '#e6e6e6',
  cardItem: '#4A4A4A',
  input: '#ffffff',
  primary: '#6246ea',
  accent: '#9D86E1',
  text: '#333333',
  textLight: '#888888',
  textMuted: '#999999',
  textOnCard: '#ffffff',
  border: '#fffafa',
  tabBar: '#6246ea',
  tabBarActive: '#d3d3d3',
  tabBarInactive: '#000000',
};

const darkColors = {
  background: '#121212',
  card: '#1e1e1e',
  section: '#1e1e1e',
  cardItem: '#2a2a2a',
  input: '#2a2a2a',
  primary: '#9D86E1',
  accent: '#9D86E1',
  text: '#ffffff',
  textLight: '#aaaaaa',
  textMuted: '#666666',
  textOnCard: '#ffffff',
  border: '#333333',
  tabBar: '#1e1e1e',
  tabBarActive: '#9D86E1',
  tabBarInactive: '#666666',
};

export type AppColors = typeof lightColors;

interface ThemeContextType {
  isDark: boolean;
  colors: AppColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark(prev => !prev);
  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? darkColors : lightColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
