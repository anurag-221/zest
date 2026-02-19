'use client';

import { useAuthStore } from '@/store/auth-store';
import { useOrderStore } from '@/store/order-store';
import Header from '@/components/Header';
import Link from 'next/link';
import { Package, MapPin, ChevronRight, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { orders } = useOrderStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
        router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!user) return null;

  // Filter orders for this user? 
  // currently order-store is local-only, so all orders there "belong" to the device user.
  // In a real app, we'd filter by user.id. For now, show all.
  const myOrders = orders;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-20">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-2xl">
                {user.name.charAt(0)}
            </div>
            <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">+91 {user.phone}</p>
            </div>
            <button 
                onClick={() => {
                    logout();
                    router.push('/');
                }}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                title="Logout"
            >
                <LogOut size={20} />
            </button>
        </div>

        <Link href="/profile/addresses" className="mb-6 block bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600">
                    <MapPin size={20} />
                </div>
                <div>
                     <h3 className="font-bold text-gray-900 dark:text-white">My Addresses</h3>
                     <p className="text-xs text-indigo-600 dark:text-indigo-400">Manage saved locations</p>
                </div>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
        </Link>

        {/* Orders Section */}
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Package size={20} />
            Order History
        </h2>

        {myOrders.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Package size={24} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">No orders yet</h3>
                <p className="text-gray-500 text-sm mb-4">Start shopping to see your orders here.</p>
                <Link href="/" className="text-indigo-600 font-bold hover:underline">
                    Browse Products
                </Link>
            </div>
        ) : (
            <div className="space-y-4">
                {myOrders.map(order => (
                    <Link 
                        key={order.id} 
                        href={`/order-success/${order.id}`}
                        className="block bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 hover:border-indigo-500 transition-colors shadow-sm"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Order #{order.id}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{order.date} • {order.status}</p>
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">₹{order.total}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 overflow-hidden">
                            {order.items.slice(0, 3).map((item, idx) => (
                                <div key={idx} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-300 truncate max-w-[100px]">
                                    {item.quantity}x {item.name}
                                </div>
                            ))}
                            {order.items.length > 3 && (
                                <span className="text-xs text-gray-400">+{order.items.length - 3} more</span>
                            )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <User size={12} />
                                <span>Delivered to {user.name}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold text-indigo-600">
                                View Details <ChevronRight size={14} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        )}
      </main>
    </div>
  );
}
