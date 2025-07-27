"use client";
import React, { useState } from 'react';
import { Search, ChevronDown, Users, FileText, Group, Gamepad2, Plus, Filter, X } from 'lucide-react';
import Popup, { PopupState } from '../../../components/Popup';

// Type definitions
interface User {
  id: number;
  username: string;
  avatar: string;
  verified: boolean;
  isGame?: boolean;
}

interface Page {
  id: number;
  name: string;
  likes: number;
  category: string;
  icon: string;
  iconColor: string;
}

interface Tab {
  name: string;
  icon: React.ComponentType<any>;
  active: boolean;
}

interface Filters {
  all: string;
  age: string;
  verified: string;
  status: string;
  gender: string;
  avatar: string;
}

const SocialExplorePage = () => {
  const [activeTab, setActiveTab] = useState<string>('Pages');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({
    all: 'All',
    age: 'Age',
    verified: 'Verified',
    status: 'Status',
    gender: 'Gender',
    avatar: 'Avatar'
  });
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

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

  // Handler functions with proper types
  const handleFollow = (userId: number) => {
    showPopup('success', 'Followed!', `You are now following user ${userId}`);
  };

  const handleSearch = () => {
    showPopup('info', 'Searching...', `Searching for: ${searchKeyword}`);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleLikePage = (pageId: number) => {
    showPopup('success', 'Liked!', `You liked page ${pageId}`);
  };

  const handleLoadMore = () => {
    showPopup('info', 'Loading...', 'Loading more pages...');
  };

  const users: User[] = [
    { id: 1, username: 'velmarxx557754', avatar: '👨‍💼', verified: false },
    { id: 2, username: 'mireyabevill36', avatar: '👨‍💼', verified: false },
    { id: 3, username: 'rhodatownes20', avatar: '👨‍💼', verified: false },
    { id: 4, username: 'rachelcox45054', avatar: '👨‍💼', verified: false },
    { id: 5, username: 'everetted23827', avatar: '👨‍💼', verified: false },
    { id: 6, username: 'kindraedler063', avatar: '👨‍💼', verified: false },
    { id: 7, username: 'Sandeep Jamwal', avatar: '👨‍💼', verified: false },
    { id: 8, username: 'sonyamcmahon2', avatar: '👨‍💼', verified: false },
    { id: 9, username: 'janeenpoling22', avatar: '👨‍💼', verified: false },
    { id: 10, username: 'sammiewittienoo', avatar: '👨‍💼', verified: false },
    { id: 11, username: 'florenesedon2', avatar: '👨‍💼', verified: false },
    { id: 12, username: 'lauriefoland2', avatar: '👨‍💼', verified: false },
    { id: 13, username: 'wileynwz756826', avatar: '👨‍💼', verified: false },
    { id: 14, username: 'susannahbarber', avatar: '👨‍💼', verified: false },
    { id: 15, username: 'bobbywallwork', avatar: '👨‍💼', verified: false },
    { id: 16, username: 'tiffany8533915', avatar: '👨‍💼', verified: false },
    { id: 17, username: 'brycetakasuka8', avatar: '👨‍💼', verified: false },
    { id: 18, username: 'Muskan Amir', avatar: '👨‍💼', verified: false },
    { id: 19, username: 'claudioheadlam', avatar: '👨‍💼', verified: false },
    { id: 20, username: 'aleciaburbank1', avatar: '👨‍💼', verified: false },
    { id: 21, username: 'alinecoggins89', avatar: '👨‍💼', verified: false },
    { id: 22, username: 'dkwim game', avatar: '🎮', verified: false, isGame: true },
    { id: 23, username: 'sethaston47131', avatar: '👨‍💼', verified: false },
    { id: 24, username: 'josiebyars639', avatar: '👨‍💼', verified: false },
    { id: 25, username: 'deangelodennin', avatar: '👨‍💼', verified: false },
    { id: 26, username: 'sibyllevay8113', avatar: '👨‍💼', verified: false }
  ];

  const pages: Page[] = [
    {
      id: 1,
      name: 'Synarion IT Solutions',
      likes: 0,
      category: 'Science and Technology',
      icon: 'S',
      iconColor: 'bg-black text-white'
    },
    {
      id: 2,
      name: 'parker',
      likes: 0,
      category: 'Other',
      icon: '📄',
      iconColor: 'bg-orange-200'
    },
    {
      id: 3,
      name: 'jaifriend',
      likes: 0,
      category: 'Other',
      icon: '📄',
      iconColor: 'bg-orange-200'
    },
    {
      id: 4,
      name: 'Paperub Official',
      likes: 0,
      category: 'Other',
      icon: 'P',
      iconColor: 'bg-orange-500 text-white'
    },
    {
      id: 5,
      name: 'BookMyEssay Official',
      likes: 0,
      category: 'Education',
      icon: '🎨',
      iconColor: 'bg-gradient-to-br from-blue-400 via-purple-500 to-yellow-500'
    },
    {
      id: 6,
      name: 'Apnademand',
      likes: 0,
      category: 'Cars and Vehicles',
      icon: '📄',
      iconColor: 'bg-orange-200'
    }
  ];

  const tabs: Tab[] = [
    { name: 'Users', icon: Users, active: false },
    { name: 'Pages', icon: FileText, active: true },
    { name: 'Groups', icon: Group, active: false },
    { name: 'Games', icon: Gamepad2, active: false }
  ];

  // User Card Component with proper typing
  const UserCard = ({ user }: { user: User }) => (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Galaxy Background with Avatar */}
      <div className="relative h-24 sm:h-32 bg-gradient-to-br from-purple-900 via-blue-900 to-black overflow-hidden">
        {/* Starry background effect */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-1 sm:top-2 left-2 sm:left-4 w-0.5 sm:w-1 h-0.5 sm:h-1 bg-white rounded-full"></div>
          <div className="absolute top-3 sm:top-6 right-4 sm:right-8 w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute top-4 sm:top-8 left-6 sm:left-12 w-0.5 sm:w-1 h-0.5 sm:h-1 bg-white rounded-full"></div>
          <div className="absolute top-6 sm:top-12 right-2 sm:right-4 w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute top-8 sm:top-16 left-4 sm:left-8 w-0.5 sm:w-1 h-0.5 sm:h-1 bg-white rounded-full"></div>
          <div className="absolute top-10 sm:top-20 right-6 sm:right-12 w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute bottom-4 sm:bottom-8 left-3 sm:left-6 w-0.5 sm:w-1 h-0.5 sm:h-1 bg-white rounded-full"></div>
          <div className="absolute bottom-6 sm:bottom-12 right-3 sm:right-6 w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute bottom-8 sm:bottom-16 left-8 sm:left-16 w-0.5 sm:w-1 h-0.5 sm:h-1 bg-white rounded-full"></div>
          {/* Nebula effect */}
          <div className="absolute top-2 sm:top-4 right-3 sm:right-6 w-4 sm:w-8 h-4 sm:h-8 bg-purple-400 rounded-full opacity-30 blur-sm"></div>
          <div className="absolute bottom-3 sm:bottom-6 left-4 sm:left-8 w-3 sm:w-6 h-3 sm:h-6 bg-pink-400 rounded-full opacity-20 blur-sm"></div>
        </div>
        
        {/* Centered Avatar */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-orange-200 flex items-center justify-center border-2 border-white shadow-lg">
            {user.isGame ? (
              <div className="text-lg sm:text-2xl">🎮</div>
            ) : (
              <div className="text-lg sm:text-2xl">🤓</div>
            )}
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-3 sm:p-4 text-center">
        <h3 className="font-medium text-gray-900 text-xs sm:text-sm mb-2 sm:mb-3 truncate">
          {user.username}
        </h3>
        <button
          onClick={() => handleFollow(user.id)}
          className="w-full bg-blue-100 text-blue-600 py-1.5 sm:py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium hover:bg-blue-200 transition-colors"
        >
          Follow
        </button>
      </div>
    </div>
  );

  // Page List Item Component with proper typing
  const PageListItem = ({ page }: { page: Page }) => (
    <div className="bg-white border-b last:border-b-0 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors gap-3 sm:gap-4">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Page Icon */}
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${page.iconColor}`}>
          {page.icon === '📄' ? (
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
          ) : page.icon === '🎨' ? (
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-yellow-500"></div>
          ) : (
            <span className="font-bold text-base sm:text-lg">{page.icon}</span>
          )}
        </div>
        
        {/* Page Info */}
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-1 truncate">{page.name}</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <span className="flex items-center gap-1">
              👍 {page.likes} people like this
            </span>
            <span className="text-blue-600">{page.category}</span>
          </div>
        </div>
      </div>
      
      {/* Like Button */}
      <button
        onClick={() => handleLikePage(page.id)}
        className="flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-700 transition-colors flex-shrink-0"
      >
        👍 Like
      </button>
    </div>
  );

  // Pages Tab Component
  const PagesComponent = () => (
    <div className="bg-white rounded-lg shadow-sm border">
      {pages.map((page) => (
        <PageListItem key={page.id} page={page} />
      ))}
      
      {/* Load More Button */}
      <div className="p-3 sm:p-4 text-center border-t">
        <button
          onClick={handleLoadMore}
          className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors mx-auto text-sm"
        >
          <ChevronDown className="w-4 h-4" />
          Load more pages
        </button>
      </div>
    </div>
  );

  // Search and Filters Component
  const SearchFilters = () => (
    <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 mb-4 sm:mb-6">
      {/* Search Bar */}
      <div className="flex justify-center mb-3 sm:mb-4">
        <div className="relative max-w-md w-full">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Keyword"
            className="w-full pl-3 sm:pl-4 pr-10 sm:pr-12 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-sm sm:text-base"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            <Search className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="flex justify-center mb-3 sm:hidden">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
          {showFilters ? <X className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Filter Dropdowns */}
      <div className={`flex flex-wrap justify-center gap-2 ${showFilters ? 'block' : 'hidden sm:flex'}`}>
        {Object.entries(filters).map(([key, value]) => (
          <div key={key} className="relative">
            <select
              value={value}
              onChange={(e) => handleFilterChange(key, e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-md px-2 sm:px-3 py-1 pr-5 sm:pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs min-w-0"
            >
              <option value={value}>{value}</option>
              {key === 'all' && (
                <>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </>
              )}
              {key === 'age' && (
                <>
                  <option value="18-25">18-25</option>
                  <option value="26-35">26-35</option>
                  <option value="36-50">36-50</option>
                  <option value="50+">50+</option>
                </>
              )}
              {key === 'verified' && (
                <>
                  <option value="Yes">Verified</option>
                  <option value="No">Not Verified</option>
                </>
              )}
              {key === 'status' && (
                <>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Away">Away</option>
                </>
              )}
              {key === 'gender' && (
                <>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </>
              )}
              {key === 'avatar' && (
                <>
                  <option value="With Photo">With Photo</option>
                  <option value="Without Photo">Without Photo</option>
                </>
              )}
            </select>
            <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-6">
      {/* Popup Modal */}
      <Popup popup={popup} onClose={closePopup} />
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
        
        {/* Search and Filters - Only show for Users tab */}
        {activeTab === 'Users' && <SearchFilters />}

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="inline-flex bg-white rounded-lg shadow-sm border overflow-x-auto max-w-full">
            {tabs.map((tab, index) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                    index === 0 ? 'rounded-l-lg' : ''
                  } ${
                    index === tabs.length - 1 ? 'rounded-r-lg' : ''
                  } ${
                    activeTab === tab.name
                      ? 'text-orange-600 bg-orange-50 border-orange-200'
                      : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Users Grid */}
        {activeTab === 'Users' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
            {users.slice(0, 24).map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}

        {/* Pages List */}
        {activeTab === 'Pages' && <PagesComponent />}

        {/* Other Tabs Placeholder */}
        {(activeTab === 'Groups' || activeTab === 'Games') && (
          <div className="bg-white rounded-lg shadow-sm border min-h-64 sm:min-h-96 flex flex-col items-center justify-center p-6 sm:p-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              {activeTab === 'Groups' && <Group className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />}
              {activeTab === 'Games' && <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />}
            </div>
            <p className="text-gray-600 font-medium text-sm sm:text-base">{activeTab} coming soon</p>
          </div>
        )}

      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-30">
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};

export default SocialExplorePage;