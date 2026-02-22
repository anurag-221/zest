import { City } from '../types';
import { supabaseClient } from '@/lib/supabase';

// Helper to map DB snake_case back to app camelCase
const mapCity = (dbCity: any): City => ({
    id: dbCity.id,
    name: dbCity.name,
    pincodes: dbCity.pincodes,
    isActive: dbCity.is_active,
    lat: dbCity.lat,
    lng: dbCity.lng,
    displayName: dbCity.display_name
});

export const CityService = {
  getAllCities: async (): Promise<City[]> => {
    const { data: cities } = await supabaseClient
        .from('cities')
        .select('*')
        .eq('is_active', true);
    return (cities || []).map(mapCity);
  },

  getCityById: async (id: string): Promise<City | undefined> => {
    const { data: city } = await supabaseClient
        .from('cities')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();
    
    return city ? mapCity(city) : undefined;
  },

  searchCities: async (query: string): Promise<City[]> => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    
    // Fetch all active to filter locally since JSONB/Array searching via JS is easier than complex PostgREST
    // In production with millions, you'd use a dedicated text search index
    const { data: cities } = await supabaseClient
        .from('cities')
        .select('*')
        .eq('is_active', true);

    return (cities || [])
      .map(mapCity)
      .filter(city => 
        city.name.toLowerCase().includes(lowerQuery) || 
        city.pincodes.some(p => p.includes(lowerQuery))
      ).slice(0, 5); 
  },

  isValidPincode: async (pincode: string): Promise<City | undefined> => {
    const { data: cities } = await supabaseClient
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .contains('pincodes', [pincode])
        .limit(1);

    return cities && cities.length > 0 ? mapCity(cities[0]) : undefined;
  },

  getNearestCity: async (lat: number, lng: number): Promise<City | null> => {
    const citiesRaw = await CityService.getAllCities();
    const cities = citiesRaw.filter(c => c.lat && c.lng);
    
    let nearest: City | null = null;
    let minDistance = Infinity;

    cities.forEach(city => {
        const R = 6371; 
        const dLat = (city.lat! - lat) * Math.PI / 180;
        const dLng = (city.lng! - lng) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat * Math.PI / 180) * Math.cos(city.lat! * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        if (distance < minDistance) {
            minDistance = distance;
            nearest = city;
        }
    });

    if (minDistance <= 50) return nearest;
    return null;
  }
};
