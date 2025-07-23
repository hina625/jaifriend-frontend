"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, MapPin, ChevronDown, ShoppingCart, Heart, Plus, Users, X } from 'lucide-react';
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  imageUrl?: string;
  quantity?: number; // Added quantity for cart
}

const MarketplacePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('Other');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [cartOpen, setCartOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load products');
        setLoading(false);
      });
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const featuredProducts = products.slice(0, 3);

  const categories: string[] = [
    'Other',
    'Autos & Vehicles', 
    "Baby & Children's Products",
    'Beauty Products & Services',
    'Computers & Peripherals',
    'Consumer Electronics'
  ];

  const nextSlide = (): void => {
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  };

  const prevSlide = (): void => {
    setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
    const target = e.target as HTMLImageElement;
    const fallbackDiv = target.nextSibling as HTMLElement;
    if (target && fallbackDiv) {
      target.style.display = 'none';
      fallbackDiv.style.display = 'flex';
    }
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    setCart(prev => {
      // If already in cart, increase quantity
      const idx = prev.findIndex(item => item.id === product.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: (updated[idx].quantity || 1) + 1 };
        return updated;
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Market</h1>
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for products"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <button className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Users className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Featured Products Carousel */}
      <section className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative">
            <div className="flex items-center overflow-hidden">
              <button
                onClick={prevSlide}
                className="absolute left-4 z-10 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex transition-transform duration-300 ease-in-out w-full">
                {featuredProducts.map((product: Product, index: number) => (
                  <div
                    key={product.id}
                    className={`flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-2 ${index === currentSlide ? 'block' : 'hidden md:block'}`}
                  >
                    <div className="bg-gray-100 rounded-lg overflow-hidden h-64 flex flex-col">
                      <div className="flex-1 p-4">
                        <img 
                          src={product.imageUrl || product.image} 
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={handleImageError}
                        />
                        <div className="w-full h-32 bg-gray-300 rounded-lg hidden items-center justify-center">
                          <span className="text-gray-500 text-sm">Image</span>
                        </div>
                      </div>
                      <div className="p-4 pt-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                        <p className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={nextSlide}
                className="absolute right-4 z-10 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Nearby Shops Banner */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg p-6 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">Nearby Shops</h2>
            <p className="text-white opacity-90 mb-4">
              Find shops near to you based on your location and connect with them directly.
            </p>
            <button className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Explore
            </button>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Users className="w-16 h-16 text-white opacity-70" />
            </div>
          </div>
        </div>
      </section>
      {/* Category Tabs */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {categories.map((category: string) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  selectedCategory === category
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-blue-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>
      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {/* Products Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-blue-600 font-medium">
              <MapPin className="w-4 h-4" />
              Location
            </button>
            <button className="flex items-center gap-2 text-gray-600 font-medium">
              Sort by Latest
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Products Grid */}
        {loading ? (
          <div className="text-center text-gray-500">Loading products...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {products.map((product: Product) => (
              <Link key={product.id} href={`/dashboard/market/checkout/${product.id}`} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow block">
                <div className="aspect-w-4 aspect-h-3 bg-gray-100 rounded-t-lg overflow-hidden">
                  <img 
                    src={product.imageUrl || product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                    onError={handleImageError}
                  />
                  <div className="w-full h-48 bg-gray-300 hidden items-center justify-center">
                    <span className="text-gray-500 text-sm">Image</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-medium text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-lg font-bold text-gray-900 mb-3">${product.price.toFixed(2)}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center" onClick={e => handleAddToCart(product, e)}>
                      <ShoppingCart className="w-4 h-4 mr-1" />
                    </button>
                    <button className="bg-green-500 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center" onClick={e => e.preventDefault()}>
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {/* Load More */}
        <div className="text-center">
          <button className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors">
            <ChevronDown className="w-4 h-4" />
            Load more products
          </button>
        </div>
      </section>
      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center">
        <Plus className="w-6 h-6" />
      </button>
      {/* Floating Cart Button */}
      <button
        className="fixed bottom-24 right-6 w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors flex items-center justify-center z-50"
        onClick={() => router.push('/dashboard/market/checkout')}
      >
        <ShoppingCart className="w-6 h-6" />
        {cart.length > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{cart.length}</span>
        )}
      </button>
    </div>
  );
};

export default MarketplacePage;