"use client";
import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, Plus, Camera, Users, X, Upload, ArrowLeft, Menu, Search, Filter, Eye, Edit, Trash2, Star } from 'lucide-react';

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
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
        resetForm();
      } else {
        const data = await res.json();
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const resetForm = () => {
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

  const handleCancel = (): void => {
    setShowSellModal(false);
    resetForm();
  };

  // Product Card Component
  const ProductCard: React.FC<{ product: any }> = ({ product }) => (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all ${viewMode === 'list' ? 'flex items-center p-4 gap-4' : 'flex flex-col'}`}>
      {product.imageUrl && (
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className={`object-cover ${viewMode === 'list' ? 'w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex-shrink-0' : 'w-full h-32 sm:h-40'}`}
        />
      )}
      
      <div className={`${viewMode === 'list' ? 'flex-1 min-w-0' : 'p-3 sm:p-4'} flex flex-col`}>
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate mb-1">{product.name}</h3>
        <p className="text-gray-600 text-xs sm:text-sm mb-1">{product.category}</p>
        <p className="text-blue-600 font-bold text-sm sm:text-base mb-1">{product.currency} {product.price}</p>
        <p className="text-xs text-gray-400">{product.type}</p>
        
        {viewMode === 'list' && (
          <div className="flex items-center gap-2 mt-2">
            <button className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
              <Eye className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      {viewMode === 'grid' && (
        <div className="px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600">4.5</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // My Products Page
  const MyProductsPage: React.FC = () => (
    <div className="p-4 sm:p-6 lg:p-8">
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading products...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 min-h-64 flex items-center justify-center">{error}</div>
      ) : products.length === 0 ? (
        <div className="min-h-64 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 max-w-md">Start selling by adding your first product to the marketplace.</p>
          <button
            onClick={() => setShowSellModal(true)}
            className="bg-blue-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm sm:text-base"
          >
            Sell new product
          </button>
        </div>
      ) : (
        <div>
          {/* Products Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">My Products</h2>
              <p className="text-sm text-gray-600">{products.length} product{products.length !== 1 ? 's' : ''}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              
              {/* View Mode Toggle */}
              <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <Package className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <Menu className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6' 
            : 'space-y-3'
          }>
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Purchased Page
  const PurchasedPage: React.FC = () => (
    <div className="min-h-64 flex flex-col items-center justify-center p-6 sm:p-8 text-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
        <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No purchases yet</h3>
      <p className="text-gray-600 text-sm sm:text-base">Your purchased items will appear here.</p>
    </div>
  );

  // Market Page
  const MarketPage: React.FC = () => (
    <div className="min-h-64 flex flex-col items-center justify-center p-6 sm:p-8 text-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
        <Package className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Explore marketplace</h3>
      <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">Discover products from other sellers.</p>
      <button className="bg-blue-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm sm:text-base">
        Browse Products
      </button>
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
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My-Product</h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="sm:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileMenu(false)}>
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              {tabs.map((tab: Tab) => (
                <button
                  key={tab.name}
                  onClick={() => {
                    setActiveTab(tab.name);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeTab === tab.name
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs - Desktop */}
      <nav className="hidden sm:block bg-white border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab: Tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${
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
      <main className="bg-white">
        {renderContent()}
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowSellModal(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all flex items-center justify-center z-20 group"
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform" />
      </button>

      {/* Sell New Product Modal */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Sell new product</h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your product in detail"
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 10 characters</p>
              </div>

              {/* Price Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {currencies.map((currency: string) => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {types.map((type: string) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {categories.map((category: string) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Available</label>
                <input
                  type="number"
                  name="totalItemUnits"
                  value={formData.totalItemUnits}
                  onChange={handleInputChange}
                  placeholder="1"
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Photos</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="hidden" 
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    {imagePreview ? (
                      <div className="space-y-3">
                        <img src={imagePreview} alt="Preview" className="mx-auto h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-lg" />
                        <p className="text-sm text-blue-600">Click to change photo</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Click to upload photos</p>
                          <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50 sticky bottom-0">
              <button
                onClick={handleCancel}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm sm:text-base"
              >
                Publish Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Safe Area */}
      <div className="sm:hidden h-safe-area-inset-bottom"></div>
    </div>
  );
};

export default MarketplaceSeller;