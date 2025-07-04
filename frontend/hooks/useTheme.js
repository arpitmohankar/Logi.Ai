import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const useTheme = () => {
  const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');
  
  return {
    theme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setTheme
  };
};
