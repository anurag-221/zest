'use client';

import { Product, City } from '@/types';
import { saveProduct, updateInventory } from '@/actions/product-actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, MapPin } from 'lucide-react';

interface ProductFormProps {
  initialData?: Product;
  cities: City[];
  initialInventory?: Record<string, { stock: number, price: number }>;
}

export default function ProductForm({ initialData, cities, initialInventory = {} }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>(initialData || {
    tags: [],
    category: 'pantry'
  });

  // Inventory State
  const [selectedCity, setSelectedCity] = useState<string>(cities[0]?.id || '');
  const [inventoryData, setInventoryData] = useState(initialInventory);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const tags = e.target.value.split(',').map(t => t.trim());
     handleChange('tags', tags);
  };

  const handleInventoryChange = (field: 'stock' | 'price', value: number) => {
      setInventoryData(prev => ({
          ...prev,
          [selectedCity]: {
              ...prev[selectedCity] || { stock: 0, price: formData.price || 0 },
              [field]: value
          }
      }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        // 1. Save Product Context
        const payload: Product = {
            id: formData.id || `prod-${Date.now()}`,
            name: formData.name!,
            description: formData.description!,
            price: Number(formData.price),
            image: formData.image!,
            category: formData.category!,
            tags: formData.tags || []
        };

        await saveProduct(payload);

        // 2. Save Inventory for the selected city (or all modified ones if we optimized)
        // For now, let's just save the currently viewed city's inventory if it exists
        if (inventoryData[selectedCity]) {
            await updateInventory(
                selectedCity, 
                payload.id, 
                Number(inventoryData[selectedCity].stock), 
                Number(inventoryData[selectedCity].price)
            );
        }

        router.push('/admin/products');
        router.refresh();
    } catch (error) {
        console.error(error);
        alert('Failed to save product');
    } finally {
        setLoading(false);
    }
  };

  const currentCityInv = inventoryData[selectedCity] || { stock: 0, price: formData.price || 0 };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Product Details */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Product Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input 
                        required
                        type="text" 
                        value={formData.name || ''}
                        onChange={e => handleChange('name', e.target.value)}
                        className="w-full rounded-lg border-gray-300 border p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                        required
                        rows={3}
                        value={formData.description || ''}
                        onChange={e => handleChange('description', e.target.value)}
                        className="w-full rounded-lg border-gray-300 border p-2.5 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                    <input 
                        required
                        type="number" 
                        value={formData.price || ''}
                        onChange={e => handleChange('price', e.target.value)}
                        className="w-full rounded-lg border-gray-300 border p-2.5 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                        value={formData.category}
                        onChange={e => handleChange('category', e.target.value)}
                        className="w-full rounded-lg border-gray-300 border p-2.5 outline-none"
                    >
                        <option value="pantry">Pantry</option>
                        <option value="dairy">Dairy</option>
                        <option value="fruits">Fruits</option>
                        <option value="snacks">Snacks</option>
                        <option value="beverages">Beverages</option>
                        <option value="sweets">Sweets</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input 
                    required
                    type="text" 
                    value={formData.image || ''}
                    onChange={e => handleChange('image', e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2.5 outline-none"
                    placeholder="https://..."
                />
            </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-4">Tags & Discovery</h2>
             <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Comma separated)</label>
                <input 
                    type="text" 
                    defaultValue={formData.tags?.join(', ') || ''}
                    onChange={handleTagsChange}
                    className="w-full rounded-lg border-gray-300 border p-2.5 outline-none"
                    placeholder="breakfast, healthy, spicy"
                />
                <p className="text-xs text-gray-500 mt-1">Used for search and event rules.</p>
            </div>
            
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox"
                        id="isBestSeller"
                        checked={formData.isBestSeller || false}
                        onChange={e => handleChange('isBestSeller', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="isBestSeller" className="text-sm font-medium text-gray-700">Mark as Best Seller</label>
                </div>
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox"
                        id="isNewArrival"
                        checked={formData.isNewArrival || false}
                        onChange={e => handleChange('isNewArrival', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="isNewArrival" className="text-sm font-medium text-gray-700">Mark as New Arrival</label>
                </div>
            </div>
        </div>
      </div>

      {/* Right Column: Inventory & Actions */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-indigo-600" />
                Inventory Manager
            </h2>
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select City</label>
                <select 
                    value={selectedCity}
                    onChange={e => setSelectedCity(e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2.5 outline-none"
                >
                    {cities.map(city => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock Level</label>
                     <input 
                        type="number"
                        min="0"
                        value={currentCityInv.stock}
                        onChange={e => handleInventoryChange('stock', Number(e.target.value))}
                        className="w-full rounded-lg border-gray-300 border p-2 outline-none font-bold text-lg"
                     />
                </div>
                 <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City Specific Price (₹)</label>
                     <input 
                        type="number"
                        min="0"
                        value={currentCityInv.price}
                        onChange={e => handleInventoryChange('price', Number(e.target.value))}
                        className="w-full rounded-lg border-gray-300 border p-2 outline-none font-bold text-lg"
                     />
                     <p className="text-xs text-gray-400 mt-1">Base Price: ₹{formData.price}</p>
                </div>
            </div>
            
            <p className="text-xs text-amber-600 mt-4 bg-amber-50 p-2 rounded">
                Note: Updating stock here saves it immediately for <strong>{cities.find(c => c.id === selectedCity)?.name}</strong> when you click Save Product.
            </p>
        </div>

        <div className="flex flex-col gap-3">
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-70 shadow-lg shadow-indigo-100"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Save Product
            </button>
            <button
                type="button"
                onClick={() => router.back()}
                className="w-full px-6 py-4 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
                Cancel
            </button>
        </div>
      </div>

    </form>
  );
}
