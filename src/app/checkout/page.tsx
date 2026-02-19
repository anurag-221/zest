'use client';

import { useCartStore } from '@/store/cart-store';
import { useOrderStore } from '@/store/order-store';
import { useLocationStore } from '@/store/location-store';
import { placeOrder } from '@/actions/product-actions';
import { LocationPicker } from '@/components/LocationPicker';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MapPin, Clock, Banknote, ChevronRight, CheckCircle2, AlertCircle, Tag, Wallet } from 'lucide-react';
import RecommendationRail from '@/components/RecommendationRail';
import { RecommendationService } from '@/services/recommendation-service';
import { useWalletStore } from '@/store/wallet-store';
import { toast } from 'sonner';
import PaymentModal from '@/components/PaymentModal';
import { useAuthStore } from '@/store/auth-store';
import AuthModal from '@/components/AuthModal';

export default function CheckoutPage() {
    const { items, total, discount, couponCode, applyCoupon, removeCoupon, clearCart, tip, setTip } = useCartStore();
    const router = useRouter();
    const { addOrder } = useOrderStore();
    const { selectedCity } = useLocationStore();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi');
    
    // Auth Check
    const { isAuthenticated, user } = useAuthStore();
    const [showAuthModal, setShowAuthModal] = useState(false);
    
    // Address State
    const [selectedAddressId, setSelectedAddressId] = useState<string>('');
    
    useEffect(() => {
        if (user?.addresses && user.addresses.length > 0 && !selectedAddressId) {
            setSelectedAddressId(user.addresses[0].id);
        }
    }, [user, selectedAddressId]);
    
    const activeAddress = user?.addresses?.find(a => a.id === selectedAddressId) || null;

    useEffect(() => {
        if (mounted && !isAuthenticated) {
            // Optional: Auto-show modal or just let them click Place Order trigger
            // For better UX, we'll suggest login on Place Order
        }
    }, [mounted, isAuthenticated]);

    const handlePlaceOrder = () => {
        if (!isAuthenticated) {
            toast.info('Please log in to place your order');
            setShowAuthModal(true);
            return;
        }

        if (!activeAddress) {
            toast.error('Please Select or Add an address');
             // optional: router.push('/profile/addresses');
            return;
        }

        if (!selectedCity) {
            toast.error('Please select a city');
            return;
        }
        setShowPaymentModal(true);
    };

    const [showMap, setShowMap] = useState(false);
    
    // Coupon State
    const [couponInput, setCouponInput] = useState('');
    const [couponError, setCouponError] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [validatingCoupon, setValidatingCoupon] = useState(false);

    // Wallet State
    const { balance, deductFunds } = useWalletStore();
    const [useWallet, setUseWallet] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Bill Calculations - Moved up safely as they only depend on state/props
    const deliveryFee = total > 499 ? 0 : 35;
    const handlingFee = 5;
    const platformFee = 2; 
    
    // Calculate intermediate totals
    const totalAfterCoupon = Math.max(0, total + deliveryFee + handlingFee + platformFee + tip - discount);
    
    // Calculate wallet deduction
    const walletDeduction = useWallet ? Math.min(balance, totalAfterCoupon) : 0;
    const grandTotal = Math.max(0, totalAfterCoupon - walletDeduction);

    if (!mounted) return null;

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-2130356-1800917.png" alt="Empty Cart" className="w-64 mb-6 mix-blend-multiply" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
                <p className="text-gray-500 mb-8">Add items to get started</p>
                <Link href="/" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                    Browse Products
                </Link>
            </div>
        );
    }



    const handlePaymentSuccess = async (method: string) => {
        setLoading(true);
        setShowPaymentModal(false);

        try {
            // 1. Call Server Action to Deduct Stock
            const result = await placeOrder(selectedCity!.id, items.map(i => ({ id: i.id, quantity: i.quantity })));
            
            if (result.success) {
                // Deduct from Wallet if used
                if (useWallet && walletDeduction > 0) {
                     deductFunds(walletDeduction, `Order Payment #${result.orderId}`);
                }

                // 2. Create Local Order Record
                const newOrder = {
                    id: result.orderId!, // Use ID from server
                    items: [...items],
                    subtotal: total,
                    discount, // Save discount
                    deliveryFee,
                    handlingFee,
                    platformFee,
                    tip, // Save tip
                    total: grandTotal,
                    date: new Date().toLocaleDateString(),
                    status: 'Processing' as const,
                    address: activeAddress ? `${activeAddress.line1}, ${activeAddress.city}` : 'Guest Address', 
                    paymentMethod: method // Save method
                };

                addOrder(newOrder);
                clearCart();
                toast.success('Order placed successfully! 🎉');
                router.push(`/order-success/${result.orderId}`);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const handleAddressSelect = (address: string) => {
         toast.success("Address selected from map: " + address);
         setShowMap(false);
         // Ideally this would save to user addresses or set a temporary address state
    };



    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-10">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-gray-100 rounded-full">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold">Checkout</h1>
                        <p className="text-xs text-gray-500">{items.length} items • Total ₹{grandTotal}</p>
                    </div>
                </div>
            </header>

            {/* AI Recommendations */}
            {items.length > 0 && (
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    <RecommendationRail 
                        title="Complete Your Meal" 
                        products={RecommendationService.getCartRecommendations(items.map(i => i.id))} 
                    />
                </div>
            )}

            <main className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
                
                {/* 1. Address Section */}
                <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600"></div>
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 mb-1">
                            <MapPin size={18} className="text-indigo-600" />
                            <h2 className="font-bold text-gray-900">Delivery Address</h2>
                        </div>
                        <Link 
                            href="/profile/addresses"
                            className="text-indigo-600 text-sm font-bold uppercase hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                        >
                            {activeAddress ? 'Change' : 'Add New'}
                        </Link>
                    </div>
                    
                    {activeAddress ? (
                        <div className="pl-6">
                            <h3 className="font-bold text-sm text-gray-800">{activeAddress.type}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {activeAddress.line1} <br/>
                                {activeAddress.line2}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{activeAddress.city}, {activeAddress.zip}</p>
                            <div className="flex items-center gap-2 mt-3 text-xs font-bold text-gray-600 bg-gray-100 w-fit px-3 py-1.5 rounded-lg">
                                <Clock size={14} />
                                <span>Delivery in 9 mins</span>
                            </div>
                        </div>
                    ) : (
                         <div className="pl-6 text-sm text-gray-500">
                            Please select or add a delivery address to proceed.
                        </div>
                    )}
                </section>

                {/* 2. Payment Method */}
                <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Banknote size={18} className="text-gray-700" />
                        Payment Method
                    </h2>
                    
                    <div className="space-y-3">
                        <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'}`}>
                            <input 
                                type="radio" 
                                name="payment" 
                                className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                                checked={paymentMethod === 'upi'}
                                onChange={() => setPaymentMethod('upi')}
                            />
                            <div className="flex-1">
                                <span className="font-bold text-gray-900 block">UPI</span>
                                <span className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</span>
                            </div>
                            <img src="https://cdn-icons-png.flaticon.com/512/270/270830.png" className="w-8 h-8 opacity-80" alt="UPI" />
                        </label>

                        <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'}`}>
                            <input 
                                type="radio" 
                                name="payment" 
                                className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                                checked={paymentMethod === 'cod'}
                                onChange={() => setPaymentMethod('cod')}
                            />
                            <div className="flex-1">
                                <span className="font-bold text-gray-900 block">Cash on Delivery</span>
                                <span className="text-xs text-gray-500">Pay cash/UPI at doorstep</span>
                            </div>
                            <Banknote className="text-gray-400" size={24} />
                        </label>
                    </div>

                    {/* Wallet Option */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${useWallet ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'}`}>
                             <div className="relative">
                                <input 
                                    type="checkbox" 
                                    className="peer sr-only"
                                    checked={useWallet}
                                    onChange={(e) => setUseWallet(e.target.checked)}
                                    disabled={balance <= 0}
                                />
                                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${useWallet ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                                    {useWallet && <CheckCircle2 size={12} className="text-white" />}
                                </div>
                             </div>
                             <div className="flex-1">
                                 <span className="font-bold text-gray-900 flex items-center gap-2">
                                     Use Zest Cash
                                     {balance > 0 && <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded-full">Available</span>}
                                 </span>
                                 <span className="text-xs text-gray-500">Balance: ₹{balance.toFixed(2)}</span>
                             </div>
                             <Wallet className="text-indigo-600" size={24} />
                        </label>
                    </div>
                </section>

                {/* 3. Coupon Section */}
                <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                     <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Tag size={18} className="text-gray-700" />
                        Coupons & Offers
                     </h2>
                     
                     {couponCode ? (
                         <div className="flex justify-between items-center bg-green-50 border border-green-200 p-3 rounded-lg">
                             <div>
                                 <p className="font-bold text-green-700 flex items-center gap-1">
                                     <CheckCircle2 size={14} /> 
                                     '{couponCode}' applied
                                 </p>
                                 <p className="text-xs text-green-600">You saved ₹{discount}</p>
                             </div>
                             <button onClick={removeCoupon} className="text-xs text-red-500 font-bold hover:underline">REMOVE</button>
                         </div>
                     ) : (
                        <div className="flex gap-2">
                             <div className="flex-1 relative">
                                <input 
                                    type="text"
                                    placeholder="Enter Coupon Code"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 uppercase"
                                    value={couponInput}
                                    onChange={(e) => {
                                        setCouponInput(e.target.value.toUpperCase());
                                        setCouponError('');
                                    }}
                                />
                                {couponError && <p className="absolute -bottom-5 left-0 text-xs text-red-500">{couponError}</p>}
                             </div>
                             <button 
                                onClick={async () => {
                                    if (!couponInput) return;
                                    setValidatingCoupon(true);
                                    setCouponError('');
                                    const { validateCoupon } = await import('@/actions/coupon-actions'); // Dynamic import to avoid server action in client component issues if any
                                    const res = await validateCoupon(couponInput, total);
                                    setValidatingCoupon(false);
                                    
                                    if (res.success && res.coupon) {
                                        applyCoupon(res.coupon.code, res.coupon.discount);
                                        toast.success('Coupon applied successfully!');
                                        setCouponInput('');
                                    } else {
                                        toast.error(res.message || 'Invalid Coupon');
                                        setCouponError(res.message || 'Invalid Coupon');
                                    }
                                }}
                                disabled={validatingCoupon || !couponInput}
                                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-50"
                             >
                                 {validatingCoupon ? 'APPLYING...' : 'APPLY'}
                             </button>
                        </div>
                     )}
                </section>

                {/* 3.5 Delivery Tip */}
                <section className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                     <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">❤️</span>
                        <div>
                            <h2 className="font-bold text-gray-900 dark:text-white">Tip your delivery partner</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">100% of the tip goes to your partner</p>
                        </div>
                     </div>
                     
                     <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {[20, 30, 50, 100].map((amount) => (
                            <button
                                key={amount}
                                onClick={() => setTip(tip === amount ? 0 : amount)}
                                className={`flex-shrink-0 px-4 py-2 rounded-xl border font-bold transition-all ${
                                    tip === amount 
                                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300' 
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                                }`}
                            >
                                <span className="text-sm">₹{amount}</span>
                                {amount === 50 && <span className="block text-[10px] font-normal text-gray-500">Most Tipped</span>}
                            </button>
                        ))}
                     </div>
                </section>

                {/* 4. Bill Details */}
                <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                     <h2 className="font-bold text-gray-900 mb-4">Bill Details</h2>
                     <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Item Total</span>
                            <span>₹{total}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span className="flex items-center gap-1">
                                Delivery Fee 
                                {deliveryFee === 0 && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded">FREE</span>}
                            </span>
                            <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                                {deliveryFee === 0 ? "- ₹35" : `₹${deliveryFee}`}
                            </span>
                        </div>
                        {deliveryFee === 0 && (
                            <div className="text-xs text-gray-400 pl-1">
                                <span className="line-through mr-2">₹35</span>
                                Free delivery for orders above ₹499
                            </div>
                        )}
                        <div className="flex justify-between text-gray-600">
                            <span>Handling Charge</span>
                            <span>₹{handlingFee}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Platform Fee</span>
                            <span>₹{platformFee}</span>
                        </div>
                        
                        {discount > 0 && (
                             <div className="flex justify-between text-green-600 font-bold">
                                <span>Coupon Discount</span>
                                <span>- ₹{discount}</span>
                            </div>
                        )}

                        {tip > 0 && (
                             <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-1">Delivery Tip ❤️</span>
                                <span>₹{tip}</span>
                            </div>
                        )}

                        {useWallet && walletDeduction > 0 && (
                             <div className="flex justify-between text-indigo-600 font-bold">
                                <span>Zest Cash Used</span>
                                <span>- ₹{walletDeduction}</span>
                            </div>
                        )}

                        <div className="border-t border-dashed border-gray-300 my-4 pt-4 flex justify-between items-center">
                            <span className="font-bold text-lg text-gray-900">To Pay</span>
                            <span className="font-bold text-lg text-gray-900">₹{grandTotal}</span>
                        </div>
                     </div>
                </section>

                {/* 4. Cancellation Policy */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-3">
                    <AlertCircle className="text-gray-400 flex-shrink-0" size={20} />
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.
                    </p>
                </div>

            </main>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-[60] md:hidden">
                <button 
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 flex items-center justify-between px-6 active:scale-[0.98] transition-transform disabled:opacity-70"
                >
                    <span>₹{grandTotal}</span>
                    <span className="flex items-center gap-2">
                        {loading ? 'Processing...' : 'Place Order'} 
                        {!loading && <ChevronRight size={20} />}
                    </span>
                </button>
            </div>

            {/* Desktop Place Order Button (Hidden on Mobile) */}
             <div className="hidden md:block fixed bottom-10 right-10 z-20">
                <button 
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-xl shadow-xl shadow-indigo-200 flex items-center gap-3 hover:bg-indigo-700 transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
                >
                    {loading ? (
                         <span>Processing...</span>
                    ) : (
                        <>
                            <span>Place Order</span>
                            <span className="bg-white/20 px-2 py-0.5 rounded text-base">₹{grandTotal}</span>
                            <ChevronRight size={24} />
                        </>
                    )}
                </button>
            </div>

            {/* Location Picker Modal */}
            {showMap && (
                <LocationPicker 
                    onConfirm={(addr) => {
                        handleAddressSelect(addr.split('(')[0]); // Simple clean up
                    }} 
                    onClose={() => setShowMap(false)} 
                />
            )}

            <PaymentModal 
                amount={grandTotal}
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handlePaymentSuccess}
                onFailure={(err) => toast.error(err)}
            />
            
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    );
}
