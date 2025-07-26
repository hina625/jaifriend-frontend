"use client";
import React, { useState } from 'react';
import { Filter, X, Search, ChevronDown, ArrowLeft, Plus } from 'lucide-react';

const MoviesPage = () => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    genre: true,
    country: true
  });

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

  const toggleSection = (section: 'genre' | 'country') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const activeFiltersCount = selectedGenres.length + selectedCountries.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm sticky top-0 z-30 border-b border-gray-200">
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Movies</h1>
            </div>
            
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden relative p-2 bg-white/70 hover:bg-white rounded-xl transition-colors border border-gray-200"
            >
              <Filter className="w-5 h-5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3 sm:mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for movies..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white/70 backdrop-blur-sm text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-2 rounded-full whitespace-nowrap transition-all duration-200 text-sm sm:text-base ${
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

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 xl:w-96">
          <div className="p-6 space-y-6 h-screen overflow-y-auto">
            {/* Genre Filter */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 text-lg">Genre</h3>
                <button
                  onClick={() => toggleSection('genre')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.genre ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {expandedSections.genre && (
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
              )}
            </div>

            {/* Country Filter */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 text-lg">Country</h3>
                <button
                  onClick={() => toggleSection('country')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.country ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {expandedSections.country && (
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
              )}
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Mobile Filter Overlay */}
        {showFilters && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowFilters(false)}>
            <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {activeFiltersCount > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-blue-600 font-medium">{activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active</span>
                  </div>
                )}
              </div>
              
              <div className="p-4 space-y-6 h-full overflow-y-auto pb-20">
                {/* Mobile Genre Filter */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">Genre</h3>
                    <button
                      onClick={() => toggleSection('genre')}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.genre ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  {expandedSections.genre && (
                    <div className="grid grid-cols-2 gap-2">
                      {genres.map((genre) => (
                        <button
                          key={genre}
                          onClick={() => toggleGenre(genre)}
                          className={`px-3 py-2 rounded-lg text-xs transition-all duration-200 border ${
                            selectedGenres.includes(genre)
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Country Filter */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">Country</h3>
                    <button
                      onClick={() => toggleSection('country')}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.country ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  {expandedSections.country && (
                    <div className="space-y-2">
                      {countries.map((country) => (
                        <button
                          key={country}
                          onClick={() => toggleCountry(country)}
                          className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-all duration-200 border ${
                            selectedCountries.includes(country)
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          {country}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Filter Actions */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t space-y-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium"
                  >
                    Clear All Filters
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6">
          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="mb-4 sm:mb-6 bg-white/70 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/50">
              <h4 className="text-sm font-medium text-gray-600 mb-2 sm:mb-3">Active Filters:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedGenres.map((genre) => (
                  <span
                    key={genre}
                    className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm"
                  >
                    {genre}
                    <button
                      onClick={() => toggleGenre(genre)}
                      className="hover:text-blue-600 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedCountries.map((country) => (
                  <span
                    key={country}
                    className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm"
                  >
                    {country}
                    <button
                      onClick={() => toggleCountry(country)}
                      className="hover:text-green-600 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-12 text-center border border-white/50">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-2xl sm:text-3xl lg:text-4xl">🎬</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No movies to show</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto">
              {activeFiltersCount > 0
                ? "No movies match your current filters. Try adjusting your selection."
                : "Start exploring by selecting genres or countries from the filters."}
            </p>
            
            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium text-sm sm:text-base">
                Browse All Movies
              </button>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors font-medium text-sm sm:text-base"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Add Button */}
      <button className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group z-20">
        <Plus className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};

export default MoviesPage;