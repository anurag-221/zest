'use client';

import { useState, useEffect } from 'react';
import { Tag, X, CheckCircle2, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import { supabaseClient } from '@/lib/supabase';
import { Coupon as CouponType } from '@/types';
import { toast } from 'sonner';

interface CouponSelectorProps {
    total: number;
    onApply: (code: string, discount: number) => void;
}

export default function CouponSelector({ total, onApply }: CouponSelectorProps) {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [validatingCode, setValidatingCode] = useState<string | null>(null);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const { data, error } = await supabaseClient
                    .from('coupons')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Filter valid ones based on date
                const now = new Date();
                const valid = (data || []).filter(c => {
                    const start = c.start_date ? new Date(c.start_date) : null;
                    const end = c.end_date ? new Date(c.end_date) : null;
                    if (start && now < start) return false;
                    if (end && now > end) return false;
                    return true;
                });

                setCoupons(valid);
            } catch (err) {
                console.error('Failed to fetch coupons', err);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) fetchCoupons();
    }, [isOpen]);

    const handleApply = async (code: string) => {
        setValidatingCode(code);
        try {
            const { validateCoupon } = await import('@/actions/coupon-actions');
            const res = await validateCoupon(code, total);
            
            if (res.success && res.coupon) {
                onApply(res.coupon.code, res.coupon.discount);
                setIsOpen(false);
            } else {
                toast.error(res.message || 'Invalid Coupon');
            }
        } catch (err) {
            toast.error('Failed to apply coupon');
        } finally {
            setValidatingCode(null);
        }
    };

    return (
        <div className="w-full">
            <button 
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center justify-between p-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Tag size={18} />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">View Available Coupons</p>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">Save more on your order</p>
                    </div>
                </div>
                <ChevronRight size={18} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                    
                    <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">Apply Coupon</h2>
                                <p className="text-xs text-gray-500">Select the best offer for you</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* List */}
                        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-indigo-500 mb-2" size={32} />
                                    <p className="text-sm text-gray-500">Finding best offers...</p>
                                </div>
                            ) : coupons.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <Tag size={24} />
                                    </div>
                                    <p className="text-gray-500 font-medium">No coupons available right now</p>
                                    <p className="text-xs text-gray-400 mt-1">Check back later for new offers</p>
                                </div>
                            ) : (
                                coupons.map((coupon) => {
                                    const isApplicable = total >= coupon.min_order_value;
                                    const isPending = validatingCode === coupon.code;

                                    return (
                                        <div 
                                            key={coupon.code}
                                            className={`relative overflow-hidden rounded-2xl border transition-all ${isApplicable ? 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 hover:border-indigo-300' : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 opacity-70'}`}
                                        >
                                            {/* Decorative side color */}
                                            <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isApplicable ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                                            
                                            <div className="p-5 pl-7">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-black text-lg tracking-wider text-gray-900 dark:text-white uppercase">{coupon.code}</span>
                                                            {isApplicable && <CheckCircle2 size={16} className="text-green-500" />}
                                                        </div>
                                                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                            {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                                                            {coupon.max_discount && ` up to ₹${coupon.max_discount}`}
                                                        </p>
                                                    </div>
                                                    <button 
                                                        disabled={!isApplicable || isPending}
                                                        onClick={() => handleApply(coupon.code)}
                                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${isApplicable ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                                    >
                                                        {isPending ? <Loader2 className="animate-spin" size={14} /> : 'Apply'}
                                                    </button>
                                                </div>

                                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{coupon.description}</p>
                                                
                                                {!isApplicable && (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/30 px-2 py-1 rounded w-fit">
                                                        <AlertCircle size={10} />
                                                        Add ₹{coupon.min_order_value - total} more to use this
                                                    </div>
                                                )}

                                                {coupon.end_date && (
                                                    <p className="mt-3 text-[10px] text-gray-400 uppercase tracking-tighter">
                                                        Valid until: {new Date(coupon.end_date).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-[10px] text-gray-400 text-center uppercase font-bold tracking-widest">
                                Terms & Conditions Apply
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
