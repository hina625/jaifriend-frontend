"use client";
import React, { useState } from 'react';
import { Plus, DollarSign, ArrowLeft, Upload, Search, Users } from 'lucide-react';

const FundingsPage = () => {
  const [activeTab, setActiveTab] = useState('My Funding Requests');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    amount: string;
    description: string;
    image: File | null;
  }>({
    title: '',
    amount: '',
    description: '',
    image: null
  });

  const tabs = ['My Funding Requests', 'Browse Funding'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateFunding = () => {
    setShowCreateForm(true);
  };

  const handleGoBack = () => {
    setShowCreateForm(false);
    setFormData({
      title: '',
      amount: '',
      description: '',
      image: null
    });
  };

  const handlePublish = () => {
    console.log('Publishing funding request:', formData);
    setShowCreateForm(false);
    setFormData({
      title: '',
      amount: '',
      description: '',
      image: null
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  // Empty State Component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
        <DollarSign className="w-8 h-8 text-purple-500" />
      </div>
      <p className="text-gray-600 text-center font-medium mb-6">
        No funding to show
      </p>
      <button
        onClick={handleCreateFunding}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
      >
        Create
      </button>
    </div>
  );

  // Create Form Component
  const CreateForm = () => (
    <div className="max-w-2xl mx-auto px-6 py-6">
      
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-lg font-medium text-gray-900">Create new funding request</h2>
      </div>

      {/* Form */}
      <div className="space-y-6">
        
        {/* Title Field */}
        <div>
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Amount Field */}
        <div>
          <input
            type="text"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-2">How much money you would like to receive?</p>
        </div>

        {/* Description Field */}
        <div>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Image Upload */}
        <div>
          <p className="text-sm text-gray-600 mb-3">Select an image</p>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <button
                type="button"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Browse To Upload
              </button>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 pt-6 border-t">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
          <button
            onClick={handlePublish}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-md font-medium transition-colors"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Fundings</h1>
        </div>
        
        {/* Create Form */}
        <CreateForm />

        {/* Right Sidebar Icons */}
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-3 z-40">
          <button className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-shadow">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <button className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-shadow">
            <Users className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Floating Action Button */}
        <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-50">
          <Plus className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-6">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Fundings</h1>
          
          {/* Tab Navigation */}
          <div className="flex gap-1 bg-white rounded-lg p-1 inline-flex">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm border min-h-96">
          {activeTab === 'My Funding Requests' && <EmptyState />}
          {activeTab === 'Browse Funding' && <EmptyState />}
        </div>

      </div>

      {/* Right Sidebar Icons */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-3 z-40">
        <button className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-shadow">
          <Search className="w-5 h-5 text-gray-600" />
        </button>
        <button className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-shadow">
          <Users className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Bottom Right Sidebar Icon */}
      <div className="fixed right-4 bottom-20 z-40">
        <button className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-shadow">
          <Users className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={handleCreateFunding}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-50"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default FundingsPage;