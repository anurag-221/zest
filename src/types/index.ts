export interface City {
  id: string;
  name: string;
  pincodes: string[];
  isActive: boolean;
  lat?: number;
  lng?: number;
  displayName?: string; // For granular location (e.g. "Tilak Nagar, New Delhi")
}

export interface ProductVariant {
  label: string;   // e.g. '500ml', 'XL Pack', 'Premium Edition'
  price: number;
  discount?: string; // e.g. '16% off' shown as badge on chip
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Base price (default / first variant)
  image: string;
  category: string;
  brand?: string;
  tags: string[];
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  stock?: number;
  variants?: ProductVariant[];
  colors?: string[]; // hex codes e.g. ['#1a1a1a', '#f5f5f0']
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
  status: 'pending' | 'processing' | 'packed' | 'shipped' | 'out-for-delivery' | 'delivered' | 'cancelled';
  statusHistory?: { status: string; timestamp: string }[];
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

export interface Coupon {
  code: string;
  type: 'flat' | 'percentage' | 'shipping';
  value: number;
  maxDiscount?: number;
  minOrderValue: number;
  description: string;
}

export interface GlobalSettings {
  storeName: string;
  supportEmail: string;
  currency: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  handlingFee: number;
  platformFee: number;
  adminPasswordHash: string;
}
