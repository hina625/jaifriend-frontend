"use client";
import React, { useState, useEffect } from 'react';
import { Search, Settings, UserPlus, Users } from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar: string;
  username: string;
  isOnline: boolean;
  isVerified?: boolean;
}

interface FollowersSidebarProps {
  isAdminPage?: boolean;
}

const FollowersSidebar: React.FC<FollowersSidebarProps> = ({ isAdminPage = false }) => {
  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [userStatus, setUserStatus] = useState<'online' | 'offline'>('online');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Mock data for demonstration - replace with actual API call
  useEffect(() => {
    const fetchFollowers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Get current user's following list
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/users/following/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setFollowers(data);
          } else {
            // Fallback to mock data
            setFollowers([
              {
                id: '1',
                name: 'Sarah Johnson',
                username: 'sarah_j',
                avatar: '/avatars/1.png.png',
                isOnline: true,
                isVerified: true
              },
              {
                id: '2',
                name: 'Mike Chen',
                username: 'mike_chen',
                avatar: '/avatars/2.png.png',
                isOnline: false
              },
              {
                id: '3',
                name: 'Emma Wilson',
                username: 'emma_w',
                avatar: '/avatars/3.png.png',
                isOnline: true
              },
              {
                id: '4',
                name: 'David Brown',
                username: 'david_b',
                avatar: '/avatars/4.png.png',
                isOnline: true,
                isVerified: true
              },
              {
                id: '5',
                name: 'Lisa Garcia',
                username: 'lisa_g',
                avatar: '/avatars/5.pmg.png',
                isOnline: false
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching followers:', error);
        // Fallback to mock data
        setFollowers([
          {
            id: '1',
            name: 'Sarah Johnson',
            username: 'sarah_j',
            avatar: '/avatars/1.png.png',
            isOnline: true,
            isVerified: true
          },
          {
            id: '2',
            name: 'Mike Chen',
            username: 'mike_chen',
            avatar: '/avatars/2.png.png',
            isOnline: false
          },
          {
            id: '3',
            name: 'Emma Wilson',
            username: 'emma_w',
            avatar: '/avatars/3.png.png',
            isOnline: true
          },
          {
            id: '4',
            name: 'David Brown',
            username: 'david_b',
            avatar: '/avatars/4.png.png',
            isOnline: true,
            isVerified: true
          },
          {
            id: '5',
            name: 'Lisa Garcia',
            username: 'lisa_g',
            avatar: '/avatars/5.pmg.png',
            isOnline: false
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, []);

  const filteredFollowers = followers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = (status: 'online' | 'offline') => {
    setUserStatus(status);
    setShowStatusMenu(false);
    // Here you would typically make an API call to update user status
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      // Here you would make an API call to create the group
      console.log('Creating group:', groupName, 'with users:', selectedUsers);
      setShowCreateGroup(false);
      setGroupName('');
      setSelectedUsers([]);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/users/search?q=${encodeURIComponent(query)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        }
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Don't show sidebar on admin pages
  if (isAdminPage) {
    return null;
  }

  return (
    <>
      {/* Followers Sidebar - Hidden on mobile */}
      <div className="fixed right-0 top-0 h-full w-16 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-40 flex flex-col items-center py-4 hidden md:flex">
        {/* Settings Icon */}
        <div className="relative mb-4">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          {/* Status Dropdown */}
          {showStatusMenu && (
            <div className="absolute right-12 top-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 min-w-[120px]">
              <button
                onClick={() => handleStatusChange('online')}
                className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
              >
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Online</span>
              </button>
              <button
                onClick={() => handleStatusChange('offline')}
                className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
              >
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Offline</span>
              </button>
            </div>
          )}
        </div>

        {/* Add User Icon */}
        <button className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors mb-4">
          <UserPlus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Brand Logo */}
        <div className="w-10 h-10 bg-red-500 rounded-full shadow-sm flex items-center justify-center mb-4">
          <span className="text-white text-xs font-bold">J</span>
        </div>

        {/* Followers List */}
        <div className="flex-1 overflow-y-auto space-y-3 px-2">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
            </div>
          ) : (
            filteredFollowers.map((user) => (
              <div
                key={user.id}
                className="relative group cursor-pointer"
                title={`${user.name} (@${user.username})`}
                onClick={() => window.open(`/dashboard/profile/${user.id}`, '_blank')}
              >
                <div className="w-10 h-10 bg-white rounded-full shadow-sm overflow-hidden relative">
                  <img
                    src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/${user.avatar}`) : '/default-avatar.svg'}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('❌ FollowersSidebar avatar load failed for user:', user.name, 'URL:', user.avatar);
                      e.currentTarget.src = '/default-avatar.svg';
                    }}
                  />
                  {/* Online Status Indicator */}
                  {user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                  {/* Verified Badge */}
                  {user.isVerified && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                
                {/* Hover Tooltip */}
                <div className="absolute left-12 top-0 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {user.name}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Search Icon */}
        <button 
          onClick={() => setShowSearchModal(true)}
          className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4">Create a group chat</h3>
            
            {/* Group Avatar */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-500">📷</span>
              </div>
              
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Participants */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add participant ({selectedUsers.length})
              </label>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {followers.map((user) => (
                  <label key={user.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded"
                    />
                    <img
                      src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/${user.avatar}`) : '/default-avatar.svg'}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => {
                        console.log('❌ Group creation avatar load failed for user:', user.name, 'URL:', user.avatar);
                        e.currentTarget.src = '/default-avatar.svg';
                      }}
                    />
                    <span className="text-sm text-gray-700">{user.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateGroup(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedUsers.length === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search for users</h3>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            {/* Search Input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search for users"
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                autoFocus
              />
            </div>
            
            {/* Search Results */}
            <div className="max-h-64 overflow-y-auto">
              {searchLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</div>
                      </div>
                      {user.isOnline && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              ) : searchQuery && !searchLoading ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No users found
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FollowersSidebar; 
