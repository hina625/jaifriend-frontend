"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Edit, Trash2, MoreVertical, Search, Filter, Camera, Video, Music, FileText, Plus, Heart, MessageCircle, Share2, Bookmark, Settings, Camera as CameraIcon, MapPin, Globe, Calendar, Users, Eye, ThumbsUp, X, ShoppingBag } from 'lucide-react';
import PostDisplay from '@/components/PostDisplay';
import Popup, { PopupState } from '@/components/Popup';
import PrivacyAwareProfile from '@/components/PrivacyAwareProfile';
import ReelsCreationModal from '@/components/ReelsCreationModal';

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
  followingList?: any[];
  followersList?: any[];
  coverPhoto?: string;
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

interface ProfileCompletion {
  profilePicture: boolean;
  name: boolean;
  workplace: boolean;
  country: boolean;
  address: boolean;
}

const ProfilePage = () => {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [userImages, setUserImages] = useState<UserImages>({ avatar: null, cover: null });
  const [posts, setPosts] = useState<Post[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
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
  const [showPostModal, setShowPostModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postMedia, setPostMedia] = useState<File[]>([]);
  const [postMediaUrls, setPostMediaUrls] = useState<string[]>([]);
  const [creatingPost, setCreatingPost] = useState(false);
  const [reelsCreationModalOpen, setReelsCreationModalOpen] = useState(false);
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);

  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: '📝' },
    { id: 'posts', label: 'Posts', icon: '📄' },
    { id: 'groups', label: 'Groups', icon: '👥' },
    { id: 'likes', label: 'Likes', icon: '👍' },
    { id: 'following', label: 'Following', icon: '➕', count: user?.following?.length || 0 },
    { id: 'followers', label: 'Followers', icon: '👥', count: user?.followers?.length || 0 },
    { id: 'photos', label: 'Photos', icon: '📷' },
    { id: 'videos', label: 'Videos', icon: '🎥' },
    { id: 'reels', label: 'Reels', icon: '🎬' },
    { id: 'products', label: 'Products', icon: '🛍️' },
    { id: 'albums', label: 'Albums', icon: '📸', count: albums.length || 0 }
  ];

  const filters = [
    { id: 'all', label: 'All', icon: <Filter className="w-3 h-3 sm:w-4 sm:h-4" /> },
    { id: 'text', label: 'Text', icon: <FileText className="w-3 h-3 sm:w-4 sm:h-4" /> },
    { id: 'photos', label: 'Photos', icon: <CameraIcon className="w-3 h-3 sm:w-4 sm:h-4" /> },
    { id: 'videos', label: 'Videos', icon: <Video className="w-3 h-3 sm:w-4 sm:h-4" /> },
    { id: 'sounds', label: 'Sounds', icon: <Music className="w-3 h-3 sm:w-4 sm:h-4" /> }
  ];

  useEffect(() => {
    console.log('🚀 Profile page useEffect running...');
    console.log('🔍 Testing console logs...');
    console.log('📱 Browser console should show these messages');
    fetchUserProfile();
    fetchUserImages();
    fetchUserPosts();
    fetchUserAlbums();
    fetchUserGroups();
    fetchUserProducts();
    
    // Listen for post creation events to refresh posts
    const handlePostCreated = () => {
      fetchUserPosts();
    };

    // Listen for post deletion events
    const handlePostDeleted = () => {
      fetchUserPosts();
    };

    const handlePostUpdated = () => {
      fetchUserPosts();
    };

    // Listen for image updates
    const handleImagesUpdated = () => {
      fetchUserImages();
    };
    
    // Listen for privacy settings updates
    const handlePrivacySettingsUpdated = () => {
      fetchUserProfile();
    };
    
    // Listen for password changes
    const handlePasswordChanged = () => {
      fetchUserProfile();
    };
    
    // Listen for profile updates from settings pages
    const handleProfileUpdated = () => {
      console.log('Profile updated event received in profile page, refreshing profile...');
      fetchUserProfile();
      fetchUserImages();
    };
    
    // Listen for album events
    const handleAlbumCreated = () => {
      fetchUserAlbums();
    };
    
    const handleAlbumUpdated = () => {
      fetchUserAlbums();
    };
    
    const handleAlbumDeleted = () => {
      fetchUserAlbums();
    };
    
    // Listen for group events
    const handleGroupCreated = () => {
      fetchUserGroups();
    };
    
    const handleGroupUpdated = () => {
      fetchUserGroups();
    };
    
    const handleGroupDeleted = () => {
      fetchUserGroups();
    };
    
    // Listen for product events
    const handleProductCreated = () => {
      fetchUserProducts();
    };
    
    const handleProductUpdated = () => {
      fetchUserProducts();
    };
    
    const handleProductDeleted = () => {
      fetchUserProducts();
    };
    
    window.addEventListener('postCreated', handlePostCreated);
    window.addEventListener('postDeleted', handlePostDeleted);
    window.addEventListener('postUpdated', handlePostUpdated);
    window.addEventListener('imagesUpdated', handleImagesUpdated);
    window.addEventListener('privacySettingsUpdated', handlePrivacySettingsUpdated);
    window.addEventListener('passwordChanged', handlePasswordChanged);
    window.addEventListener('profileUpdated', handleProfileUpdated);
    window.addEventListener('albumCreated', handleAlbumCreated);
    window.addEventListener('albumUpdated', handleAlbumUpdated);
    window.addEventListener('albumDeleted', handleAlbumDeleted);
    window.addEventListener('groupCreated', handleGroupCreated);
    window.addEventListener('groupUpdated', handleGroupUpdated);
    window.addEventListener('groupDeleted', handleGroupDeleted);
    window.addEventListener('productCreated', handleProductCreated);
    window.addEventListener('productUpdated', handleProductUpdated);
    window.addEventListener('productDeleted', handleProductDeleted);
    
    // Cleanup function
    return () => {
      window.removeEventListener('postCreated', handlePostCreated);
      window.removeEventListener('postDeleted', handlePostDeleted);
      window.removeEventListener('postUpdated', handlePostUpdated);
      window.removeEventListener('imagesUpdated', handleImagesUpdated);
      window.removeEventListener('privacySettingsUpdated', handlePrivacySettingsUpdated);
      window.removeEventListener('passwordChanged', handlePasswordChanged);
      window.removeEventListener('profileUpdated', handleProfileUpdated);
      window.removeEventListener('albumCreated', handleAlbumCreated);
      window.removeEventListener('albumUpdated', handleAlbumUpdated);
      window.removeEventListener('albumDeleted', handleAlbumDeleted);
      window.removeEventListener('groupCreated', handleGroupCreated);
      window.removeEventListener('groupUpdated', handleGroupUpdated);
      window.removeEventListener('groupDeleted', handleGroupDeleted);
      window.removeEventListener('productCreated', handleProductCreated);
      window.removeEventListener('productUpdated', handleProductUpdated);
      window.removeEventListener('productDeleted', handleProductDeleted);
    };
  }, []);

  // Monitor userImages and user state changes
  useEffect(() => {
    console.log('🖼️ UserImages state changed:', userImages);
    console.log('🖼️ User state changed:', user);
  }, [userImages, user]);

  // Cleanup localhost URLs in database
  useEffect(() => {
    const cleanupLocalhostUrls = async () => {
      try {
        console.log('🧹 Starting localhost URL cleanup...');
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('❌ No token found for cleanup');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/userimages/cleanup-localhost`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Localhost URL cleanup completed:', result);
          
          // Refresh user data after cleanup
          await fetchUserImages();
          await fetchUserProfile();
        } else {
          console.log('❌ Cleanup failed:', response.status);
        }
      } catch (error) {
        console.error('❌ Error during cleanup:', error);
      }
    };

    // Run cleanup once when component mounts
    cleanupLocalhostUrls();
  }, []);

  // Listen for profile updates from settings pages
  useEffect(() => {
    const handleProfileUpdated = () => {
      console.log('Profile updated event received in profile page, refreshing profile...');
      fetchUserProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdated);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdated);
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

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/profile/me`;
      console.log('🔍 Fetching user profile from:', apiUrl);
      const response = await fetch(apiUrl, { 
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setLoading(false);
      } else {
        console.error('❌ Failed to fetch user profile:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error details:', errorText);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setLoading(false);
    }
  };

  const fetchUserImages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('🖼️ Fetching user images...');
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/userimages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const imagesData = await response.json();
        console.log('🖼️ User images data:', imagesData);
        setUserImages(imagesData);
      } else {
        console.error('❌ Failed to fetch user images:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user images:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      console.log('🔍 fetchUserPosts called...');
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No token found');
        return;
      }

      console.log('🌐 Fetching posts from API...');
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const postsData = await response.json();
        console.log('📸 Fetched posts data:', postsData);
        console.log('📸 Posts with media:', postsData.filter((post: any) => post.media && post.media.length > 0));
        console.log('📸 Setting posts in state...');
        setPosts(postsData);
      } else {
        console.log('❌ API response not ok:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const fetchUserAlbums = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/albums/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const albumsData = await response.json();
        setAlbums(albumsData);
      }
    } catch (error) {
      console.error('Error fetching user albums:', error);
    }
  };

  const fetchUserGroups = async () => {
    try {
      setGroupsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/groups`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const groupsData = await response.json();
        console.log('📊 User groups fetched:', groupsData.length);
        setGroups(groupsData);
      } else {
        console.error('Failed to fetch user groups:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
    } finally {
      setGroupsLoading(false);
    }
  };

  const fetchUserProducts = async () => {
    try {
      setProductsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found for fetching products');
        setProductsLoading(false);
        return;
      }

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const productsData = await response.json();
        console.log('Products data fetched:', productsData);
        setProducts(productsData);
      } else {
        console.error('Failed to fetch products:', response.status, response.statusText);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
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
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/profile/update`, { 
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
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setPosts(prev => prev.filter(post => post._id !== postId));
        showPopup('success', 'Post Deleted', 'Post has been deleted successfully!');
        
        // Dispatch event to notify other components (like feed)
        window.dispatchEvent(new CustomEvent('postDeleted'));
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
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${editingPost._id}`, { 
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
        
        // Dispatch event to notify other components (like feed)
        window.dispatchEvent(new CustomEvent('postUpdated'));
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

  // Post creation functions
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setPostMedia(prev => [...prev, ...files]);
      
      // Create preview URLs
      const newUrls = files.map(file => URL.createObjectURL(file));
      setPostMediaUrls(prev => [...prev, ...newUrls]);
      
      // Show success message
      const fileType = files[0].type.startsWith('video/') ? 'video' : 'image';
      const fileCount = files.length;
      showPopup('success', 'Media Added!', `${fileCount} ${fileType}${fileCount > 1 ? 's' : ''} added successfully. Review and continue to post.`);
      
      // Show media preview popup immediately after selection
      setShowMediaPreview(true);
      setSelectedMediaIndex(postMediaUrls.length); // Show the newly added media
      
      // Close post modal temporarily to show media preview
      setShowPostModal(false);
    }
  };

  const handleMediaPreviewClose = () => {
    setShowMediaPreview(false);
    setSelectedMediaIndex(0);
    
    // If user has media selected, ask if they want to continue to post
    if (postMedia.length > 0) {
      if (confirm('Do you want to continue creating a post with the selected media?')) {
        setShowPostModal(true);
      }
    }
  };

  const handleMediaPreviewNext = () => {
    if (selectedMediaIndex < postMediaUrls.length - 1) {
      setSelectedMediaIndex(selectedMediaIndex + 1);
    }
  };

  const handleMediaPreviewPrev = () => {
    if (selectedMediaIndex > 0) {
      setSelectedMediaIndex(selectedMediaIndex - 1);
    }
  };

  const removeMedia = (index: number) => {
    setPostMedia(prev => prev.filter((_, i) => i !== index));
    setPostMediaUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      // Revoke the URL to free memory
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
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

  const handleReelShare = async () => {
    try {
      // Here you would typically upload the reel to your backend
      // For now, we'll just redirect to the reels page
      showPopup('success', 'Reel Created!', 'Your reel has been created successfully!');
      
      // Redirect to reels page (you'll need to create this page)
      router.push('/dashboard/reels');
    } catch (error) {
      showPopup('error', 'Error', 'Failed to create reel. Please try again.');
    }
  };

  const resetPostForm = () => {
    setPostContent('');
    setPostMedia([]);
    setPostMediaUrls([]);
    setShowPostModal(false);
    setShowMediaPreview(false);
    setSelectedMediaIndex(0);
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
    
            const fullUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}${url}`;
    console.log('🔗 getMediaUrl:', { original: url, full: fullUrl });
    return fullUrl;
  };

  const getCompletionPercentage = () => {
    const completed = Object.values(profileCompletion).filter(Boolean).length;
    return Math.round((completed / Object.keys(profileCompletion).length) * 100);
  };

  // Helper function to get current user ID
  const getCurrentUserId = (): string | null => {
    // Try multiple ways to get user ID
    let userId = localStorage.getItem('userId');
    
    if (!userId) {
      // Try from user object
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = user.id || user._id || user.userId;
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
    }
    
    // Try from token (decode JWT)
    if (!userId) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userId = payload.userId || payload.id || payload.sub;
        } catch (e) {
          console.error('Error decoding token:', e);
        }
      }
    }
    
    return userId;
  };

  // Helper function to filter user's groups
  const getUserGroups = (): Group[] => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return [];
    
    return groups.filter(group => {
      // Check if user is creator
      const isCreator = typeof group.creator === 'object' 
        ? group.creator?._id === currentUserId
        : group.creator === currentUserId;
      
      // Check if user is a member
      const isMember = group.members?.some(member => 
        typeof member.user === 'object'
          ? member.user?._id === currentUserId
          : member.user === currentUserId
      );
      
      return isCreator || isMember;
    });
  };

  const getUserProducts = (): Product[] => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return [];
    
    return products.filter(product => {
      return typeof product.seller === 'object'
        ? product.seller?._id === currentUserId
        : product.seller === currentUserId;
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('🖼️ Avatar upload triggered:', file);
    if (file) {
      console.log('📁 File selected:', file.name, file.size, file.type);
      setNewAvatar(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('🖼️ Preview generated');
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      handleSaveAvatar();
    } else {
      console.log('❌ No file selected');
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSaveCover(file);
    }
  };

  const handleSaveCover = async (file: File) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showPopup('error', 'Authentication Error', 'Please log in again');
        return;
      }

      const formData = new FormData();
      formData.append('cover', file);

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/userimages/cover`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Cover uploaded successfully:', data);
        
        // Update local state
        setUserImages(prev => ({
          ...prev,
          cover: data.cover
        }));
        
        // Show success message
        showPopup('success', 'Cover Updated!', 'Your cover photo has been updated successfully!');
        
        // Trigger profile update event to refresh navbar
        window.dispatchEvent(new CustomEvent('profileUpdated'));
        
        // Refresh user images
        fetchUserImages();
      } else {
        const errorData = await response.json();
        showPopup('error', 'Upload Failed', errorData.error || 'Failed to upload cover photo');
      }
    } catch (error) {
      console.error('Error uploading cover:', error);
      showPopup('error', 'Upload Failed', 'Failed to upload cover photo. Please try again.');
    }
  };

  const handleSaveAvatar = async () => {
    console.log('💾 Starting avatar save process');
    console.log('🔍 Testing avatar upload console logs...');
    console.log('📱 This should appear in browser console');
    if (!newAvatar) {
      console.log('❌ No avatar file to save');
      return;
    }
    
    try {
      setUploadingAvatar(true);
      const token = localStorage.getItem('token');
      console.log('🔑 Token available:', !!token);
      if (!token) {
        showPopup('error', 'Authentication Error', 'Please log in again');
        return;
      }

      const formData = new FormData();
      formData.append('avatar', newAvatar);
      console.log('📤 FormData created with file:', newAvatar.name);

              const uploadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/userimages/avatar`;
      console.log('🌐 Upload URL:', uploadUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Avatar uploaded successfully:', data);
        
        // Update local state immediately
        setUserImages(prev => ({
          ...prev,
          avatar: data.avatar
        }));
        
        // Also update user profile to keep it synchronized
        setUser(prev => prev ? {
          ...prev,
          avatar: data.avatar
        } : null);
        
        // Clear upload state
        setNewAvatar(null);
        setAvatarPreview(null);
        
        // Show success message
        showPopup('success', 'Avatar Updated!', 'Your profile picture has been updated successfully!');
        
        // Trigger profile update event to refresh navbar
        window.dispatchEvent(new CustomEvent('profileUpdated'));
        
        // Refresh user images and profile to ensure consistency
        await fetchUserImages();
        await fetchUserProfile();
        
        console.log('✅ Avatar update completed - data refreshed');
      } else {
        const errorData = await response.json();
        console.log('❌ Upload failed:', errorData);
        showPopup('error', 'Upload Failed', errorData.error || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('❌ Error uploading avatar:', error);
      showPopup('error', 'Upload Failed', 'Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
      console.log('🏁 Avatar upload process completed');
    }
  };

  const handleContinueToPost = () => {
    setShowMediaPreview(false);
    setShowPostModal(true);
  };

  const handleCompleteMediaFlow = () => {
    // Close media preview and open post modal
    setShowMediaPreview(false);
    setShowPostModal(true);
    
    // Focus on post content input
    setTimeout(() => {
      const postContentInput = document.querySelector('textarea[name="postContent"], textarea[placeholder*="What\'s happening"]') as HTMLTextAreaElement;
      if (postContentInput) {
        postContentInput.focus();
      }
    }, 100);
  };

  const handleRemoveMediaFromPreview = (index: number) => {
    removeMedia(index);
    
    // If no media left, close the preview
    if (postMedia.length <= 1) {
      setShowMediaPreview(false);
      setSelectedMediaIndex(0);
      
      // Ask if user wants to create a text-only post
      if (postMedia.length === 0) {
        if (confirm('No media selected. Do you want to create a text-only post?')) {
          setShowPostModal(true);
        }
      }
    } else {
      // Adjust selected index if needed
      if (selectedMediaIndex >= postMedia.length - 1) {
        setSelectedMediaIndex(postMedia.length - 2);
      }
    }
  };

  const handleAddMoreMedia = () => {
    // Trigger file input click
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center p-4 transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base">Loading profile...</p>
          <p className="mt-2 text-xs text-gray-500">Please wait while we load your profile data</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center p-4 transition-colors duration-200">
        <div className="text-center max-w-sm mx-auto">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-2">User not found</p>
          <p className="text-xs text-gray-500 mb-4">Please check your login status or try refreshing the page</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              Refresh Page
            </button>
            <button 
              onClick={() => router.push('/dashboard')} 
              className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredPosts = getFilteredPosts();

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-dark-900 overflow-x-hidden max-w-full transition-colors duration-200 pb-4 sm:pb-6">
      {/* Cover Photo Section */}
      <div className="relative h-32 sm:h-48 md:h-64 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 overflow-hidden">
        {(userImages.cover || user.coverPhoto) ? (
          <img 
            src={(() => {
              // Enhanced cover photo display logic
              if (userImages.cover) {
                return getMediaUrl(userImages.cover);
              } else if (user.coverPhoto && user.coverPhoto !== '/covers/default-cover.jpg') {
                // Handle Cloudinary URLs properly
                if (user.coverPhoto.startsWith('http')) {
                  return user.coverPhoto; // Already a full URL
                } else {
                  return getMediaUrl(user.coverPhoto);
                }
              }
              return '/default-cover.jpg';
            })()}
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
          <label className="px-2 py-1 sm:px-3 sm:py-2 bg-black bg-opacity-20 text-white rounded-lg backdrop-blur-sm hover:bg-opacity-30 transition-all flex items-center gap-1 text-xs sm:text-sm cursor-pointer">
            <span className="text-sm">📷</span>
            <span className="hidden xs:inline">Cover</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
          </label>
          <button className="p-1 sm:p-2 bg-black bg-opacity-20 text-white rounded-lg backdrop-blur-sm hover:bg-opacity-30 transition-all">
            <span className="text-sm">➕</span>
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
                src={(() => {
                  // Enhanced avatar display logic
                  let finalSrc = '/default-avatar.svg';
                  
                  if (avatarPreview) {
                    finalSrc = avatarPreview;
                  } else if (userImages.avatar) {
                    finalSrc = getMediaUrl(userImages.avatar);
                  } else if (user.avatar && user.avatar !== '/avatars/1.png.png') {
                    // Handle Cloudinary URLs properly
                    if (user.avatar.startsWith('http')) {
                      finalSrc = user.avatar; // Already a full URL
                    } else {
                      finalSrc = getMediaUrl(user.avatar);
                    }
                  }
                  
                  console.log('🖼️ Profile picture src:', { 
                    avatarPreview, 
                    userImagesAvatar: userImages.avatar, 
                    userAvatar: user.avatar, 
                    finalSrc,
                    isCloudinary: user.avatar?.includes('cloudinary'),
                    isHttp: user.avatar?.startsWith('http')
                  });
                  return finalSrc;
                })()}
                alt={user.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl object-cover bg-gray-200"
              />
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
              {user.isOnline && (
                <div className="absolute bottom-3 right-3 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>

            {/* User Info */}
            <PrivacyAwareProfile 
              viewerType="self" 
              user={user || {
                id: '',
                name: '',
                username: '',
                avatar: '',
                email: '',
                followers: [],
                following: [],
                bio: '',
                location: '',
                website: '',
                workplace: '',
                address: '',
                country: '',
                isOnline: false,
                joinedDate: '',
                posts: []
              }}
              onEditProfile={() => setShowProfileEdit(true)}
              onViewActivities={() => {
                // Navigate to activities page or show activities modal
                console.log('View activities clicked');
              }}
            />


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

                {/* Following and Followers Lists */}
                <div className="space-y-4">
                  {/* Following List */}
                  <div className="bg-white rounded-xl shadow-sm p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Following ({user.followingList?.length || 0})
                    </h3>
                    {user.followingList && user.followingList.length > 0 ? (
                      <div className="space-y-2">
                        {user.followingList.slice(0, 5).map((followedUser: any) => (
                          <div key={followedUser._id || followedUser.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <img
                              src={getMediaUrl(followedUser.avatar)}
                              alt={followedUser.name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">
                                {followedUser.name || followedUser.fullName || 'Unknown User'}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                @{followedUser.username || 'unknown'}
                              </p>
                            </div>
                          </div>
                        ))}
                        {user.followingList.length > 5 && (
                          <p className="text-sm text-gray-500 text-center py-2">
                            +{user.followingList.length - 5} more following
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No following yet</p>
                    )}
                  </div>

                  {/* Followers List */}
                  <div className="bg-white rounded-xl shadow-sm p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Followers ({user.followersList?.length || 0})
                    </h3>
                    {user.followersList && user.followersList.length > 0 ? (
                      <div className="space-y-2">
                        {user.followersList.slice(0, 5).map((follower: any) => (
                          <div key={follower._id || follower.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <img
                              src={getMediaUrl(follower.avatar)}
                              alt={follower.name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">
                                {follower.name || follower.fullName || 'Unknown User'}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                @{follower.username || 'unknown'}
                              </p>
                            </div>
                          </div>
                        ))}
                        {user.followersList.length > 5 && (
                          <p className="text-sm text-gray-500 text-center py-2">
                            +{user.followersList.length - 5} more followers
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No followers yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-4">
                {/* Post Creation */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                  {/* Top Section: Content Type Selection */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                                        <button
                    onClick={() => setReelsCreationModalOpen(true)}
                    className="flex items-center gap-2 bg-pink-50 dark:bg-pink-900/20 px-3 py-2 rounded-lg border border-pink-200 dark:border-pink-700 hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors cursor-pointer"
                  >
                    <span className="text-pink-500 text-lg">💎</span>
                    <span className="text-sm font-medium text-pink-700 dark:text-pink-300">Reels Video</span>
                  </button>
                      <div className="flex items-center gap-2 bg-pink-50 dark:bg-pink-900/20 px-3 py-2 rounded-lg border border-pink-200 dark:border-pink-700">
                        <span className="text-pink-500 text-lg">🕐</span>
                        <span className="text-sm font-medium text-pink-700 dark:text-pink-300">Free live streams</span>
                      </div>
                    </div>
                  </div>

                  {/* Content Creation Area */}
                  <div className="relative mb-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={getMediaUrl(user.avatar)}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 relative">
                        <textarea
                          placeholder="Write your message, add your photo or Video ... @Mention... #Hashtag"
                          className="w-full min-h-[120px] border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none"
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                        />
                        {/* Character Counter */}
                        <div className="absolute top-2 right-2">
                          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                            {postContent.length}/250
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar / Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                        title="Add photos"
                      >
                        <span className="text-xl">📷</span>
                        <span className="text-sm hidden sm:inline">Photo</span>
                      </button>
                      
                      <button
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        onClick={() => document.getElementById('video-upload')?.click()}
                        title="Add videos"
                      >
                        <span className="text-xl">🎥</span>
                        <span className="text-sm hidden sm:inline">Video</span>
                      </button>
                      
                      <button
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
                        title="Add emojis"
                      >
                        <span className="text-xl">😊</span>
                        <span className="text-sm hidden sm:inline">Emoji</span>
                      </button>
                      
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <span className="text-lg">🌐</span>
                        <select className="text-sm bg-transparent border-none outline-none cursor-pointer">
                          <option>Everyone</option>
                          <option>Friends</option>
                          <option>Private</option>
                        </select>
                      </div>
                    </div>
                    
                    <button
                      onClick={createPost}
                      disabled={(!postContent.trim() && postMedia.length === 0) || creatingPost}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <span className="text-lg">📤</span>
                      {creatingPost ? 'Publishing...' : 'Publish'}
                    </button>
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
                {filteredPosts.length === 0 && albums.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <div className="text-gray-400 mb-3">
                      <FileText className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No content found</h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      {searchQuery ? 'Try adjusting your search terms' : 'Start sharing your thoughts and albums!'}
                    </p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => setShowPostModal(true)}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        Create Post
                      </button>
                      <button
                        onClick={() => router.push('/dashboard/albums')}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        Create Album
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Combine posts and albums and sort by creation date */}
                    {(() => {
                      const combinedContent = [
                        ...filteredPosts.map((post: any) => ({ ...post, type: 'post' })),
                        ...albums.map((album: any) => ({ ...album, type: 'album' }))
                      ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                      return combinedContent.map((item: any) => {
                        if (item.type === 'album') {
                          return (
                            <div key={item._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                              <div className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <img
                                    src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}${user.avatar}`) : '/default-avatar.svg'}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full border-2 border-blue-400"
                                  />
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{user.name}</h4>
                                    <p className="text-sm text-gray-500">Created an album • {new Date(item.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.name}</h3>
                                
                                {/* Album Media Grid */}
                                {item.media && item.media.length > 0 && (
                                  <div className="grid grid-cols-3 gap-2 mb-3">
                                    {item.media.slice(0, 6).map((media: any, index: number) => (
                                      <img
                                        key={index}
                                        src={getMediaUrl(media.url)}
                                        alt={`Album media ${index + 1}`}
                                        className="w-full aspect-square object-cover rounded-lg"
                                      />
                                    ))}
                                    {item.media.length > 6 && (
                                      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-500">
                                        +{item.media.length - 6}
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Album Actions */}
                                <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                                  <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                                    <span>❤️</span>
                                    <span className="text-sm">{item.likes?.length || 0}</span>
                                  </button>
                                  <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                                    <span>💬</span>
                                    <span className="text-sm">{item.comments?.length || 0}</span>
                                  </button>
                                  <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
                                    <span>📤</span>
                                    <span className="text-sm">{item.shares?.length || 0}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div key={item._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                              <PostDisplay
                                post={item}
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
                                isOwner={true}
                                showEditDelete={true}
                              />
                            </div>
                          );
                        }
                      });
                    })()}
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
                  <button
                    onClick={() => router.push('/dashboard/albums')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Create Album
                  </button>
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
                    <p className="text-gray-600 mb-4">Create your first album to share your photos and videos</p>
                    <button
                      onClick={() => router.push('/dashboard/albums')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Create Album
                    </button>
                  </div>
                )}
              </div>
            ) : activeTab === 'groups' ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">My Groups</h3>
                  <button
                    onClick={() => router.push('/dashboard/groups')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Create Group
                  </button>
                </div>
                
                {groupsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading groups...</p>
                  </div>
                ) : getUserGroups().length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getUserGroups().map((group) => (
                      <div key={group._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{group.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            group.privacy === 'public' 
                              ? 'bg-green-100 text-green-700' 
                              : group.privacy === 'private'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {group.privacy.charAt(0).toUpperCase() + group.privacy.slice(1)}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-xs mb-3 line-clamp-2">{group.description}</p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{group.stats?.memberCount || group.members?.length || 0} members</span>
                          </div>
                          <span>{group.category}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400">
                            Created {new Date(group.createdAt).toLocaleDateString()}
                          </p>
                          <button
                            onClick={() => router.push(`/dashboard/groups`)}
                            className="text-blue-500 hover:text-blue-600 text-xs font-medium"
                          >
                            View Group
                          </button>
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
                    <p className="text-gray-600 mb-4">Create your first group to connect with others</p>
                    <button
                      onClick={() => router.push('/dashboard/groups')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Create Group
                    </button>
                  </div>
                )}
              </div>
            ) : activeTab === 'posts' ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">My Posts</h3>
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Create Post
                  </button>
                </div>
                
                {/* Filter Tabs */}
                <div className="flex space-x-1 mb-4 overflow-x-auto">
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        activeFilter === filter.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter.icon}
                      <span>{filter.label}</span>
                    </button>
                  ))}
                </div>
                
                {/* Posts Content */}
                {getFilteredPosts().length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h4>
                    <p className="text-gray-600 mb-4">Start sharing your thoughts, photos, and videos</p>
                    <button
                      onClick={() => setShowPostModal(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Create Post
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getFilteredPosts().map((post) => (
                      <div key={post._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
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
            ) : activeTab === 'products' ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">My Products</h3>
                  <button
                    onClick={() => router.push('/dashboard/products')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Create Product
                  </button>
                </div>
                
                {productsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading products...</p>
                  </div>
                ) : getUserProducts().length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getUserProducts().map((product) => (
                      <div key={product._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        {product.imageUrl && (
                          <div className="mb-3">
                            <img
                              src={getMediaUrl(product.imageUrl)}
                              alt={product.name}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{product.name}</h4>
                          <span className="text-green-600 font-semibold text-sm">
                            {product.currency} {product.price}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-xs mb-3 line-clamp-2">{product.description}</p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{product.category}</span>
                          <span>{product.type}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400">
                            {product.totalItemUnits} units available
                          </p>
                          <button
                            onClick={() => router.push(`/dashboard/products`)}
                            className="text-blue-500 hover:text-blue-600 text-xs font-medium"
                          >
                            View Product
                          </button>
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
                    <p className="text-gray-600 mb-4">Start selling your products in the marketplace</p>
                    <button
                      onClick={() => router.push('/dashboard/products')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Create Product
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h3>
                <p className="text-gray-600">This feature is coming soon!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg shadow-xl max-w-sm sm:max-w-md w-full p-4 sm:p-6 max-h-[95vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Edit Profile</h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={editingProfile.name}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                <textarea
                  value={editingProfile.bio}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  value={editingProfile.location}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                <input
                  type="url"
                  value={editingProfile.website}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Workplace</label>
                <input
                  type="text"
                  value={editingProfile.workplace}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, workplace: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                <input
                  type="text"
                  value={editingProfile.country}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <input
                  type="text"
                  value={editingProfile.address}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={() => setShowProfileEdit(false)}
                className="flex-1 px-3 sm:px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base touch-manipulation"
                style={{ touchAction: 'manipulation' }}
              >
                Cancel
              </button>
              <button
                onClick={updateProfile}
                className="flex-1 px-3 sm:px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base touch-manipulation"
                style={{ touchAction: 'manipulation' }}
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

      {/* Post Creation Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Create Post</h2>
                <button
                  onClick={resetPostForm}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={getMediaUrl(user?.avatar || '/avatars/1.png.png')}
                    alt={user?.name || 'User'}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{user?.name || 'User'}</div>
                    <div className="text-sm text-gray-500">Public</div>
                  </div>
                </div>

                {/* Post Content */}
                <div>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="What's going on? #Hashtag.. @Mention.. Link.."
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
                    maxLength={1000}
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {postContent.length}/1000
                  </div>
                </div>

                {/* Media Preview */}
                {postMediaUrls.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">Media Preview</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {postMediaUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeMedia(index)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Media Upload Buttons */}
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm">
                    <CameraIcon className="w-4 h-4 text-green-500" />
                    <span>Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                      multiple
                    />
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm">
                    <Video className="w-4 h-4 text-red-500" />
                    <span>Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                      multiple
                    />
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6 sm:mt-8">
                <button
                  onClick={resetPostForm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors w-full sm:w-auto text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={createPost}
                  disabled={(!postContent.trim() && postMedia.length === 0) || creatingPost}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors w-full sm:w-auto text-sm flex items-center justify-center"
                >
                  {creatingPost ? 'Creating...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup */}
      <Popup popup={popup} onClose={closePopup} />

      {/* Reels Creation Modal */}
      <ReelsCreationModal
        isOpen={reelsCreationModalOpen}
        onClose={() => setReelsCreationModalOpen(false)}
        onSuccess={handleReelShare}
      />

      {/* Media Preview Popup */}
      {showMediaPreview && postMediaUrls.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Media Preview
              </h3>
              <button
                onClick={handleMediaPreviewClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Media Content */}
            <div className="flex-1 p-4">
              <div className="relative">
                {/* Media Display */}
                <div className="flex justify-center mb-4">
                  {postMedia[selectedMediaIndex]?.type.startsWith('video/') ? (
                    <video
                      src={postMediaUrls[selectedMediaIndex]}
                      controls
                      className="max-w-full max-h-96 rounded-lg"
                      autoPlay
                      muted
                    />
                  ) : (
                    <img
                      src={postMediaUrls[selectedMediaIndex]}
                      alt={`Preview ${selectedMediaIndex + 1}`}
                      className="max-w-full max-h-96 object-contain rounded-lg"
                    />
                  )}
                </div>

                {/* Navigation Controls */}
                {postMediaUrls.length > 1 && (
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button
                      onClick={handleMediaPreviewPrev}
                      disabled={selectedMediaIndex === 0}
                      className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedMediaIndex + 1} of {postMediaUrls.length}
                    </span>
                    
                    <button
                      onClick={handleMediaPreviewNext}
                      disabled={selectedMediaIndex === postMediaUrls.length - 1}
                      className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Thumbnail Grid */}
                <div className="grid grid-cols-6 gap-2">
                  {postMediaUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedMediaIndex(index)}
                      className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                        index === selectedMediaIndex
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      {postMedia[index]?.type.startsWith('video/') ? (
                        <div className="w-full h-16 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                          </svg>
                        </div>
                      ) : (
                        <img
                          src={url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-16 object-cover"
                        />
                      )}
                      {index === selectedMediaIndex && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

                          {/* Footer Actions */}
              <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRemoveMediaFromPreview(selectedMediaIndex)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Remove Media
                  </button>
                  <button
                    onClick={handleAddMoreMedia}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Add More
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {postMedia[selectedMediaIndex]?.name}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleMediaPreviewClose}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleCompleteMediaFlow}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Continue to Post
                  </button>
                </div>
              </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => router.push('/dashboard')}
        className="fixed bottom-20 right-4 w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-50"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ProfilePage;
