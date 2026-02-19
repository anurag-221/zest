'use client';

import { ReactNode } from 'react';

import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  );
}
