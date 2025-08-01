"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Edit, Trash2, MoreVertical, Search, Filter, Camera, Video, Music, FileText, Plus, Heart, MessageCircle, Share2, Bookmark, Settings, Camera as CameraIcon, UserPlus, UserCheck, MapPin, Globe, Calendar, Phone, BarChart3, Users, Clock, Link as LinkIcon, Gift } from 'lucide-react';
import PostDisplay from '@/components/PostDisplay';
import AlbumDisplay from '@/components/AlbumDisplay';
import Popup, { PopupState } from '@/components/Popup';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverPhoto?: string;
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
  posts: number;
  albums: number;
  photos: number;
  videos: number;
  followersList: string[];
  followingList: string[];
  isPrivate?: boolean;
  isOnline?: boolean;
  lastSeen?: string;
  isFollowing?: boolean;
  isBlocked?: boolean;
  isVerified?: boolean;
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

export default function UserProfile() {
  const { userId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [newCoverPhoto, setNewCoverPhoto] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Get the actual userId string
  const actualUserId = Array.isArray(userId) ? userId[0] : userId;

  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: '📝' },
    { id: 'groups', label: 'Groups', icon: '👥' },
    { id: 'likes', label: 'Likes', icon: '❤️' },
    { id: 'following', label: 'Following', count: user?.following || 0 },
    { id: 'followers', label: 'Followers', count: user?.followers || 0 },
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
    if (actualUserId) {
      fetchUserProfile();
      fetchUserContent();
    }
  }, [actualUserId]);

  // Listen for image updates from settings page
  useEffect(() => {
    const handleImagesUpdated = () => {
      console.log('Images updated event received, refreshing profile...');
      fetchUserProfile();
    };

    const handlePrivacySettingsUpdated = () => {
      console.log('Privacy settings updated event received, refreshing profile...');
      fetchUserProfile();
    };

    const handlePasswordChanged = () => {
      console.log('Password changed event received, refreshing profile...');
      fetchUserProfile();
    };

    window.addEventListener('imagesUpdated', handleImagesUpdated);
    window.addEventListener('privacySettingsUpdated', handlePrivacySettingsUpdated);
    window.addEventListener('passwordChanged', handlePasswordChanged);

    return () => {
      window.removeEventListener('imagesUpdated', handleImagesUpdated);
      window.removeEventListener('privacySettingsUpdated', handlePrivacySettingsUpdated);
      window.removeEventListener('passwordChanged', handlePasswordChanged);
    };
  }, []);

  // Listen for profile updates from settings pages
  useEffect(() => {
    const handleProfileUpdated = () => {
      console.log('Profile updated event received in dynamic profile page, refreshing profile...');
      fetchUserProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdated);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdated);
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/register');
        return;
      }

      console.log('Fetching profile for userId:', actualUserId);

      // Handle "me" case - get current user's ID first
      let targetUserId = actualUserId;
      if (actualUserId === 'me') {
        try {
          const currentUserResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/profile/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (currentUserResponse.ok) {
            const currentUser = await currentUserResponse.json();
            targetUserId = currentUser.id;
            // Redirect to the actual user ID to avoid "me" in URL
            router.replace(`/dashboard/profile/${targetUserId}`);
            return;
          } else {
            setError('Failed to get current user information');
            showPopup('error', 'Error', 'Failed to get current user information');
            return;
          }
        } catch (error) {
          console.error('Error fetching current user:', error);
          setError('Failed to get current user information');
          showPopup('error', 'Error', 'Failed to get current user information');
          return;
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/users/${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const userData = await response.json();
          console.log('User data received:', userData);
          setUser(userData);
          setIsFollowing(userData.isFollowing);
          setIsBlocked(userData.isBlocked);
        } else {
          console.error('Response is not JSON:', await response.text());
          setError('Invalid response format from server');
          showPopup('error', 'Error', 'Invalid response format from server');
        }
        
        // Check if this is the current user's profile
        const currentUserResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/profile/me`, { 
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (currentUserResponse.ok) {
          const contentType = currentUserResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const currentUser = await currentUserResponse.json();
            setIsCurrentUser(currentUser.id === actualUserId);
          }
        }
      } else {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error('Profile fetch error:', errorData);
          setError(errorData.error || 'User not found');
          showPopup('error', 'Error', errorData.error || 'User not found');
        } else {
          const errorText = await response.text();
          console.error('Profile fetch error (non-JSON):', errorText);
          setError('User not found');
          showPopup('error', 'Error', 'User not found');
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
      showPopup('error', 'Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserContent = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Skip content fetching if userId is "me" (will be handled after redirect)
      if (actualUserId === 'me') return;
      
      // Fetch posts
      const postsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/users/${actualUserId}/posts`, { 
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (postsResponse.ok) {
        const contentType = postsResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const postsData = await postsResponse.json();
          setPosts(postsData);
        }
      }

      // Fetch albums
      const albumsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/users/${actualUserId}/albums`, { 
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (albumsResponse.ok) {
        const contentType = albumsResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const albumsData = await albumsResponse.json();
          setAlbums(albumsData);
        }
      }
    } catch (error) {
      console.error('Error fetching user content:', error);
    }
  };

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/users/${user.id}/follow`, { 
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/users/${user.id}/block`, { 
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

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setEditContent(post.content);
    setShowEditModal(true);
  };

  const handleEditProfile = () => {
    if (user) {
      router.push(`/dashboard/settings/profile`);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewAvatar(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCoverPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = async () => {
    if (!newAvatar) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const formData = new FormData();
      formData.append('profilePhoto', newAvatar);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/upload/profile-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        showPopup('success', 'Success', 'Profile picture updated successfully');
        setNewAvatar(null);
        setAvatarPreview('');
        fetchUserProfile(); // Refresh user data
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('imagesUpdated'));
      } else {
        const errorData = await response.json();
        showPopup('error', 'Error', errorData.error || 'Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      showPopup('error', 'Error', 'Failed to update profile picture');
    }
  };

  const handleSaveCoverPhoto = async () => {
    if (!newCoverPhoto) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const formData = new FormData();
      formData.append('coverPhoto', newCoverPhoto);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/upload/cover-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        showPopup('success', 'Success', 'Cover photo updated successfully');
        setNewCoverPhoto(null);
        setCoverPreview('');
        fetchUserProfile(); // Refresh user data
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('imagesUpdated'));
      } else {
        const errorData = await response.json();
        showPopup('error', 'Error', errorData.error || 'Failed to update cover photo');
      }
    } catch (error) {
      console.error('Error updating cover photo:', error);
      showPopup('error', 'Error', 'Failed to update cover photo');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setPosts(posts.filter(post => post._id !== postId));
        showPopup('success', 'Success', 'Post deleted successfully');
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
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${editingPost._id}`, { 
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editContent })
      });

      if (response.ok) {
        setPosts(posts.map(post => 
          post._id === editingPost._id 
            ? { ...post, content: editContent }
            : post
        ));
        setShowEditModal(false);
        setEditingPost(null);
        setEditContent('');
        showPopup('success', 'Success', 'Post updated successfully');
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
    if (!url) return '/default-avatar.png';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${url}`;
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

  const getLastSeenText = (lastSeen?: string) => {
    if (!lastSeen) return '21 hrs';
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hrs`;
    return `${Math.floor(diffInHours / 24)} days`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Loading Profile...</h2>
          <p className="text-gray-600 text-sm sm:text-base">Fetching user data and posts</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4">
            {error ? 'Error Loading Profile' : 'User Not Found'}
          </h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            {error || "The user profile you're looking for doesn't exist."}
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = '/dashboard/profile/users'}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
            >
              Browse All Users
            </button>
            <button 
              onClick={() => window.history.back()}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
      {/* Cover Photo Section */}
      <div className="relative h-32 sm:h-48 md:h-64 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 overflow-hidden">
        <img
          src={coverPreview || getMediaUrl(user.coverPhoto || '')}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {isCurrentUser && (
          <>
            <label className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center cursor-pointer hover:bg-opacity-50 transition-colors">
              <div className="text-white text-center">
                <CameraIcon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2" />
                <span className="text-sm sm:text-base font-medium">Click to Change Cover Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverPhotoUpload}
                  className="hidden"
                />
              </div>
            </label>
            {newCoverPhoto && (
              <button
                onClick={handleSaveCoverPhoto}
                className="absolute top-4 right-4 w-8 h-8 sm:w-10 sm:h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg"
                title="Save cover photo"
              >
                ✓
              </button>
            )}
          </>
        )}
        {/* Particle effect overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 1px, transparent 1px),
                           radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 1px, transparent 1px),
                           radial-gradient(circle at 40% 40%, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '100px 100px, 80px 80px, 60px 60px'
        }}></div>
      </div>

      {/* Profile Header */}
      <div className="relative px-3 pb-4 -mt-12 sm:-mt-20">
        <div className="w-full">
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="flex flex-col items-center gap-3 w-full">
              {/* Profile Picture */}
              <div className="relative">
                <img
                  src={avatarPreview || getMediaUrl(user.avatar)}
                  alt={user.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl object-cover bg-gray-200"
                />
                {isCurrentUser && (
                  <>
                    <label className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors shadow-lg">
                      <CameraIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                    {newAvatar && (
                      <button
                        onClick={handleSaveAvatar}
                        className="absolute top-1 right-1 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg text-xs"
                        title="Save profile picture"
                      >
                        ✓
                      </button>
                    )}
                  </>
                )}
                {user.isOnline && (
                  <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 w-3 h-3 sm:w-5 sm:h-5 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              {/* User Info */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{user.name}</h1>
                  {user.isVerified && (
                    <div className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                      PRO
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-sm sm:text-base mb-2">@{user.username}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1 flex-wrap justify-center">
              {!isCurrentUser ? (
                <>
                  <button className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleMessage}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                  <button 
                    onClick={handleFollow}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                      isFollowing 
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </>
              ) : (
                <>
                  <button className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors">
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                    <FileText className="w-4 h-4" />
                    <span>Activities</span>
                  </button>
                  {isCurrentUser && (
                    <button 
                      onClick={handleEditProfile}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex sm:hidden gap-2 w-full max-w-xs">
              {!isCurrentUser ? (
                <>
                  <button 
                    onClick={handleMessage}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                  <button 
                    onClick={handleFollow}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                      isFollowing 
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-12 sm:top-16 z-40">
        <div className="w-full px-3">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 sm:gap-2 py-3 px-3 sm:px-4 border-b-2 transition-colors whitespace-nowrap min-w-fit ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className="text-xs sm:text-sm font-medium">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="bg-gray-200 text-gray-600 px-1 sm:px-2 py-0.5 rounded-full text-xs">
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

                {/* User Stats */}
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{getLastSeenText(user.lastSeen)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>{user.following || 0} Following</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>{user.followers || 0} Followers</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span>{posts.length} posts</span>
                  </div>
                  {user.website && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <LinkIcon className="w-4 h-4 flex-shrink-0" />
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline truncate">
                        {user.website.replace('https://', '').replace('http://', '')}
                      </a>
                    </div>
                  )}
                  {user.gender && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>👤</span>
                      <span>{user.gender}</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Living in {user.location}</span>
                    </div>
                  )}
                </div>

                {/* Profile Picture */}
                <div className="pt-4 border-t">
                  <img
                    src={getMediaUrl(user.avatar)}
                    alt={user.name}
                    className="w-full h-32 sm:h-40 lg:h-48 object-cover rounded-lg"
                  />
                </div>
              </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-xl shadow-sm p-3">
              <div className="flex border-b -mb-3 overflow-x-auto scrollbar-hide">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex items-center gap-1 px-3 py-2 text-sm transition-colors whitespace-nowrap ${
                      activeFilter === filter.id
                        ? 'text-blue-600 border-b-2 border-blue-500 -mb-px'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {filter.icon}
                    <span>{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* User Bio Card */}
            {user.bio && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={getMediaUrl(user.avatar)}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{user.name}</h3>
                      {user.isVerified && (
                        <div className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium flex-shrink-0">
                          PRO
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">1 w</p>
                    <p className="text-gray-800 text-sm">{user.bio}</p>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Posts */}
            {getFilteredPosts().length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="text-gray-400 mb-3">
                  <FileText className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {searchQuery ? 'Try adjusting your search terms' : 'No posts to display.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredPosts().map((post) => (
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
                      showEditDelete={isCurrentUser}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Other tabs content */}
        {activeTab === 'photos' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Photos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
              {posts.filter(post => post.media && post.media.length > 0).map((post, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={getMediaUrl(post.media[0])}
                    alt="Post media"
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Videos</h2>
            <p className="text-gray-600 text-sm sm:text-base">No videos yet.</p>
          </div>
        )}

        {activeTab === 'following' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Following ({user.following || 0})</h2>
            <p className="text-gray-600 text-sm sm:text-base">Following list coming soon!</p>
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Followers ({user.followers || 0})</h2>
            <p className="text-gray-600 text-sm sm:text-base">Followers list coming soon!</p>
          </div>
        )}

        {activeTab !== 'timeline' && activeTab !== 'photos' && activeTab !== 'videos' && activeTab !== 'following' && activeTab !== 'followers' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">This section is coming soon!</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {/* Removed floating action button */}

      {/* Edit Post Modal */}
      {showEditModal && editingPost && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
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

      {/* Edit Profile Modal */}
      {/* Removed Edit Profile Modal */}

      {/* Popup */}
      <Popup popup={popup} onClose={closePopup} />


    </div>
  );
}