import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  isRTL: boolean;
  toggleTheme: () => void;
  toggleRTL: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      isRTL: false,
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        
        // Update document class
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      toggleRTL: () => {
        const newRTL = !get().isRTL;
        set({ isRTL: newRTL });
        
        // Update document direction
        document.documentElement.dir = newRTL ? 'rtl' : 'ltr';
        document.documentElement.setAttribute('dir', newRTL ? 'rtl' : 'ltr');
      },
      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
        
        // Update document class
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);