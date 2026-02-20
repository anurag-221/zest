import { db } from '@/lib/fs-db';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import OrderStatusSelector from '@/components/admin/OrderStatusSelector';

export default async function OrdersPage() {
  const orders = await db.orders.getAll();

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'delivered': return 'bg-green-100 text-green-700';
        case 'processing': return 'bg-blue-100 text-blue-700';
        case 'out-for-delivery': return 'bg-yellow-100 text-yellow-700';
        case 'cancelled': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
        case 'delivered': return <CheckCircle size={14} />;
        case 'processing': return <Package size={14} />;
        case 'out-for-delivery': return <Truck size={14} />;
        default: return <Clock size={14} />;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Recent Orders</h1>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100 text-left">
                <tr>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Order Details</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Customer & Address</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Items</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Payment</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 align-top">
                            <span className="font-mono text-xs font-bold text-indigo-600 block mb-1">#{order.id}</span>
                            <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</span>
                        </td>
                        <td className="p-4 align-top">
                            <p className="text-sm font-bold text-gray-900">{order.customer?.name || 'Guest'}</p>
                            <p className="text-xs text-gray-500 mt-0.5 max-w-[200px]">{order.customer?.address || 'No address provided'}</p>
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded border border-gray-200">
                                {order.cityId}
                            </span>
                        </td>
                        <td className="p-4 align-top">
                             <div className="space-y-1">
                                {order.items.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="text-sm text-gray-700 flex justify-between gap-4 max-w-[200px]">
                                        <span className="truncate">{item.name}</span>
                                        <span className="text-gray-400 text-xs whitespace-nowrap">x{item.quantity}</span>
                                    </div>
                                ))}
                                {order.items.length > 3 && (
                                    <p className="text-xs text-indigo-600 font-medium">+{order.items.length - 3} more items</p>
                                )}
                             </div>
                        </td>
                        <td className="p-4 align-top">
                            <p className="text-sm font-bold text-gray-900">₹{order.total}</p>
                            <p className="text-xs text-gray-500">{order.paymentMethod ? order.paymentMethod.toUpperCase() : 'COD'}</p>
                        </td>
                        <td className="p-4 align-top">
                            <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
