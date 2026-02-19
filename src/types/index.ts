export interface City {
  id: string;
  name: string;
  pincodes: string[];
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Base price, might be overridden by inventory
  image: string;
  category: string;
  brand?: string;
  tags: string[];
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  stock?: number;
}

export interface InventoryItem {
  stock: number;
  price: number; 
}

export interface Inventory {
  [cityId: string]: {
    [productId: string]: InventoryItem;
  };
}

export interface EventRule {
  showTags: string[];
  boostCategory?: string;
}

export interface EventSchedule {
  start: string; // ISO Date
  end: string;   // ISO Date
}

export interface EventAssets {
  banner: string;
  themeColor: string;
}

export interface AppEvent {
  id: string;
  name: string;
  type: 'festival' | 'sale' | 'announcement';
  schedule: EventSchedule;
  rules: EventRule;
  assets: EventAssets;
  targetCities: string[]; // "all" or specific city IDs
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  createdAt: string;
  cityId: string;
  userId?: string;
  customer?: {
    name?: string;
    address?: string;
  };
  discount?: number;
  fees?: {
    delivery: number;
    platform: number;
    handling: number;
    tip?: number;
  };
  paymentMethod?: string;
}
