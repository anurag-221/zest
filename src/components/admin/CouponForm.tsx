'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Tag } from 'lucide-react';
import { Coupon } from '@/types';
import { saveCoupon } from '@/actions/admin-coupon-actions';
import { toast } from 'sonner';

export default function CouponForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Coupon>>({
      type: 'percentage'
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const payload: Coupon = {
            code: formData.code!.toUpperCase(),
            type: formData.type as 'flat' | 'percentage' | 'shipping',
            value: Number(formData.value),
            minOrderValue: Number(formData.minOrderValue || 0),
            maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
            description: formData.description || ''
        };

        const result = await saveCoupon(payload);

        if (result.success) {
            toast.success('Coupon created successfully!');
            router.push('/admin/coupons');
            router.refresh();
        } else {
            toast.error(result.message || 'Failed to save coupon');
        }
    } catch (error) {
        console.error(error);
        toast.error('Failed to save coupon');
    } finally {
        setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <input 
                    required
                    type="text" 
                    value={formData.code || ''}
                    onChange={e => handleChange('code', e.target.value.toUpperCase())}
                    className="w-full rounded-lg border-gray-300 border p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-bold tracking-widest text-lg"
                    placeholder="E.g. SUMMER50"
                />
            </div>
            
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Internal / Customer facing)</label>
                <input 
                    required
                    type="text" 
                    value={formData.description || ''}
                    onChange={e => handleChange('description', e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="50% off on all summer items"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <select 
                    value={formData.type}
                    onChange={e => handleChange('type', e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                    <option value="shipping">Free Shipping</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                <input 
                    required={formData.type !== 'shipping'}
                    type="number" 
                    min="0"
                    disabled={formData.type === 'shipping'}
                    value={formData.type === 'shipping' ? 0 : formData.value || ''}
                    onChange={e => handleChange('value', e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    placeholder={formData.type === 'percentage' ? '%' : '₹'}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Value (₹)</label>
                <input 
                    required
                    type="number" 
                    min="0"
                    value={formData.minOrderValue === undefined ? '' : formData.minOrderValue}
                    onChange={e => handleChange('minOrderValue', e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                />
            </div>

            {formData.type === 'percentage' && (
                 <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount Cap (₹) - Optional</label>
                 <input 
                     type="number" 
                     min="0"
                     value={formData.maxDiscount || ''}
                     onChange={e => handleChange('maxDiscount', e.target.value)}
                     className="w-full rounded-lg border-gray-300 border p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="No cap"
                 />
             </div>
            )}
        </div>

        <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-70 shadow-lg shadow-indigo-100"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Save Coupon
            </button>
        </div>
    </form>
  );
}
