"use client";
import React, { useState } from 'react';
import { MapPin, Grid3X3, Search, Briefcase, Plus } from 'lucide-react';

const JobsPage = () => {
  const [selectedJobType, setSelectedJobType] = useState('Part time');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');

  const jobTypes = [
    'Full time',
    'Part time', 
    'Internship',
    'Volunteer',
    'Contract'
  ];

  const handleExploreNearby = () => {
    console.log('Exploring nearby businesses...');
  };

  const handleSearch = () => {
    console.log('Searching jobs...', { searchQuery, location, category, selectedJobType });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-6">
        
        {/* Nearby Business Banner */}
        <div className="bg-gradient-to-r from-green-200 to-green-300 rounded-lg p-6 mb-8 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Nearby Business
              </h2>
              <p className="text-gray-700 mb-4 max-w-md">
                Find businesses near to you based on your location and connect with them directly.
              </p>
              <button 
                onClick={handleExploreNearby}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Explore
              </button>
            </div>
            
            {/* Business Illustration */}
            <div className="hidden md:block">
              <div className="w-32 h-24 relative">
                {/* Simple business people illustration */}
                <div className="absolute right-0 top-0">
                  <svg width="120" height="90" viewBox="0 0 120 90" className="text-gray-600">
                    {/* Person 1 */}
                    <circle cx="20" cy="25" r="8" fill="currentColor" opacity="0.7"/>
                    <rect x="15" y="35" width="10" height="20" fill="currentColor" opacity="0.7"/>
                    
                    {/* Person 2 */}
                    <circle cx="45" cy="20" r="8" fill="currentColor" opacity="0.8"/>
                    <rect x="40" y="30" width="10" height="25" fill="currentColor" opacity="0.8"/>
                    
                    {/* Person 3 */}
                    <circle cx="70" cy="25" r="8" fill="currentColor" opacity="0.7"/>
                    <rect x="65" y="35" width="10" height="20" fill="currentColor" opacity="0.7"/>
                    
                    {/* Desk/Table */}
                    <rect x="10" y="55" width="70" height="4" fill="currentColor" opacity="0.6"/>
                    <rect x="12" y="59" width="8" height="15" fill="currentColor" opacity="0.5"/>
                    <rect x="70" y="59" width="8" height="15" fill="currentColor" opacity="0.5"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          
          {/* Header */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-semibold text-gray-900 text-center mb-6">Jobs</h1>
            
            {/* Search Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              
              {/* Location Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-blue-500" />
                </div>
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-600"
                />
              </div>

              {/* Categories Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Grid3X3 className="h-4 w-4 text-blue-500" />
                </div>
                <input
                  type="text"
                  placeholder="Categories"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-600"
                />
              </div>

              {/* Search Jobs */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for jobs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Job Type Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {jobTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedJobType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedJobType === type
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-gray-600 text-center font-medium">
              No available jobs to show.
            </p>
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

export default JobsPage;