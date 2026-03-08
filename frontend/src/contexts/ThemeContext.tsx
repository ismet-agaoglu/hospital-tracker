import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  uiScale: number;
  setUiScale: (scale: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  const [uiScale, setUiScaleState] = useState(() => {
    const saved = localStorage.getItem('uiScale');
    const parsed = saved ? Number(saved) : 100;
    if (Number.isNaN(parsed)) return 100;
    return Math.min(120, Math.max(85, parsed));
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${uiScale}%`;
    localStorage.setItem('uiScale', String(uiScale));
  }, [uiScale]);

  const toggleTheme = () => setIsDark(!isDark);
  const setUiScale = (scale: number) => {
    const clamped = Math.min(120, Math.max(85, Math.round(scale)));
    setUiScaleState(clamped);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, uiScale, setUiScale }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
