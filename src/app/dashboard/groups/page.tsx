"use client";
import React, { useState, useEffect } from 'react';
import { Users, Plus, X, Menu, Search, Settings, MessageCircle, Star } from 'lucide-react';

interface FormData {
  name: string;
  description: string;
  privacy: string;
  category: string;
  website?: string;
  email?: string;
  phone?: string;
}

interface Group {
  _id: string;
  name: string;
  description: string;
  category: string;
  privacy: 'public' | 'private' | 'secret';
  avatar?: string;
  coverPhoto?: string;
  creator: {
    _id: string;
    name: string;
    username?: string;
    avatar?: string;
  };
  members: Array<{
    user: {
      _id: string;
      name: string;
      username?: string;
      avatar?: string;
    };
    role: 'member' | 'moderator' | 'admin';
    joinedAt: string;
    isActive: boolean;
  }>;
  stats: {
    memberCount: number;
    postCount: number;
    eventCount: number;
  };
  isActive: boolean;
  website?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

const GroupsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('My Groups');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    privacy: 'public',
    category: 'general'
  });

  const tabs: string[] = ['My Groups', 'Suggested groups', 'Joined Groups'];

  // Empty groups data - will be populated from API
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Fetch groups from API
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/groups`;

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const groupsData = await response.json();
          setGroups(groupsData);
        } else {
          setGroups([]);
        }
      } catch {
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateGroup = async (): Promise<void> => {
    try {
      setCreating(true);
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      // Validate required fields
      if (!formData.name.trim()) {
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('privacy', formData.privacy);
      formDataToSend.append('category', formData.category);
      if (formData.website) formDataToSend.append('website', formData.website);
      if (formData.email) formDataToSend.append('email', formData.email);
      if (formData.phone) formDataToSend.append('phone', formData.phone);

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/groups`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        const newGroup = await response.json();
        setGroups(prev => [newGroup, ...prev]);
        setShowCreateModal(false);
        setFormData({
          name: '',
          description: '',
          privacy: 'public',
          category: 'general'
        });
      }
    } catch {
      // Silent error handling
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = (): void => {
    setShowCreateModal(false);
    setFormData({
      name: '',
      description: '',
      privacy: 'public',
      category: 'general'
    });
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh groups
        const groupsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/groups`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (groupsResponse.ok) {
          const updatedGroups = await groupsResponse.json();
          setGroups(updatedGroups);
        }
      }
    } catch {
      // Silent error handling
    }
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description,
      privacy: group.privacy,
      category: group.category,
      website: group.website || '',
      email: group.email || '',
      phone: group.phone || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('privacy', formData.privacy);
      formDataToSend.append('category', formData.category);
      if (formData.website) formDataToSend.append('website', formData.website);
      if (formData.email) formDataToSend.append('email', formData.email);
      if (formData.phone) formDataToSend.append('phone', formData.phone);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/groups/${editingGroup._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        const updatedGroup = await response.json();
        setGroups(prev => prev.map(g => g._id === editingGroup._id ? updatedGroup : g));
        setShowEditModal(false);
        setEditingGroup(null);
        setFormData({
          name: '',
          description: '',
          privacy: 'public',
          category: 'general'
        });
      }
    } catch {
      // Silent error handling
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setGroups(prev => prev.filter(g => g._id !== groupId));
      }
    } catch {
      // Silent error handling
    }
  };

  const getGroupsForTab = (): Group[] => {
    const userId = localStorage.getItem('userId') || (() => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user.id || user._id;
        } catch {
          return null;
        }
      }
      return null;
    })();
    
    switch (activeTab) {
      case 'My Groups':
        return groups.filter(group => 
          group.creator._id === userId || 
          group.members.some(member => member.user._id === userId && member.role === 'admin')
        );
      case 'Suggested groups':
        return groups.filter(group => 
          group.privacy === 'public' && 
          !group.members.some(member => member.user._id === userId)
        );
      case 'Joined Groups':
        return groups.filter(group => 
          group.members.some(member => member.user._id === userId)
        );
      default:
        return [];
    }
  };

  // Group Card Component
  const GroupCard: React.FC<{ group: Group }> = ({ group }) => {
    const userId = localStorage.getItem('userId') || (() => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user.id || user._id;
        } catch {
          return null;
        }
      }
      return null;
    })();
    const isMember = group.members.some(member => member.user._id === userId);
    const isAdmin = group.members.some(member => member.user._id === userId && member.role === 'admin');
    const isCreator = group.creator._id === userId;

    return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
            src={group.avatar || group.coverPhoto || '/avatars/1.png.png'} 
          alt={group.name}
          className="w-full h-32 sm:h-40 object-cover"
        />
        <div className="absolute top-2 left-2 flex gap-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
              group.privacy === 'public' 
              ? 'bg-green-100 text-green-700' 
                : group.privacy === 'private'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-red-100 text-red-700'
          }`}>
              {group.privacy.charAt(0).toUpperCase() + group.privacy.slice(1)}
          </span>
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
              {group.category.charAt(0).toUpperCase() + group.category.slice(1)}
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
              <span>{group.stats.memberCount.toLocaleString()} members</span>
            </div>
            <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
        </div>
        
        <div className="flex gap-2">
            {isMember || isAdmin || isCreator ? (
            <>
              <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Chat
              </button>
                {(isAdmin || isCreator) && (
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEditGroup(group)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                <Settings className="w-4 h-4" />
              </button>
                    {(isCreator) && (
                      <button 
                        onClick={() => handleDeleteGroup(group._id)}
                        className="px-3 py-2 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                )}
            </>
          ) : (
            <button 
                onClick={() => handleJoinGroup(group._id)}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              Join Group
            </button>
          )}
        </div>
      </div>
    </div>
  );
  };

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
    <div className="w-full h-full overflow-y-auto scrollbar-hide">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
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
              <GroupCard key={group._id} group={group} />
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
                    name="name"
                    placeholder="Group name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                {/* Group Description */}
                <div>
                  <textarea
                    name="description"
                    placeholder="Group description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
                  />
                </div>

                {/* Group Privacy and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Group type</label>
                    <select
                      name="privacy"
                      value={formData.privacy}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="secret">Secret</option>
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
                      <option value="general">General</option>
                      <option value="business">Business</option>
                      <option value="education">Education</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="health">Health</option>
                      <option value="sports">Sports</option>
                      <option value="technology">Technology</option>
                      <option value="travel">Travel</option>
                      <option value="other">Other</option>
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
                  disabled={!formData.name.trim() || creating}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors w-full sm:w-auto text-sm flex items-center justify-center"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {showEditModal && editingGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Group</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingGroup(null);
                    setFormData({
                      name: '',
                      description: '',
                      privacy: 'public',
                      category: 'general'
                    });
                  }}
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
                    name="name"
                    placeholder="Group name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                {/* Group Description */}
                <div>
                  <textarea
                    name="description"
                    placeholder="Group description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
                  />
                </div>

                {/* Group Privacy and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Group type</label>
                    <select
                      name="privacy"
                      value={formData.privacy}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="secret">Secret</option>
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
                      <option value="general">General</option>
                      <option value="business">Business</option>
                      <option value="education">Education</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="health">Health</option>
                      <option value="sports">Sports</option>
                      <option value="technology">Technology</option>
                      <option value="travel">Travel</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6 sm:mt-8">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingGroup(null);
                    setFormData({
                      name: '',
                      description: '',
                      privacy: 'public',
                      category: 'general'
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors w-full sm:w-auto text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateGroup}
                  disabled={!formData.name.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors w-full sm:w-auto text-sm"
                >
                  Update
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