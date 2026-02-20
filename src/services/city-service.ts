import { City } from '../types';
import citiesData from '../../data/cities.json';

export const CityService = {
  getAllCities: (): City[] => {
    return (citiesData as City[]).filter(city => city.isActive);
  },

  getCityById: (id: string): City | undefined => {
    // We might still want to get a city by ID even if inactive (e.g. for existing orders), 
    // but for now let's keep it consistent or just leave it as is. 
    // Usually getById is for specific lookups, whereas lists are for selection.
    // Let's filter here too to be safe, unless it breaks order history.
    // Actually, for order history, we likely store the city name snapshot.
    return (citiesData as City[]).find(city => city.id === id && city.isActive);
  },

  searchCities: (query: string): City[] => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return (citiesData as City[])
      .filter(city => city.isActive)
      .filter(city => 
      city.name.toLowerCase().includes(lowerQuery) || 
      city.pincodes.some(p => p.includes(lowerQuery))
    ).slice(0, 5); // Return max 5 suggestions
  },

  isValidPincode: (pincode: string): City | undefined => {
    return (citiesData as City[]).find(city => city.isActive && city.pincodes.includes(pincode));
  },

  getNearestCity: (lat: number, lng: number): City | null => {
    const cities = CityService.getAllCities().filter(c => c.lat && c.lng);
    let nearest: City | null = null;
    let minDistance = Infinity;

    cities.forEach(city => {
        // Haversine Formula approximation (sufficient for city level)
        const R = 6371; // Earth radius in km
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

    // Only return if within 50km
    if (minDistance <= 50) return nearest;
    return null;
  }
};
