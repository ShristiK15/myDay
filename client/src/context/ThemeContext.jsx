import { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext({ theme: 'parchment' });

const themeClass = { parchment: 'theme-parchment', midnight: 'theme-midnight', linen: 'theme-linen' };

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const theme = user?.theme || 'parchment';

  useEffect(() => {
    document.documentElement.className = themeClass[theme] || 'theme-parchment';
  }, [theme]);

  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
