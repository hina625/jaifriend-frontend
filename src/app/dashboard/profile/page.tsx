"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, MoreVertical, Search, Filter, Camera, Video, Music, FileText, Plus, Heart, MessageCircle, Share2, Bookmark, Settings, Camera as CameraIcon } from 'lucide-react';
import PostDisplay from '@/components/PostDisplay';
import Popup, { PopupState } from '@/components/Popup';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  email: string;
  followers: string[];
  following: string[];
  bio?: string;
  location?: string;
  website?: string;
}

interface Post {
  _id: string;
  content: string;
  media: any[];
  likes: string[];
  comments: any[];
  shares: string[];
  views: string[];
  createdAt: string;
  user: {
    name: string;
    avatar: string;
    userId: string;
  };
}

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: '📝' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
    { id: 'friends', label: 'Friends', icon: '👥' },
    { id: 'photos', label: 'Photos', icon: '📷' },
    { id: 'videos', label: 'Videos', icon: '🎥' },
    { id: 'saved', label: 'Saved', icon: '🔖' }
  ];

  const filters = [
    { id: 'all', label: 'All', icon: <Filter className="w-4 h-4" /> },
    { id: 'text', label: 'Text', icon: <FileText className="w-4 h-4" /> },
    { id: 'photos', label: 'Photos', icon: <CameraIcon className="w-4 h-4" /> },
    { id: 'videos', label: 'Videos', icon: <Video className="w-4 h-4" /> }
  ];

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
    
    // Listen for post creation events to refresh posts
    const handlePostCreated = () => {
      fetchUserPosts();
    };
    
    window.addEventListener('postCreated', handlePostCreated);
    
    return () => {
      window.removeEventListener('postCreated', handlePostCreated);
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/register');
        return;
      }

      const response = await fetch('http://localhost:5000/api/profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile/posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const postsData = await response.json();
        setPosts(postsData);
      } else {
        console.error('Failed to fetch user posts');
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setEditContent(post.content);
    setShowEditModal(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setPosts(prev => prev.filter(post => post._id !== postId));
        showPopup('success', 'Post Deleted', 'Post has been deleted successfully!');
      } else {
        showPopup('error', 'Error', 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showPopup('error', 'Error', 'Failed to delete post');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPost || !editContent.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${editingPost._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editContent })
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(prev => prev.map(post => 
          post._id === editingPost._id ? updatedPost : post
        ));
        setShowEditModal(false);
        setEditingPost(null);
        setEditContent('');
        showPopup('success', 'Post Updated', 'Post has been updated successfully!');
      } else {
        showPopup('error', 'Error', 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      showPopup('error', 'Error', 'Failed to update post');
    }
  };

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

  const getFilteredPosts = () => {
    let filtered = posts;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply content type filter
    switch (activeFilter) {
      case 'text':
        filtered = filtered.filter(post => !post.media || post.media.length === 0);
        break;
      case 'photos':
        filtered = filtered.filter(post => 
          post.media && post.media.some(media => media.type === 'image')
        );
        break;
      case 'videos':
        filtered = filtered.filter(post => 
          post.media && post.media.some(media => media.type === 'video')
        );
        break;
    }

    return filtered;
  };

  const getMediaUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    );
  }

  const filteredPosts = getFilteredPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-64 md:h-80 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          
          {/* Cover Photo Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <CameraIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm opacity-75">Add cover photo</p>
            </div>
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="relative px-4 md:px-8 pb-6">
          <div className="max-w-4xl mx-auto">
            {/* Profile Picture */}
            <div className="relative -mt-20 mb-4">
              <div className="relative inline-block">
                <img
                  src={getMediaUrl(user.avatar)}
                  alt={user.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl object-cover bg-gray-200"
                />
                <button className="absolute bottom-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors">
                  <CameraIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{user.name}</h1>
                <p className="text-gray-600 text-lg mb-2">@{user.username}</p>
                
                {/* Bio */}
                {user.bio && (
                  <p className="text-gray-700 mb-4 max-w-2xl">{user.bio}</p>
                )}

                {/* Location & Website */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <span>📍</span>
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center gap-1">
                      <span>🌐</span>
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {user.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{posts.length}</div>
                    <div className="text-gray-600">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{user.followers?.length || 0}</div>
                    <div className="text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{user.following?.length || 0}</div>
                    <div className="text-gray-600">Following</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-medium">
                  <MessageCircle className="w-4 h-4" />
                  <span>Message</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-medium">
                  <Heart className="w-4 h-4" />
                  <span>Follow</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-6 border-b-2 transition-colors whitespace-nowrap min-w-fit ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search your posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                        activeFilter === filter.id
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter.icon}
                      <span>{filter.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Posts */}
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <FileText className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery ? 'Try adjusting your search terms' : 'Start sharing your thoughts!'}
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create Post
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <div key={post._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <PostDisplay
                      post={post}
                      onLike={async (postId) => {
                        // Handle like
                      }}
                      onComment={async (postId, comment) => {
                        // Handle comment
                      }}
                      onSave={async (postId) => {
                        // Handle save
                      }}
                      onShare={async (postId, shareOptions) => {
                        // Handle share
                      }}
                      onDelete={handleDeletePost}
                      onEdit={handleEditPost}
                      showEditDelete={true}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">About {user.name}</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
                <p className="text-gray-600">{user.bio || 'No bio added yet.'}</p>
              </div>
              {user.location && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                  <p className="text-gray-600">{user.location}</p>
                </div>
              )}
              {user.website && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Website</h4>
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {user.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">Friends</h3>
            <p className="text-gray-600">Friends feature coming soon!</p>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">Photos</h3>
            <p className="text-gray-600">Photo gallery coming soon!</p>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">Videos</h3>
            <p className="text-gray-600">Video gallery coming soon!</p>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">Saved Posts</h3>
            <p className="text-gray-600">Saved posts coming soon!</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => router.push('/dashboard')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-50"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Edit Post Modal */}
      {showEditModal && editingPost && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Post</h3>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="What's on your mind?"
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPost(null);
                  setEditContent('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup */}
      <Popup popup={popup} onClose={closePopup} />
    </div>
  );
};

export default ProfilePage; 