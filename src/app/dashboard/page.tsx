"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AlbumDisplay from '@/components/AlbumDisplay';
import SharePopup, { ShareOptions } from '@/components/SharePopup';
import LatestProducts from '@/components/LatestProducts';
import Popup from '@/components/Popup';
import type { PopupState } from '@/components/Popup';
import PostOptionsDropdown from '@/components/PostOptionsDropdown';
import FeedPost from '@/components/FeedPost';
import ReelsCreationModal from '@/components/ReelsCreationModal';
import StoryCreationModal from '@/components/StoryCreationModal';
import StoryViewer from '@/components/StoryViewer';
import { isAuthenticated, clearAuth, getCurrentUserId } from '@/utils/auth';
import { 
  searchGifsApi, 
  getTrendingGifsApi,
  uploadFileApi,
  uploadMultipleFilesApi
} from '@/utils/api';

function getUserAvatar() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.avatar) {
      if (user.avatar.includes('localhost:3000')) {
        const correctedUrl = user.avatar.replace('http://localhost:3000', 'https://jaifriend-frontend-n6zr.vercel.app');
        return correctedUrl;
      }
      
      if (user.avatar.includes('/avatars/') || user.avatar.includes('/covers/')) {
        return ''; // Return empty string instead of default avatar
      }
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app';
      if (user.avatar.startsWith('http')) {
        return user.avatar;
      }
      return `${baseUrl}${user.avatar}`;
    }
    return ''; // Return empty string instead of default avatar
  } catch {
    return ''; // Return empty string instead of default avatar
  }
}

function getUserId(user: any): string {
  if (!user) {
    return '';
  }
  
  if (user.userId && typeof user.userId === 'object' && user.userId._id) {
    return user.userId._id;
  }
  
  if (typeof user._id === 'string') {
    return user._id;
  }
  if (typeof user.id === 'string') {
    return user.id;
  }
  if (typeof user.userId === 'string') {
    return user.userId;
  }
  
  if (user._id && typeof user._id === 'object' && user._id.toString) {
    const id = user._id.toString();
    return id;
  }
  if (user.id && typeof user.id === 'object' && user.id.toString) {
    const id = user.id.toString();
    return id;
  }
  if (user.userId && typeof user.userId === 'object' && user.userId.toString) {
    const id = user.userId.toString();
    return id;
  }
  
  const fallbackId = String(user._id || user.id || user.userId || '');
  
  if (!fallbackId || fallbackId === 'undefined' || fallbackId === 'null') {
    return '';
  }
  
  return fallbackId;
}

export default function Dashboard() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [deletingComments, setDeletingComments] = useState<{[key: string]: boolean}>({});
  const [newPost, setNewPost] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editMediaFiles, setEditMediaFiles] = useState<File[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [modalMediaFiles, setModalMediaFiles] = useState<File[]>([]);
  const [modalMediaType, setModalMediaType] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const modalImageInputRef = useRef<HTMLInputElement>(null);
  const modalVideoInputRef = useRef<HTMLInputElement>(null);
  const modalAudioInputRef = useRef<HTMLInputElement>(null);
  const modalFileUploadRef = useRef<HTMLInputElement>(null);

  const [openDropdownPostId, setOpenDropdownPostId] = useState<string | null>(null);

  const [showSharePopup, setShowSharePopup] = useState(false);
  const [selectedPostForShare, setSelectedPostForShare] = useState<any>(null);
  const [showReelsModal, setShowReelsModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [selectedUserStories, setSelectedUserStories] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);

  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const showPopup = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    setPopup({ isOpen: true, type, title, message });
  };

  const closePopup = () => {
    setPopup({ ...popup, isOpen: false });
  };

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  const startEditPost = (post: any) => {
    setEditingPostId(post._id || post.id);
    setEditContent(post.content);
    setEditTitle(post.title || '');
    setEditMediaFiles([]);
  };

  const cancelEditPost = () => {
    setEditingPostId(null);
    setEditContent('');
    setEditTitle('');
    setEditMediaFiles([]);
  };

  const handleEditPost = async (postId: string) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('content', editContent);
    
    // Add title if provided
    if (editTitle.trim()) {
      formData.append('title', editTitle.trim());
    }
    
    editMediaFiles.forEach(file => formData.append('media', file));
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}`, {
      method: 'PUT',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
    
    if (res.ok) {
      const updatedPost = await res.json();
      setPosts(posts => posts.map(p => (p._id === postId || p.id === postId) ? updatedPost : p));
      cancelEditPost();
      window.dispatchEvent(new CustomEvent('postUpdated'));
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    const token = localStorage.getItem('token');
    const commentKey = `${postId}-${commentId}`;
    
    setDeletingComments(prev => ({ ...prev, [commentKey]: true }));
    
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}/comment/${commentId}`;
      
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setPosts(posts => posts.map(p => (p._id === postId || p.id === postId) ? data.post : p));
        showPopup('success', 'Success', 'Comment deleted successfully');
      } else {
        showPopup('error', 'Error', 'Failed to delete comment. Please try again.');
      }
    } catch (error) {
      showPopup('error', 'Error', 'Network error. Please check your connection and try again.');
    } finally {
      setDeletingComments(prev => ({ ...prev, [commentKey]: false }));
    }
  };

  const handleDeleteAlbumComment = async (albumId: string, commentId: string) => {
    const token = localStorage.getItem('token');
    const commentKey = `album-${albumId}-${commentId}`;
    
    setDeletingComments(prev => ({ ...prev, [commentKey]: true }));
    
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/albums/${albumId}/comment/${commentId}`;
      
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAlbums(albums => albums.map(a => a._id === albumId ? data.album : a));
        showPopup('success', 'Success', 'Comment deleted successfully');
      } else {
        showPopup('error', 'Error', 'Failed to delete comment. Please try again.');
      }
    } catch (error) {
      showPopup('error', 'Error', 'Network error. Please check your connection and try again.');
    } finally {
      setDeletingComments(prev => ({ ...prev, [commentKey]: false }));
    }
  };

  const fetchFeedData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [postsResponse, albumsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts`, token ? { headers: { 'Authorization': `Bearer ${token}` } } : {}),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/albums`, token ? { headers: { 'Authorization': `Bearer ${token}` } } : {})
      ]);
      
      const [postsData, albumsData] = await Promise.all([
        postsResponse.ok ? postsResponse.json() : [],
        albumsResponse.ok ? albumsResponse.json() : []
      ]);
      

      
      const combinedFeed = [
        ...postsData.map((post: any) => ({ ...post, type: 'post' })),
        ...albumsData.map((album: any) => ({ ...album, type: 'album' }))
      ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setPosts(postsData);
      setAlbums(albumsData);
    } catch (error) {
      console.error('Error fetching feed data:', error);
    } finally {
      setLoadingPosts(false);
      setLoadingAlbums(false);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      
      if (!token || token === 'null' || token === 'undefined') {
        router.push('/');
        return;
      }
      
      fetchFeedData();
      fetchStories();
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    const handleAlbumCreated = () => fetchFeedData();
    const handleAlbumDeleted = () => fetchFeedData();
    const handleAlbumShared = () => fetchFeedData();
    const handlePostCreated = () => fetchFeedData();
    const handlePostDeleted = () => fetchFeedData();
    
    // Handle post updates more efficiently
    const handlePostUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.postId && customEvent.detail.updatedPost) {
        // Update specific post instead of refetching all data
        setPosts(posts => posts.map(p => 
          p._id === customEvent.detail.postId ? customEvent.detail.updatedPost : p
        ));
      } else {
        // Fallback to refetching all data if no specific update info
        fetchFeedData();
      }
    };

    window.addEventListener('albumCreated', handleAlbumCreated);
    window.addEventListener('albumDeleted', handleAlbumDeleted);
    window.addEventListener('albumShared', handleAlbumShared);
    window.addEventListener('postCreated', handlePostCreated);
    window.addEventListener('postDeleted', handlePostDeleted);
    window.addEventListener('postUpdated', handlePostUpdated);
    
    return () => {
      window.removeEventListener('albumCreated', handleAlbumCreated);
      window.removeEventListener('albumDeleted', handleAlbumDeleted);
      window.removeEventListener('albumShared', handleAlbumShared);
      window.removeEventListener('postCreated', handlePostCreated);
      window.removeEventListener('postDeleted', handlePostDeleted);
      window.removeEventListener('postUpdated', handlePostUpdated);
    };
  }, []);

  useEffect(() => {
    const trackViews = async () => {
      const token = localStorage.getItem('token');
      if (token && posts.length > 0) {
        const postsToTrack = posts.slice(0, 5);
        for (const post of postsToTrack) {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${post._id}/view`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
          } catch (error) {
            // Silent fail
          }
        }
      }
    };
    
    if (posts.length > 0) {
      trackViews();
    }
  }, [posts]);

  useEffect(() => {
    const trackAlbumViews = async () => {
      const token = localStorage.getItem('token');
      if (token && albums.length > 0) {
        const albumsToTrack = albums.slice(0, 3);
        for (const album of albumsToTrack) {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/albums/${album._id}/view`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
          } catch (error) {
            // Silent fail
          }
        }
      }
    };
    
    if (albums.length > 0) {
      trackAlbumViews();
    }
  }, [albums]);

  const handlePost = async () => {
    if (!newPost.trim() && !mediaFiles.length) {
      showPopup('error', 'Empty Post', 'Please add some content or media to your post');
      return;
    }
    
    // Check word limit
    const wordCount = newPost.split(/\s+/).filter(word => word && word.length > 0).length;
    if (wordCount > 300) {
      showPopup('error', 'Word Limit Exceeded', 'Your post cannot exceed 300 words. Please shorten your message.');
      return;
    }
    
    setPosting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showPopup('error', 'Authentication Error', 'Please log in again to create posts');
        return;
      }

      const formData = new FormData();
      // Preserve content exactly as typed/pasted - no trimming to maintain formatting
      formData.append('content', newPost);
      
      // Add title if provided
      if (newPostTitle.trim()) {
        formData.append('title', newPostTitle.trim());
      }
      
      mediaFiles.forEach((file, index) => {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File "${file.name}" is too large. Maximum size is 10MB.`);
        }
        
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
        if (!validTypes.includes(file.type)) {
          throw new Error(`File "${file.name}" has an unsupported format. Please use images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM, OGG).`);
        }
        
        formData.append('media', file);
      });
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (res.ok) {
        const post = await res.json();
        setPosts([post, ...posts]);
        setNewPost('');
        setNewPostTitle('');
        setMediaFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        showPopup('success', 'Post Created!', 'Your post has been shared successfully!');
        window.dispatchEvent(new CustomEvent('postCreated'));
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Failed to create post. Please try again.';
        showPopup('error', 'Post Failed', errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post. Please try again.';
      showPopup('error', 'Post Failed', errorMessage);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setPostToDelete(id);
    
    setPopup({
      isOpen: true,
      type: 'warning',
      title: 'Delete Post',
      message: 'Are you sure you want to delete this post? This action cannot be undone.',
      showConfirm: true,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
  };

  const handleToggleComments = async (postId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showPopup('error', 'Authentication Error', 'Please login to modify post settings');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}/toggle-comments`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts => posts.map(p => 
          (p._id === postId || p.id === postId) ? { ...p, commentsEnabled: data.commentsEnabled } : p
        ));
        showPopup('success', 'Success', `Comments ${data.commentsEnabled ? 'enabled' : 'disabled'} successfully`);
      } else {
        showPopup('error', 'Error', 'Failed to toggle comments');
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to connect to server');
    }
  };

  const handleOpenInNewTab = (post: any) => {
    const postUrl = `${window.location.origin}/dashboard/post/${post._id || post.id}`;
    window.open(postUrl, '_blank');
  };

  const handlePinPost = async (postId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showPopup('error', 'Authentication Error', 'Please login to pin posts');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}/pin`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts => posts.map(p => 
          (p._id === postId || p.id === postId) ? { ...p, isPinned: data.isPinned } : p
        ));
        showPopup('success', 'Success', `Post ${data.isPinned ? 'pinned' : 'unpinned'} successfully`);
      } else {
        showPopup('error', 'Error', 'Failed to pin/unpin post');
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to connect to server');
    }
  };

  const handleBoostPost = async (postId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showPopup('error', 'Authentication Error', 'Please login to boost posts');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}/boost`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts => posts.map(p => 
          (p._id === postId || p.id === postId) ? { ...p, isBoosted: data.isBoosted } : p
        ));
        showPopup('success', 'Success', `Post ${data.isBoosted ? 'boosted' : 'unboosted'} successfully`);
      } else {
        showPopup('error', 'Error', 'Failed to boost/unboost post');
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to connect to server');
    }
  };

  const handlePopupConfirm = async () => {
    if (popup.title === 'Delete Post' && postToDelete) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          showPopup('error', 'Authentication Error', 'Please log in again to delete posts.');
          return;
        }

        const deletePostId = postToDelete;
        showPopup('info', 'Deleting Post', 'Please wait while we delete your post...');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${deletePostId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          setPosts(posts.filter(p => (p._id || p.id) !== deletePostId));
          if (editingPostId === deletePostId) cancelEditPost();
          setPostToDelete(null);
          showPopup('success', 'Post Deleted', 'Your post has been successfully deleted.');
          window.dispatchEvent(new CustomEvent('postDeleted'));
        } else {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.message || 'Failed to delete post. Please try again.';
          showPopup('error', 'Delete Failed', errorMessage);
        }
      } catch (error) {
        showPopup('error', 'Network Error', 'Failed to connect to server. Please check your internet connection.');
      }
    }
  };

  const handleLike = async (postId: string) => {
    const currentPost = posts.find(p => (p._id === postId || p.id === postId));
    const token = localStorage.getItem('token');
    
    if (!token) {
      showPopup('error', 'Authentication Error', 'Please login to like posts');
      return;
    }

    // Optimistic update for better UX
    const originalPosts = [...posts];
    setPosts(prevPosts => {
      return prevPosts.map(p => {
        if (p._id === postId || p.id === postId) {
          const currentUserId = getCurrentUserId();
          const isCurrentlyLiked = p.likes?.includes(currentUserId);
          
          const newLikes = isCurrentlyLiked 
            ? p.likes?.filter((id: string) => id !== currentUserId) || []
            : [...(p.likes || []), currentUserId];
          
          return {
            ...p,
            likes: newLikes
          };
        }
        return p;
      });
    });

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}/like`;
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        // Update with server response
        setPosts(prevPosts => {
          const updatedPosts = prevPosts.map(p => {
            if (p._id === postId || p.id === postId) {
              return data.post;
            }
            return p;
          });
          return updatedPosts;
        });
        
        // Show success message
        const isLiked = data.post.likes?.includes(getCurrentUserId());
        showPopup('success', 'Success', `Post ${isLiked ? 'liked' : 'unliked'} successfully!`);
      } else {
        // Revert optimistic update on error
        setPosts(originalPosts);
        
        let errorMessage = 'Unknown error';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || 'Unknown error';
        } catch (parseError) {
          try {
            const responseText = await res.text();
            errorMessage = responseText || 'Unknown error';
          } catch (textError) {
            errorMessage = `HTTP ${res.status}: ${res.statusText}`;
          }
        }
        
        showPopup('error', 'Error', `Failed to like post: ${errorMessage}`);
      }
    } catch (error) {
      // Revert optimistic update on network error
      setPosts(originalPosts);
      showPopup('error', 'Network Error', 'Failed to connect to server. Please check your internet connection.');
    }
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      showPopup('error', 'Authentication Error', 'Please login to add reactions');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}/reaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reactionType })
      });
      
      if (res.ok) {
        const data = await res.json();
        setPosts(posts => posts.map(p => (p._id === postId || p.id === postId) ? data.post : p));
      } else {
        showPopup('error', 'Error', 'Failed to add reaction. Please try again.');
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to connect to server. Please check your internet connection.');
    }
  };



  const handleSave = async (postId: string) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      showPopup('error', 'Authentication Error', 'Please login to save posts');
      return;
    }
    
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}/save`;
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        
        setPosts(posts => posts.map(p => (p._id === postId || p.id === postId) ? { 
          ...p, 
          savedBy: data.savedBy || p.savedBy,
          saved: data.saved 
        } : p));
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('postSaved', { 
          detail: { postId, savedBy: data.savedBy, saved: data.saved } 
        }));
        
        // Show success message
        const isSaved = data.saved || (data.savedBy && data.savedBy.length > 0);
        showPopup('success', 'Success', `Post ${isSaved ? 'saved' : 'removed from saved'} successfully!`);
      } else {
        let errorData: any = {};
        try {
          errorData = await res.json();
        } catch (parseError) {
          // Silent fail
        }
        
        // Show error message
        showPopup('error', 'Save Failed', errorData.message || `Failed to save post (Status: ${res.status})`);
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to connect to server');
    }
  };

  const handleAddComment = async (postId: string, commentText: string) => {
    if (!commentText.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: commentText })
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(posts => posts.map(p => (p._id === postId || p.id === postId) ? {
          ...p,
          comments: [...(p.comments || []), data.comment]
        } : p));
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleShare = (postId: string, shareOptions: ShareOptions) => {
    setSelectedPostForShare({ id: postId, ...shareOptions });
    setShowSharePopup(true);
  };

  const handleReelShare = async (reelData: any) => {
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

  const handleView = async (postId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL || `https://jaifriend-backend-production.up.railway.app/api/posts/${postId}/view`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(posts => posts.map(p => 
          (p._id === postId || p.id === postId) ? { ...p, views: data.views } : p
        ));
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleAlbumDelete = async (albumId: string) => {
    if (!window.confirm('Delete this album?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL || `https://jaifriend-backend-production.up.railway.app/api/albums/${albumId}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (res.ok) {
      setAlbums(prev => prev.filter(album => album._id !== albumId));
    }
  };

  const handleAlbumLike = async (albumId: string) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      showPopup('error', 'Authentication Error', 'Please login to like albums');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/albums/${albumId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAlbums(albums => albums.map(a => a._id === albumId ? data.album : a));
      } else {
        showPopup('error', 'Error', 'Failed to like album. Please try again.');
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to connect to server. Please check your internet connection.');
    }
  };

  const handleAlbumReaction = async (albumId: string, reactionType: string) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      showPopup('error', 'Authentication Error', 'Please login to add reactions');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/albums/${albumId}/reaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reactionType })
      });
      
      if (res.ok) {
        const data = await res.json();
        setAlbums(albums => albums.map(a => a._id === albumId ? data.album : a));
      } else {
        showPopup('error', 'Error', 'Failed to add reaction. Please try again.');
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to connect to server. Please check your internet connection.');
    }
  };

  const handleAlbumComment = async (albumId: string, comment: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/albums/${albumId}/comment`, { 
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: comment })
      });
      if (res.ok) {
        const data = await res.json();
        setAlbums(prev => prev.map(album => 
          album._id === albumId ? { ...album, comments: [...(album.comments || []), data.comment] } : album
        ));
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleAlbumSave = async (albumId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/albums/${albumId}/save`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAlbums(prev => prev.map(album => 
          album._id === albumId ? { ...album, savedBy: data.savedBy, saved: data.saved } : album
        ));
        
        window.dispatchEvent(new CustomEvent('albumSaved'));
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleAlbumShare = async (albumId: string, shareOptions?: ShareOptions) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/albums/${albumId}/share`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: shareOptions?.customMessage || '',
          shareTo: shareOptions?.shareTo || 'friends',
          shareOnTimeline: shareOptions?.shareOnTimeline || false,
          shareToPage: shareOptions?.shareToPage || false,
          shareToGroup: shareOptions?.shareToGroup || false
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        
        setAlbums(prev => prev.map(album => 
          album._id === albumId ? { ...album, shares: data.shares, shared: data.shared } : album
        ));
        
        showPopup('success', 'Album Shared!', 'Your album has been shared successfully!');
        window.dispatchEvent(new CustomEvent('albumShared'));
        fetchFeedData();
      } else {
        const errorData = await res.json();
        showPopup('error', 'Share Failed', errorData.message || 'Failed to share album');
      }
    } catch (error) {
      showPopup('error', 'Network Error', 'Failed to share album. Please try again.');
    }
  };

  const getMediaUrl = (url: string) => {
    if (!url) {
      return ''; // Return empty string instead of default avatar
    }
    
    if (url.startsWith('http')) {
      return url;
    }
    
    if (url.includes('/avatars/') || url.includes('/covers/') || 
        url.includes('1.png') || url.includes('2.png') || url.includes('3.png') || 
        url.includes('4.png') || url.includes('5.png') || url.includes('6.png')) {
      return ''; // Return empty string instead of default avatar
    }
    
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}${url.startsWith('/') ? url : `/${url}`}`;
    return fullUrl;
  };

  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) setUserEmail(email);
  }, []);

  const [userStory, setUserStory] = useState<string | null>(null);
  const storyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedStory = localStorage.getItem('userStory');
    if (savedStory) setUserStory(savedStory);
  }, []);

  const handleStoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setUserStory(reader.result);
          localStorage.setItem('userStory', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // New story system functions
  
  // Group stories by user to avoid duplicates
  const groupStoriesByUser = (stories: any[]) => {
    const grouped = new Map();
    
    stories.forEach(story => {
      const userId = story.user._id || story.user.id;
      
      if (!grouped.has(userId)) {
        grouped.set(userId, {
          user: story.user,
          stories: [],
          latestStory: story
        });
      }
      
      grouped.get(userId).stories.push(story);
      
      // Keep the most recent story as the latest
      if (new Date(story.createdAt) > new Date(grouped.get(userId).latestStory.createdAt)) {
        grouped.get(userId).latestStory = story;
      }
    });
    
    const result = Array.from(grouped.values());
    return result;
  };
  
  const fetchStories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/stories/feed`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStories(data.stories || []);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoadingStories(false);
    }
  };

  const handleStorySuccess = (storyData: any) => {
    setStories(prev => [storyData, ...prev]);
    showPopup('success', 'Story Created!', 'Your story has been shared successfully!');
  };

  const handleStoryDelete = async (storyId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/stories/${storyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setStories(prev => prev.filter(story => story._id !== storyId));
        showPopup('success', 'Story Deleted', 'Your story has been deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      showPopup('error', 'Error', 'Failed to delete story');
    }
  };

  const handleStoryReact = async (storyId: string, reactionType: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/stories/${storyId}/react`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reactionType })
      });

      if (response.ok) {
        // Update stories state with new reaction
        const updatedStories = stories.map(story => {
          if (story._id === storyId) {
            return { ...story, reactions: [...story.reactions, { userId: 'current', type: reactionType, createdAt: new Date().toISOString() }] };
          }
          return story;
        });
        setStories(updatedStories);
      }
    } catch (error) {
      console.error('Error reacting to story:', error);
    }
  };

  const handleStoryReply = async (storyId: string, content: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/stories/${storyId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        // Update stories state with new reply
        const updatedStories = stories.map(story => {
          if (story._id === storyId) {
            return { ...story, replies: [...story.replies, { userId: 'current', content, createdAt: new Date().toISOString() }] };
          }
          return story;
        });
        setStories(updatedStories);
      }
    } catch (error) {
      console.error('Error replying to story:', error);
    }
  };

  const openStoryViewer = (groupedStoryIndex: number) => {
    const groupedStories = groupStoriesByUser(stories);
    const selectedGroupedStory = groupedStories[groupedStoryIndex];
    
    if (selectedGroupedStory) {
      // Set the selected user's stories and show viewer
      setSelectedUserStories(selectedGroupedStory.stories);
      setSelectedStoryIndex(0); // Always start from first story of the user
      setShowStoryViewer(true);
    }
  };

  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const navigateToProfile = (userId: string) => {
    window.location.href = `/dashboard/profile/${userId}`;
  };

  // Search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);



  // Modal media handlers
  const handleModalImageUpload = () => {
    modalImageInputRef.current?.click();
  };

  const handleModalVideoUpload = () => {
    modalVideoInputRef.current?.click();
  };

  const handleModalAudioUpload = () => {
    modalAudioInputRef.current?.click();
  };

  const handleModalFileUpload = () => {
    modalFileUploadRef.current?.click();
  };

  const handleModalMediaChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      
      const validFiles = fileArray.filter(file => {
        if (file.size > 10 * 1024 * 1024) {
          showPopup('error', 'File Too Large', `File "${file.name}" is too large. Maximum size is 10MB.`);
          return false;
        }
        
        // Check file type based on the upload type
        let isValid = false;
        switch (type) {
          case 'image':
            isValid = file.type.startsWith('image/');
            break;
          case 'video':
            isValid = file.type.startsWith('video/');
            break;
          case 'audio':
            isValid = file.type.startsWith('audio/');
            break;
          case 'file':
            isValid = file.type.startsWith('application/') || file.type.startsWith('text/');
            break;
          default:
            isValid = true;
        }
        
        if (!isValid) {
          showPopup('error', 'Unsupported Format', `File "${file.name}" is not a valid ${type} file.`);
          return false;
        }
        
        return true;
      });
      
      if (validFiles.length > 0) {
        setModalMediaFiles(prev => [...prev, ...validFiles]);
        setModalMediaType(type);
        showPopup('success', 'Files Added', `${validFiles.length} ${type} file(s) added successfully!`);
      }
    }
  };

  const removeModalMedia = (index: number) => {
    setModalMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearModalMedia = () => {
    setModalMediaFiles([]);
    setModalMediaType('');
  };

  const handleModalPost = async () => {
    if (!newPost.trim() && modalMediaFiles.length === 0) {
      showPopup('error', 'Empty Post', 'Please add some content or media to your post');
      return;
    }

    try {
      setPosting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        showPopup('error', 'Authentication Error', 'Please log in again');
        return;
      }

      // Separate files by type - only send images and videos to backend
      const imageVideoFiles = modalMediaFiles.filter(file => 
        file.type.startsWith('image/') || file.type.startsWith('video/')
      );
      
      const documentFiles = modalMediaFiles.filter(file => 
        file.type.startsWith('application/') || file.type.startsWith('text/')
      );
      
      const audioFiles = modalMediaFiles.filter(file => 
        file.type.startsWith('audio/')
      );

      // Create post content with file information
      let postContent = newPost;
      
      // Add document files info
      if (documentFiles.length > 0) {
        postContent += '\n\n📄 Attached Documents:\n';
        documentFiles.forEach(file => {
          const fileIcon = file.type.includes('pdf') ? '📕' : 
                          file.type.includes('word') ? '📘' : 
                          file.type.includes('excel') ? '📗' : '📄';
          postContent += `${fileIcon} ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)\n`;
        });
        postContent += '\nNote: Document files are referenced but not uploaded due to server limitations.';
      }
      
      // Add audio files info
      if (audioFiles.length > 0) {
        postContent += '\n\n🎵 Attached Audio:\n';
        audioFiles.forEach(file => {
          postContent += `🎵 ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)\n`;
        });
        postContent += '\nNote: Audio files are referenced but not uploaded due to server limitations.';
      }

      // Create the post data object
      const postData: any = {
        content: postContent
      };

      // Add new post type data
      if (selectedGif) {
        postData.gif = selectedGif;
      }
      
      if (voiceRecording) {
        postData.voice = voiceRecording;
        postData.voiceData = {
          duration: recordingTime,
          transcription: 'Voice recording', // In real app, this would use speech-to-text API
          isPublic: true
        };
      }
      
      if (selectedFeeling) {
        postData.feeling = {
          type: selectedFeeling.type,
          intensity: 5,
          emoji: selectedFeeling.emoji,
          description: selectedFeeling.description
        };
      }
      
      if (sellData) {
        postData.sell = {
          productName: sellData.productName,
          price: sellData.price,
          currency: 'USD',
          condition: sellData.condition,
          negotiable: sellData.negotiable || false,
          shipping: false,
          pickup: true
        };
      }
      
      if (pollData) {
        postData.poll = {
          question: pollData.question,
          options: pollData.options.map((opt: string) => ({ text: opt })),
          isMultipleChoice: pollData.isMultipleChoice || false,
          allowCustomOptions: false,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        };
      }
      
      if (locationData) {
        postData.location = {
          name: locationData.name,
          address: locationData.address,
          category: locationData.category,
          coordinates: null, // In real app, this would use geocoding API
          placeId: null,
          rating: null
        };
      }

      // Create FormData for media files
      const formData = new FormData();
      
      // Add basic post data
      formData.append('content', postContent);
      
      // Add new post type data as separate fields
      if (selectedGif) {
        formData.append('gif[url]', selectedGif.url);
        formData.append('gif[source]', selectedGif.source);
        formData.append('gif[tags]', selectedGif.tags.join(','));
        formData.append('gif[width]', selectedGif.width.toString());
        formData.append('gif[height]', selectedGif.height.toString());
      }
      if (voiceRecording) {
        formData.append('voice', voiceRecording);
        formData.append('voiceData[duration]', postData.voiceData.duration.toString());
        formData.append('voiceData[transcription]', postData.voiceData.transcription);
        formData.append('voiceData[isPublic]', postData.voiceData.isPublic.toString());
      }
      if (selectedFeeling) {
        formData.append('feeling[type]', postData.feeling.type);
        formData.append('feeling[intensity]', postData.feeling.intensity.toString());
        formData.append('feeling[emoji]', postData.feeling.emoji);
        formData.append('feeling[description]', postData.feeling.description);
      }
      if (sellData) {
        formData.append('sell[productName]', postData.sell.productName);
        formData.append('sell[price]', postData.sell.price.toString());
        formData.append('sell[currency]', postData.sell.currency);
        formData.append('sell[condition]', postData.sell.condition);
        formData.append('sell[negotiable]', postData.sell.negotiable.toString());
        formData.append('sell[shipping]', postData.sell.shipping.toString());
        formData.append('sell[pickup]', postData.sell.pickup.toString());
      }
      if (pollData) {
        formData.append('poll[question]', postData.poll.question);
        formData.append('poll[isMultipleChoice]', postData.poll.isMultipleChoice.toString());
        formData.append('poll[allowCustomOptions]', postData.poll.allowCustomOptions.toString());
        formData.append('poll[expiresAt]', postData.poll.expiresAt.toISOString());
        // Add poll options
        postData.poll.options.forEach((option: any, index: number) => {
          formData.append(`poll[options][${index}][text]`, option.text);
        });
      }
      if (locationData) {
        formData.append('location[name]', postData.location.name);
        formData.append('location[address]', postData.location.address);
        formData.append('location[category]', postData.location.category);
      }
      
      // Add media files
      imageVideoFiles.forEach(file => {
        formData.append('media', file);
      });

      // Debug: Log what's being sent
      console.log('🚀 Sending to backend:');
      console.log('🚀 selectedGif:', selectedGif);
      console.log('🚀 voiceRecording:', voiceRecording);
      console.log('🚀 selectedFeeling:', selectedFeeling);
      console.log('🚀 sellData:', sellData);
      console.log('🚀 pollData:', pollData);
      console.log('🚀 locationData:', locationData);
      
      // Log FormData entries
      for (let [key, value] of formData.entries()) {
        console.log('🚀 FormData entry:', key, value);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      // API response received

      if (response.ok) {
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const newPostData = await response.json();
          setPosts(prev => [newPostData, ...prev]);
          setNewPost('');
          setModalMediaFiles([]);
          setModalMediaType('');
          setShowPostModal(false);
          
          // Clear all modal data
          setSelectedGif(null);
          setVoiceRecording(null);
          setSelectedFeeling(null);
          setSellData(null);
          setPollData(null);
          setLocationData(null);
          
          // Clear form data
          setSellFormData({});
          setPollFormData({});
          setLocationFormData({});
          setGifSearchQuery('');
          setGifResults([]);
          setRecordingTime(0);
          
          if (modalMediaFiles.length > 0) {
            const uploadedCount = imageVideoFiles.length;
            const referencedCount = documentFiles.length + audioFiles.length;
            
            if (referencedCount > 0) {
              showPopup('success', 'Post Created!', `Post created successfully! ${uploadedCount} file(s) uploaded, ${referencedCount} file(s) referenced in content.`);
            } else {
              showPopup('success', 'Post Created!', `Post created successfully with ${uploadedCount} file(s)!`);
            }
          } else {
            showPopup('success', 'Post Created!', 'Your post has been shared successfully!');
          }
          
          // Refresh posts
          fetchFeedData();
        } else {
          // Handle non-JSON response
          const responseText = await response.text();
          console.error('Non-JSON response:', responseText);
          showPopup('error', 'API Error', 'Server returned invalid response format');
        }
      } else {
        // Handle error response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            showPopup('error', 'Error', errorData.message || 'Failed to create post');
          } catch (jsonError) {
            showPopup('error', 'Error', `HTTP ${response.status}: Failed to create post`);
          }
        } else {
          // Handle HTML error response
          const responseText = await response.text();
          console.error('HTML error response:', responseText);
          showPopup('error', 'Server Error', `HTTP ${response.status}: Server error occurred`);
        }
      }
    } catch (error) {
      console.error('Error creating post:', error);
      showPopup('error', 'Error', 'Failed to create post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  // State for different modal types
  const [showGifModal, setShowGifModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showFeelingsModal, setShowFeelingsModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // State for modal data
  const [selectedGif, setSelectedGif] = useState<any>(null);
  const [voiceRecording, setVoiceRecording] = useState<Blob | null>(null);
  const [selectedFeeling, setSelectedFeeling] = useState<any>(null);
  const [sellData, setSellData] = useState<any>(null);
  const [pollData, setPollData] = useState<any>(null);
  const [locationData, setLocationData] = useState<any>(null);
  
  // Form data states
  const [sellFormData, setSellFormData] = useState<{
    productName?: string;
    price?: number;
    condition?: string;
    negotiable?: boolean;
  }>({});
  const [pollFormData, setPollFormData] = useState<{
    question?: string;
    option1?: string;
    option2?: string;
    option3?: string;
    option4?: string;
    isMultipleChoice?: boolean;
  }>({});
  const [locationFormData, setLocationFormData] = useState<{
    name?: string;
    address?: string;
    category?: string;
  }>({});
  
  // GIF search state
  const [gifResults, setGifResults] = useState<any[]>([]);
  const [gifSearchQuery, setGifSearchQuery] = useState('');
  const [gifSearchLoading, setGifSearchLoading] = useState(false);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingChunks, setRecordingChunks] = useState<Blob[]>([]);

  const handleModalGIF = async () => {
    setShowGifModal(true);
    await loadTrendingGifs();
  };

  const handleModalVoice = () => {
    setShowVoiceModal(true);
  };

  const handleModalFeelings = () => {
    setShowFeelingsModal(true);
  };

  const handleModalSell = () => {
    setShowSellModal(true);
  };

  const handleModalPoll = () => {
    setShowPollModal(true);
  };

  const handleModalLocation = () => {
    setShowLocationModal(true);
  };

  // GIF search handler
  const handleGifSearch = async (query: string) => {
    setGifSearchQuery(query);
    
    if (query.trim().length < 2) {
      setGifResults([]);
      return;
    }
    
    try {
      setGifSearchLoading(true);
      const results = await searchGifsApi(query, 20);
      setGifResults(results.data || []);
    } catch (error) {
      console.error('Error searching GIFs:', error);
      setGifResults([]);
    } finally {
      setGifSearchLoading(false);
    }
  };

  // Load trending GIFs when modal opens
  const loadTrendingGifs = async () => {
    try {
      setGifSearchLoading(true);
      const results = await getTrendingGifsApi(20);
      setGifResults(results.data || []);
    } catch (error) {
      console.error('Error loading trending GIFs:', error);
      setGifResults([]);
    } finally {
      setGifSearchLoading(false);
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordingChunks(prev => [...prev, event.data]);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(recordingChunks, { type: 'audio/wav' });
        setVoiceRecording(audioBlob);
        setRecordingChunks([]);
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      setRecordingTime(0);
      recorder.onstop = () => {
        clearInterval(timer);
        const audioBlob = new Blob(recordingChunks, { type: 'audio/wav' });
        setVoiceRecording(audioBlob);
        setRecordingChunks([]);
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      console.error('Error starting recording:', error);
      showPopup('error', 'Recording Error', 'Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const addEmojiToPost = (emoji: string) => {
    const textarea = document.querySelector('textarea[placeholder="What\'s happening?"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(start);
      textarea.value = before + emoji + after;
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      textarea.focus();
      setNewPost(textarea.value);
    }
    setShowEmojiPicker(false);
  };

  const emojiCategories = [
    {
      name: 'Smileys',
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳']
    },
    {
      name: 'Animals',
      emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞']
    },
    {
      name: 'Food',
      emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀']
    },
    {
      name: 'Activities',
      emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿']
    },
    {
      name: 'Objects',
      emojis: ['💎', '💍', '💐', '💒', '💓', '💔', '💕', '💖', '💗', '💘', '💙', '💚', '💛', '🧡', '💜', '🖤', '💝', '💞', '💟', '❣️', '💕', '💟', '💘', '💝', '💖', '💗', '💓', '💔', '💕', '💖', '💗']
    }
  ];

  return (
    <div className="bg-[#f4f7fb] dark:bg-gray-900 min-h-screen pt-2 sm:pt-4 pb-24 sm:pb-6 w-full scrollbar-hide overflow-x-hidden transition-colors duration-200 touch-manipulation">
      <Popup popup={popup} onClose={closePopup} />
      
      <SharePopup
        isOpen={showSharePopup}
        onClose={() => {
          setShowSharePopup(false);
          setSelectedPostForShare(null);
        }}
        onShare={(shareOptions) => {
          if (selectedPostForShare) {
            handleShare(selectedPostForShare._id || selectedPostForShare.id, shareOptions);
          }
        }}
        postContent={selectedPostForShare?.content}
        postMedia={selectedPostForShare?.media}
        isAlbum={selectedPostForShare?.type === 'album'}
      />
      
      <div className="px-2 sm:px-4 lg:px-6 w-full">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white transition-colors duration-200">
          {userEmail ? `Hello, ${userEmail}! 👋` : "Hello!"}
        </h1>

        {/* Main Search Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search posts, users, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-3 max-w-md mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Search Results ({searchResults.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {searchResults.map((result, index) => (
                    <div key={index} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {result.type === 'user' ? (
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {result.username?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {result.type === 'post' ? 'P' : 'A'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {result.type === 'user' ? result.username : result.title || result.content?.substring(0, 50)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {result.type === 'user' ? 'User' : result.type === 'post' ? 'Post' : 'Album'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>


        <div className="w-full pt-2 mb-3 sm:mb-4">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide touch-pan-x">
            {/* Your Story */}
            <div 
              className="flex-shrink-0 flex flex-col items-center group cursor-pointer touch-manipulation" 
              onClick={() => setShowStoryModal(true)}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              style={{ touchAction: 'manipulation' }}
            >
              {userStory ? (
                userStory.startsWith('data:video') ? (
                  <video
                    src={userStory}
                    className="w-20 h-28 sm:w-24 sm:h-36 md:w-32 md:h-48 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-blue-500 mb-2 sm:mb-3 shadow-lg sm:shadow-xl object-cover transition-transform group-hover:scale-105"
                    controls
                  />
                ) : (
                  <img
                    src={userStory}
                    className="w-20 h-28 sm:w-24 sm:h-36 md:w-32 md:h-48 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-blue-500 mb-2 sm:mb-3 shadow-lg sm:shadow-xl object-cover transition-transform group-hover:scale-105"
                    alt="Your Story"
                  />
                )
              ) : (
                <div className="w-20 h-28 sm:w-24 sm:h-36 md:w-32 md:h-48 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-gray-300 mb-2 sm:mb-3 shadow-lg sm:shadow-xl bg-gray-100 dark:bg-gray-200 relative overflow-hidden transition-transform group-hover:scale-105">
                  {/* User Profile Picture */}
                  {getUserAvatar() ? (
                <img
                  src={getUserAvatar()}
                      className="w-full h-full object-cover"
                      alt="Your Profile"
                />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-2xl">👤</span>
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gray-300 to-transparent"></div>
                  
                  {/* Plus Button */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200 z-10">
                    <span className="text-gray-800 text-lg font-bold">+</span>
                  </div>
                </div>
              )}
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium transition-colors duration-200">Create new story</span>
            </div>

            {/* Other Users' Stories */}
            {loadingStories ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-20 h-28 sm:w-24 sm:h-36 md:w-32 md:h-48 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-gray-300 mb-2 sm:mb-3 shadow-lg sm:shadow-xl bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              ))
                                    ) : (
              groupStoriesByUser(stories).slice(0, 6).map((groupedStory, index) => (
                <div 
                  key={groupedStory.user._id || groupedStory.user.id}
                  className="flex-shrink-0 flex flex-col items-center group cursor-pointer touch-manipulation"
                  onClick={() => openStoryViewer(index)}
                  onTouchStart={(e) => {
                    e.currentTarget.style.transform = 'scale(0.95)';
                  }}
                  onTouchEnd={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  style={{ touchAction: 'manipulation' }}
                >
                  {/* Show story count indicator if user has multiple stories */}
                  {groupedStory.stories.length > 1 && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold z-10">
                      {groupedStory.stories.length}
                    </div>
                  )}
                  
                  {groupedStory.latestStory.mediaType === 'video' ? (
                    <video
                      src={groupedStory.latestStory.media}
                      poster={groupedStory.latestStory.thumbnail}
                      className="w-20 h-28 sm:w-24 sm:h-36 md:w-32 md:h-48 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-gray-300 mb-2 sm:mb-3 shadow-lg sm:shadow-xl object-cover transition-transform group-hover:scale-105 relative"
                    />
                  ) : (
                    <img
                      src={groupedStory.latestStory.media}
                      className="w-20 h-28 sm:w-24 sm:h-36 md:w-32 md:h-48 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-gray-300 mb-2 sm:mb-3 shadow-lg sm:shadow-xl object-cover transition-transform group-hover:scale-105 relative"
                      alt={`${groupedStory.user.username}'s Story`}
                    />
                  )}
                  <span className="text-xs sm:text-sm text-[#34495e] dark:text-gray-300 group-hover:text-[#022e8a] dark:group-hover:text-blue-400 font-medium transition-colors duration-200 truncate max-w-[80px] text-center">
                    {groupedStory.user.fullName || groupedStory.user.username}
                  </span>
                </div>
              ))
            )}

          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-3 sm:gap-4 w-full scrollbar-hide">
          <div className="w-full xl:flex-1 max-w-none xl:max-w-2xl xl:mx-0 scrollbar-hide">
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 mb-3 sm:mb-4 transition-colors duration-200">
              {/* Top Section: Content Type Selection */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowReelsModal(true)}
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
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {getUserAvatar() ? (
                      <img
                        src={getUserAvatar()}
                        alt="Your avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 relative">
                    {/* Content Textarea */}
                    <textarea
                      placeholder="Click to create a new post..."
                      className={`w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none cursor-pointer ${
                        newPost.trim() ? 'min-h-[80px]' : 'min-h-[40px]'
                      }`}
                      value=""
                      readOnly
                      onClick={() => setShowPostModal(true)}
                      onFocus={(e) => {
                        e.target.blur();
                        setShowPostModal(true);
                      }}
                      disabled={posting}
                      maxLength={1800}
                    />
                  </div>
                  
                  {/* Camera Icon - Positioned to the right of textarea */}
                  <div className="flex items-center justify-center w-10 h-10 flex-shrink-0">
                    <button
                      className="flex items-center justify-center w-10 h-10 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      disabled={posting}
                      title="Add photos or videos"
                    >
                      <span className="text-xl">📷</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Character Count and Word Count */}
              {newPost.trim() && (
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <span>Words: {newPost.split(/\s+/).filter(word => word && word.length > 0).length}/300</span>
                  <span>Characters: {newPost.length}/1800</span>
                </div>
              )}



              {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={e => {
                    const files = e.target.files;
                    if (files) {
                      const fileArray = Array.from(files);
                      
                      const validFiles = fileArray.filter(file => {
                        if (file.size > 10 * 1024 * 1024) {
                          showPopup('error', 'File Too Large', `File "${file.name}" is too large. Maximum size is 10MB.`);
                          return false;
                        }
                        
                        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
                        if (!validTypes.includes(file.type)) {
                          showPopup('error', 'Unsupported Format', `File "${file.name}" has an unsupported format.`);
                          return false;
                        }
                        
                        return true;
                      });
                      
                      if (validFiles.length > 0) {
                        setMediaFiles(prev => [...prev, ...validFiles]);
                        showPopup('success', 'Files Added', `${validFiles.length} file(s) added successfully!`);
                      }
                    }
                  }}
                />
              {mediaFiles.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-200">Selected files ({mediaFiles.length}):</div>
                  <div className="flex flex-wrap gap-2">
                    {mediaFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg text-xs transition-colors duration-200">
                        <div className="flex items-center gap-1">
                          <span className="text-lg">
                            {file.type.startsWith('image/') ? '🖼️' : '🎥'}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-medium truncate max-w-[120px]">{file.name}</span>
                            <span className="text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setMediaFiles(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded transition-colors"
                          title="Remove file"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setMediaFiles([]);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="mt-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                  >
                    Clear all files
                  </button>
                </div>
              )}
            </div>

            {loadingPosts && loadingAlbums ? (
              <div className="text-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Loading your feed...</p>
              </div>
            ) : posts.length === 0 && albums.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📱</div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">No posts yet</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-200">Be the first to share something amazing!</p>
              </div>
            ) : (
              <>


                {(() => {
                  const combinedFeed = [
                    ...posts.map((post: any) => ({ ...post, type: 'post' })),
                    ...albums.map((album: any) => ({ ...album, type: 'album' }))
                  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                  return combinedFeed.map((item: any) => {
                    if (item.type === 'album') {
                      return (
                        <AlbumDisplay
                          key={item._id}
                          album={item}
                          onDelete={handleAlbumDelete}
                          isOwner={false}
                          onLike={handleAlbumLike}
                          onReaction={handleAlbumReaction}
                          onComment={handleAlbumComment}
                          onDeleteComment={handleDeleteAlbumComment}
                          onSave={handleAlbumSave}
                          onShare={handleAlbumShare}
                          deletingComments={deletingComments}
                        />
                      );
                    } else {
                      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                      
                      const isOwnPost = item.user && (
                        item.user._id === currentUser._id || 
                        item.user.id === currentUser.id || 
                        item.user.userId === currentUser.id
                      );
                      
                      return (
                        <FeedPost
                          key={item._id || item.id}
                          post={item}
                          onLike={handleLike}
                          onReaction={handleReaction}
                          onComment={handleAddComment}
                          onShare={handleShare}
                          onSave={handleSave}
                          onDelete={handleDelete}
                          onEdit={startEditPost}
                          isOwnPost={isOwnPost}
                        />
                      );
                    }
                  });
                })()}
              </>
            )}
          </div>

          <div className="w-full xl:w-1/4 flex flex-col gap-3 sm:gap-4 scrollbar-hide">
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 transition-colors duration-200">
              <div className="font-semibold mb-2 text-sm text-gray-900 dark:text-white transition-colors duration-200">Pro Members</div>
              <button className="bg-orange-400 text-white px-3 py-2 rounded-full w-full mb-2 text-sm">Upgrade To Pro</button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 transition-colors duration-200">
              <div className="font-semibold mb-2 text-sm text-gray-900 dark:text-white transition-colors duration-200">Pages you may like</div>
              <div className="flex flex-col gap-2">
                <button className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-900 dark:text-white transition-colors duration-200">Apnademand</button>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow p-3 sm:p-4 transition-colors duration-200">
              <div className="font-semibold mb-2 text-sm text-gray-900 dark:text-white transition-colors duration-200">Latest Products</div>
              <LatestProducts />
            </div>
          </div>
        </div>
      </div>

      <Popup 
        popup={popup} 
        onClose={closePopup} 
        onConfirm={handlePopupConfirm}
        onCancel={() => {
          setPostToDelete(null);
          closePopup();
        }}
      />

      {/* Reels Creation Modal */}
      <ReelsCreationModal
        isOpen={showReelsModal}
        onClose={() => setShowReelsModal(false)}
        onSuccess={() => handleReelShare({})}
      />

      {/* Story Creation Modal */}
      <StoryCreationModal
        isOpen={showStoryModal}
        onClose={() => setShowStoryModal(false)}
        onSuccess={handleStorySuccess}
      />

      {/* Story Viewer */}
      {showStoryViewer && selectedUserStories.length > 0 && (
        <StoryViewer
          stories={selectedUserStories}
          initialStoryIndex={selectedStoryIndex}
          onClose={() => setShowStoryViewer(false)}
          onDelete={handleStoryDelete}
          onReact={handleStoryReact}
          onReply={handleStoryReply}
        />
      )}
      
      {/* Post Creation Modal */}
      {showPostModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] sm:max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowPostModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{1800 - (newPost.length)}</span>
                <button
                  onClick={handleModalPost}
                  disabled={posting || (!newPost.trim() && modalMediaFiles.length === 0 && !selectedGif && !voiceRecording && !selectedFeeling && !sellData && !pollData && !locationData)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {posting ? 'Sharing...' : 'Share'}
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(90vh-120px)] sm:max-h-[calc(80vh-120px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {/* Post Input */}
              <textarea
                placeholder="What's happening?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="w-full border-none outline-none text-sm sm:text-base resize-none min-h-[60px] sm:min-h-[80px] bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                maxLength={1800}
              />

              {/* Media Preview */}
              {modalMediaFiles.length > 0 && (
                <div className="mt-3 sm:mt-4">
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">Selected files ({modalMediaFiles.length}):</div>
                  <div className="flex flex-wrap gap-2">
                    {modalMediaFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-sm sm:text-base">
                            {file.type.startsWith('image/') ? '🖼️' : 
                             file.type.startsWith('video/') ? '🎥' : 
                             file.type.startsWith('audio/') ? '🎵' : '📄'}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-medium truncate max-w-[80px] sm:max-w-[120px]">{file.name}</span>
                            <span className="text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeModalMedia(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded transition-colors"
                          title="Remove file"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={clearModalMedia}
                    className="mt-2 text-xs sm:text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-2 sm:px-3 py-1 sm:py-2 rounded transition-colors"
                  >
                    Clear all files
                  </button>
                </div>
              )}

              {/* Selected Features Preview */}
              {(selectedGif || voiceRecording || selectedFeeling || sellData || pollData || locationData) && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Selected features:</div>
                  <div className="space-y-2">
                    {selectedGif && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span>🎭 GIF: {selectedGif.source}</span>
                        <button
                          onClick={() => setSelectedGif(null)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    {voiceRecording && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span>🎤 Voice recording</span>
                        <button
                          onClick={() => setVoiceRecording(null)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    {selectedFeeling && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span>{selectedFeeling.emoji} Feeling: {selectedFeeling.description}</span>
                        <button
                          onClick={() => setSelectedFeeling(null)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    {sellData && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span>🏪 Selling: {sellData.productName} - ${sellData.price}</span>
                        <button
                          onClick={() => setSellData(null)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    {pollData && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span>📊 Poll: {pollData.question}</span>
                        <button
                          onClick={() => setPollData(null)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    {locationData && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span>📍 Location: {locationData.name}</span>
                        <button
                          onClick={() => setLocationData(null)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Audience Selector */}
              <div className="flex items-center gap-2 mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <span className="text-sm sm:text-base">🌐</span>
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Everyone</span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* File Upload Limitations Notice */}
              <div className="col-span-full mb-2 p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
                  <span className="font-medium">📋 Note:</span> Only images and videos are uploaded to server. 
                  Documents and audio files are referenced in post content.
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 mt-3 sm:mt-4">
                <button 
                  onClick={handleModalImageUpload}
                  className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-lg sm:text-xl">📷</span>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Images</span>
                </button>
                
                <button 
                  onClick={handleModalAudioUpload}
                  className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-lg sm:text-xl">🎵</span>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Audio</span>
                </button>
                
                <button 
                  onClick={handleModalFileUpload}
                  className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-lg sm:text-xl">📄</span>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Files</span>
                </button>
                
                <button 
                  onClick={handleModalGIF}
                  className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-lg sm:text-xl">🎭</span>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">GIF</span>
                </button>
                
                <button 
                  onClick={handleModalVoice}
                  className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-lg sm:text-xl">🎤</span>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Voice</span>
                </button>
                
                <button 
                  onClick={handleModalFeelings}
                  className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-lg sm:text-xl">😊</span>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Feelings</span>
                </button>
                
                <button 
                  onClick={handleModalSell}
                  className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-lg sm:text-xl">🏪</span>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Sell</span>
                </button>
                
                <button 
                  onClick={handleModalPoll}
                  className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-lg sm:text-xl">📊</span>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Poll</span>
                </button>
                
                <button 
                  onClick={handleModalLocation}
                  className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-lg sm:text-xl">📍</span>
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Location</span>
                </button>
              </div>

              {/* Mark/Formatting Icons */}
              <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => {
                    const textarea = document.querySelector('textarea[placeholder="What\'s happening?"]') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selected = text.substring(start, end);
                      const after = text.substring(end);
                      textarea.value = before + '#' + selected + after;
                      textarea.setSelectionRange(start + 1, start + 1 + selected.length);
                      textarea.focus();
                      setNewPost(textarea.value);
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  title="Add hashtag"
                >
                  <span className="text-base sm:text-lg font-bold">#</span>
                </button>
                
                <button 
                  onClick={() => {
                    const textarea = document.querySelector('textarea[placeholder="What\'s happening?"]') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selected = text.substring(start, end);
                      const after = text.substring(end);
                      textarea.value = before + '@' + selected + after;
                      textarea.setSelectionRange(start + 1, start + 1 + selected.length);
                      textarea.focus();
                      setNewPost(textarea.value);
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  title="Mention user"
                >
                  <span className="text-base sm:text-lg font-bold">@</span>
                </button>
                
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  title="Add emoji"
                >
                  <span className="text-base sm:text-lg">😊</span>
                </button>
              </div>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">Select Emoji</span>
                    <button 
                      onClick={() => setShowEmojiPicker(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {emojiCategories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="mb-3 sm:mb-4">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{category.name}</h4>
                      <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 sm:gap-2">
                        {category.emojis.map((emoji, emojiIndex) => (
                          <button
                            key={emojiIndex}
                            onClick={() => addEmojiToPost(emoji)}
                            className="w-7 h-7 sm:w-8 sm:h-8 text-base sm:text-lg hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors flex items-center justify-center"
                            title={emoji}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hidden file inputs */}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={modalImageInputRef}
                onChange={(e) => handleModalMediaChange(e, 'image')}
              />
              <input
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                ref={modalVideoInputRef}
                onChange={(e) => handleModalMediaChange(e, 'video')}
              />
              <input
                type="file"
                accept="audio/*"
                multiple
                className="hidden"
                ref={modalAudioInputRef}
                onChange={(e) => handleModalMediaChange(e, 'audio')}
                title="Note: Audio files will be referenced in post content but not uploaded to server"
              />
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                multiple
                className="hidden"
                ref={modalFileUploadRef}
                onChange={(e) => handleModalMediaChange(e, 'file')}
                title="Note: Document files will be referenced in post content but not uploaded to server"
              />
            </div>
          </div>
        </div>
      )}

      {/* GIF Selection Modal */}
      {showGifModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select GIF</h3>
              <button
                onClick={() => setShowGifModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search GIFs..."
                    value={gifSearchQuery}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                    onChange={(e) => handleGifSearch(e.target.value)}
                  />
                  {gifSearchLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                {gifResults.length > 0 ? (
                  gifResults.map((gif: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedGif({
                          url: gif.images.fixed_height.url,
                          source: 'giphy',
                          tags: gif.tags || [],
                          width: gif.images.fixed_height.width,
                          height: gif.images.fixed_height.height,
                          giphyId: gif.id
                        });
                        setShowGifModal(false);
                      }}
                      className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors overflow-hidden"
                    >
                      <img 
                        src={gif.images.fixed_height.url} 
                        alt={gif.title}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))
                ) : (
                  // Fallback to emoji placeholders if no GIFs loaded
                  ['🎭', '🎪', '🎨', '🎬', '🎤', '🎧', '🎮', '🎯', '🎲', '🎸', '🎹', '🎺'].map((gif, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedGif({ url: gif, source: 'emoji', tags: ['fun'], width: 200, height: 200 });
                        setShowGifModal(false);
                      }}
                      className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-4xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {gif}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Recording Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Record Voice</h3>
              <button
                onClick={() => setShowVoiceModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="text-center">
                <button 
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl mb-4 transition-colors ${
                    isRecording ? 'bg-red-600 animate-pulse' : 'bg-red-500 hover:bg-red-600'
                  }`}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? '⏹️' : '🎤'}
                </button>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                </p>
                {recordingTime > 0 && (
                  <p className="text-sm text-gray-500 mb-4">Duration: {recordingTime}s</p>
                )}
                {voiceRecording && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">Voice recorded successfully!</p>
                    <audio controls className="w-full mt-2">
                      <source src={URL.createObjectURL(voiceRecording)} type="audio/wav" />
                    </audio>
                  </div>
                )}
                <div className="flex gap-2">
                  {!voiceRecording ? (
                    <button
                      onClick={() => setShowVoiceModal(false)}
                      className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setVoiceRecording(null);
                          setRecordingTime(0);
                        }}
                        className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                      >
                        Re-record
                      </button>
                      <button
                        onClick={() => setShowVoiceModal(false)}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                      >
                        Use Recording
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feelings Selection Modal */}
      {showFeelingsModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">How are you feeling?</h3>
              <button
                onClick={() => setShowFeelingsModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                {[
                  { type: 'happy', emoji: '😊', description: 'Happy' },
                  { type: 'excited', emoji: '🤩', description: 'Excited' },
                  { type: 'grateful', emoji: '🙏', description: 'Grateful' },
                  { type: 'loved', emoji: '💕', description: 'Loved' },
                  { type: 'sad', emoji: '😢', description: 'Sad' },
                  { type: 'angry', emoji: '😠', description: 'Angry' },
                  { type: 'surprised', emoji: '😮', description: 'Surprised' },
                  { type: 'scared', emoji: '😨', description: 'Scared' },
                  { type: 'calm', emoji: '😌', description: 'Calm' },
                  { type: 'proud', emoji: '😎', description: 'Proud' },
                  { type: 'tired', emoji: '😴', description: 'Tired' },
                  { type: 'confused', emoji: '😕', description: 'Confused' }
                ].map((feeling) => (
                  <button
                    key={feeling.type}
                    onClick={() => {
                      setSelectedFeeling(feeling);
                      setShowFeelingsModal(false);
                    }}
                    className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="text-3xl mb-2">{feeling.emoji}</span>
                    <span className="text-xs text-gray-700 dark:text-gray-300 text-center">{feeling.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sell Product Modal */}
      {showSellModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sell Product</h3>
              <button
                onClick={() => setShowSellModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Product name"
                  value={sellFormData.productName || ''}
                  onChange={(e) => setSellFormData(prev => ({ ...prev, productName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={sellFormData.price || ''}
                  onChange={(e) => setSellFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <select 
                  value={sellFormData.condition || 'New'}
                  onChange={(e) => setSellFormData(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="New">New</option>
                  <option value="Used">Used</option>
                  <option value="Refurbished">Refurbished</option>
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="negotiable"
                    checked={sellFormData.negotiable || false}
                    onChange={(e) => setSellFormData(prev => ({ ...prev, negotiable: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="negotiable" className="text-sm text-gray-700 dark:text-gray-300">Price negotiable</label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (sellFormData.productName && sellFormData.price) {
                        setSellData(sellFormData);
                        setShowSellModal(false);
                        setSellFormData({});
                      } else {
                        showPopup('error', 'Missing Information', 'Please fill in product name and price');
                      }
                    }}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Add Product
                  </button>
                  <button
                    onClick={() => setShowSellModal(false)}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Poll Modal */}
      {showPollModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Poll</h3>
              <button
                onClick={() => setShowPollModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Poll question"
                  value={pollFormData.question || ''}
                  onChange={(e) => setPollFormData(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Option 1"
                  value={pollFormData.option1 || ''}
                  onChange={(e) => setPollFormData(prev => ({ ...prev, option1: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Option 2"
                  value={pollFormData.option2 || ''}
                  onChange={(e) => setPollFormData(prev => ({ ...prev, option2: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Option 3 (optional)"
                  value={pollFormData.option3 || ''}
                  onChange={(e) => setPollFormData(prev => ({ ...prev, option3: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Option 4 (optional)"
                  value={pollFormData.option4 || ''}
                  onChange={(e) => setPollFormData(prev => ({ ...prev, option4: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="multipleChoice"
                    checked={pollFormData.isMultipleChoice || false}
                    onChange={(e) => setPollFormData(prev => ({ ...prev, isMultipleChoice: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="multipleChoice" className="text-sm text-gray-700 dark:text-gray-300">Allow multiple choices</label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (pollFormData.question && pollFormData.option1 && pollFormData.option2) {
                        const options = [pollFormData.option1, pollFormData.option2];
                        if (pollFormData.option3) options.push(pollFormData.option3);
                        if (pollFormData.option4) options.push(pollFormData.option4);
                        
                        setPollData({
                          question: pollFormData.question,
                          options: options,
                          isMultipleChoice: pollFormData.isMultipleChoice || false
                        });
                        setShowPollModal(false);
                        setPollFormData({});
                      } else {
                        showPopup('error', 'Missing Information', 'Please fill in question and at least 2 options');
                      }
                    }}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Create Poll
                  </button>
                  <button
                    onClick={() => setShowPollModal(false)}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Location</h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Location name"
                  value={locationFormData.name || ''}
                  onChange={(e) => setLocationFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={locationFormData.address || ''}
                  onChange={(e) => setLocationFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <select
                  value={locationFormData.category || ''}
                  onChange={(e) => setLocationFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select category</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="cafe">Cafe</option>
                  <option value="park">Park</option>
                  <option value="shopping">Shopping</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="other">Other</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (locationFormData.name && locationFormData.address) {
                        setLocationData(locationFormData);
                        setShowLocationModal(false);
                        setLocationFormData({});
                      } else {
                        showPopup('error', 'Missing Information', 'Please fill in location name and address');
                      }
                    }}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Add Location
                  </button>
                  <button
                    onClick={() => setShowLocationModal(false)}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddCommentForm({ postId, onAddComment }: { postId: string, onAddComment: (postId: string, text: string) => void }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={async e => {
        e.preventDefault();
        setLoading(true);
        await onAddComment(postId, text);
        setText(''); // Clear input after successful comment
        setLoading(false);
      }}
    >
      <input
        type="text"
        className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
        placeholder="Add a comment..."
        value={text}
        onChange={e => setText(e.target.value)}
        ref={inputRef}
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm flex-shrink-0 hover:bg-blue-600 transition-colors duration-200"
        disabled={loading || !text.trim()}
      >
        {loading ? 'Posting...' : 'Comment'}
      </button>
    </form>
  );
}