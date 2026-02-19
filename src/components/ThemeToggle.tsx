'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />; // Placeholder to avoid layout shift
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
      aria-label="Toggle Dark Mode"
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-yellow-400 fill-yellow-400" />
      ) : (
        <Moon size={20} className="text-indigo-600 fill-indigo-100" />
      )}
    </button>
  );
}
