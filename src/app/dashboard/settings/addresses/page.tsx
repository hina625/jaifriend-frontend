"use client";
import React, { useState, useEffect } from 'react';
import { Address, AddressFormData, getAddressesApi, addAddressApi, deleteAddressApi, setDefaultAddressApi } from '@/utils/api';
import Popup, { PopupState } from '@/components/Popup';

const MyAddressesPage = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [formData, setFormData] = useState<AddressFormData>({
    name: 'Hina Sadaf -BSCS-2nd-029',
    phone: '',
    country: '',
    city: '',
    zipCode: '',
    address: '',
    type: 'home'
  });

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    const token = getToken();
    if (!token) {
      showPopup('error', 'Authentication Error', 'Please log in to view your addresses.');
      return;
    }

    try {
      setLoading(true);
      const response = await getAddressesApi(token);
      setAddresses(response.addresses || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
      showPopup('error', 'Error', 'Failed to load addresses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showPopup = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    setPopup({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closePopup = () => {
    setPopup(prev => ({ ...prev, isOpen: false }));
  };

  const handleInputChange = (field: keyof AddressFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddAddress = async () => {
    if (!formData.name.trim()) {
      showPopup('error', 'Validation Error', 'Please enter a name');
      return;
    }

    if (!formData.country.trim()) {
      showPopup('error', 'Validation Error', 'Please enter a country');
      return;
    }

    if (!formData.city.trim()) {
      showPopup('error', 'Validation Error', 'Please enter a city');
      return;
    }

    if (!formData.zipCode.trim()) {
      showPopup('error', 'Validation Error', 'Please enter a zip code');
      return;
    }

    if (!formData.address.trim()) {
      showPopup('error', 'Validation Error', 'Please enter an address');
      return;
    }

    const token = getToken();
    if (!token) {
      showPopup('error', 'Authentication Error', 'Please log in to add addresses.');
      return;
    }

    setLoading(true);
    try {
      const response = await addAddressApi(token, formData);
      setAddresses(response.addresses);
      
      // Reset form
      setFormData({
        name: 'Hina Sadaf -BSCS-2nd-029',
        phone: '',
        country: '',
        city: '',
        zipCode: '',
        address: '',
        type: 'home'
      });
      
      setShowModal(false);
      showPopup('success', 'Success', 'Address added successfully!');
    } catch (error: any) {
      console.error('Error adding address:', error);
      const errorMessage = error.response?.data?.error || 'Failed to add address. Please try again.';
      showPopup('error', 'Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    // Reset form to default values
    setFormData({
      name: 'Hina Sadaf -BSCS-2nd-029',
      phone: '',
      country: '',
      city: '',
      zipCode: '',
      address: '',
      type: 'home'
    });
  };

  const handleDeleteAddress = async (addressId: string) => {
    const token = getToken();
    if (!token) {
      showPopup('error', 'Authentication Error', 'Please log in to delete addresses.');
      return;
    }

    try {
      const response = await deleteAddressApi(token, addressId);
      setAddresses(response.addresses);
      showPopup('success', 'Success', 'Address deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting address:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete address. Please try again.';
      showPopup('error', 'Error', errorMessage);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    const token = getToken();
    if (!token) {
      showPopup('error', 'Authentication Error', 'Please log in to set default address.');
      return;
    }

    try {
      const response = await setDefaultAddressApi(token, addressId);
      setAddresses(response.addresses);
      showPopup('success', 'Success', 'Default address updated successfully!');
    } catch (error: any) {
      console.error('Error setting default address:', error);
      const errorMessage = error.response?.data?.error || 'Failed to set default address. Please try again.';
      showPopup('error', 'Error', errorMessage);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">My Addresses</h1>
        
        {loading && addresses.length === 0 && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Addresses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add New Address Card */}
          <div 
            onClick={() => setShowModal(true)}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors min-h-[200px]"
          >
            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-gray-700 font-medium">Add New</span>
          </div>

          {/* Existing Addresses */}
          {addresses.map((address) => (
            <div key={address.id} className="border border-gray-200 rounded-lg p-6 relative group hover:shadow-md transition-shadow">
              {address.isDefault && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Default
                </div>
              )}
              
              <button
                onClick={() => handleDeleteAddress(address.id)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:bg-red-600"
              >
                ×
              </button>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 text-sm">{address.name}</h3>
                {address.phone && <p className="text-sm text-gray-600">📞 {address.phone}</p>}
                {address.address && <p className="text-sm text-gray-600">📍 {address.address}</p>}
                {address.city && <p className="text-sm text-gray-600">🏙️ {address.city}</p>}
                {address.country && <p className="text-sm text-gray-600">🌍 {address.country}</p>}
                {address.zipCode && <p className="text-sm text-gray-600">📮 {address.zipCode}</p>}
                {address.type && <p className="text-sm text-gray-600">🏠 {address.type}</p>}
              </div>
              
              {!address.isDefault && (
                <button
                  onClick={() => handleSetDefault(address.id)}
                  className="mt-3 w-full text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded transition-colors"
                >
                  Set as Default
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Address Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Address</h2>
              
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Phone and Country */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>

                {/* City and Zip Code */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>

                {/* Address Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-vertical"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAddress}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup */}
      <Popup popup={popup} onClose={closePopup} />
    </div>
  );
};

export default MyAddressesPage;