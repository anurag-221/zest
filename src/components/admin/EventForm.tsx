'use client';

import { AppEvent, City } from '@/types';
import { saveEvent } from '@/actions/event-actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';

interface EventFormProps {
  initialData?: AppEvent;
  availableCities: City[];
}

export default function EventForm({ initialData, availableCities }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<AppEvent>>(initialData || {
    type: 'festival',
    targetCities: ['all'],
    schedule: { start: '', end: '' },
    rules: { showTags: [], boostCategory: '' },
    assets: { banner: '', themeColor: '#000000' }
  });

  const isAllCities = formData.targetCities?.includes('all');

  // Helper for input changes
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCityToggle = (cityId: string) => {
      setFormData(prev => {
          const current = prev.targetCities || [];
          if (cityId === 'all') {
             return { ...prev, targetCities: ['all'] };
          }

          // If previously 'all', clear it and start with new selection
          let newCities = current.includes('all') ? [] : [...current];
          
          if (newCities.includes(cityId)) {
              newCities = newCities.filter(id => id !== cityId);
          } else {
              newCities.push(cityId);
          }
          
          // If nothing selected, default back to all? Or strict empty? Let's strict empty but maybe show error if needed.
          // Actually, let's keep it empty if user deselects all.
          
          return { ...prev, targetCities: newCities };
      });
  };

  const handleNestedChange = (parent: 'schedule' | 'rules' | 'assets', field: string, value: any) => {
    setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const tags = e.target.value.split(',').map(t => t.trim());
     handleNestedChange('rules', 'showTags', tags);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const payload: AppEvent = {
            id: formData.id || `evt-${Date.now()}`,
            name: formData.name!,
            type: formData.type as 'festival' | 'sale',
            schedule: formData.schedule!,
            rules: formData.rules!,
            assets: formData.assets!,
            targetCities: formData.targetCities || ['all']
        };

        if (payload.targetCities.length === 0) {
            alert('Please select at least one city or "All Cities"');
            setLoading(false);
            return;
        }

        await saveEvent(payload);
        router.push('/admin/events');
    } catch (error) {
        console.error(error);
        alert('Failed to save event');
    } finally {
        setLoading(false);
    }
  };

  // Helper to format ISO date to local datetime-local input format
  const formatForInput = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
            <input 
                required
                type="text" 
                value={formData.name || ''}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Diwali Sale"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select 
                value={formData.type}
                onChange={e => handleChange('type', e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-2.5 outline-none"
            >
                <option value="festival">Festival</option>
                <option value="sale">Sale</option>
                <option value="announcement">Announcement</option>
            </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Target Cities</label>
        <div className="flex flex-wrap gap-3">
             <button
                type="button"
                onClick={() => handleCityToggle('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    isAllCities 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300'
                }`}
             >
                All Cities
             </button>
             {availableCities.map(city => {
                 const isSelected = formData.targetCities?.includes(city.id) && !isAllCities;
                 return (
                    <button
                        key={city.id}
                        type="button"
                        onClick={() => handleCityToggle(city.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                            isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300'
                        }`}
                    >
                        {city.name}
                    </button>
                 );
             })}
        </div>
        <p className="text-xs text-gray-500 mt-2">
            {isAllCities ? 'Event visible in all locations.' : 'Event visible only in selected locations.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input 
                required
                type="datetime-local" 
                value={formData.schedule?.start ? formatForInput(formData.schedule.start) : ''}
                onChange={e => handleNestedChange('schedule', 'start', new Date(e.target.value).toISOString())}
                className="w-full rounded-lg border-gray-300 border p-2.5 outline-none"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input 
                required
                type="datetime-local" 
                value={formData.schedule?.end ? formatForInput(formData.schedule.end) : ''}
                onChange={e => handleNestedChange('schedule', 'end', new Date(e.target.value).toISOString())}
                className="w-full rounded-lg border-gray-300 border p-2.5 outline-none"
            />
        </div>
      </div>

      {/* Rules and Assets sections remain unchanged */}
      <div className="border-t pt-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Rules & Merchandising</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Show Tags (Comma separated)</label>
                <input 
                    type="text" 
                    defaultValue={formData.rules?.showTags?.join(', ') || ''}
                    onChange={handleTagsChange}
                    className="w-full rounded-lg border-gray-300 border p-2.5 outline-none"
                    placeholder="fasting, sweets, gift"
                />
                <p className="text-xs text-gray-500 mt-1">Products with these tags will be featured.</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Boost Category (Optional)</label>
                <input 
                    type="text" 
                    value={formData.rules?.boostCategory || ''}
                    onChange={e => handleNestedChange('rules', 'boostCategory', e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2.5 outline-none"
                    placeholder="e.g. sweets"
                />
            </div>
        </div>
      </div>

      <div className="border-t pt-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Assets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image URL</label>
                <input 
                    type="text" 
                    value={formData.assets?.banner || ''}
                    onChange={e => handleNestedChange('assets', 'banner', e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2.5 outline-none"
                    placeholder="https://..."
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme Color</label>
                 <div className="flex items-center gap-2">
                    <input 
                        type="color" 
                        value={formData.assets?.themeColor || '#000000'}
                        onChange={e => handleNestedChange('assets', 'themeColor', e.target.value)}
                        className="h-10 w-10 p-0 border-0 rounded"
                    />
                    <input 
                        type="text" 
                        value={formData.assets?.themeColor || ''}
                        onChange={e => handleNestedChange('assets', 'themeColor', e.target.value)}
                         className="flex-1 rounded-lg border-gray-300 border p-2.5 outline-none font-mono"
                    />
                 </div>
            </div>
        </div>
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
            Save Event
        </button>
      </div>

    </form>
  );
}
