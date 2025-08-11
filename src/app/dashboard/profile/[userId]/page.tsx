"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Edit, Trash2, MoreVertical, Search, Filter, Camera, Video, Music, FileText, Plus, Heart, MessageCircle, Share2, Bookmark, Settings, Camera as CameraIcon, MapPin, Globe, Calendar, Users, Eye, ThumbsUp, X, ShoppingBag, UserPlus, UserCheck, Phone, BarChart3, Clock, Link as LinkIcon, Gift } from 'lucide-react';
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
  isFollowing?: boolean;
  isBlocked?: boolean;
  isVerified?: boolean;
  lastSeen?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
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

interface Album {
  _id: string;
  name: string;
  media: any[];
  createdAt: string;
  user: string;
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

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: string;
  category: string;
  location: string;
  imageUrl?: string;
  totalItemUnits: number;
  seller: {
    _id: string;
    name: string;
    username?: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const UserProfile: React.FC = () => {
  const { userId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userImages, setUserImages] = useState<UserImages>({
    avatar: null,
    cover: null
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postMedia, setPostMedia] = useState<File[]>([]);
  const [postMediaUrls, setPostMediaUrls] = useState<string[]>([]);
  const [creatingPost, setCreatingPost] = useState(false);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Tabs configuration
  const tabs = [
    { id: 'timeline', label: 'Timeline', count: posts.length },
    { id: 'albums', label: 'Albums', count: albums.length },
    { id: 'groups', label: 'Groups', count: groups.length },
    { id: 'products', label: 'Products', count: products.length }
  ];

  // Filters configuration
  const filters = [
    { id: 'all', label: 'All Posts', icon: <FileText className="w-4 h-4" /> },
    { id: 'photos', label: 'Photos', icon: <Camera className="w-4 h-4" /> },
    { id: 'videos', label: 'Videos', icon: <Video className="w-4 h-4" /> },
    { id: 'text', label: 'Text Only', icon: <FileText className="w-4 h-4" /> }
  ];

  // Get the actual userId string
  const actualUserId = Array.isArray(userId) ? userId[0] : userId;

  useEffect(() => {
    if (actualUserId) {
      fetchUserProfile();
      fetchUserImages();
      fetchUserContent();
      fetchUserAlbums();
      fetchUserGroups();
      fetchUserProducts();
    }
  }, [actualUserId]);

  // Event listeners for updates
  useEffect(() => {
    const handleImagesUpdated = () => {
      fetchUserImages();
    };

    const handlePrivacySettingsUpdated = () => {
      fetchUserProfile();
    };

    const handlePasswordChanged = () => {
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
      fetchUserProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdated);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdated);
    };
  }, []);

  // Add missing event handlers
  const handlePostCreated = () => {
    fetchUserContent();
  };

  const handlePostDeleted = () => {
    fetchUserContent();
  };

  const handlePostUpdated = () => {
    fetchUserContent();
  };

  const handleAlbumCreated = () => {
    fetchUserAlbums();
  };

  const handleAlbumUpdated = () => {
    fetchUserAlbums();
  };

  const handleAlbumDeleted = () => {
    fetchUserAlbums();
  };

  const handleGroupCreated = () => {
    fetchUserGroups();
  };

  const handleGroupUpdated = () => {
    fetchUserGroups();
  };

  const handleGroupDeleted = () => {
    fetchUserGroups();
  };

  const handleProductCreated = () => {
    fetchUserProducts();
  };

  const handleProductUpdated = () => {
    fetchUserProducts();
  };

  const handleProductDeleted = () => {
    fetchUserProducts();
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/register');
        return;
      }

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
          const userData = await response.json();
          setUser(userData);
          setIsFollowing(userData.isFollowing);
          setIsBlocked(userData.isBlocked);
        
        // Check if this is the current user's profile
        const currentUserResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/profile/me`, { 
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (currentUserResponse.ok) {
            const currentUser = await currentUserResponse.json();
            setIsCurrentUser(currentUser.id === actualUserId);
        }
      } else {
          const errorData = await response.json();
        setError(errorData.error || 'Failed to load user profile');
        showPopup('error', 'Error', errorData.error || 'Failed to load user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
      showPopup('error', 'Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserImages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/userimages/${actualUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserImages(data);
      }
    } catch (error) {
      console.error('Error fetching user images:', error);
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
          const postsData = await postsResponse.json();
          setPosts(postsData);
        }
    } catch (error) {
      console.error('Error fetching user content:', error);
    }
  };

  const fetchUserAlbums = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/users/${actualUserId}/albums`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAlbums(data);
      }
    } catch (error) {
      console.error('Error fetching user albums:', error);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/groups/user/${actualUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  };

  const fetchUserProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/users/${actualUserId}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching user products:', error);
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
        fetchUserProfile();
      }
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      showPopup('error', 'Error', 'Failed to block/unblock user');
    }
  };

  const handleMessage = () => {
    // Navigate to messages or open chat
    router.push(`/dashboard/messages/${user?.id}`);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setEditContent(post.content);
    setShowEditModal(true);
  };

  const handleEditProfile = () => {
    router.push('/dashboard/settings/profile');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCoverPhoto(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveAvatar = async () => {
    if (!newAvatar) return;
    
    try {
      setUploadingAvatar(true);
      const token = localStorage.getItem('token');
      if (!token) {
        showPopup('error', 'Authentication Error', 'Please log in again');
        return;
      }

      const formData = new FormData();
      formData.append('avatar', newAvatar);

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/userimages/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setUserImages(prev => ({
          ...prev,
          avatar: data.avatar
        }));
        setNewAvatar(null);
        setAvatarPreview('');
        showPopup('success', 'Avatar Updated!', 'Your profile picture has been updated successfully!');
        window.dispatchEvent(new CustomEvent('profileUpdated'));
        fetchUserImages();
      } else {
        const errorData = await response.json();
        showPopup('error', 'Upload Failed', errorData.error || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showPopup('error', 'Upload Failed', 'Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveCoverPhoto = async () => {
    if (!newCoverPhoto) return;
    
    try {
      setUploadingCover(true);
      const token = localStorage.getItem('token');
      if (!token) {
        showPopup('error', 'Authentication Error', 'Please log in again');
        return;
      }

      const formData = new FormData();
      formData.append('cover', newCoverPhoto);

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/userimages/cover`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setUserImages(prev => ({
          ...prev,
          cover: data.cover
        }));
        setNewCoverPhoto(null);
        setCoverPreview('');
        showPopup('success', 'Cover Updated!', 'Your cover photo has been updated successfully!');
        fetchUserImages();
      } else {
        const errorData = await response.json();
        showPopup('error', 'Upload Failed', errorData.error || 'Failed to upload cover photo');
      }
    } catch (error) {
      console.error('Error uploading cover photo:', error);
      showPopup('error', 'Upload Failed', 'Failed to upload cover photo. Please try again.');
    } finally {
      setUploadingCover(false);
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
        showPopup('success', 'Post Deleted', 'Post has been deleted successfully');
        fetchUserContent();
      } else {
        showPopup('error', 'Delete Failed', 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showPopup('error', 'Delete Failed', 'Failed to delete post');
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
        showPopup('success', 'Post Updated', 'Post has been updated successfully');
        setShowEditModal(false);
        setEditingPost(null);
        setEditContent('');
        fetchUserContent();
      } else {
        showPopup('error', 'Update Failed', 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      showPopup('error', 'Update Failed', 'Failed to update post');
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
      case 'photos':
        filtered = filtered.filter(post => 
          post.media && post.media.some(media => media.type?.startsWith('image/'))
        );
        break;
      case 'videos':
        filtered = filtered.filter(post => 
          post.media && post.media.some(media => media.type?.startsWith('video/'))
        );
        break;
      case 'text':
        filtered = filtered.filter(post => 
          !post.media || post.media.length === 0
        );
        break;
    }

    return filtered;
  };

  const getMediaUrl = (url: string) => {
    if (!url) return '/default-avatar.svg';
    if (url.startsWith('http')) return url;
    
    // Handle localhost URLs that might be stored incorrectly
    if (url.includes('localhost:3000')) {
              const correctedUrl = url.replace('http://localhost:3000', 'https://jaifriend-backend-production.up.railway.app');
      console.log('🔗 getMediaUrl - Fixed localhost URL:', { original: url, corrected: correctedUrl });
      return correctedUrl;
    }
    
    // Handle hardcoded placeholder avatars that don't exist
    if (url.includes('/avatars/') || url.includes('/covers/')) {
      console.log('🔗 getMediaUrl - Placeholder avatar detected:', url);
      return '/default-avatar.svg';
    }
    
          return `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}${url}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getLastSeenText = (lastSeen?: string) => {
    if (!lastSeen) return 'Online';
    
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newMedia = [...postMedia, ...files];
    setPostMedia(newMedia);

    // Create preview URLs
    const newUrls = files.map(file => URL.createObjectURL(file));
    setPostMediaUrls(prev => [...prev, ...newUrls]);
  };

  const removeMedia = (index: number) => {
    setPostMedia(prev => prev.filter((_, i) => i !== index));
    setPostMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const createPost = async () => {
    if ((!postContent.trim() && postMedia.length === 0) || creatingPost) return;

    try {
      setCreatingPost(true);
      const token = localStorage.getItem('token');
      if (!token) {
        showPopup('error', 'Authentication Error', 'Please log in again');
        return;
      }

      const formData = new FormData();
      formData.append('content', postContent);
      
      postMedia.forEach((file, index) => {
        formData.append('media', file);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        showPopup('success', 'Post Created!', 'Your post has been created successfully!');
        resetPostForm();
        fetchUserContent();
      } else {
        const errorData = await response.json();
        showPopup('error', 'Post Failed', errorData.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      showPopup('error', 'Post Failed', 'Failed to create post. Please try again.');
    } finally {
      setCreatingPost(false);
    }
  };

  const resetPostForm = () => {
    setPostContent('');
    setPostMedia([]);
    setPostMediaUrls([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center p-4 transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center p-4 transition-colors duration-200">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">User not found</p>
        </div>
      </div>
    );
  }

  const filteredPosts = getFilteredPosts();

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-dark-900 overflow-x-hidden max-w-full transition-colors duration-200 pb-4 sm:pb-6">
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
      
        {/* Cover actions - only show for current user */}
        {isCurrentUser && (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2">
            <label className="px-2 py-1 sm:px-3 sm:py-2 bg-black bg-opacity-20 text-white rounded-lg backdrop-blur-sm hover:bg-opacity-30 transition-all flex items-center gap-1 text-xs sm:text-sm cursor-pointer">
              <span className="text-sm">📷</span>
              <span className="hidden xs:inline">Cover</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverPhotoUpload}
                  className="hidden"
                />
            </label>
            <button className="p-1 sm:p-2 bg-black bg-opacity-20 text-white rounded-lg backdrop-blur-sm hover:bg-opacity-30 transition-all">
              <span className="text-sm">➕</span>
              </button>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="relative px-3 pb-4 -mt-12 sm:-mt-20">
        <div className="w-full max-w-full">
          {/* Profile Picture and Actions */}
          <div className="flex flex-col items-center gap-3 mb-4">
              {/* Profile Picture */}
              <div className="relative">
                <img
                src={(() => {
                  const finalSrc = avatarPreview || (userImages.avatar ? getMediaUrl(userImages.avatar) : (user.avatar && user.avatar !== '/avatars/1.png.png' ? getMediaUrl(user.avatar) : '/avatars/1.png.png'));
                  return finalSrc;
                })()}
                  alt={user.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl object-cover bg-gray-200"
                />
                {isCurrentUser && (
                <label className="absolute bottom-1 right-1 w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors shadow-lg">
                  {uploadingAvatar ? (
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="text-sm">📷</span>
                  )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                    disabled={uploadingAvatar}
                      />
                    </label>
                )}
                {user.isOnline && (
                <div className="absolute bottom-3 right-3 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              {/* User Info */}
              <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 break-words">{user.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-2">@{user.username}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1 flex-wrap justify-center">
              {!isCurrentUser && (
                <>
                  <button 
                    onClick={handleFollow}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                      isFollowing 
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    <span>{isFollowing ? 'Following' : 'Follow'}</span>
                  </button>
                  <button 
                    onClick={handleMessage}
                    className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                  <button 
                    onClick={handleBlock}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                      isBlocked 
                        ? 'bg-red-200 text-red-700 hover:bg-red-300' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <span>{isBlocked ? 'Unblock' : 'Block'}</span>
                  </button>
                </>
              )}
              {isCurrentUser && (
                <>
                  <button className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                    <button 
                      onClick={handleEditProfile}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4" />
                    <span>Edit</span>
                    </button>
                  <button className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                    <Eye className="w-4 h-4" />
                    <span>Activities</span>
                  </button>
                </>
              )}
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
                {/* Post Creation - only show for current user */}
                {isCurrentUser && (
                  <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center gap-3">
                  <img
                    src={getMediaUrl(user.avatar)}
                    alt={user.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          placeholder="What's going on? #Hashtag.. @Mention.. Link.."
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-colors"
                  />
                </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                          <button 
                            onClick={() => document.getElementById('photo-upload')?.click()}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Add photo"
                          >
                            <CameraIcon className="w-4 h-4" />
                          </button>
                          <div className="w-px bg-gray-300"></div>
                          <button 
                            onClick={() => document.getElementById('video-upload')?.click()}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Add video"
                          >
                            <Video className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={createPost}
                          disabled={(!postContent.trim() && postMedia.length === 0) || creatingPost}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
                        >
                          {creatingPost ? 'Posting...' : 'Post'}
                        </button>
                      </div>
              </div>
                    
                    {/* Hidden file inputs */}
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                      multiple
                    />
                    <input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                      multiple
                    />
                    
                    {/* Media Preview */}
                    {postMediaUrls.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-2">
                          {postMediaUrls.map((url, index) => (
                            <div key={index} className="relative">
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => removeMedia(index)}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

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

            {/* Posts */}
                {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="text-gray-400 mb-3">
                  <FileText className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600 mb-4 text-sm">
                      {searchQuery ? 'Try adjusting your search terms' : 'No posts yet'}
                    </p>
                    {isCurrentUser && (
                      <button
                        onClick={() => setShowPostModal(true)}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        Create Post
                      </button>
                    )}
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
                      showEditDelete={isCurrentUser}
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
            {activeTab === 'albums' ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Albums</h3>
                  {isCurrentUser && (
                    <button
                      onClick={() => router.push('/dashboard/albums')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Create Album
                    </button>
                  )}
                </div>
                
                {albums.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {albums.map((album) => (
                      <div key={album._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">{album.name}</h4>
                        <div className="grid grid-cols-3 gap-1 mb-2">
                          {album.media && album.media.length > 0 ? (
                            album.media.slice(0, 6).map((media: any, index: number) => (
                              <img
                                key={index}
                                src={getMediaUrl(media.url)}
                                alt="album media"
                                className="w-full aspect-square object-cover rounded"
                              />
                            ))
                          ) : (
                            <div className="col-span-3 text-xs text-gray-400 py-4 text-center">No media</div>
                          )}
                          {album.media && album.media.length > 6 && (
                            <div className="aspect-square bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                              +{album.media.length - 6}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(album.createdAt).toLocaleDateString()}
                        </p>
                </div>
              ))}
            </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="w-8 h-8 text-gray-400" />
          </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No albums yet</h4>
                    <p className="text-gray-600 mb-4">No albums to display</p>
                    {isCurrentUser && (
                      <button
                        onClick={() => router.push('/dashboard/albums')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Create Album
                      </button>
                    )}
          </div>
        )}
          </div>
            ) : activeTab === 'groups' ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Groups</h3>
                  {isCurrentUser && (
                    <button
                      onClick={() => router.push('/dashboard/groups')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Create Group
                    </button>
                  )}
                </div>
                
                {groups.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map((group) => (
                      <div key={group._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">{group.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          <span>{group.stats.memberCount} members</span>
          </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h4>
                    <p className="text-gray-600 mb-4">No groups to display</p>
                    {isCurrentUser && (
                      <button
                        onClick={() => router.push('/dashboard/groups')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Create Group
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : activeTab === 'products' ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Products</h3>
                  {isCurrentUser && (
                    <button
                      onClick={() => router.push('/dashboard/products')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Add Product
                    </button>
                  )}
                </div>
                
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <div key={product._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-green-600">
                            {product.currency} {product.price}
                          </span>
                          <span className="text-gray-500">{product.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No products yet</h4>
                    <p className="text-gray-600 mb-4">No products to display</p>
                    {isCurrentUser && (
                      <button
                        onClick={() => router.push('/dashboard/products')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Add Product
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {tabs.find(tab => tab.id === activeTab)?.label}
                </h3>
                <p className="text-gray-600">This section is coming soon!</p>
              </div>
            )}
          </div>
        )}
      </div>

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

      {/* Popup */}
      <Popup popup={popup} onClose={closePopup} />
    </div>
  );
};

export default UserProfile;