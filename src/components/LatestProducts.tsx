'use client';
import React, { useState, useEffect } from 'react';
import { Package, Eye } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  category: string;
  type: string;
  sellerName: string;
  createdAt: string;
}

const LatestProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const fetchLatestProducts = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-bacnd-production.up.railway.app'}/api/products/latest`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Latest products fetched:', data.length);
        setProducts(data);
        setLoading(false);
    } catch (error) {
        console.error('Error fetching latest products:', error);
        setError('Failed to load latest products');
      setLoading(false);
    }
  };

    fetchLatestProducts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-sm text-gray-700">Latest Products</h3>
        </div>
        <div className="text-center py-4">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-sm text-gray-700">Latest Products</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-xs text-gray-500">{error}</p>
              </div>
            </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-sm text-gray-700">Latest Products</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-xs text-gray-500">No products available</p>
          </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-gray-600" />
        <h3 className="font-semibold text-sm text-gray-700">Latest Products</h3>
      </div>
      
      <div className="space-y-2">
        {products.map((product) => (
          <div key={product._id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-3">
              {product.image && (
                <img 
                  src={product.image} 
              alt={product.name}
                  className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                />
              )}
              
          <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 truncate mb-1">
              {product.name}
            </h4>
                <p className="text-xs text-gray-600 mb-1">
                  {product.category} • {product.type}
                </p>
                <p className="text-sm font-semibold text-blue-600 mb-1">
                  {product.currency} {product.price}
                </p>
                <p className="text-xs text-gray-500">
                  by {product.sellerName}
                </p>
              </div>
              
              <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                <Eye className="w-3 h-3" />
              </button>
          </div>
        </div>
      ))}
        </div>
      
      {products.length > 0 && (
        <div className="text-center pt-2">
          <a 
            href="/dashboard/products" 
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            View all products →
          </a>
        </div>
      )}
    </div>
  );
};

export default LatestProducts; 