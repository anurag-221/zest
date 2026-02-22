'use client';

import { useAuthStore } from '@/store/auth-store';
import { useOrderStore } from '@/store/order-store';
import Header from '@/components/Header';
import Link from 'next/link';
import { Package, MapPin, ChevronRight, LogOut, User, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { orders, updateOrderStatusLocally } = useOrderStore();
  const router = useRouter();

  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Fetch orders from DB on mount — only for the current logged-in user
  useEffect(() => {
    let isMounted = true;
    
    if (!isAuthenticated || !user?.id) {
        setLoadingOrders(false);
        return;
    }

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const { data, error } = await supabaseClient
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            if (isMounted && data) {
                setDbOrders(data);
            }
        } catch (err) {
            console.error("Failed to fetch user orders", err);
        } finally {
            if (isMounted) setLoadingOrders(false);
        }
    };

    fetchOrders();
    
    return () => { isMounted = false; };
  }, [isAuthenticated, user?.id]);

  // Sync active order statuses continuously
  useEffect(() => {
    let isMounted = true;
    
    const syncOrders = async () => {
        const activeOrderIds = dbOrders
            .filter(o => !['delivered', 'cancelled'].includes(o.status))
            .map(o => o.id);
            
        if (activeOrderIds.length === 0) return;

        try {
            const { data, error } = await supabaseClient
                .from('orders')
                .select('id, status')
                .in('id', activeOrderIds);
                
            if (error) throw error;
            
            if (isMounted && data && data.length > 0) {
                setDbOrders(prev => prev.map(oldOrder => {
                    const update = data.find(newOrder => newOrder.id === oldOrder.id);
                    return update ? { ...oldOrder, status: update.status } : oldOrder;
                }));
            }
        } catch (err) {
            console.error("Failed to sync orders", err);
        }
    };

    if (isAuthenticated && dbOrders.length > 0) {
        // Only run the interval if we actually have orders loaded
        const interval = setInterval(syncOrders, 5000);
        return () => { 
            isMounted = false; 
            clearInterval(interval); 
        };
    }
    
    return () => { isMounted = false; };
  }, [isAuthenticated, dbOrders.length]);

  useEffect(() => {
    if (!isAuthenticated) {
        router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!user) return null;

  const myOrders = dbOrders;

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50';
          case 'processing': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
          case 'packed': return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50';
          case 'shipped': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-800/50';
          case 'out-for-delivery': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-800/50';
          case 'delivered': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800/50';
          case 'cancelled': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800/50';
          default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
      }
  };

  const formatStatus = (status: string) => {
      return status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

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

        {loadingOrders ? (
             <div className="flex justify-center items-center py-12">
                 <Loader2 className="animate-spin text-indigo-500" size={32} />
             </div>
        ) : myOrders.length === 0 ? (
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
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{order.date ? new Date(order.date).toLocaleDateString() : 'Recent'}</span>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                                        {formatStatus(order.status)}
                                    </span>
                                </div>
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">₹{order.total}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 overflow-hidden">
                            {order.items.slice(0, 3).map((item: any, idx: number) => (
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
