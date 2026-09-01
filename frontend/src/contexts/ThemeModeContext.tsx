import React, { createContext, useContext, useMemo, useState } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeModeContextData {
  mode: ThemeMode;
  toggleMode: () => void;
}

const STORAGE_KEY = '@FinanceHub:themeMode';

const ThemeModeContext = createContext<ThemeModeContextData>({} as ThemeModeContextData);

function getInitialMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'dark' ? 'dark' : 'light';
}

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  const value = useMemo(() => ({ mode, toggleMode }), [mode]);

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
};

export function useThemeMode(): ThemeModeContextData {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode deve ser utilizado dentro de um ThemeModeProvider');
  }
  return context;
}
