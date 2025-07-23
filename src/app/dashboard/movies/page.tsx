"use client";
import React, { useState } from 'react';

const MoviesPage = () => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const genres = [
    'Action', 'Comedy', 'Drama', 'Horror', 'Mythological', 'War',
    'Adventure', 'Family', 'Sport', 'Animation', 'Crime', 'Fantasy',
    'Musical', 'Romance', 'Thriller', 'History', 'Documentary', 'TV Show'
  ];

  const countries = [
    'United States', 'China', 'India', 'United Kingdom', 'Japan', 'South Korea',
    'France', 'Germany', 'Canada', 'Australia', 'Brazil', 'Mexico'
  ];

  const tabs = ['All', 'Recommended', 'New', 'Most watched'];

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const toggleCountry = (country: string) => {
    setSelectedCountries(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedCountries([]);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <span className="text-lg">←</span>
              </button>
              <h1 className="text-3xl font-bold text-gray-800">Movies</h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-lg">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Search for movies..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white/70 backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white/70 hover:bg-white text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex gap-6 p-6">
        {/* Filters Sidebar */}
        <div className="w-80 space-y-6">
          {/* Genre Filter */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-lg">Genre</h3>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="text-lg">▼</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 border ${
                    selectedGenres.includes(genre)
                      ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                      : 'bg-white/50 hover:bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Country Filter */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-lg">Country</h3>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="text-lg">▼</span>
              </button>
            </div>
            <div className="space-y-2">
              {countries.map((country) => (
                <button
                  key={country}
                  onClick={() => toggleCountry(country)}
                  className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-all duration-200 border ${
                    selectedCountries.includes(country)
                      ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                      : 'bg-white/50 hover:bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {(selectedGenres.length > 0 || selectedCountries.length > 0) && (
            <button
              onClick={clearFilters}
              className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Active Filters */}
          {(selectedGenres.length > 0 || selectedCountries.length > 0) && (
            <div className="mb-6 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
              <h4 className="text-sm font-medium text-gray-600 mb-3">Active Filters:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedGenres.map((genre) => (
                  <span
                    key={genre}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {genre}
                    <button
                      onClick={() => toggleGenre(genre)}
                      className="hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {selectedCountries.map((country) => (
                  <span
                    key={country}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {country}
                    <button
                      onClick={() => toggleCountry(country)}
                      className="hover:text-green-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/50">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-4xl">🎬</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No movies to show</h3>
            <p className="text-gray-500 mb-6">
              {selectedGenres.length > 0 || selectedCountries.length > 0
                ? "No movies match your current filters. Try adjusting your selection."
                : "Start exploring by selecting genres or countries from the filters."}
            </p>
            
            {/* Quick Actions */}
            <div className="flex justify-center gap-3">
              <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium">
                Browse All Movies
              </button>
              {(selectedGenres.length > 0 || selectedCountries.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Add Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group">
        <span className="text-2xl group-hover:scale-110 transition-transform">+</span>
      </button>
    </div>
  );
};

export default MoviesPage;