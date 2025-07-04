import { createContext, useContext, useEffect } from 'react';
import { useTheme as useThemeHook } from '../hooks/useTheme';

const ThemeContext = createContext({});

export const ThemeProvider = ({ children }) => {
  const { theme, toggleTheme, setTheme } = useThemeHook();

  useEffect(() => {
    // Apply theme class to html element
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    toggleTheme,
    setTheme,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
};
