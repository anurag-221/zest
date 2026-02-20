'use client';

import { useCartStore } from '../store/cart-store';
import { useLocationStore } from '../store/location-store';
import { Search, ShoppingBag, MapPin, ChevronDown, User, Menu, ShoppingCart, Mic, Heart } from 'lucide-react';
import { LocationPicker } from './LocationPicker';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';

import { useState, useEffect } from 'react';
import useVoiceInput from '../hooks/useVoiceInput';
import CartDrawer from './CartDrawer';
import { ProductService } from '@/services/product-service';
import { useAuthStore } from '@/store/auth-store';
import AuthModal from './AuthModal';

export default function Header() {
  const { selectedCity, setCity } = useLocationStore();
  const { items, total } = useCartStore();
  const { user } = useAuthStore();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const { isListening, transcript, startListening, support } = useVoiceInput();

  useEffect(() => {
    if (transcript) {
        handleSearch(transcript);
    }
  }, [transcript]);

  const handleSearch = (query: string) => {
      setSearchQuery(query);
      if (query.trim().length > 1) {
          const allProducts = ProductService.getAllProducts();
          const filtered = allProducts.filter(p => 
              p.name.toLowerCase().includes(query.toLowerCase()) || 
              p.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
          ).slice(0, 5); // Limit to 5 results
          setSearchResults(filtered);
      } else {
          setSearchResults([]);
      }
  };

  return (
    <>
    <header className="w-full sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors">
      <div className="w-full px-4 py-2 md:py-0 md:h-16 flex flex-col md:flex-row items-center gap-3 md:gap-4">
        
        {/* Top Row Mobile: Logo, Location & Mobile Actions */}
        <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-2 md:gap-8">
            <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 dark:shadow-none group-hover:scale-105 transition-transform">
                Z
                </div>
                <span className="font-extrabold text-2xl tracking-tight text-gray-900 dark:text-gray-100 hidden md:block">
                Zest
                </span>
            </Link>
            <div className="flex items-center gap-1.5 cursor-pointer max-w-[140px] md:max-w-xs" onClick={() => setCity(null as any)}>
                <div className="text-left overflow-hidden">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-none mb-0.5">Delivering to</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate leading-none">
                    {selectedCity ? (selectedCity.displayName || selectedCity.name) : 'Select Location'}
                    </p>
                </div>
                <ChevronDown size={14} className="text-indigo-600 flex-shrink-0" />
            </div>
            </div>

            {/* Mobile Actions (Visible only on mobile) */}
            <div className="flex md:hidden items-center gap-3">
                <ThemeToggle />
                {user ? (
                    <Link href="/profile" className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-sm">
                        {user.name.charAt(0)}
                    </Link>
                ) : (
                    <button onClick={() => setShowAuthModal(true)} className="text-gray-700 dark:text-gray-300">
                        <User size={20} />
                    </button>
                )}
                 <button 
                    onClick={() => setIsCartOpen(true)}
                    className="relative text-gray-700 dark:text-gray-300"
                >
                    <ShoppingCart size={24} />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>
        </div>

        {/* Search Bar (Full width on mobile, Flex on desktop) */}
        <div className="w-full md:flex-1 max-w-2xl mx-auto relative z-40">
            <div className={`relative group transition-all duration-300 ${isListening ? 'ring-2 ring-indigo-500 scale-[1.02]' : ''}`}>
                <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={isListening ? "Listening..." : "Search for 'milk', 'chips', 'bread'..."}
                className="w-full bg-gray-100 dark:bg-gray-800 dark:text-gray-100 border-none rounded-xl py-2.5 pl-10 pr-12 text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all placeholder-gray-500 text-sm md:text-base"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                
                {support && (
                    <button 
                    onClick={startListening}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                        isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400'
                    }`}
                    >
                        <Mic size={18} />
                    </button>
                )}
                
                {/* Search Dropdown */}
                {searchResults.length > 0 ? (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                        {searchResults.map(product => (
                            <Link 
                            key={product.id}
                            href={`/product/${product.id}`}
                            className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 text-left transition-colors border-b border-gray-50 last:border-0"
                            onClick={() => {
                                setSearchQuery('');
                                setSearchResults([]);
                            }}
                            >
                                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <img src={product.image} className="w-8 h-8 object-contain mix-blend-multiply" alt={product.name} />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-gray-900">{product.name}</p>
                                    <p className="text-xs text-gray-500">{product.category}</p>
                                </div>
                            </Link>
                        ))}
                        <Link
                        href={`/search?q=${searchQuery}`}
                        className="block w-full p-3 text-center text-sm font-bold text-indigo-600 hover:bg-gray-50 border-t border-gray-100"
                        onClick={() => {
                                setSearchQuery('');
                                setSearchResults([]);
                        }}
                        >
                            See all results for "{searchQuery}"
                        </Link>
                    </div>
                ) : searchQuery.length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 text-center text-gray-500 text-sm">
                    No results found for "{searchQuery}"
                </div>
                )}
            </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4 md:gap-6">
            <ThemeToggle />
            <Link href="/wishlist" className="hidden md:flex text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors">
                <Heart size={24} />
            </Link>
            {user ? (
                <Link href="/profile" className="hidden md:flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors font-medium">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold">
                        {user.name.charAt(0)}
                    </div>
                    <span className="text-sm max-w-[100px] truncate">{user.name}</span>
                </Link>
            ) : (
                <button 
                    onClick={() => setShowAuthModal(true)}
                    className="hidden md:flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors font-medium"
                >
                    <User size={20} />
                    <span className="text-sm">Login</span>
                </button>
            )}
            
            <button 
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-md shadow-indigo-200"
            >
              <ShoppingCart size={18} />
              <div className="flex flex-col items-start leading-none">
                <span className="text-xs opacity-90">{cartCount > 0 ? `${cartCount} items` : 'My Cart'}</span>
                <span className="text-sm">₹{total}</span>
              </div>
            </button>
          </div>

      </div>
    </header>

    <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
