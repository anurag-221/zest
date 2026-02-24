
import Link from 'next/link';
import { Plus, Tag, Trash2 } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';

export default async function AdminCouponsPage() {
    const { data: dbCoupons } = await supabaseAdmin.from('coupons').select('*').order('created_at', { ascending: false });
    const coupons = dbCoupons || [];

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Manage Coupons</h1>
                <Link 
                    href="/admin/coupons/new"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={20} />
                    New Coupon
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                        <tr>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Value</th>
                            <th className="px-6 py-4">Validity</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {coupons.map(coupon => {
                            const now = new Date();
                            const start = coupon.start_date ? new Date(coupon.start_date) : null;
                            const end = coupon.end_date ? new Date(coupon.end_date) : null;
                            
                            let status = 'active';
                            let statusColor = 'bg-green-100 text-green-700 border-green-200';
                            
                            if (!coupon.is_active) {
                                status = 'inactive';
                                statusColor = 'bg-gray-100 text-gray-500 border-gray-200';
                            } else if (start && now < start) {
                                status = 'scheduled';
                                statusColor = 'bg-blue-100 text-blue-700 border-blue-200';
                            } else if (end && now > end) {
                                status = 'expired';
                                statusColor = 'bg-red-100 text-red-700 border-red-200';
                            }

                            return (
                                <tr key={coupon.code} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase border ${statusColor}`}>
                                            {status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <Tag size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 tracking-wider uppercase">{coupon.code}</p>
                                                <p className="text-[10px] text-gray-400 max-w-[150px] truncate">{coupon.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 flex w-fit rounded text-xs font-bold uppercase">
                                            {coupon.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">
                                            {coupon.type === 'percentage' ? `${coupon.value}%${coupon.max_discount ? ` (Up to ₹${coupon.max_discount})` : ''}` : `₹${coupon.value}`}
                                        </p>
                                        <p className="text-[10px] text-gray-400">Min Order: ₹{coupon.min_order_value}</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        {start || end ? (
                                            <div className="space-y-0.5">
                                                {start && <p>From: {new Date(start).toLocaleDateString()}</p>}
                                                {end && <p>To: {new Date(end).toLocaleDateString()}</p>}
                                            </div>
                                        ) : (
                                            <span className="text-gray-300">Always valid</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <form action={async () => {
                                                'use server';
                                                const { deleteCoupon } = await import('@/actions/admin-coupon-actions');
                                                await deleteCoupon(coupon.code);
                                            }}>
                                                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {coupons.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        No coupons found. Create your first promo code to get started!
                    </div>
                )}
            </div>
        </div>
    );
}
