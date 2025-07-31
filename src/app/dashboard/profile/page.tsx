"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, MoreVertical, Search, Filter, Camera, Video, Music, FileText, Plus, Heart, MessageCircle, Share2, Bookmark, Settings, Camera as CameraIcon, MapPin, Globe, Calendar, Users, Eye, ThumbsUp } from 'lucide-react';
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
  workplace?: string;
  address?: string;
  country?: string;
  isOnline?: boolean;
  joinedDate?: string;
}

interface UserImages {
  avatar: string | null;
  cover: string | null;
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

interface ProfileCompletion {
  profilePicture: boolean;
  name: boolean;
  workplace: boolean;
  country: boolean;
  address: boolean;
}

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userImages, setUserImages] = useState<UserImages>({ avatar: null, cover: null });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion>({
    profilePicture: false,
    name: false,
    workplace: false,
    country: false,
    address: false
  });
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editingProfile, setEditingProfile] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    workplace: '',
    address: '',
    country: ''
  });
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: '📝' },
    { id: 'groups', label: 'Groups', icon: '👥' },
    { id: 'likes', label: 'Likes', icon: '👍' },
    { id: 'following', label: 'Following', icon: '➕', count: user?.following?.length || 0 },
    { id: 'followers', label: 'Followers', icon: '👥', count: user?.followers?.length || 0 },
    { id: 'photos', label: 'Photos', icon: '📷' },
    { id: 'videos', label: 'Videos', icon: '🎥' },
    { id: 'reels', label: 'Reels', icon: '🎬' },
    { id: 'products', label: 'Products', icon: '🛍️' }
  ];

  const filters = [
    { id: 'all', label: 'All', icon: <Filter className="w-3 h-3 sm:w-4 sm:h-4" /> },
    { id: 'text', label: 'Text', icon: <FileText className="w-3 h-3 sm:w-4 sm:h-4" /> },
    { id: 'photos', label: 'Photos', icon: <CameraIcon className="w-3 h-3 sm:w-4 sm:h-4" /> },
    { id: 'videos', label: 'Videos', icon: <Video className="w-3 h-3 sm:w-4 sm:h-4" /> },
    { id: 'sounds', label: 'Sounds', icon: <Music className="w-3 h-3 sm:w-4 sm:h-4" /> }
  ];

  useEffect(() => {
    fetchUserProfile();
    fetchUserImages();
    fetchUserPosts();
    
    // Listen for post creation events to refresh posts
    const handlePostCreated = () => {
      fetchUserPosts();
    };

    // Listen for post deletion events
    const handlePostDeleted = () => {
      fetchUserPosts();
    };

    // Listen for image updates
    const handleImagesUpdated = () => {
      fetchUserImages();
    };
    
    window.addEventListener('postCreated', handlePostCreated);
    window.addEventListener('postDeleted', handlePostDeleted);
    window.addEventListener('imagesUpdated', handleImagesUpdated);
    
    return () => {
      window.removeEventListener('postCreated', handlePostCreated);
      window.removeEventListener('postDeleted', handlePostDeleted);
      window.removeEventListener('imagesUpdated', handleImagesUpdated);
    };
  }, []);

  useEffect(() => {
    if (user) {
      calculateProfileCompletion();
      setEditingProfile({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        workplace: user.workplace || '',
        address: user.address || '',
        country: user.country || ''
      });
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/register');
        return;
      }

      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/profile/me', { 
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

  const fetchUserImages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/userimages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const imagesData = await response.json();
        setUserImages(imagesData);
      }
    } catch (error) {
      console.error('Error fetching user images:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/profile/posts', {  
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

  const calculateProfileCompletion = () => {
    if (!user) return;
    
    setProfileCompletion({
      profilePicture: !!user.avatar && user.avatar !== '',
      name: !!user.name && user.name.trim() !== '',
      workplace: !!user.workplace && user.workplace.trim() !== '',
      country: !!user.country && user.country.trim() !== '',
      address: !!user.address && user.address.trim() !== ''
    });
  };

  const updateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/profile/update', { 
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingProfile)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setShowProfileEdit(false);
        showPopup('success', 'Profile Updated', 'Your profile has been updated successfully!');
      } else {
        showPopup('error', 'Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showPopup('error', 'Error', 'Failed to update profile');
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/posts/${postId}`, { 
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/posts/${editingPost._id}`, { 
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
    if (!url) return '/default-avatar.png';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}${url}`;
  };

  const getCompletionPercentage = () => {
    const completed = Object.values(profileCompletion).filter(Boolean).length;
    return Math.round((completed / Object.keys(profileCompletion).length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 text-sm sm:text-base">User not found</p>
        </div>
      </div>
    );
  }

  const filteredPosts = getFilteredPosts();

  return (
    <div className="w-full min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
      {/* Cover Photo Section */}
      <div className="relative h-32 sm:h-48 md:h-64 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 overflow-hidden">
        {userImages.cover ? (
          <img 
            src={getMediaUrl(userImages.cover)} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          /* Particle effect overlay */
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 1px, transparent 1px),
                             radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 1px, transparent 1px),
                             radial-gradient(circle at 40% 40%, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '100px 100px, 80px 80px, 60px 60px'
          }}></div>
        )}
      
        {/* Cover actions */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2">
          <button className="px-2 py-1 sm:px-3 sm:py-2 bg-black bg-opacity-20 text-white rounded-lg backdrop-blur-sm hover:bg-opacity-30 transition-all flex items-center gap-1 text-xs sm:text-sm">
            <CameraIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Cover</span>
          </button>
          <button className="p-1 sm:p-2 bg-black bg-opacity-20 text-white rounded-lg backdrop-blur-sm hover:bg-opacity-30 transition-all">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="relative px-3 pb-4 -mt-12 sm:-mt-20">
        <div className="w-full max-w-full">
          {/* Profile Picture and Actions */}
          <div className="flex flex-col items-center gap-3 mb-4">
            {/* Profile Picture */}
            <div className="relative">
              <img
                src={userImages.avatar ? getMediaUrl(userImages.avatar) : getMediaUrl(user.avatar)}
                alt={user.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl object-cover bg-gray-200"
              />
              <button className="absolute bottom-1 right-1 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-gray-700 transition-colors">
                <CameraIcon className="w-3 h-3" />
              </button>
              {user.isOnline && (
                <div className="absolute bottom-3 right-3 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>

            {/* User Info */}
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 break-words">{user.name}</h1>
              <p className="text-gray-600 text-sm sm:text-base mb-2">@{user.username}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1 flex-wrap justify-center">
              <button className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setShowProfileEdit(true)}
                className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                <Eye className="w-4 h-4" />
                <span>Activities</span>
              </button>
            </div>
          </div>

          {/* User Details */}
          <div className="mb-4 text-center">
            {user.bio && (
              <p className="text-gray-700 mb-3 text-sm sm:text-base max-w-full mx-auto px-2">{user.bio}</p>
            )}

            <div className="flex flex-wrap gap-1 text-xs sm:text-sm text-gray-600 mb-3 justify-center px-2">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3 flex-shrink-0" />
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                    {user.website}
                  </a>
                </div>
              )}
              {user.joinedDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span>Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
              <div className="bg-white border-b sticky top-0 z-30">
        <div className="w-full px-3">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap min-w-fit ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-3 py-4">
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {/* Profile Completion Card */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Profile Completion</h3>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Complete your profile</span>
                  <span className="text-sm font-medium text-gray-900">{getCompletionPercentage()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getCompletionPercentage()}%` }}
                  ></div>
                </div>
              </div>

                             {/* Completion Items */}
               <div className="grid grid-cols-1 gap-2 text-xs">
                <div className={`flex items-center gap-2 px-2 py-1.5 rounded-full ${
                  profileCompletion.profilePicture 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    profileCompletion.profilePicture ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className={`truncate ${profileCompletion.profilePicture ? 'line-through' : ''}`}>
                    Add profile picture
                  </span>
                </div>

                <div className={`flex items-center gap-2 px-2 py-1.5 rounded-full ${
                  profileCompletion.name 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    profileCompletion.name ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className={`truncate ${profileCompletion.name ? 'line-through' : ''}`}>
                    Add your name
                  </span>
                </div>

                <div className={`flex items-center gap-2 px-2 py-1.5 rounded-full ${
                  profileCompletion.workplace 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    profileCompletion.workplace ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className={`truncate ${profileCompletion.workplace ? 'line-through' : ''}`}>
                    Add workplace
                  </span>
                </div>

                <div className={`flex items-center gap-2 px-2 py-1.5 rounded-full ${
                  profileCompletion.country 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    profileCompletion.country ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className={`truncate ${profileCompletion.country ? 'line-through' : ''}`}>
                    Add country
                  </span>
                </div>

                                 <div className={`flex items-center gap-2 px-2 py-1.5 rounded-full ${
                   profileCompletion.address 
                     ? 'bg-green-100 text-green-700' 
                     : 'bg-gray-100 text-gray-600'
                 }`}>
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    profileCompletion.address ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className={`truncate ${profileCompletion.address ? 'line-through' : ''}`}>
                    Add your address
                  </span>
                </div>
              </div>
            </div>

            {/* Content Layout */}
            <div className="space-y-4">
              {/* Search and Stats */}
              <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
                {/* Search Box */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>

                                 {/* Stats */}
                 <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>{user.following?.length || 0} Following</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>{user.followers?.length || 0} Followers</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span>{posts.length} posts</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{user.location || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-4">
                                 {/* Post Creation */}
                 <div className="bg-white rounded-xl shadow-sm p-3">
                   <div className="flex items-center gap-2">
                    <img
                      src={getMediaUrl(user.avatar)}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                                         <div className="flex-1 min-w-0">
                       <input
                         type="text"
                         placeholder="What's going on? #Hashtag.. @Mention.. Link.."
                         className="w-full px-3 py-2 bg-gray-100 rounded-full focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                         onClick={() => router.push('/dashboard')}
                         readOnly
                       />
                     </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                        <Video className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg">
                        <CameraIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex mt-3 border-b overflow-x-auto scrollbar-hide">
                    {filters.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`flex items-center gap-1 px-3 py-2 text-sm transition-colors whitespace-nowrap ${
                          activeFilter === filter.id
                            ? 'text-blue-600 border-b-2 border-blue-500'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {filter.icon}
                        <span>{filter.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Posts */}
                {filteredPosts.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <div className="text-gray-400 mb-3">
                      <FileText className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      {searchQuery ? 'Try adjusting your search terms' : 'Start sharing your thoughts!'}
                    </p>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      Create Post
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
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
            </div>
          </div>
        )}

        {/* Other Tabs */}
        {activeTab !== 'timeline' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h3>
            <p className="text-gray-600 text-sm">This section is coming soon!</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => router.push('/dashboard')}
        className="fixed bottom-20 right-4 w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-50"
      >
        <Plus className="w-5 h-5" />
      </button>

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Edit Profile</h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingProfile.name}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={editingProfile.bio}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={editingProfile.location}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={editingProfile.website}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Workplace</label>
                <input
                  type="text"
                  value={editingProfile.workplace}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, workplace: e.target.value }))}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={editingProfile.country}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={editingProfile.address}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="flex space-x-2 sm:space-x-3 mt-4 sm:mt-6">
              <button
                onClick={() => setShowProfileEdit(false)}
                className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={updateProfile}
                className="flex-1 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {showEditModal && editingPost && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Edit Post</h3>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-24 sm:h-32 p-2 sm:p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base"
              placeholder="What's on your mind?"
            />
            <div className="flex space-x-2 sm:space-x-3 mt-3 sm:mt-4">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPost(null);
                  setEditContent('');
                }}
                className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
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