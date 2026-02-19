'use client';

import { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, Smartphone, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentModalProps {
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (method: string) => void;
  onFailure: (error: string) => void;
}

type PaymentMethod = 'upi' | 'card' | 'cod';
type PaymentState = 'idle' | 'processing' | 'success' | 'failure';

export default function PaymentModal({ amount, isOpen, onClose, onSuccess, onFailure }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [state, setState] = useState<PaymentState>('idle');
  const [upiApp, setUpiApp] = useState('gpay');

  // Reset state when opened
  useEffect(() => {
    if (isOpen) setState('idle');
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePayment = () => {
    setState('processing');
    
    // Simulate API call
    setTimeout(() => {
        const isSuccess = Math.random() > 0.1; // 90% success rate
        
        if (isSuccess) {
            setState('success');
            setTimeout(() => {
                onSuccess(method);
            }, 1500);
        } else {
            setState('failure');
            toast.error('Payment Failed. Please try again.');
        }
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Complete Payment</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
            </button>
        </div>

        {/* Amount */}
        <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 text-center">
            <p className="text-sm text-gray-500 dark:text-indigo-300 font-medium uppercase tracking-wider mb-1">To Pay</p>
            <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400">₹{amount}</p>
        </div>

        {/* Content based on State */}
        <div className="p-6">
            {state === 'idle' && (
                <div className="space-y-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-300 mb-2">Select Payment Method</p>
                    
                    {/* UPI */}
                    <div 
                        onClick={() => setMethod('upi')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${method === 'upi' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'}`}
                    >
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <Smartphone size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-900 dark:text-white">UPI</p>
                            <p className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</p>
                        </div>
                        {method === 'upi' && <div className="w-4 h-4 bg-indigo-600 rounded-full" />}
                    </div>

                    {/* Card */}
                    <div 
                        onClick={() => setMethod('card')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${method === 'card' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'}`}
                    >
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <CreditCard size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-900 dark:text-white">Credit / Debit Card</p>
                            <p className="text-xs text-gray-500">Visa, Mastercard, RuPay</p>
                        </div>
                        {method === 'card' && <div className="w-4 h-4 bg-indigo-600 rounded-full" />}
                    </div>

                    {/* COD */}
                    <div 
                        onClick={() => setMethod('cod')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${method === 'cod' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'}`}
                    >
                         <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                            <Banknote size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-900 dark:text-white">Cash on Delivery</p>
                            <p className="text-xs text-gray-500">Pay at your doorstep</p>
                        </div>
                        {method === 'cod' && <div className="w-4 h-4 bg-indigo-600 rounded-full" />}
                    </div>

                    <button 
                        onClick={handlePayment}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all mt-4"
                    >
                        Pay ₹{amount}
                    </button>
                </div>
            )}

            {state === 'processing' && (
                <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Processing Payment...</h3>
                    <p className="text-gray-500 text-center text-sm">Do not press back or close this window.</p>
                </div>
            )}

            {state === 'success' && (
                <div className="flex flex-col items-center justify-center py-8">
                    <CheckCircle2 size={64} className="text-green-500 mb-4 animate-bounce" />
                    <h3 className="text-xl font-bold text-green-600 mb-2">Payment Successful!</h3>
                    <p className="text-gray-500 text-center text-sm">Redirecting to order confirmation...</p>
                </div>
            )}
            
            {state === 'failure' && (
                <div className="flex flex-col items-center justify-center py-8">
                    <AlertCircle size={64} className="text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-red-600 mb-2">Payment Failed</h3>
                    <p className="text-gray-500 text-center text-sm mb-6">Something went wrong with the transaction.</p>
                    <button 
                        onClick={() => setState('idle')}
                        className="px-6 py-2 bg-gray-100 text-gray-900 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
        
        {/* Footer Security Badge */}
        <div className="bg-gray-50 dark:bg-gray-800 p-3 text-center border-t border-gray-100 dark:border-gray-700">
            <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                🔒 100% Secure Transaction • 256-bit SSL Encryption
            </p>
        </div>

      </div>
    </div>
  );
}
