'use client';

import { useState } from 'react';
import { GlobalSettings } from '@/types';
import { saveSettings } from '@/actions/settings-actions';
import { toast } from 'sonner';
import { Save, Shield, Store, CreditCard, Loader2 } from 'lucide-react';

export default function SettingsForm({ initialSettings }: { initialSettings: GlobalSettings }) {
    const [settings, setSettings] = useState<GlobalSettings>(initialSettings);
    const [loading, setLoading] = useState(false);
    
    // UI Tabs State
    const [activeTab, setActiveTab] = useState<'identity' | 'fees' | 'security'>('identity');
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const result = await saveSettings(settings);
            if (result.success) {
                toast.success('Settings updated successfully!');
            } else {
                toast.error(result.message || 'Failed to update settings');
            }
        } catch (error) {
           toast.error('An unexpected error occurred.'); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Nav Tabs */}
            <div className="flex border-b border-gray-100 overflow-x-auto">
                <button 
                    type="button"
                    onClick={() => setActiveTab('identity')}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'identity' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <Store size={18} /> Store Identity
                </button>
                <button 
                    type="button"
                    onClick={() => setActiveTab('fees')}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'fees' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <CreditCard size={18} /> Fees & Taxes
                </button>
                <button 
                    type="button"
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'security' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <Shield size={18} /> Security
                </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
                
                {/* Store Identity Tab */}
                {activeTab === 'identity' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Store Name</label>
                                <input 
                                    type="text" 
                                    name="storeName"
                                    value={settings.storeName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Support Email</label>
                                <input 
                                    type="email" 
                                    name="supportEmail"
                                    value={settings.supportEmail}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Currency Symbol</label>
                                <input 
                                    type="text" 
                                    name="currency"
                                    value={settings.currency}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all max-w-[120px]"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Fees & Taxes Tab */}
                {activeTab === 'fees' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="bg-indigo-50 text-indigo-700 p-4 rounded-xl text-sm font-medium mb-6">
                            These values will automatically reflect on the Customer Checkout page.
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Standard Delivery Fee ({settings.currency})</label>
                                <input 
                                    type="number" 
                                    name="deliveryFee"
                                    value={settings.deliveryFee}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Free Delivery Threshold ({settings.currency})</label>
                                <div className="text-gray-500 text-xs mb-2">Orders above this value will get free delivery.</div>
                                <input 
                                    type="number" 
                                    name="freeDeliveryThreshold"
                                    value={settings.freeDeliveryThreshold}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Handling Fee ({settings.currency})</label>
                                <input 
                                    type="number" 
                                    name="handlingFee"
                                    value={settings.handlingFee}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Platform Fee ({settings.currency})</label>
                                <input 
                                    type="number" 
                                    name="platformFee"
                                    value={settings.platformFee}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                         <div className="bg-amber-50 text-amber-700 p-4 rounded-xl text-sm font-medium mb-6">
                            Changing this password will immediately affect all Admin Portal logins.
                        </div>
                        <div className="max-w-md">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Admin Portal Password</label>
                            <input 
                                type="text" 
                                name="adminPasswordHash"
                                value={settings.adminPasswordHash}
                                onChange={handleChange}
                                placeholder="Enter a secure password..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                )}

                {/* Submit Action */}
                <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 min-w-[160px]"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <>Save Changes <Save size={18} /></>}
                    </button>
                </div>
            </form>
        </div>
    );
}
