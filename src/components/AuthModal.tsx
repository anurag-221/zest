'use client';

import { useState } from 'react';
import { X, Smartphone, ArrowRight, Loader2, KeyRound, User as UserIcon, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabaseClient } from '@/lib/supabase';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useWalletStore } from '@/store/wallet-store';
import { useViewedStore } from '@/store/viewed-store';
import { upsertUser } from '@/actions/auth-actions';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'phone' | 'otp' | 'name';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [useWhatsapp, setUseWhatsapp] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [mockExpectedOtp, setMockExpectedOtp] = useState<string | null>(null);
  
  const { login } = useAuthStore();
  const { subscribeToPush } = usePushNotifications();

  const hydrateStoresFromDb = (dbUser: any) => {
    // Restore Cart
    if (dbUser.cart && dbUser.cart.length > 0) {
      useCartStore.setState({ items: dbUser.cart, total: dbUser.cart.reduce((a: number, i: any) => a + i.price * i.quantity, 0) });
    }
    // Restore Wishlist
    if (dbUser.wishlist && dbUser.wishlist.length > 0) {
      useWishlistStore.setState({ items: dbUser.wishlist });
    }
    // Restore Wallet
    if (dbUser.wallet_balance !== undefined && dbUser.wallet_balance !== null) {
      useWalletStore.setState({ 
        balance: dbUser.wallet_balance, 
        transactions: dbUser.wallet_transactions || [] 
      });
    }
    // Restore Viewed Products
    if (dbUser.viewed_products && dbUser.viewed_products.length > 0) {
      useViewedStore.setState({ viewedProductIds: dbUser.viewed_products });
    }
  };

  if (!isOpen) return null;

  const resetModalState = () => {
      setStep('phone');
      setPhone('');
      setOtp('');
      setName('');
      setMockExpectedOtp(null);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
        toast.error('Please enter a valid 10-digit number');
        return;
    }
    setLoading(true);
    
    try {
        const response = await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, channel: useWhatsapp ? 'whatsapp' : 'sms' }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to send OTP');
        }

        if (data.mock && data.devOtp) {
            setMockExpectedOtp(data.devOtp); // Store mock OTP to send to verification endpoint later
        }

        setStep('otp');
        const method = useWhatsapp ? 'WhatsApp' : 'SMS';
        const msg = data.mock ? `OTP sent via ${method}: ${data.devOtp} (DEV MODE)` : `OTP sent via ${method}`;
        toast.success(msg, {
            duration: 5000,
            icon: useWhatsapp ? <Smartphone size={18} className="text-green-500" /> : undefined
        });
    } catch (err) {
        toast.error((err as Error).message || 'Something went wrong');
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    
    try {
        const response = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, otp, mockExpectedOtp }),
        });
        
        const data = await response.json();
        
        if (data.valid) {
            // Check if user exists in Supabase DB
            const { data: existingUser } = await supabaseClient
                .from('users')
                .select('*')
                .eq('phone', phone)
                .single();

            if (existingUser) {
                // Background sync/upsert to ensure all fields are standard
                await upsertUser({
                    id: existingUser.id,
                    name: existingUser.name,
                    phone: existingUser.phone,
                    addresses: existingUser.addresses || []
                });

                // Log User into Local Client Store
                login({
                    id: existingUser.id,
                    name: existingUser.name,
                    phone: existingUser.phone,
                    addresses: existingUser.addresses || []
                });
                // Restore all other stores from DB
                hydrateStoresFromDb(existingUser);
                toast.success(`Welcome back, ${existingUser.name}!`);
                onClose();
                
                setTimeout(() => subscribeToPush(existingUser.id), 1000);
                setTimeout(() => resetModalState(), 500);
            } else {
                setStep('name');
            }
        } else {
            toast.error('Invalid OTP. Please try again.');
        }
    } catch (err) {
        toast.error('Verification failed. Try again later.');
    } finally {
        setLoading(false);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    
    try {
        const res = await upsertUser({
            name: name,
            phone: phone,
            addresses: []
        });

        if (!res.success || !res.user) {
            throw new Error(res.message || 'Failed to save user');
        }

        const inserted = res.user;

        // Log User into Local Client Store
        login({
            id: inserted.id,
            name: inserted.name,
            phone: inserted.phone,
            addresses: inserted.addresses || []
        });
    
        toast.success(`Welcome, ${name}!`);
        onClose();
        
        // Automatically attempt to subscribe to push notifications on login
        setTimeout(() => {
            subscribeToPush(inserted.id);
        }, 1000);
        // Reset for next time
        setTimeout(() => {
            resetModalState();
        }, 500);

    } catch (err) {
        console.error("Failed to save user", err);
        toast.error("Failed to complete signup. Try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors z-10">
            <X size={20} className="text-gray-500" />
        </button>

        {/* Hero Image */}
        <div className="bg-indigo-600 h-32 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-800 to-purple-600 opacity-80"></div>
            <div className="relative z-10 text-center text-white">
                <h2 className="text-2xl font-bold mb-1">Get Started</h2>
                <p className="text-indigo-100 text-sm">Log in to track orders & save addresses</p>
            </div>
        </div>

        <div className="p-8">
            {step === 'phone' && (
                <form onSubmit={handleSendOtp} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Enter Phone Number</label>
                        <div className="flex items-center gap-3 border dark:border-gray-700 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                            <span className="text-gray-500 font-bold">+91</span>
                            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                            <input 
                                type="tel" 
                                autoFocus
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder="99999 99999"
                                className="flex-1 bg-transparent border-none outline-none font-bold text-gray-900 dark:text-white placeholder-gray-400 text-lg tracking-widest"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setUseWhatsapp(!useWhatsapp)}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${useWhatsapp ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'}`}>
                            {useWhatsapp && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">Get OTP via WhatsApp</span>
                        {useWhatsapp && <Smartphone size={16} className="text-green-500 ml-auto" />}
                    </div>

                    <button type="submit" disabled={loading} className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${useWhatsapp ? 'bg-green-600 hover:bg-green-700 shadow-green-200 dark:shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none'}`}>
                        {loading ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={18} /></>}
                    </button>
                    <p className="text-xs text-center text-gray-400">By continuing, you agree to our Terms.</p>
                </form>
            )}

            {step === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="text-center mb-6">
                        <p className="text-gray-500 text-sm">We sent a code to <span className="font-bold text-gray-900 dark:text-gray-100">+91 {phone}</span></p>
                        <button type="button" onClick={() => setStep('phone')} className="text-indigo-600 text-xs font-bold hover:underline mt-1">Change Number</button>
                    </div>

                    {mockExpectedOtp && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6 text-center">
                            <p className="text-xs text-yellow-800 dark:text-yellow-200 font-bold mb-1">🧪 DEV MODE OTP</p>
                            <p className="text-lg font-black tracking-widest text-yellow-900 dark:text-yellow-100">{mockExpectedOtp}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <KeyRound size={16} /> Enter OTP
                        </label>
                        <input 
                            type="text" 
                            autoFocus
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                            placeholder="123456"
                            className="w-full border dark:border-gray-700 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none font-black text-center text-2xl tracking-[0.5em] text-gray-900 dark:text-white"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : 'Verify'}
                    </button>
                </form>
            )}

            {step === 'name' && (
                <form onSubmit={handleComplete} className="space-y-6">
                     <div className="text-center mb-2">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                             <UserIcon size={32} />
                        </div>
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white">Almost there!</h3>
                        <p className="text-gray-500 text-sm">What should we call you?</p>
                    </div>

                    <div className="space-y-2">
                         <input 
                            type="text" 
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                            className="w-full border dark:border-gray-700 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-900 dark:text-white text-lg text-center"
                        />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all">
                        Complete Signup
                    </button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
}
