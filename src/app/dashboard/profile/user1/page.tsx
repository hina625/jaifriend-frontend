"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, MoreVertical, Search, Filter, Camera, Video, Music, FileText, Plus, Heart, MessageCircle, Share2, Bookmark, Settings, Camera as CameraIcon, UserPlus, UserCheck, MapPin, Globe, Calendar, Phone } from 'lucide-react';
import PostDisplay from '@/components/PostDisplay';
import AlbumDisplay from '@/components/AlbumDisplay';
import Popup, { PopupState } from '@/components/Popup';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  workplace?: string;
  country?: string;
  address?: string;
  followers: number;
  following: number;
  followersList: string[];
  followingList: string[];
  isPrivate?: boolean;
  isOnline?: boolean;
  lastSeen?: string;
  isFollowing?: boolean;
  isBlocked?: boolean;
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

interface Album {
  _id: string;
  name: string;
  description?: string;
  media: any[];
  likes: string[];
  comments: any[];
  shares: string[];
  savedBy: string[];
  createdAt: string;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
}

const User1Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
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
    { id: 'albums', label: 'Albums', icon: '📚' },
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
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/register');
        return;
      }

      // Find user by username
      const response = await fetch('http://localhost:5000/api/users/search?q=ahmed_khan', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const users = await response.json();
        const userData = users.find((u: any) => u.username === 'ahmed_khan');
        
        if (userData) {
          // Get detailed user info
          const userResponse = await fetch(`http://localhost:5000/api/users/${userData.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (userResponse.ok) {
            const detailedUser = await userResponse.json();
            setUser(detailedUser);
            setIsFollowing(detailedUser.isFollowing);
            setIsBlocked(detailedUser.isBlocked);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      showPopup('error', 'Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Find user by username first
      const searchResponse = await fetch('http://localhost:5000/api/users/search?q=ahmed_khan', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (searchResponse.ok) {
        const users = await searchResponse.json();
        const userData = users.find((u: any) => u.username === 'ahmed_khan');
        
        if (userData) {
          const postsResponse = await fetch(`http://localhost:5000/api/users/${userData.id}/posts`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (postsResponse.ok) {
            const postsData = await postsResponse.json();
            setPosts(postsData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) return;

      const response = await fetch(`http://localhost:5000/api/users/${user.id}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        showPopup('success', 'Success', isFollowing ? 'Unfollowed successfully' : 'Followed successfully');
        
        // Refresh user data to update follower count
        fetchUserProfile();
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      showPopup('error', 'Error', 'Failed to follow/unfollow user');
    }
  };

  const handleBlock = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) return;

      const response = await fetch(`http://localhost:5000/api/users/${user.id}/block`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsBlocked(!isBlocked);
        showPopup('success', 'Success', isBlocked ? 'Unblocked successfully' : 'Blocked successfully');
      }
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      showPopup('error', 'Error', 'Failed to block/unblock user');
    }
  };

  const handleMessage = () => {
    showPopup('info', 'Message', 'Message feature coming soon!');
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

    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (activeFilter) {
      case 'text':
        filtered = filtered.filter(post => !post.media || post.media.length === 0);
        break;
      case 'photos':
        filtered = filtered.filter(post => 
          post.media && post.media.some(media => media.type === 'image' || media.includes('unsplash'))
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
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h2>
          <p className="text-gray-600">The user profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {user?.isOnline && (
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
                  <p className="text-gray-600">@{user?.username}</p>
                </div>
                
                <div className="flex gap-2">
                  {!isCurrentUser && (
                    <>
                      <button
                        onClick={handleFollow}
                        className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                          isFollowing
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="w-4 h-4 inline mr-2" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 inline mr-2" />
                            Follow
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleMessage}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 inline mr-2" />
                        Message
                      </button>
                    </>
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-4">{user?.bio}</p>

              {/* Stats */}
              <div className="flex gap-6 text-sm text-gray-600">
                <span><strong className="text-gray-900">{user?.followers || 0}</strong> followers</span>
                <span><strong className="text-gray-900">{user?.following || 0}</strong> following</span>
                <span><strong className="text-gray-900">{posts.length}</strong> posts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                      activeFilter === filter.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.icon}
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-6">
              {getFilteredPosts().map((post) => (
                <PostDisplay
                  key={post._id}
                  post={post}
                  onEdit={setEditingPost}
                  onDelete={() => {}}
                  isOwner={isCurrentUser}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About {user?.name}</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{user?.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <a href={user?.website} className="text-blue-500 hover:underline">{user?.website}</a>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Born {user?.dateOfBirth}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{user?.phone}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Friends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(user?.followersList) && user.followersList.length > 0 ? (
                user.followersList.map((followerId, index) => (
                  <div key={followerId} className="flex items-center gap-3 p-3 border rounded-lg">
                    <img
                      src={`/avatars/${(index % 20) + 1}.png`}
                      alt="Friend"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Friend {index + 1}</p>
                      <p className="text-sm text-gray-600">@friend{index + 1}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-600">No friends yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {posts.filter(post => post.media && post.media.length > 0).map((post, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={getMediaUrl(post.media[0])}
                    alt="Post media"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Videos</h2>
            <p className="text-gray-600">No videos yet.</p>
          </div>
        )}

        {activeTab === 'albums' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Albums</h2>
            <p className="text-gray-600">No albums yet.</p>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Posts</h2>
            <p className="text-gray-600">No saved posts yet.</p>
          </div>
        )}
      </div>

      <Popup
        popup={popup}
        onClose={closePopup}
      />
    </div>
  );
};

export default User1Profile; 