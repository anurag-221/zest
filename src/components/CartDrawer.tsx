'use client';

import { useCartStore } from '@/store/cart-store';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, total, addItem, widthdrawItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!mounted) return null;

  // Mock Fees
  const deliveryFee = total > 499 ? 0 : 35;
  const handlingFee = 5;
  const grandTotal = total + deliveryFee + handlingFee;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-50 transition-opacity"
            onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[400px] bg-gray-50 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center justify-between border-b shadow-sm sticky top-0">
                <div className="flex items-center gap-3">
                    <span className="bg-yellow-100 p-2 rounded-full">
                         <ShoppingBag size={20} className="text-yellow-700" />
                    </span>
                    <div>
                        <h2 className="font-bold text-lg">My Cart</h2>
                        <p className="text-xs text-gray-500">{items.length} items</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                         <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-2130356-1800917.png" alt="Empty Cart" className="w-48 mb-4 mix-blend-multiply" />
                         <p className="font-bold text-lg mb-2">Your cart is empty</p>
                         <p className="text-sm">Add generic items to get started</p>
                    </div>
                ) : (
                    <>
                        {/* Delivery Time */}
                        <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex items-center gap-3">
                             <div className="bg-indigo-100 p-2 rounded-lg">
                                <img src="https://cdn-icons-png.flaticon.com/512/2972/2972185.png" className="w-8 h-8 object-contain" alt="Delivery" />
                             </div>
                             <div>
                                 <p className="font-bold text-gray-900">Delivery in 9 mins</p>
                                 <p className="text-xs text-gray-500">Shipment of {items.length} items</p>
                             </div>
                        </div>

                        {/* Items List */}
                        <div className="bg-white rounded-xl shadow-sm divide-y">
                            {items.map(item => (
                                <div key={item.id} className="p-4 flex gap-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 object-contain mix-blend-multiply" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm text-gray-900 line-clamp-2">{item.name}</h4>
                                        <p className="text-xs text-gray-500 mb-2">{item.description.substring(0, 20)}...</p>
                                        <div className="flex justify-between items-end">
                                            <span className="font-bold">₹{item.price * item.quantity}</span>
                                            
                                            <div className="flex items-center gap-2 bg-indigo-600 text-white rounded-lg p-1 shadow-sm">
                                                <button 
                                                    onClick={() => widthdrawItem(item.id)}
                                                    className="p-1 hover:bg-indigo-700 rounded transition-colors"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                <button 
                                                    onClick={() => addItem(item)}
                                                    disabled={item.stock !== undefined && item.quantity >= item.stock}
                                                    className="p-1 hover:bg-indigo-700 rounded transition-colors disabled:opacity-50"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bill Details */}
                        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
                            <h3 className="font-bold text-sm">Bill Details</h3>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Item Total</span>
                                <span>₹{total}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <span>Delivery Fee</span>
                                    {/* Tooltip hint could go here */}
                                </div>
                                <div className="flex items-center gap-2">
                                     <span className="line-through text-xs text-gray-400">₹50</span>
                                     <span className={deliveryFee === 0 ? "text-green-600 font-bold" : ""}>
                                        {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                                     </span>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Handling Charge</span>
                                <span>₹{handlingFee}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between font-bold text-base text-gray-900">
                                <span>To Pay</span>
                                <span>₹{grandTotal}</span>
                            </div>
                        </div>

                        {/* Cancellation Policy */}
                        <div className="bg-gray-100 p-3 rounded-lg">
                            <p className="text-[10px] text-gray-500 leading-tight">
                                Cancellation Policy: Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Footer Actions */}
            {items.length > 0 && (
                <div className="bg-white p-4 border-t sticky bottom-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                     {/* Address Strip */}
                     <div className="flex items-center justify-between mb-3 bg-gray-50 p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                             <div className="bg-white p-1 rounded shadow-sm">
                                <img src="https://cdn-icons-png.flaticon.com/512/535/535239.png" className="w-4 h-4" alt="Home" />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-800 uppercase">Delivering to Home</span>
                                <span className="text-[10px] text-gray-500 truncate max-w-[200px]">Room 402, Building 5...</span>
                             </div>
                        </div>
                        <button className="text-[10px] font-bold text-indigo-600 uppercase">Change</button>
                     </div>

                    <Link 
                        href="/checkout"
                        onClick={onClose} 
                        className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-between px-4 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 active:scale-[0.98]"
                    >
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-lg">₹{grandTotal}</span>
                            <span className="text-[10px] opacity-80 uppercase font-medium">Total</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>Proceed to Pay</span>
                            <ArrowRight size={18} />
                        </div>
                    </Link>
                </div>
            )}
        </div>
      </div>
    </>
  );
}
