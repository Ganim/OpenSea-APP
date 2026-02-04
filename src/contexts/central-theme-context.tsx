'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark-blue';

interface CentralThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const CentralThemeContext = createContext<CentralThemeContextType | undefined>(
  undefined
);

export function CentralThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>('dark-blue');

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove('dark-blue', 'light');
    root.classList.add(newTheme);
  };

  useEffect(() => {
    const stored = localStorage.getItem('central-theme') as Theme | null;
    if (stored) {
      setThemeState(stored);
      applyTheme(stored);
    } else {
      applyTheme('dark-blue');
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('central-theme', newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark-blue' ? 'light' : 'dark-blue';
    setTheme(newTheme);
  };

  return (
    <CentralThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </CentralThemeContext.Provider>
  );
}

export function useCentralTheme() {
  const context = useContext(CentralThemeContext);
  if (!context) {
    throw new Error('useCentralTheme must be used within CentralThemeProvider');
  }
  return context;
}
