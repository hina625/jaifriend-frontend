"use client";
import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, Plus, Camera, Users, X, Upload } from 'lucide-react';

interface Tab {
  name: string;
  active: boolean;
}

interface FormData {
  name: string;
  description: string;
  currency: string;
  price: string;
  type: string;
  location: string;
  category: string;
  totalItemUnits: string;
  photos: File[];
}

const MarketplaceSeller: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('My Products');
  const [showSellModal, setShowSellModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    currency: 'USD ($)',
    price: '',
    type: 'New',
    location: '',
    category: 'Autos & Vehicles',
    totalItemUnits: '',
    photos: []
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'My Products') {
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
    }
  }, [activeTab, showSellModal]);

  const tabs: Tab[] = [
    { name: 'My Products', active: true },
    { name: 'Purchased', active: false },
    { name: 'Market', active: false }
  ];

  const currencies: string[] = ['USD ($)', 'EUR (€)', 'GBP (£)', 'CAD ($)', 'AUD ($)'];
  const types: string[] = ['New', 'Used', 'Refurbished'];
  const categories: string[] = [
    'Autos & Vehicles',
    'Baby & Children\'s Products', 
    'Beauty Products & Services',
    'Computers & Peripherals',
    'Consumer Electronics',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, photos: [file] }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('currency', formData.currency);
      form.append('price', formData.price);
      form.append('type', formData.type);
      form.append('location', formData.location);
      form.append('category', formData.category);
      form.append('totalItemUnits', formData.totalItemUnits);
      if (formData.photos[0]) form.append('image', formData.photos[0]);
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        body: form
      });
      if (res.ok) {
        alert('Product created successfully!');
        setShowSellModal(false);
        setFormData({
          name: '',
          description: '',
          currency: 'USD ($)',
          price: '',
          type: 'New',
          location: '',
          category: 'Autos & Vehicles',
          totalItemUnits: '',
          photos: []
        });
        setImagePreview(null);
        // Optionally, trigger a refresh of the market page here
      } else {
        const data = await res.json();
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleCancel = (): void => {
    setShowSellModal(false);
    // Reset form
    setFormData({
      name: '',
      description: '',
      currency: 'USD ($)',
      price: '',
      type: 'New',
      location: '',
      category: 'Autos & Vehicles',
      totalItemUnits: '',
      photos: []
    });
    setImagePreview(null);
  };

  // My Products Page
  const MyProductsPage: React.FC = () => (
    <div className="min-h-96 flex flex-col items-center justify-center p-8 w-full">
      {loading ? (
        <div className="text-gray-500">Loading products...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : products.length === 0 ? (
        <>
          <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-600 font-medium mb-6">No available products to show.</p>
          <button
            onClick={() => setShowSellModal(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Sell new product
          </button>
        </>
      ) : (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product._id} className="bg-white rounded-lg shadow border p-4 flex flex-col items-center">
              {product.imageUrl && (
                <img src={product.imageUrl} alt={product.name} className="h-24 w-24 object-cover rounded mb-2" />
              )}
              <h3 className="font-semibold text-gray-900 mb-1 text-center">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-1 text-center">{product.category}</p>
              <p className="text-blue-600 font-bold mb-1">{product.currency} {product.price}</p>
              <p className="text-xs text-gray-400 text-center">{product.type}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Purchased Page
  const PurchasedPage: React.FC = () => (
    <div className="min-h-96 flex flex-col items-center justify-center p-8">
      <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mb-4">
        <ShoppingCart className="w-8 h-8 text-red-500" />
      </div>
      <p className="text-gray-600 font-medium">No purchased items found</p>
    </div>
  );

  // Market Page (placeholder)
  const MarketPage: React.FC = () => (
    <div className="min-h-96 flex flex-col items-center justify-center p-8">
      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
        <Package className="w-8 h-8 text-blue-500" />
      </div>
      <p className="text-gray-600 font-medium">Explore marketplace products</p>
    </div>
  );

  const renderContent = (): React.ReactElement => {
    switch (activeTab) {
      case 'My Products':
        return <MyProductsPage />;
      case 'Purchased':
        return <PurchasedPage />;
      case 'Market':
        return <MarketPage />;
      default:
        return <MyProductsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">My-Product</h1>
            
            <div className="flex gap-3">
              <button className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Camera className="w-5 h-5 text-gray-600" />
              </button>
              <button className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Users className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map((tab: Tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.name
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-blue-600'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border">
          {renderContent()}
        </div>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowSellModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Sell New Product Modal */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Sell new product</h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Name"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description"
                  rows={4}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Please describe your product.</p>
              </div>

              {/* Currency, Price, Type */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {currencies.map((currency: string) => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Price"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {types.map((type: string) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location and Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Location"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {categories.map((category: string) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Total Item Units */}
              <div>
                <input
                  type="number"
                  name="totalItemUnits"
                  value={formData.totalItemUnits}
                  onChange={handleInputChange}
                  placeholder="Total Item Units"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Photos</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-24 object-cover rounded mb-2" />
                  )}
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload photos</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={handleCancel}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceSeller;