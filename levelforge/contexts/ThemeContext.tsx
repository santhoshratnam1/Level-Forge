import React, { createContext, useState, useEffect, useMemo } from 'react';

export type Theme = 'light' | 'dark';
export type Accent = 'cyan' | 'purple' | 'green';
export type Density = 'compact' | 'comfortable' | 'spacious';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accent: Accent;
  setAccent: (accent: Accent) => void;
  density: Density;
  setDensity: (density: Density) => void;
}

const defaultState: ThemeContextType = {
  theme: 'dark',
  setTheme: () => {},
  accent: 'cyan',
  setAccent: () => {},
  density: 'comfortable',
  setDensity: () => {},
};

export const ThemeContext = createContext<ThemeContextType>(defaultState);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [accent, setAccent] = useState<Accent>('cyan');
  const [density, setDensity] = useState<Density>('comfortable');

  useEffect(() => {
    // Load saved settings from localStorage on initial mount
    try {
      const savedTheme = localStorage.getItem('level-forge-theme') as Theme | null;
      const savedAccent = localStorage.getItem('level-forge-accent') as Accent | null;
      const savedDensity = localStorage.getItem('level-forge-density') as Density | null;

      if (savedTheme) setTheme(savedTheme);
      if (savedAccent) setAccent(savedAccent);
      if (savedDensity) setDensity(savedDensity);
    } catch (e) {
      console.error("Could not load theme settings from localStorage", e);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('level-forge-theme', theme);
    } catch (e) {
      console.error("Could not save theme to localStorage", e);
    }
  }, [theme]);
  
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-accent', accent);
    try {
      localStorage.setItem('level-forge-accent', accent);
    } catch (e) {
      console.error("Could not save accent to localStorage", e);
    }
  }, [accent]);
  
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-density', density);
    try {
      localStorage.setItem('level-forge-density', density);
    } catch (e) {
      console.error("Could not save density to localStorage", e);
    }
  }, [density]);
  

  const value = useMemo(() => ({
    theme,
    setTheme,
    accent,
    setAccent,
    density,
    setDensity
  }), [theme, accent, density]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};