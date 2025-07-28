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
  followers: string[];
  following: string[];
  isPrivate?: boolean;
  isOnline?: boolean;
  lastSeen?: string;
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

const User7Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>({
    id: 'user7',
    name: 'Bilal Hassan',
    username: 'bilal_hassan',
    avatar: '/avatars/7.png.png',
    email: 'bilal.hassan@email.com',
    bio: 'Music Producer | DJ | Sound Engineer 🎵',
    location: 'Rawalpindi, Pakistan',
    website: 'https://bilalmusic.com',
    phone: '+92-306-7890123',
    dateOfBirth: '1992-04-25',
    gender: 'Male',
    workplace: 'Studio 7 Productions',
    country: 'Pakistan',
    address: 'Saddar, Rawalpindi',
    followers: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6'],
    following: ['user1', 'user2', 'user3'],
    isPrivate: false,
    isOnline: true,
    lastSeen: new Date().toISOString()
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
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

  // Sample posts for user7
  const samplePosts: Post[] = [
    {
      _id: 'post13',
      content: 'New track dropping next week! 🎧 Been working on this for months and I\'m so excited to share it with you all. #newmusic #producer #electronic',
      media: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500'],
      likes: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6'],
      comments: [],
      shares: [],
      views: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6'],
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      user: {
        name: 'Bilal Hassan',
        avatar: '/avatars/7.png.png',
        userId: 'user7'
      }
    },
    {
      _id: 'post14',
      content: 'Studio session with some amazing artists today! 🎤 The energy in the room was incredible. Can\'t wait to finish these collaborations. #studio #collaboration #music',
      media: [],
      likes: ['user1', 'user2', 'user3', 'user4'],
      comments: [],
      shares: [],
      views: ['user1', 'user2', 'user3', 'user4', 'user5'],
      createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
      user: {
        name: 'Bilal Hassan',
        avatar: '/avatars/7.png.png',
        userId: 'user7'
      }
    }
  ];

  useEffect(() => {
    setPosts(samplePosts);
  }, []);

  const handleFollow = async () => {
    setIsFollowing(!isFollowing);
    showPopup('success', 'Success', isFollowing ? 'Unfollowed successfully' : 'Followed successfully');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
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
      <div className="bg-gradient-to-r from-indigo-400 to-purple-500">
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
            <div className="flex-1 text-white">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{user?.name}</h1>
                  <p className="text-indigo-100">@{user?.username}</p>
                </div>
                
                <div className="flex gap-2">
                  {!isCurrentUser && (
                    <>
                      <button
                        onClick={handleFollow}
                        className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                          isFollowing
                            ? 'bg-white text-indigo-600 hover:bg-gray-100'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
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
                        className="px-6 py-2 bg-white bg-opacity-20 text-white rounded-full font-semibold hover:bg-opacity-30 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 inline mr-2" />
                        Message
                      </button>
                    </>
                  )}
                </div>
              </div>

              <p className="mb-4">{user?.bio}</p>

              {/* Stats */}
              <div className="flex gap-6 text-sm text-indigo-100">
                <span><strong className="text-white">{user?.followers.length}</strong> followers</span>
                <span><strong className="text-white">{user?.following.length}</strong> following</span>
                <span><strong className="text-white">{posts.length}</strong> posts</span>
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
                    ? 'border-indigo-500 text-indigo-600'
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                      activeFilter === filter.id
                        ? 'bg-indigo-500 text-white'
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
                  onEdit={() => {}}
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
                <MapPin className="w-5 h-5 text-indigo-400" />
                <span className="text-gray-700">{user?.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-indigo-400" />
                <a href={user?.website} className="text-indigo-500 hover:underline">{user?.website}</a>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <span className="text-gray-700">Born {user?.dateOfBirth}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-indigo-400" />
                <span className="text-gray-700">{user?.phone}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Friends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user?.followers.map((followerId, index) => (
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
              ))}
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

export default User7Profile; 