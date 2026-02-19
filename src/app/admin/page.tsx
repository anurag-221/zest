import { db } from '@/lib/fs-db';
import { Users, TrendingUp, AlertTriangle } from 'lucide-react';
import AdminAnalytics from '@/components/AdminAnalytics';

export default async function AdminDashboard() {
  const events = await db.events.getAll();
  const orders = await db.orders.getAll();
  
  // 1. Active Events
  const activeEvents = events.filter(e => {
     const now = new Date();
     return new Date(e.schedule.start) <= now && new Date(e.schedule.end) >= now;
  });

  // 2. Financials
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.total, 0);

  const today = new Date().toDateString();
  const todaysRevenue = orders
    .filter(o => o.status !== 'cancelled' && new Date(o.createdAt).toDateString() === today)
    .reduce((acc, o) => acc + o.total, 0);

  // 3. User Metrics (Unique Customers)
  const uniqueCustomers = new Set(orders.map(o => o.customer?.name || 'Guest')).size;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total Customers</h3>
            <Users className="text-indigo-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{uniqueCustomers}</p>
          <span className="text-green-500 text-sm font-medium">Lifetime unique</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total Revenue</h3>
            <TrendingUp className="text-emerald-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
          <span className="text-gray-400 text-sm">Today: <span className="text-emerald-600 font-bold">₹{todaysRevenue}</span></span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Active Events</h3>
            <AlertTriangle className="text-orange-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{activeEvents.length}</p>
          <span className="text-gray-500 text-sm">Currently live campaigns</span>
        </div>
      </div>

      <div className="mb-8">
         <AdminAnalytics />
      </div>

      {/* Recent Activity */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {orders.length > 0 ? (
            <div className="divide-y divide-gray-50">
                {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div>
                            <p className="font-bold text-sm text-gray-900">New Order #{order.id}</p>
                            <p className="text-xs text-gray-500">{order.items.length} items • {new Date(order.createdAt).toLocaleTimeString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-sm text-gray-900">₹{order.total}</p>
                            <p className="text-xs text-indigo-600 capitalize">{order.status}</p>
                        </div>
                    </div>
                ))}
                <div className="p-3 text-center border-t border-gray-50">
                    <a href="/admin/orders" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All Orders</a>
                </div>
            </div>
        ) : (
            <div className="p-8 text-center text-gray-500">No orders yet.</div>
        )}
      </div>
    </div>
  );
}
