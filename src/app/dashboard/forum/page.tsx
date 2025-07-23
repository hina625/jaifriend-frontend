"use client";
import React, { useState } from 'react';
import { Search, Users, MessageSquare, FileText, Reply, Plus, Camera } from 'lucide-react';

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

  // Browse Forum Page
  const BrowseForumPage: React.FC = () => (
    <div className="bg-white rounded-lg border min-h-96 flex flex-col items-center justify-center p-8">
      <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mb-4">
        <Users className="w-8 h-8 text-red-500" />
      </div>
      <p className="text-gray-600 font-medium">No forums to show</p>
    </div>
  );

  // Members Page
  const MembersPage: React.FC = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-gray-900">List of users</span>
        </div>

        {/* Alphabet Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {alphabet.map((letter: string) => (
            <button
              key={letter}
              className="w-8 h-8 text-sm text-gray-600 hover:bg-gray-100 rounded flex items-center justify-center"
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-3 gap-4 pb-3 mb-4 border-b text-sm font-medium text-gray-600 uppercase tracking-wide">
          <div>NAME</div>
          <div>JOINED</div>
          <div>POSTS</div>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {users.map((user: User, index: number) => (
            <div key={index} className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm">
                  {user.avatar === '🏴' ? '🏴' : '👤'}
                </div>
                <span className="text-blue-600 font-medium">{user.name}</span>
              </div>
              <div className="text-blue-600 text-sm">{user.joined}</div>
              <div className="text-orange-600 font-medium">{user.posts}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Search Page
  const SearchPage: React.FC = () => (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <Search className="w-4 h-4 text-white" />
        </div>
        <span className="font-medium text-gray-900">Search</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Term */}
        <div className="lg:col-span-1">
          <textarea
            name="searchTerm"
            value={searchForm.searchTerm}
            onChange={handleInputChange}
            placeholder="Search for term"
            className="w-full h-32 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-2">
            Type in one or more search terms, each must be at least 4 characters
          </p>
        </div>

        {/* Search Options */}
        <div className="lg:col-span-1 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Search type</label>
            <select
              name="searchType"
              value={searchForm.searchType}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Search subject only</option>
              <option>Search message content</option>
              <option>Search both</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Search in</label>
            <select
              name="searchIn"
              value={searchForm.searchIn}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Search in threads</option>
              <option>Search in replies</option>
              <option>Search everywhere</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Search section</label>
            <select
              name="searchSection"
              value={searchForm.searchSection}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select section...</option>
              <option>General Discussion</option>
              <option>Help & Support</option>
              <option>Announcements</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Search
        </button>
      </div>
    </div>
  );

  // My Threads Page
  const MyThreadsPage: React.FC = () => (
    <div className="bg-white rounded-lg border min-h-96 flex flex-col items-center justify-center p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <span className="font-medium text-gray-900">My Threads</span>
      </div>
      <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-yellow-600" />
      </div>
      <p className="text-gray-600 font-medium">No threads to show</p>
    </div>
  );

  // My Replies Page
  const MyRepliesPage: React.FC = () => (
    <div className="bg-white rounded-lg border min-h-96 flex flex-col items-center justify-center p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <Reply className="w-4 h-4 text-white" />
        </div>
        <span className="font-medium text-gray-900">My Replies</span>
      </div>
      <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mb-4">
        <Reply className="w-8 h-8 text-red-500" />
      </div>
      <p className="text-gray-600 font-medium">No replies to show</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Forum</h1>
            
            <div className="flex gap-3">
              <button className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Camera className="w-5 h-5 text-gray-600" />
              </button>
              <button className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Users className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map((tab: Tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
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
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ForumPage;