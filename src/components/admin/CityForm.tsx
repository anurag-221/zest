'use client';

import { City } from '@/types';
import { saveCity } from '@/actions/city-actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Plus, X } from 'lucide-react';

interface CityFormProps {
  initialData?: City;
}

export default function CityForm({ initialData }: CityFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<City>>(initialData || {
    isActive: true,
    pincodes: []
  });
  const [pincodeInput, setPincodeInput] = useState('');

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addPincode = () => {
      if (!pincodeInput.trim()) return;
      setFormData(prev => ({
          ...prev,
          pincodes: [...(prev.pincodes || []), pincodeInput.trim()]
      }));
      setPincodeInput('');
  };

  const removePincode = (index: number) => {
      setFormData(prev => ({
          ...prev,
          pincodes: prev.pincodes?.filter((_, i) => i !== index)
      }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const payload: City = {
            id: formData.id || `city-${Date.now()}`,
            name: formData.name!,
            pincodes: formData.pincodes || [],
            isActive: formData.isActive ?? true
        };

        await saveCity(payload);
        router.push('/admin/cities');
        router.refresh();
    } catch (error) {
        console.error(error);
        alert('Failed to save city');
    } finally {
        setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl">
      <div className="space-y-6">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City Name</label>
            <input 
                required
                type="text" 
                value={formData.name || ''}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Pune"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincodes</label>
            <div className="flex gap-2 mb-3">
                <input 
                    type="text" 
                    value={pincodeInput}
                    onChange={e => setPincodeInput(e.target.value)}
                    className="flex-1 rounded-lg border-gray-300 border p-2.5 outline-none"
                    placeholder="Enter Pincode"
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPincode())}
                />
                <button 
                    type="button"
                    onClick={addPincode}
                    className="bg-gray-100 text-gray-700 px-4 rounded-lg hover:bg-gray-200"
                >
                    <Plus size={20} />
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {formData.pincodes?.map((pin, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                        {pin}
                        <button type="button" onClick={() => removePincode(i)} className="hover:text-indigo-900">
                            <X size={14} />
                        </button>
                    </span>
                ))}
            </div>
        </div>

        <div className="flex items-center gap-2">
            <input 
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={e => handleChange('isActive', e.target.checked)}
                className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
        </div>

        <div className="flex justify-end pt-4 gap-3">
             <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-70"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Save City
            </button>
        </div>
      </div>
    </form>
  );
}
