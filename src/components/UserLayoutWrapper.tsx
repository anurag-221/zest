'use client';

import { usePathname } from 'next/navigation';
import LocationGuard from '@/components/LocationGuard';
import BottomNav from '@/components/BottomNav';
import FloatingCart from '@/components/FloatingCart';
import PushPermissionBanner from '@/components/PushPermissionBanner';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export default function UserLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // Admin routes: skip all user-facing overlays
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <LocationGuard>
      {children}
      <FloatingCart />
      <BottomNav />
      <PushPermissionBanner />
      <PWAInstallPrompt />
    </LocationGuard>
  );
}
