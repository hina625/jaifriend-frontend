"use client";
import React, { useState } from 'react';
import { Search, Users, MessageSquare, FileText, Reply, Plus, Camera, Menu, X, ChevronDown } from 'lucide-react';

interface Tab {
  name: string;
  active: boolean;
}

interface User {
  name: string;
  joined: string;
  posts: number;
  avatar: string;
}

interface SearchForm {
  searchTerm: string;
  searchType: string;
  searchIn: string;
  searchSection: string;
}

const ForumPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('My Threads');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showAlphabet, setShowAlphabet] = useState<boolean>(false);
  const [searchForm, setSearchForm] = useState<SearchForm>({
    searchTerm: '',
    searchType: 'Search subject only',
    searchIn: 'Search in threads',
    searchSection: ''
  });

  const tabs: Tab[] = [
    { name: 'Browse Forum', active: false },
    { name: 'Members', active: false },
    { name: 'Search', active: false },
    { name: 'My Threads', active: true },
    { name: 'My Replies', active: false }
  ];

  const alphabet: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  const users: User[] = [
    { name: 'shieldadugan751', joined: '14 m', posts: 0, avatar: '👤' },
    { name: 'yzqzachary365', joined: '1 h', posts: 0, avatar: '👤' },
    { name: 'lillohervey00', joined: '1 h', posts: 0, avatar: '👤' },
    { name: 'wallacenhendon0', joined: '2 hrs', posts: 0, avatar: '👤' },
    { name: 'marygueale8909', joined: '3 hrs', posts: 0, avatar: '👤' },
    { name: 'carson09t9487', joined: '4 hrs', posts: 0, avatar: '👤' },
    { name: 'hubertschur25', joined: '4 hrs', posts: 0, avatar: '👤' },
    { name: 'harsylvia66021', joined: '5 hrs', posts: 0, avatar: '👤' },
    { name: 'Edward Jacob', joined: '5 hrs', posts: 0, avatar: '🏴' },
    { name: 'hashimumer', joined: '6 hrs', posts: 0, avatar: '👤' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setSearchForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (): void => {
    console.log('Search submitted:', searchForm);
  };

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    setMobileMenuOpen(false);
  };

  // Browse Forum Page
  const BrowseForumPage: React.FC = () => (
    <div className="bg-white rounded-lg border min-h-64 sm:min-h-96 flex flex-col items-center justify-center p-6 sm:p-8">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
        <Users className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
      </div>
      <p className="text-gray-600 font-medium text-sm sm:text-base">No forums to show</p>
    </div>
  );

  // Members Page
  const MembersPage: React.FC = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg border p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <span className="font-medium text-gray-900 text-sm sm:text-base">List of users</span>
        </div>

        {/* Alphabet Filter - Mobile Toggle */}
        <div className="sm:hidden mb-4">
          <button
            onClick={() => setShowAlphabet(!showAlphabet)}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors"
          >
            Filter by letter
            <ChevronDown className={`w-4 h-4 transition-transform ${showAlphabet ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Alphabet Filter */}
        <div className={`flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6 ${showAlphabet ? 'block' : 'hidden sm:flex'}`}>
          {alphabet.map((letter: string) => (
            <button
              key={letter}
              className="w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 rounded flex items-center justify-center transition-colors"
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Table Header - Hidden on mobile, replaced with cards */}
        <div className="hidden sm:grid grid-cols-3 gap-4 pb-3 mb-4 border-b text-sm font-medium text-gray-600 uppercase tracking-wide">
          <div>NAME</div>
          <div>JOINED</div>
          <div>POSTS</div>
        </div>

        {/* Users List */}
        <div className="space-y-2 sm:space-y-3">
          {users.map((user: User, index: number) => (
            <div key={index} className="sm:grid sm:grid-cols-3 sm:gap-4 py-3 border-b border-gray-100 last:border-b-0">
              {/* Mobile Card Layout */}
              <div className="sm:hidden bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    {user.avatar === '🏴' ? '🏴' : '👤'}
                  </div>
                  <span className="text-blue-600 font-medium text-sm truncate">{user.name}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Joined: <span className="text-blue-600">{user.joined}</span></span>
                  <span>Posts: <span className="text-orange-600 font-medium">{user.posts}</span></span>
                </div>
              </div>

              {/* Desktop Grid Layout */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm">
                  {user.avatar === '🏴' ? '🏴' : '👤'}
                </div>
                <span className="text-blue-600 font-medium">{user.name}</span>
              </div>
              <div className="hidden sm:block text-blue-600 text-sm">{user.joined}</div>
              <div className="hidden sm:block text-orange-600 font-medium">{user.posts}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Search Page
  const SearchPage: React.FC = () => (
    <div className="bg-white rounded-lg border p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <Search className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </div>
        <span className="font-medium text-gray-900 text-sm sm:text-base">Search</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Search Term */}
        <div className="lg:col-span-1">
          <textarea
            name="searchTerm"
            value={searchForm.searchTerm}
            onChange={handleInputChange}
            placeholder="Search for term"
            className="w-full h-24 sm:h-32 p-3 sm:p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Type in one or more search terms, each must be at least 4 characters
          </p>
        </div>

        {/* Search Options */}
        <div className="lg:col-span-1 space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm text-gray-600 mb-2">Search type</label>
            <select
              name="searchType"
              value={searchForm.searchType}
              onChange={handleInputChange}
              className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option>Search subject only</option>
              <option>Search message content</option>
              <option>Search both</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm text-gray-600 mb-2">Search in</label>
            <select
              name="searchIn"
              value={searchForm.searchIn}
              onChange={handleInputChange}
              className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option>Search in threads</option>
              <option>Search in replies</option>
              <option>Search everywhere</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm text-gray-600 mb-2">Search section</label>
            <select
              name="searchSection"
              value={searchForm.searchSection}
              onChange={handleInputChange}
              className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="">Select section...</option>
              <option>General Discussion</option>
              <option>Help & Support</option>
              <option>Announcements</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-6">
        <button
          onClick={handleSearch}
          className="w-full sm:w-auto bg-blue-500 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm sm:text-base"
        >
          Search
        </button>
      </div>
    </div>
  );

  // My Threads Page
  const MyThreadsPage: React.FC = () => (
    <div className="bg-white rounded-lg border min-h-64 sm:min-h-96 flex flex-col items-center justify-center p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </div>
        <span className="font-medium text-gray-900 text-sm sm:text-base">My Threads</span>
      </div>
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
      </div>
      <p className="text-gray-600 font-medium text-sm sm:text-base">No threads to show</p>
    </div>
  );

  // My Replies Page
  const MyRepliesPage: React.FC = () => (
    <div className="bg-white rounded-lg border min-h-64 sm:min-h-96 flex flex-col items-center justify-center p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <Reply className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </div>
        <span className="font-medium text-gray-900 text-sm sm:text-base">My Replies</span>
      </div>
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
        <Reply className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
      </div>
      <p className="text-gray-600 font-medium text-sm sm:text-base">No replies to show</p>
    </div>
  );

  const renderContent = (): React.ReactElement => {
    switch (activeTab) {
      case 'Browse Forum':
        return <BrowseForumPage />;
      case 'Members':
        return <MembersPage />;
      case 'Search':
        return <SearchPage />;
      case 'My Threads':
        return <MyThreadsPage />;
      case 'My Replies':
        return <MyRepliesPage />;
      default:
        return <MyThreadsPage />;
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto scrollbar-hide">
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Forum</h1>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              <button className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-4 h-4 text-gray-600" /> : <Menu className="w-4 h-4 text-gray-600" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Desktop */}
      <nav className="hidden sm:block bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map((tab: Tab) => (
              <button
                key={tab.name}
                onClick={() => handleTabChange(tab.name)}
                className={`flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 sm:hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-800">Navigation</h3>
            </div>
            <div className="py-2">
              {tabs.map((tab: Tab) => (
                <button
                  key={tab.name}
                  onClick={() => handleTabChange(tab.name)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    activeTab === tab.name
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Mobile Tab Indicator */}
      <div className="sm:hidden bg-white border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">{activeTab}</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {renderContent()}
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-30">
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};

export default ForumPage;
