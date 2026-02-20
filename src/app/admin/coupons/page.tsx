import { db } from '@/lib/fs-db';
import Link from 'next/link';
import { Plus, Tag, Trash2, Edit } from 'lucide-react';

export default async function AdminCouponsPage() {
    const coupons = await db.coupons.getAll();

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
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Value</th>
                            <th className="px-6 py-4">Min. Order</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {coupons.map(coupon => (
                            <tr key={coupon.code} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <Tag size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 tracking-wider uppercase">{coupon.code}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 flex w-fit rounded text-xs font-bold uppercase">
                                        {coupon.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {coupon.type === 'percentage' ? `${coupon.value}%${coupon.maxDiscount ? ` (Up to ₹${coupon.maxDiscount})` : ''}` : `₹${coupon.value}`}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-500">
                                    ₹{coupon.minOrderValue}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                    {coupon.description}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        {/* Future edit feature could be added here */}
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
                        ))}
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
