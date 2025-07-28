'use client';
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Eye, Heart } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl?: string;
  category: string;
  type: string;
  location: string;
  totalItemUnits: number;
  createdAt: string;
}

const LatestProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestProducts();
  }, []);

  const fetchLatestProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (response.ok) {
        const data = await response.json();
        // Get latest 4 products for sidebar
        setProducts(data.slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'INR') {
      return `₹${price.toLocaleString('en-IN')}`;
    } else if (currency === 'USD') {
      return `$${price.toFixed(2)}`;
    }
    return `${currency} ${price}`;
  };

  const getDefaultImage = (index: number) => {
    const defaultImages = [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=150&fit=crop', // Kitchen equipment
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=150&fit=crop', // Supplements
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=150&fit=crop', // Health products
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=150&fit=crop'  // Medical
    ];
    return defaultImages[index % defaultImages.length];
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="animate-pulse">
            <div className="flex gap-3">
              <div className="bg-gray-200 w-16 h-16 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="bg-gray-200 h-3 rounded w-3/4"></div>
                <div className="bg-gray-200 h-3 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product, index) => (
        <div key={product._id} className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <img
              src={product.imageUrl || getDefaultImage(index)}
              alt={product.name}
              className="w-16 h-16 rounded-lg object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getDefaultImage(index);
              }}
            />
          </div>
          
          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-gray-900 truncate">
              {product.name}
            </h4>
            <p className="text-sm font-bold text-blue-600">
              {formatPrice(product.price, product.currency)}
            </p>
            <div className="flex gap-1 mt-1">
              <button className="p-1 text-gray-400 hover:text-blue-500 transition-colors">
                <ShoppingCart className="w-3 h-3" />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <Eye className="w-3 h-3" />
              </button>
              <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                <Heart className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {products.length === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">No products available</p>
        </div>
      )}
      
      {products.length > 0 && (
        <button 
          onClick={fetchLatestProducts}
          className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
        >
          See all products
        </button>
      )}
    </div>
  );
};

export default LatestProducts; 