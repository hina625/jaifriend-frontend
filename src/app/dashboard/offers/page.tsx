"use client";
import React from 'react';
import { Plus, Tag, Search, Users } from 'lucide-react';

const OffersPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 relative">
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Offers</h1>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center min-h-96 py-16">
          <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <Tag className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-gray-600 text-center font-medium">
            No available offers to show.
          </p>
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

      {/* Bottom Right Sidebar Icons */}
      <div className="fixed right-4 bottom-20 flex flex-col gap-3 z-40">
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
};

export default OffersPage;