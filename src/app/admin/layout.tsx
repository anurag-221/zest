'use client';

import Link from 'next/link';
import { LayoutDashboard, Calendar, Package, Settings, ShoppingBag, MapPin, Tag, Menu, X } from 'lucide-react';
import AdminGuard from '@/components/admin/AdminGuard';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Menu Button - Fixed to top left on small screens */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-40 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">Z</div>
              <span className="font-bold text-xl text-gray-900">Zest</span>
          </div>
          <button onClick={toggleMenu} className="p-2 bg-gray-50 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
              <Menu size={24} />
          </button>
      </div>

      {/* Backdrop Overlay for Mobile */}
      {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
            onClick={closeMenu}
          />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">Z</div>
            <span className="font-bold text-xl text-gray-900">Zest Admin</span>
          </div>
          <button onClick={closeMenu} className="md:hidden p-1 text-gray-400 hover:text-gray-900 transition-colors">
              <X size={20} />
          </button>
        </div>
        
        <nav className="p-4 space-y-1 overflow-y-auto">
          {[
              { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
              { href: '/admin/events', icon: Calendar, label: 'Events & Config' },
              { href: '/admin/products', icon: Package, label: 'Products' },
              { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
              { href: '/admin/cities', icon: MapPin, label: 'Cities' },
              { href: '/admin/coupons', icon: Tag, label: 'Coupons' }
          ].map((item) => {
              const isActive = pathname === item.href;
              return (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    onClick={closeMenu}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <item.icon size={20} className={isActive ? 'text-indigo-600' : 'text-gray-500'} />
                    {item.label}
                  </Link>
              );
          })}
          
          <div className="pt-4 mt-4 border-t border-gray-100">
             <Link href="/admin/settings" onClick={closeMenu} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${pathname === '/admin/settings' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Settings size={18} className={pathname === '/admin/settings' ? 'text-indigo-600' : 'text-gray-400'} />
                Settings
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 mt-16 md:mt-0 md:p-8 w-full max-w-full overflow-x-hidden">
        <AdminGuard>
            {children}
        </AdminGuard>
      </main>
    </div>
  );
}
