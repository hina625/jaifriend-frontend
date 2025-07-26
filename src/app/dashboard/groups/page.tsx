"use client";
import React, { useState } from 'react';
import { Users, Plus, X, Menu, Search, Settings, MessageCircle, Star } from 'lucide-react';

interface FormData {
  groupName: string;
  groupUrl: string;
  groupType: string;
  category: string;
}

interface Group {
  id: number;
  name: string;
  description: string;
  members: number;
  category: string;
  type: 'Public' | 'Private';
  image: string;
  isJoined: boolean;
  lastActivity: string;
}

const GroupsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('My Groups');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    groupName: '',
    groupUrl: '',
    groupType: 'Public',
    category: 'Cars and Vehicles'
  });

  const tabs: string[] = ['My Groups', 'Suggested groups', 'Joined Groups'];

  // Mock groups data
  const mockGroups: Group[] = [
    {
      id: 1,
      name: 'Tech Innovators',
      description: 'A community for technology enthusiasts and innovators to share ideas and collaborate.',
      members: 1250,
      category: 'Technology',
      type: 'Public',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
      isJoined: true,
      lastActivity: '2 hours ago'
    },
    {
      id: 2,
      name: 'Car Enthusiasts Club',
      description: 'For people who love cars, racing, and automotive technology.',
      members: 892,
      category: 'Cars and Vehicles',
      type: 'Public',
      image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=400&h=300&fit=crop',
      isJoined: false,
      lastActivity: '5 hours ago'
    },
    {
      id: 3,
      name: 'Photography Masters',
      description: 'Share your photography skills and learn from professionals.',
      members: 2341,
      category: 'Entertainment',
      type: 'Public',
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop',
      isJoined: true,
      lastActivity: '1 day ago'
    },
    {
      id: 4,
      name: 'Fitness Warriors',
      description: 'Motivation and tips for maintaining a healthy lifestyle.',
      members: 567,
      category: 'Sports',
      type: 'Private',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      isJoined: false,
      lastActivity: '3 days ago'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateGroup = (): void => {
    console.log('Creating group:', formData);
    setShowCreateModal(false);
    setFormData({
      groupName: '',
      groupUrl: '',
      groupType: 'Public',
      category: 'Cars and Vehicles'
    });
  };

  const handleCancel = (): void => {
    setShowCreateModal(false);
    setFormData({
      groupName: '',
      groupUrl: '',
      groupType: 'Public',
      category: 'Cars and Vehicles'
    });
  };

  const handleJoinGroup = (groupId: number) => {
    console.log('Joining group:', groupId);
  };

  const getGroupsForTab = (): Group[] => {
    switch (activeTab) {
      case 'My Groups':
        return mockGroups.filter(group => group.isJoined);
      case 'Suggested groups':
        return mockGroups.filter(group => !group.isJoined);
      case 'Joined Groups':
        return mockGroups.filter(group => group.isJoined);
      default:
        return [];
    }
  };

  // Group Card Component
  const GroupCard: React.FC<{ group: Group }> = ({ group }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
          src={group.image} 
          alt={group.name}
          className="w-full h-32 sm:h-40 object-cover"
        />
        <div className="absolute top-2 left-2 flex gap-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            group.type === 'Public' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-orange-100 text-orange-700'
          }`}>
            {group.type}
          </span>
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
            {group.category}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">{group.name}</h3>
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <Star className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{group.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{group.members.toLocaleString()} members</span>
          </div>
          <span>Active {group.lastActivity}</span>
        </div>
        
        <div className="flex gap-2">
          {group.isJoined ? (
            <>
              <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Chat
              </button>
              <button className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => handleJoinGroup(group.id)}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              Join Group
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Empty State Component
  const EmptyState: React.FC = () => (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16">
      <div className="w-12 h-12 sm:w-16 sm:h-16 mb-4 sm:mb-6 text-purple-400">
        <svg viewBox="0 0 64 64" fill="currentColor" className="w-full h-full">
          <path d="M32 8c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm-12 20c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm24 0c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm-12 12c-6.6 0-12 5.4-12 12v4h24v-4c0-6.6-5.4-12-12-12z"/>
        </svg>
      </div>
      <p className="text-gray-500 text-base sm:text-lg mb-4 sm:mb-6">No groups to show</p>
      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
      >
        Create
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 relative pb-20 sm:pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Groups</h1>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 hidden sm:block">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Users className="w-5 h-5" />
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 text-gray-400 hover:text-gray-600"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {/* Desktop Tabs */}
          <div className="hidden sm:flex space-x-1 mt-4">
            {tabs.map((tab: string) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Mobile Tab Indicator */}
          <div className="sm:hidden mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">{activeTab}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
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
              {tabs.map((tab: string) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    activeTab === tab
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
              <div className="border-t mt-2 pt-2">
                <button
                  onClick={() => {
                    setShowCreateModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  Create New Group
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {getGroupsForTab().length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {getGroupsForTab().map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-30"
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Create New Group</h2>
                <button
                  onClick={handleCancel}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Group Name */}
                <div>
                  <input
                    type="text"
                    name="groupName"
                    placeholder="Group name"
                    value={formData.groupName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                {/* Group URL */}
                <div>
                  <input
                    type="text"
                    name="groupUrl"
                    placeholder="Group URL"
                    value={formData.groupUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">https://jarfriend.com/Group URL</p>
                </div>

                {/* Group Type and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Group type</label>
                    <select
                      name="groupType"
                      value={formData.groupType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="Cars and Vehicles">Cars and Vehicles</option>
                      <option value="Technology">Technology</option>
                      <option value="Sports">Sports</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6 sm:mt-8">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors w-full sm:w-auto text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={!formData.groupName.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors w-full sm:w-auto text-sm"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;