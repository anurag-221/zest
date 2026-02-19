import { City } from '../types';
import citiesData from '../../data/cities.json';

export const CityService = {
  getAllCities: (): City[] => {
    return citiesData as City[];
  },

  getCityById: (id: string): City | undefined => {
    return (citiesData as City[]).find(city => city.id === id);
  },

  searchCities: (query: string): City[] => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return (citiesData as City[]).filter(city => 
      city.name.toLowerCase().includes(lowerQuery) || 
      city.pincodes.some(p => p.includes(lowerQuery))
    ).slice(0, 5); // Return max 5 suggestions
  },

  isValidPincode: (pincode: string): City | undefined => {
    return (citiesData as City[]).find(city => city.pincodes.includes(pincode));
  }
};
