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
import { isAuthenticated, clearAuth } from '@/utils/auth';

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
        console.log('❌ No valid token found, redirecting to login');
        router.push('/');
        return;
      }
      
      console.log('✅ Token found, proceeding with data fetch');
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
        console.log('🔄 Post updated locally:', customEvent.detail.postId);
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
        setPosts(prevPosts => {
          const updatedPosts = prevPosts.map(p => {
            if (p._id === postId || p.id === postId) {
              return data.post;
            }
            return p;
          });
          return updatedPosts;
        });
      } else {
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
    console.log('🔄 Dashboard handleSave called with postId:', postId);
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('❌ No token found for save operation');
      alert('Please login to save posts');
      return;
    }
    
    try {
      console.log('🔄 Dashboard: Saving post:', postId);
      console.log('🔑 Token exists:', !!token);
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}/save`;
      console.log('🌐 API URL:', apiUrl);
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📡 Response status:', res.status);
      console.log('📡 Response headers:', res.headers);
      
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Dashboard: Save response:', data);
        
        setPosts(posts => posts.map(p => (p._id === postId || p.id === postId) ? { 
          ...p, 
          savedBy: data.savedBy || p.savedBy,
          saved: data.saved 
        } : p));
        
        window.dispatchEvent(new CustomEvent('postSaved'));
        console.log('🔄 Dashboard: Post state updated');
        
        // Show success message
        showPopup('success', 'Post Saved!', 'Post has been saved to your collection');
      } else {
        console.error('❌ Dashboard: Save failed with status:', res.status);
        console.error('❌ Response headers:', Object.fromEntries(res.headers.entries()));
        
        let errorData = {};
        try {
          errorData = await res.json();
        console.error('❌ Dashboard: Save error data:', errorData);
        } catch (parseError) {
          console.error('❌ Could not parse error response:', parseError);
        }
        
        // Show error message
        showPopup('error', 'Save Failed', errorData.message || `Failed to save post (Status: ${res.status})`);
      }
    } catch (error) {
      console.error('❌ Dashboard: Save network error:', error);
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
    
    console.log('🔍 Grouping stories:', stories.length, 'stories');
    
    stories.forEach(story => {
      const userId = story.user._id || story.user.id;
      console.log('🔍 Story user ID:', userId, 'Username:', story.user.username);
      
      if (!grouped.has(userId)) {
        grouped.set(userId, {
          user: story.user,
          stories: [],
          latestStory: story
        });
        console.log('🔍 Created new group for user:', userId);
      } else {
        console.log('🔍 Added to existing group for user:', userId);
      }
      
      grouped.get(userId).stories.push(story);
      
      // Keep the most recent story as the latest
      if (new Date(story.createdAt) > new Date(grouped.get(userId).latestStory.createdAt)) {
        grouped.get(userId).latestStory = story;
      }
    });
    
    const result = Array.from(grouped.values());
    console.log('🔍 Final grouped result:', result.length, 'groups');
    result.forEach(group => {
      console.log('🔍 Group:', group.user.username, 'Stories:', group.stories.length);
    });
    
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
        console.log('🔍 Fetched stories:', data.stories?.map((s: any) => ({ 
          id: s._id, 
          userId: s.user._id || s.user.id, 
          username: s.user.username 
        })));
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
  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const navigateToProfile = (userId: string) => {
    window.location.href = `/dashboard/profile/${userId}`;
  };

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
                <div className="w-20 h-28 sm:w-24 sm:h-36 md:w-32 md:h-48 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-blue-500 mb-2 sm:mb-3 shadow-lg sm:shadow-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center transition-transform group-hover:scale-105">
                  {getUserAvatar() ? (
                <img
                  src={getUserAvatar()}
                      className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
                  alt="Your Story"
                />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-white">
                      <span className="text-2xl mb-1">📷</span>
                      <span className="text-xs text-center">Add Story</span>
                    </div>
                  )}
                </div>
              )}
              <span className="text-xs sm:text-sm text-[#022e8a] dark:text-blue-400 font-semibold transition-colors duration-200">Your Story</span>
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
                      placeholder="Write your message, add your photo or Video ... @Mention... #Hashtag"
                      className={`w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none ${
                        newPost.trim() || document.activeElement === document.querySelector('textarea') 
                          ? 'min-h-[120px]' 
                          : 'min-h-[60px]'
                      }`}
                      value={newPost}
                      onChange={e => setNewPost(e.target.value)}
                      onFocus={() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) textarea.style.minHeight = '120px';
                      }}
                      onBlur={() => {
                        if (!newPost.trim()) {
                          const textarea = document.querySelector('textarea');
                          if (textarea) textarea.style.minHeight = '60px';
                        }
                      }}
                      disabled={posting}
                      maxLength={1800}
                    />

                  </div>
                </div>
              </div>

              {/* Action Bar / Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    disabled={posting}
                    title="Add photos or videos"
                  >
                    <span className="text-xl">📷</span>
                    <span className="text-sm hidden sm:inline">Photo/Video</span>
                  </button>
                  
                  <button
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                    title="Tag products"
                  >
                    <span className="text-xl">🛒</span>
                    <span className="text-sm hidden sm:inline">Products</span>
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
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  onClick={handlePost}
                  disabled={posting || (!newPost.trim() && !mediaFiles.length)}
                >
                  <span className="text-lg">📤</span>
                  {posting ? 'Publishing...' : 'Publish'}
                </button>
              </div>

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
                          showPopup('error', 'Unsupported Format', `File "${file.name}" has an unsupported format. Please use images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM, OGG).`);
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
      
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar { 
          display: none;
        }
      `}</style>
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