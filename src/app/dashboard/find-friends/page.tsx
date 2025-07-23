"use client";
import React, { useState } from 'react';
import { Plus, Search, Users, Settings } from 'lucide-react';

const FindFriendsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mapZoom, setMapZoom] = useState(4);

  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 10));
  };

  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 1));
  };

  const handleSearch = () => {
    console.log('Searching for users:', searchQuery);
  };

  return (
    <div className="h-screen bg-gray-100 flex">
      
      {/* Map Section */}
      <div className="flex-1 relative">
        
        {/* Interactive World Map */}
        <div className="h-full bg-gradient-to-br from-blue-300 to-blue-500 relative overflow-hidden">
          {/* Map Background with simplified continents */}
          <svg 
            className="w-full h-full absolute inset-0" 
            viewBox="0 0 1000 500" 
            style={{ transform: `scale(${1 + mapZoom * 0.1})` }}
          >
            {/* Simple light blue ocean background */}
            <rect width="1000" height="500" fill="#87CEEB" />
            
            {/* North America */}
            <path 
              d="M 50 80 L 120 60 L 180 65 L 230 80 L 280 100 L 320 130 L 340 160 L 330 190 L 310 210 L 280 230 L 240 240 L 200 245 L 160 248 L 120 245 L 90 230 L 70 210 L 50 190 L 40 160 L 45 130 L 50 100 Z" 
              fill="#E5E7EB" 
              className="hover:fill-gray-300 cursor-pointer transition-colors"
            />
            
            {/* South America */}
            <path 
              d="M 220 280 L 270 285 L 290 295 L 300 310 L 310 340 L 315 370 L 310 400 L 300 430 L 285 450 L 270 460 L 250 465 L 230 460 L 215 450 L 205 430 L 200 400 L 205 370 L 210 340 L 215 310 Z" 
              fill="#E5E7EB" 
              className="hover:fill-gray-300 cursor-pointer transition-colors"
            />
            
            {/* Europe */}
            <path 
              d="M 450 90 L 480 85 L 520 90 L 540 100 L 550 120 L 545 140 L 535 155 L 520 160 L 500 165 L 480 160 L 465 150 L 455 135 L 450 120 L 450 105 Z" 
              fill="#E5E7EB" 
              className="hover:fill-gray-300 cursor-pointer transition-colors"
            />
            
            {/* Africa */}
            <path 
              d="M 480 165 L 520 160 L 550 170 L 570 190 L 580 220 L 575 250 L 570 280 L 565 310 L 555 340 L 540 360 L 520 375 L 495 380 L 470 375 L 450 360 L 440 340 L 445 310 L 450 280 L 455 250 L 465 220 L 475 190 Z" 
              fill="#E5E7EB" 
              className="hover:fill-gray-300 cursor-pointer transition-colors"
            />
            
            {/* Asia */}
            <path 
              d="M 550 90 L 600 85 L 650 90 L 700 95 L 750 100 L 800 110 L 830 130 L 840 160 L 835 190 L 820 210 L 800 220 L 770 225 L 740 220 L 710 210 L 680 200 L 650 190 L 620 180 L 590 170 L 570 150 L 555 130 L 550 110 Z" 
              fill="#E5E7EB" 
              className="hover:fill-gray-300 cursor-pointer transition-colors"
            />
            
            {/* Australia */}
            <path 
              d="M 720 330 L 780 325 L 820 335 L 840 350 L 845 365 L 840 380 L 825 390 L 800 395 L 770 390 L 745 385 L 725 375 L 715 360 L 715 345 Z" 
              fill="#E5E7EB" 
              className="hover:fill-gray-300 cursor-pointer transition-colors"
            />
            
            {/* Simple white clouds */}
            <ellipse cx="150" cy="130" rx="25" ry="10" fill="white" opacity="0.8" />
            <ellipse cx="170" cy="125" rx="20" ry="8" fill="white" opacity="0.8" />
            <ellipse cx="185" cy="130" rx="15" ry="6" fill="white" opacity="0.8" />
            
            <ellipse cx="650" cy="160" rx="30" ry="12" fill="white" opacity="0.7" />
            <ellipse cx="675" cy="155" rx="25" ry="10" fill="white" opacity="0.7" />
            <ellipse cx="695" cy="160" rx="20" ry="8" fill="white" opacity="0.7" />
          </svg>
          
          {/* Map Controls */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <button 
              onClick={handleZoomIn}
              className="w-10 h-10 bg-white rounded-md shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
            >
              <span className="text-gray-700 font-bold text-lg">+</span>
            </button>
            <button 
              onClick={handleZoomOut}
              className="w-10 h-10 bg-white rounded-md shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
            >
              <span className="text-gray-700 font-bold text-lg">−</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-[1000px] bg-white shadow-lg flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Find friends</h1>
          
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search for users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
            <button 
              onClick={handleSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {/* Empty State */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-gray-600 font-medium">No users to show</p>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-50">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default FindFriendsPage;
