'use client';

import { useAuthStore } from '@/store/auth-store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAdmin && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isAdmin, pathname, router, mounted]);

  if (!mounted) return null;

  // If not admin and not on login page, show nothing (will redirect)
  if (!isAdmin && pathname !== '/admin/login') {
      return null;
  }

  return <>{children}</>;
}
