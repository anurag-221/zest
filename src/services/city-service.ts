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
  }
};
