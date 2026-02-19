import { Product } from '../types';

export interface Brand {
  id: string;
  name: string;
  logo: string;
  banner: string;
  description: string;
}

export const BRANDS: Brand[] = [
  {
    id: 'amul',
    name: 'Amul',
    logo: '/images/brands/amul.png',
    banner: 'https://www.amul.com/m/images/milk-range-banner.jpg',
    description: 'The Taste of India. Milk, Butter, Cheese, and more.'
  },
  {
    id: 'nestle',
    name: 'Nestlé',
    logo: '/images/brands/nestle.png',
    banner: 'https://www.nestle.in/sites/g/files/pydnoa451/files/banner-images/Desktop-Banner-1920x450.jpg',
    description: 'Good Food, Good Life. Maggi, KitKat, Nescafe.'
  },
  {
    id: 'britannia',
    name: 'Britannia',
    logo: '/images/brands/britannia.png',
    banner: 'https://britannia.co.in/images/banner/good-day.jpg',
    description: 'Baking a world of happiness with Biscuits, Bread and Dairy.'
  },
  {
    id: 'coke',
    name: 'Coca-Cola',
    logo: '/images/brands/coke.png',
    banner: 'https://www.coca-colacompany.com/content/dam/journey/us/en/brands/coca-cola/coca-cola-original-taste-header.jpg',
    description: 'Open Happiness. Refreshing beverages for every moment.'
  },
  {
    id: 'lays',
    name: 'Lays',
    logo: '/images/brands/lays.png',
    banner: 'https://www.lays.com/sites/lays.com/files/styles/banner/public/2021-06/Lays-Banner.jpg',
    description: 'Betcha can\'t eat just one!'
  },
    {
    id: 'tata',
    name: 'Tata',
    logo: '/images/brands/tata.png',
    banner: 'https://www.tata.com/content/dam/tata/images/home/banner-desktop.jpg',
    description: 'Desh Ka Namak and much more.'
  }
];

export const BrandService = {
  getAllBrands: () => BRANDS,
  getBrandById: (id: string) => BRANDS.find(b => b.id === id),
};
