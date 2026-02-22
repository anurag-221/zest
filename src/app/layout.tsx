import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from './AppProviders';
import UserLayoutWrapper from '@/components/UserLayoutWrapper';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Zest - 10 Min Delivery',
  description: 'Groceries delivered in 10 minutes',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Zest',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#4F46E5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-gray-50 dark:bg-black transition-colors`}>
        <Providers>
          <UserLayoutWrapper>
            {children}
          </UserLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
