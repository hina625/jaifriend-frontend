'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AlbumDisplay from '@/components/AlbumDisplay';
import SharePopup, { ShareOptions } from '@/components/SharePopup';
import LatestProducts from '@/components/LatestProducts';
import Popup from '@/components/Popup';
import type { PopupState } from '@/components/Popup';

function getUserAvatar() {
  // Try to get avatar from localStorage (if you store it there after login), otherwise use default
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.avatar || '/avatars/1.png.png';
  } catch {
    return '/avatars/1.png.png';
  }
}

export default function Dashboard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit a post
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editMediaFiles, setEditMediaFiles] = useState<File[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Share popup state
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [selectedPostForShare, setSelectedPostForShare] = useState<any>(null);

  // Popup state
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  // Popup functions
  const showPopup = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    setPopup({ isOpen: true, type, title, message });
  };

  const closePopup = () => {
    setPopup({ ...popup, isOpen: false });
  };

  const startEditPost = (post: any) => {
    setEditingPostId(post._id || post.id);
    setEditContent(post.content);
    setEditMediaFiles([]);
  };

  const cancelEditPost = () => {
    setEditingPostId(null);
    setEditContent('');
    setEditMediaFiles([]);
  };

  const handleEditPost = async (postId: string) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('content', editContent);
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
      
      // Dispatch event to notify other components (like profile)
      window.dispatchEvent(new CustomEvent('postUpdated'));
    } else {
      console.error('Failed to edit post');
    }
  };

  // Delete a comment
  const handleDeleteComment = async (postId: string, commentId: string) => {
    const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}/comment/${commentId}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (res.ok) {
      const data = await res.json();
      setPosts(posts => posts.map(p => (p._id === postId || p.id === postId) ? data.post : p));
    } else {
      console.error('Failed to delete comment');
    }
  };

  const fetchFeedData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching feed data with token:', token ? 'Present' : 'Missing');
      
      const [postsResponse, albumsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts`, token ? { headers: { 'Authorization': `Bearer ${token}` } } : {}),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/albums`, token ? { headers: { 'Authorization': `Bearer ${token}` } } : {})
      ]);
      
      console.log('📡 Posts response status:', postsResponse.status);
      console.log('📡 Albums response status:', albumsResponse.status);
      
      if (!postsResponse.ok) {
        console.error('❌ Posts API error:', postsResponse.status, postsResponse.statusText);
        const errorText = await postsResponse.text();
        console.error('❌ Posts error details:', errorText);
      }
      
      if (!albumsResponse.ok) {
        console.error('❌ Albums API error:', albumsResponse.status, albumsResponse.statusText);
        const errorText = await albumsResponse.text();
        console.error('❌ Albums error details:', errorText);
      }
      
      const [postsData, albumsData] = await Promise.all([
        postsResponse.ok ? postsResponse.json() : [],
        albumsResponse.ok ? albumsResponse.json() : []
      ]);
      
      console.log('📊 Posts fetched:', postsData.length);
      console.log('📊 Albums fetched:', albumsData.length);
      console.log('📊 Sample album:', albumsData[0]);
      
      // Combine posts and albums into a single feed
      const combinedFeed = [
        ...postsData.map((post: any) => ({ ...post, type: 'post' })),
        ...albumsData.map((album: any) => ({ ...album, type: 'album' }))
      ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      console.log('📊 Combined feed items:', combinedFeed.length);
      console.log('📊 Feed breakdown:', {
        posts: postsData.length,
        albums: albumsData.length,
        total: combinedFeed.length
      });
      
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
    fetchFeedData();
  }, []);

  // Listen for album creation and deletion events
  useEffect(() => {
    const handleAlbumCreated = () => {
      fetchFeedData();
    };

    const handleAlbumDeleted = () => {
      fetchFeedData();
    };

    const handlePostCreated = () => {
      console.log('Post created event received, refreshing feed...');
      fetchFeedData();
    };

    const handlePostDeleted = () => {
      console.log('Post deleted event received, refreshing feed...');
      fetchFeedData();
    };

    const handlePostUpdated = () => {
      console.log('Post updated event received, refreshing feed...');
      fetchFeedData();
    };

    window.addEventListener('albumCreated', handleAlbumCreated);
    window.addEventListener('albumDeleted', handleAlbumDeleted);
    window.addEventListener('postCreated', handlePostCreated);
    window.addEventListener('postDeleted', handlePostDeleted);
    window.addEventListener('postUpdated', handlePostUpdated);
    
    return () => {
      window.removeEventListener('albumCreated', handleAlbumCreated);
      window.removeEventListener('albumDeleted', handleAlbumDeleted);
      window.removeEventListener('postCreated', handlePostCreated);
      window.removeEventListener('postDeleted', handlePostDeleted);
      window.removeEventListener('postUpdated', handlePostUpdated);
    };
  }, []);

  // Track views for posts when they are displayed
  useEffect(() => {
    const trackViews = async () => {
      const token = localStorage.getItem('token');
      if (token && posts.length > 0) {
        // Track views for the first few posts (to avoid too many requests)
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
            console.error('Error tracking view for post:', post._id, error);
          }
        }
      }
    };
    
    if (posts.length > 0) {
      trackViews();
    }
  }, [posts]);

  // Track views for albums when they are displayed
  useEffect(() => {
    const trackAlbumViews = async () => {
      const token = localStorage.getItem('token');
      if (token && albums.length > 0) {
        // Track views for the first few albums (to avoid too many requests)
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
            console.error('Error tracking view for album:', album._id, error);
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
    
    setPosting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showPopup('error', 'Authentication Error', 'Please log in again to create posts');
        return;
      }

      const formData = new FormData();
      formData.append('content', newPost.trim());
      
      // Add media files with proper validation
      mediaFiles.forEach((file, index) => {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File "${file.name}" is too large. Maximum size is 10MB.`);
        }
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
        if (!validTypes.includes(file.type)) {
          throw new Error(`File "${file.name}" has an unsupported format. Please use images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM, OGG).`);
        }
        
        formData.append('media', file);
      });

      console.log('Creating post with content:', newPost.trim());
      console.log('Media files:', mediaFiles.length);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (res.ok) {
        const post = await res.json();
        console.log('Post created successfully:', post);
        setPosts([post, ...posts]);
        setNewPost('');
        setMediaFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        showPopup('success', 'Post Created!', 'Your post has been shared successfully!');
        
        // Dispatch event to refresh profile pages
        window.dispatchEvent(new CustomEvent('postCreated'));
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Failed to create post. Please try again.';
        showPopup('error', 'Post Failed', errorMessage);
        console.error('Failed to create post:', res.status, errorMessage);
      }
    } catch (err) {
      console.error('Error creating post:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post. Please try again.';
      showPopup('error', 'Post Failed', errorMessage);
    } finally {
      setPosting(false);
    }
  };

  // Delete a post
  const handleDelete = async (id: string) => {
    // Store the post ID for deletion
    setPostToDelete(id);
    
    // Show confirmation popup
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

  // Handle popup confirmation for delete
  const handlePopupConfirm = async () => {
    if (popup.title === 'Delete Post' && postToDelete) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          showPopup('error', 'Authentication Error', 'Please log in again to delete posts.');
          return;
        }

        const deletePostId = postToDelete;

        // Show loading popup
        showPopup('info', 'Deleting Post', 'Please wait while we delete your post...');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${deletePostId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          // Remove post from state
          setPosts(posts.filter(p => (p._id || p.id) !== deletePostId));
          if (editingPostId === deletePostId) cancelEditPost();
          
          // Clear the post to delete
          setPostToDelete(null);
          
          // Show success popup
          showPopup('success', 'Post Deleted', 'Your post has been successfully deleted.');
          
          // Dispatch event to refresh other pages
          window.dispatchEvent(new CustomEvent('postDeleted'));
        } else {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.message || 'Failed to delete post. Please try again.';
          showPopup('error', 'Delete Failed', errorMessage);
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        showPopup('error', 'Network Error', 'Failed to connect to server. Please check your internet connection.');
      }
    }
  };

  // Like a post
  const handleLike = async (postId: string) => {
    const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (res.ok) {
      const data = await res.json();
      setPosts(posts => posts.map(p => (p._id === postId || p.id === postId) ? data.post : p));
    } else {
      console.error('Failed to like post');
    }
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}/reaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ reactionType })
    });
    if (res.ok) {
      const data = await res.json();
      setPosts(posts => posts.map(p => (p._id === postId || p.id === postId) ? data.post : p));
    } else {
      console.error('Failed to add reaction');
    }
  };

  // Save a post
  const handleSave = async (postId: string) => {
    const token = localStorage.getItem('token');
    console.log('Saving post:', postId);
    try {
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Save response:', data);
        setPosts(posts => posts.map(p => (p._id === postId || p.id === postId) ? { 
          ...p, 
          savedBy: data.savedBy || p.savedBy,
          saved: data.saved 
        } : p));
        
        // Dispatch event to refresh saved page
        window.dispatchEvent(new CustomEvent('postSaved'));
        
        // Show feedback
        const post = posts.find(p => (p._id === postId || p.id === postId));
        if (post) {
          if (data.saved) {
            console.log('Post Saved!');
          } else {
            console.log('Post Removed');
          }
        }
      } else {
        console.error('Failed to save post:', res.status, res.statusText);
      }
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  // Add comment to a post
  const handleAddComment = async (postId: string, commentText: string, clearInput: () => void) => {
    if (!commentText.trim()) return;
    const token = localStorage.getItem('token');
    console.log('Adding comment to post:', postId, commentText);
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
        console.log('Comment response:', data);
        setPosts(posts => posts.map(p => (p._id === postId || p.id === postId) ? {
          ...p,
          comments: [...(p.comments || []), data.comment]
        } : p));
        clearInput();
        console.log('Comment Posted!');
      } else {
        console.error('Failed to add comment:', res.status, res.statusText);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Share a post
  const handleShare = async (postId: string, shareOptions?: ShareOptions) => {
    const token = localStorage.getItem('token');
    try {
      console.log('Sharing post:', postId, 'with options:', shareOptions);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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
        console.log('Post shared successfully:', data);
        
        // Update post shares count
        setPosts(posts => posts.map(p => 
          (p._id === postId || p.id === postId) ? { ...p, shares: data.shares, shared: data.shared } : p
        ));
        
        // Show success message
        showPopup('success', 'Post Shared!', 'Your post has been shared successfully!');
        
        // Refresh feed to show the shared post
        fetchFeedData();
      } else {
        const errorData = await res.json();
        console.error('Post share error:', errorData);
        showPopup('error', 'Share Failed', errorData.message || 'Failed to share post');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      showPopup('error', 'Network Error', 'Failed to share post. Please try again.');
    }
  };

  const openSharePopup = (post: any) => {
    setSelectedPostForShare(post);
    setShowSharePopup(true);
  };

  // Handle view tracking
  const handleView = async (postId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL || `http://localhost:5000/api/posts/${postId}/view`, {
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
      console.error('Error tracking view:', error);
    }
  };

  // Handle album deletion
  const handleAlbumDelete = async (albumId: string) => {
    if (!window.confirm('Delete this album?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL || `http://localhost:5000/api/albums/${albumId}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (res.ok) {
      setAlbums(prev => prev.filter(album => album._id !== albumId));
    } else {
      console.error('Failed to delete album');
    }
  };

  // Handle album like
  const handleAlbumLike = async (albumId: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/albums/${albumId}/like`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (res.ok) {
      const data = await res.json();
      setAlbums(albums => albums.map(a => a._id === albumId ? data.album : a));
    } else {
      console.error('Failed to like album');
    }
  };

  const handleAlbumReaction = async (albumId: string, reactionType: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/albums/${albumId}/reaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ reactionType })
    });
    if (res.ok) {
      const data = await res.json();
      setAlbums(albums => albums.map(a => a._id === albumId ? data.album : a));
    } else {
      console.error('Failed to add reaction to album');
    }
  };

  // Handle album comment
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
      console.error('Error commenting on album:', error);
    }
  };

  // Handle album save
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
        
        // Dispatch event to refresh saved page
        window.dispatchEvent(new CustomEvent('albumSaved'));
      }
    } catch (error) {
      console.error('Error saving album:', error);
    }
  };

  // Handle album share
  const handleAlbumShare = async (albumId: string, shareOptions?: ShareOptions) => {
    const token = localStorage.getItem('token');
    try {
      console.log('Sharing album:', albumId, 'with options:', shareOptions);
      
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
        console.log('Album shared successfully:', data);
        
        // Update album shares count
        setAlbums(prev => prev.map(album => 
          album._id === albumId ? { ...album, shares: data.shares, shared: data.shared } : album
        ));
        
        // Show success message
        showPopup('success', 'Album Shared!', 'Your album has been shared successfully!');
        
        // Refresh feed to show the shared post
        fetchFeedData();
      } else {
        const errorData = await res.json();
        console.error('Album share error:', errorData);
        showPopup('error', 'Share Failed', errorData.message || 'Failed to share album');
      }
    } catch (error) {
      console.error('Error sharing album:', error);
      showPopup('error', 'Network Error', 'Failed to share album. Please try again.');
    }
  };

  // Helper to get full media URL
  const getMediaUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}${url}`;
  };

  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Replace 'userEmail' with the actual key you use in localStorage
    const email = localStorage.getItem("userEmail");
    if (email) setUserEmail(email);
  }, []);

  // Add state for user story
  const [userStory, setUserStory] = useState<string | null>(null);
  const storyInputRef = useRef<HTMLInputElement>(null);

  // Load user story from localStorage on mount
  useEffect(() => {
    const savedStory = localStorage.getItem('userStory');
    if (savedStory) setUserStory(savedStory);
  }, []);

  // Handle story upload
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

  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const router = useRouter();

  // Navigate to user profile
  const navigateToProfile = (userId: string) => {
    // Use window.location for more reliable navigation
    window.location.href = `/dashboard/profile/${userId}`;
  };

  return (
    <div className="bg-[#f4f7fb] min-h-screen pt-2 sm:pt-4 pb-6 w-full scrollbar-hide">
      <div className="px-3 sm:px-4 lg:px-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
          {userEmail ? `Hello, ${userEmail}! 👋` : "Hello!"}
        </h1>
        {user && (
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <img src={user.avatar || '/avatars/1.png.png'} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-500" />
            <span className="font-bold text-blue-700 text-xs sm:text-sm md:text-base">ID: {user._id || user.id}</span>
          </div>
        )}

        {/* Stories Row at the top */}
        <div className="w-full pt-2 mb-3 sm:mb-4">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {/* Current user story */}
            <div className="flex-shrink-0 flex flex-col items-center group cursor-pointer" onClick={() => storyInputRef.current?.click()}>
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
                <img
                  src={getUserAvatar()}
                  className="w-20 h-28 sm:w-24 sm:h-36 md:w-32 md:h-48 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-blue-500 mb-2 sm:mb-3 shadow-lg sm:shadow-xl object-cover transition-transform group-hover:scale-105"
                  alt="Your Story"
                />
              )}
              <span className="text-xs sm:text-sm text-[#022e8a] font-semibold">Your Story</span>
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                ref={storyInputRef}
                onChange={handleStoryUpload}
              />
            </div>
            {/* Demo static stories */}
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center group cursor-pointer">
                <div className="w-20 h-28 sm:w-24 sm:h-36 md:w-32 md:h-48 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-gray-300 mb-2 sm:mb-3 shadow-lg sm:shadow-xl bg-gray-200 flex items-center justify-center transition-transform group-hover:scale-105">
                  {/* Optionally, you can put a user icon or plus icon here */}
                </div>
                <span className="text-xs sm:text-sm text-[#34495e] group-hover:text-[#022e8a] font-medium">User {i}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main layout - Responsive */}
        <div className="flex flex-col xl:flex-row gap-3 sm:gap-4 w-full scrollbar-hide">
          {/* Main content */}
          <div className="w-full xl:flex-1 max-w-none xl:max-w-2xl xl:mx-0 scrollbar-hide">
            {/* Post Creation */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <input
                  type="text"
                  placeholder="What's going on? #Hashtag.. @Mention.. Link.."
                  className="flex-1 border rounded-full px-3 py-2 text-sm"
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                  disabled={posting}
                />
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
                      
                      // Validate files before adding
                      const validFiles = fileArray.filter(file => {
                        // Check file size (max 10MB)
                        if (file.size > 10 * 1024 * 1024) {
                          showPopup('error', 'File Too Large', `File "${file.name}" is too large. Maximum size is 10MB.`);
                          return false;
                        }
                        
                        // Check file type
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
                <button
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full text-xs sm:text-sm transition-colors"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  disabled={posting}
                  title="Add photos or videos"
                >
                  📷/🎥
                </button>
                <button
                  className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm"
                  onClick={handlePost}
                  disabled={posting || (!newPost.trim() && !mediaFiles.length)}
                >
                  {posting ? 'Posting...' : 'Post'}
                </button>
              </div>
              {mediaFiles.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-600 mb-2">Selected files ({mediaFiles.length}):</div>
                  <div className="flex flex-wrap gap-2">
                    {mediaFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-lg">
                            {file.type.startsWith('image/') ? '🖼️' : '🎥'}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-medium truncate max-w-[120px]">{file.name}</span>
                            <span className="text-gray-500">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
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

            {/* Feed */}
            {loadingPosts && loadingAlbums ? (
              <div className="text-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Loading your feed...</p>
              </div>
            ) : posts.length === 0 && albums.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📱</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No posts yet</h3>
                <p className="text-gray-500 text-sm">Be the first to share something amazing!</p>
              </div>
            ) : (
              <>
                {/* Feed Stats */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow p-3 sm:p-4 mb-3 sm:mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="flex items-center gap-1">
                        📝 <span className="font-medium">{posts.length}</span> posts
                      </span>
                      <span className="flex items-center gap-1">
                        📸 <span className="font-medium">{albums.length}</span> albums
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 hidden sm:inline">
                      Latest updates first
                    </span>
                  </div>
                </div>

                {/* Create combined feed sorted by creation date */}
                {(() => {
                  const combinedFeed = [
                    ...posts.map((post: any) => ({ ...post, type: 'post' })),
                    ...albums.map((album: any) => ({ ...album, type: 'album' }))
                  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                  console.log('🎯 Rendering feed with items:', combinedFeed.length);
                  console.log('🎯 Feed items breakdown:', {
                    posts: posts.length,
                    albums: albums.length,
                    combined: combinedFeed.length
                  });

                  return combinedFeed.map((item: any) => {
                    console.log('🎯 Rendering item:', item.type, item._id, item.name || item.content?.substring(0, 50));
                    
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
                          onSave={handleAlbumSave}
                          onShare={handleAlbumShare}
                        />
                      );
                    } else {
                      return (
                        <div key={item._id || item.id} className="bg-white rounded-lg sm:rounded-xl shadow p-3 sm:p-4 mb-3 sm:mb-4">
                          <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <div className="flex items-center flex-1">
                              {item.user ? (
                                <a 
                                  href={`/dashboard/profile/${String(item.user._id || item.user.id || item.user.userId || '')}`}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <img
                                    src={item.user.avatar || '/avatars/1.png.png'}
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-400 mr-2 cursor-pointer"
                                    alt={item.user.name || 'User'}
                                  />
                                </a>
                              ) : (
                                <img
                                  src="/avatars/1.png.png"
                                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-400 mr-2"
                                  alt="User"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                {item.user ? (
                                  <a 
                                    href={`/dashboard/profile/${String(item.user._id || item.user.id || item.user.userId || '')}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="font-semibold text-sm sm:text-base hover:underline cursor-pointer truncate block"
                                  >
                                    {item.user.name || 'Anonymous'}
                                  </a>
                                ) : (
                                  <div className="font-semibold text-sm sm:text-base truncate">Anonymous</div>
                                )}
                                <div className="text-xs text-gray-400">
                                  {new Date(item.createdAt).toLocaleString()}
                                  {item.isShared && (
                                    <span className="ml-2 text-blue-600">📤 Shared</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Post Actions Menu */}
                            <div className="flex items-center gap-2">
                              {/* Media indicator */}
                              {item.media && item.media.length > 0 && (
                                <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                  {item.media.some((m: any) => m.type === 'video') && <span>🎥</span>}
                                  {item.media.some((m: any) => m.type === 'image') && <span>📷</span>}
                                  <span className="hidden sm:inline">{item.media.length} media</span>
                                  <span className="sm:hidden">{item.media.length}</span>
                                </div>
                              )}
                              
                              {/* Edit/Delete Menu for own posts */}
                              {(() => {
                                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                                const isOwnPost = item.user && (
                                  item.user._id === currentUser._id || 
                                  item.user.id === currentUser.id || 
                                  item.user.userId === currentUser.id
                                );
                                
                                if (isOwnPost) {
                                  return (
                                    <div className="relative group">
                                      <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                        <span className="text-gray-500 hover:text-gray-700">⋮</span>
                                      </button>
                                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto min-w-[120px]">
                                        <button
                                          onClick={() => startEditPost(item)}
                                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                        >
                                          <span>✏️</span>
                                          <span>Edit</span>
                                        </button>
                                        <button
                                          onClick={() => handleDelete(item._id || item.id)}
                                          className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                        >
                                          <span>🗑️</span>
                                          <span>Delete</span>
                                        </button>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </div>

                          {/* Edit post form */}
                          {editingPostId === (item._id || item.id) ? (
                            <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200">
                              <textarea
                                className="w-full border rounded p-2 mb-2 text-sm"
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                                rows={3}
                                placeholder="Edit your post..."
                              />
                              <input
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                className="mb-2 text-sm w-full"
                                ref={editFileInputRef}
                                onChange={e => {
                                  const files = e.target.files;
                                  if (files) {
                                    const fileArray = Array.from(files);
                                    setEditMediaFiles(prev => [...prev, ...fileArray]);
                                  }
                                }}
                              />
                              {editMediaFiles.length > 0 && (
                                <div className="mb-2">
                                  <div className="text-xs text-gray-600 mb-1">Selected files:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {editMediaFiles.map((file, index) => (
                                      <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                                        <span className="truncate max-w-[80px] sm:max-w-none">{file.name}</span>
                                        <button
                                          onClick={() => setEditMediaFiles(prev => prev.filter((_, i) => i !== index))}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <button
                                  className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition text-sm flex-1 sm:flex-none"
                                  onClick={() => handleEditPost(item._id || item.id)}
                                  disabled={!editContent.trim()}
                                >
                                  Save
                                </button>
                                <button
                                  className="bg-gray-300 px-3 py-2 rounded hover:bg-gray-400 transition text-sm flex-1 sm:flex-none"
                                  onClick={cancelEditPost}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mb-2 sm:mb-3 text-sm sm:text-base">
                              {/* Show shared post indicator */}
                              {item.isShared && item.sharedFrom && (
                                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-blue-600">🔄</span>
                                    <span className="text-sm text-gray-600">
                                      {item.sharedFrom.userName} shared this
                                    </span>
                                  </div>
                                  {item.shareMessage && (
                                    <div className="text-sm mb-2">{item.shareMessage}</div>
                                  )}
                                  {/* Show original post content */}
                                  {item.sharedFrom.postId && (
                                    <div className="text-sm text-gray-700 italic">
                                      "{item.content}"
                                    </div>
                                  )}
                                  {/* Show shared album */}
                                  {item.sharedFrom.albumId && (
                                    <div className="text-sm text-gray-700 italic">
                                      Album: {item.sharedFrom.albumName}
                                      {item.sharedFrom.albumMedia && item.sharedFrom.albumMedia.length > 0 && (
                                        <div className="mt-2 flex gap-2 overflow-x-auto">
                                          {item.sharedFrom.albumMedia.slice(0, 3).map((media: any, idx: number) => (
                                            <img
                                              key={idx}
                                              src={getMediaUrl(media.url)}
                                              alt={`Album media ${idx + 1}`}
                                              className="w-16 h-16 object-cover rounded"
                                            />
                                          ))}
                                          {item.sharedFrom.albumMedia.length > 3 && (
                                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs">
                                              +{item.sharedFrom.albumMedia.length - 3}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                              {/* Show regular post content */}
                              {(!item.isShared || !item.sharedFrom) && item.content}
                            </div>
                          )}

                          {/* Show media if present */}
                          {item.media && item.media.length > 0 ? (
                            <div className="mb-3">
                              {item.media.length === 1 ? (
                                // Single media
                                item.media[0].type === 'video' ? (
                                  <video controls className="rounded-lg w-full max-h-64 sm:max-h-80 object-cover">
                                    <source src={getMediaUrl(item.media[0].url)} type="video/mp4" />
                                    Your browser does not support the video tag.
                                  </video>
                                ) : (
                                  <img src={getMediaUrl(item.media[0].url)} alt="media" className="rounded-lg w-full max-h-64 sm:max-h-80 object-cover" />
                                )
                              ) : (
                                // Multiple media - grid layout
                                <div className={`grid gap-1 sm:gap-2 ${item.media.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
                                  {item.media.map((media: any, index: number) => (
                                    <div key={index} className="relative">
                                      {media.type === 'video' ? (
                                        <video 
                                          controls 
                                          className="rounded-lg w-full h-24 sm:h-32 object-cover"
                                          onClick={() => {
                                            console.log('Video clicked:', media.url);
                                          }}
                                        >
                                          <source src={getMediaUrl(media.url)} type="video/mp4" />
                                          Your browser does not support the video tag.
                                        </video>
                                      ) : (
                                        <img 
                                          src={getMediaUrl(media.url)} 
                                          alt={`media ${index + 1}`} 
                                          className="rounded-lg w-full h-24 sm:h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                          onClick={() => {
                                            console.log('Image clicked:', media.url);
                                          }}
                                        />
                                      )}
                                      {/* Video play icon overlay */}
                                      {media.type === 'video' && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="bg-black bg-opacity-50 rounded-full p-1">
                                            <span className="text-white text-sm">▶</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : item.media && item.media.url ? (
                            // Backward compatibility for old single media structure
                            item.media.type === 'video' ? (
                              <video controls className="rounded-lg w-full max-h-64 sm:max-h-80 object-cover mb-3">
                                <source src={getMediaUrl(item.media.url)} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            ) : (
                              <img src={getMediaUrl(item.media.url)} alt="media" className="rounded-lg w-full max-h-64 sm:max-h-80 object-cover mb-3" />
                            )
                          ) : item.image && item.image !== '' ? (
                            // Legacy image support
                            <img src={getMediaUrl(item.image)} alt="media" className="rounded-lg w-full max-h-64 sm:max-h-80 object-cover mb-3" />
                          ) : null}

                          {/* Action buttons */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            <div className="relative">
                              <button 
                                className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${
                                  Array.isArray(item.reactions) && item.reactions.length > 0 
                                    ? 'text-red-500 bg-red-50 border border-red-200' 
                                    : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                                }`} 
                                onClick={() => handleLike(item._id || item.id)}
                                onMouseEnter={() => {
                                  // Show reaction popup on hover
                                  const reactionButton = document.getElementById(`reaction-${item._id || item.id}`);
                                  if (reactionButton) {
                                    reactionButton.classList.remove('hidden');
                                  }
                                }}
                                onMouseLeave={() => {
                                  // Hide reaction popup after delay
                                  setTimeout(() => {
                                    const reactionButton = document.getElementById(`reaction-${item._id || item.id}`);
                                    if (reactionButton) {
                                      reactionButton.classList.add('hidden');
                                    }
                                  }, 300);
                                }}
                              >
                                <span>
                                  {(() => {
                                    if (item.reactions && Array.isArray(item.reactions) && item.reactions.length > 0) {
                                      const reactionCounts: { [key: string]: number } = {};
                                      item.reactions.forEach((reaction: any) => {
                                        reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
                                      });
                                      const mostCommon = Object.keys(reactionCounts).reduce((a, b) => 
                                        reactionCounts[a] > reactionCounts[b] ? a : b
                                      );
                                      const reactionEmojis: { [key: string]: string } = {
                                        like: '👍',
                                        love: '❤️',
                                        haha: '😂',
                                        wow: '😮',
                                        sad: '😢',
                                        angry: '😠'
                                      };
                                      return reactionEmojis[mostCommon] || '👍';
                                    }
                                    return '👍';
                                  })()}
                                </span>
                                <span className="font-medium">
                                  {Array.isArray(item.reactions) ? item.reactions.length : (Array.isArray(item.likes) ? item.likes.length : 0)}
                                </span>
                              </button>
                              
                              {/* Reaction Popup */}
                              <div 
                                id={`reaction-${item._id || item.id}`}
                                className="absolute bottom-full left-0 mb-2 hidden z-50 bg-white rounded-full shadow-lg border border-gray-200 p-2"
                                onMouseEnter={() => {
                                  const reactionButton = document.getElementById(`reaction-${item._id || item.id}`);
                                  if (reactionButton) {
                                    reactionButton.classList.remove('hidden');
                                  }
                                }}
                                onMouseLeave={() => {
                                  const reactionButton = document.getElementById(`reaction-${item._id || item.id}`);
                                  if (reactionButton) {
                                    reactionButton.classList.add('hidden');
                                  }
                                }}
                              >
                                <div className="flex items-center gap-1">
                                  {[
                                    { type: 'like', emoji: '👍', color: 'bg-blue-500' },
                                    { type: 'love', emoji: '❤️', color: 'bg-red-500' },
                                    { type: 'haha', emoji: '😂', color: 'bg-yellow-500' },
                                    { type: 'wow', emoji: '😮', color: 'bg-yellow-500' },
                                    { type: 'sad', emoji: '😢', color: 'bg-yellow-500' },
                                    { type: 'angry', emoji: '😠', color: 'bg-orange-500' }
                                  ].map((reaction) => (
                                    <button
                                      key={reaction.type}
                                      onClick={() => handleReaction(item._id || item.id, reaction.type)}
                                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm hover:scale-110 transition-all duration-200 ${reaction.color}`}
                                      title={reaction.type.charAt(0).toUpperCase() + reaction.type.slice(1)}
                                    >
                                      {reaction.emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <button 
                              className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm touch-manipulation ${
                                Array.isArray(item.savedBy) && item.savedBy.length > 0 
                                  ? 'text-green-500 bg-green-50 border border-green-200' 
                                  : 'text-gray-500 hover:text-green-500 hover:bg-green-50'
                              }`} 
                              onClick={() => handleSave(item._id || item.id)}
                              style={{ touchAction: 'manipulation' }}
                            >
                              <span>💾</span>
                              <span className="font-medium hidden sm:inline">
                                {Array.isArray(item.savedBy) && item.savedBy.length > 0 ? 'Saved' : 'Save'}
                              </span>
                            </button>
                            <button 
                              className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm touch-manipulation ${
                                Array.isArray(item.shares) && item.shares.length > 0 
                                  ? 'text-green-500 bg-green-50 border border-green-200' 
                                  : 'text-gray-500 hover:text-green-500 hover:bg-green-50'
                              }`} 
                              onClick={() => openSharePopup(item)}
                              style={{ touchAction: 'manipulation' }}
                            >
                              <span>📤</span>
                              <span className="font-medium">
                                <span className="hidden sm:inline">Share </span>
                                {Array.isArray(item.shares) && item.shares.length > 0 ? `(${item.shares.length})` : ''}
                              </span>
                            </button>
                            <span className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 text-gray-400 text-xs sm:text-sm">
                              <span>💬</span>
                              <span className="font-medium">
                                {Array.isArray(item.comments) ? item.comments.length : 0}
                                <span className="hidden sm:inline"> comments</span>
                              </span>
                            </span>
                            <span className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 text-gray-400 text-xs sm:text-sm">
                              <span>👁️</span>
                              <span className="font-medium">
                                {Array.isArray(item.views) ? item.views.length : 0}
                                <span className="hidden sm:inline"> views</span>
                              </span>
                            </span>
                            
                            {/* Delete button for own posts */}
                            {(() => {
                              const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                              const isOwnPost = item.user && (
                                item.user._id === currentUser._id || 
                                item.user.id === currentUser.id || 
                                item.user.userId === currentUser.id
                              );
                              
                              if (isOwnPost) {
                                return (
                                  <button 
                                    onClick={() => handleDelete(item._id || item.id)}
                                    className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm text-red-500 hover:text-red-700 hover:bg-red-50"
                                    title="Delete post"
                                  >
                                    <span>🗑️</span>
                                    <span className="font-medium hidden sm:inline">Delete</span>
                                  </button>
                                );
                              }
                              return null;
                            })()}
                          </div>

                          {/* Comments Section */}
                          <div className="mt-3 border-t pt-3">
                            <div className="font-semibold mb-2 text-sm flex items-center gap-2">
                              <span>Comments</span>
                              {item.comments && item.comments.length > 0 && (
                                <span className="text-xs text-gray-500">({item.comments.length})</span>
                              )}
                            </div>
                            {item.comments && item.comments.length > 0 ? (
                              <div className="space-y-2 mb-3">
                                {item.comments.map((comment: any, idx: number) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <img src={comment.user?.avatar || '/avatars/1.png.png'} alt="avatar" className="w-6 h-6 rounded-full flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                                        {comment.user?.userId ? (
                                          <a 
                                            href={`/dashboard/profile/${String(comment.user.userId)}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="font-medium text-xs sm:text-sm hover:underline cursor-pointer"
                                          >
                                            {comment.user?.name || 'Anonymous'}
                                          </a>
                                        ) : (
                                          <span className="font-medium text-xs sm:text-sm">{comment.user?.name || 'Anonymous'}</span>
                                        )}
                                        <span className="text-xs text-gray-400">{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}</span>
                                      </div>
                                      <div className="text-sm break-words">{comment.text}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400 mb-3">No comments yet.</div>
                            )}
                            {/* Add comment form */}
                            <AddCommentForm postId={item._id || item.id} onAddComment={handleAddComment} />
                          </div>
                        </div>
                      );
                    }
                  });
                })()}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full xl:w-1/4 flex flex-col gap-3 sm:gap-4 scrollbar-hide">
            <div className="bg-white rounded-lg sm:rounded-xl shadow p-3 sm:p-4">
              <div className="font-semibold mb-2 text-sm">Pro Members</div>
              <button className="bg-orange-400 text-white px-3 py-2 rounded-full w-full mb-2 text-sm">Upgrade To Pro</button>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl shadow p-3 sm:p-4">
              <div className="font-semibold mb-2 text-sm">Pages you may like</div>
              <div className="flex flex-col gap-2">
                <button className="bg-gray-100 px-3 py-1 rounded-full text-sm">Apnademand</button>
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl shadow p-3 sm:p-4">
              <div className="font-semibold mb-2 text-sm">Latest Products</div>
              <LatestProducts />
            </div>
          </div>
        </div>
      </div>

      {/* Share Popup */}
      {selectedPostForShare && (
        <SharePopup
          isOpen={showSharePopup}
          onClose={() => {
            setShowSharePopup(false);
            setSelectedPostForShare(null);
          }}
          onShare={(shareOptions) => {
            handleShare(selectedPostForShare._id || selectedPostForShare.id, shareOptions);
          }}
          postContent={selectedPostForShare.content}
          postMedia={selectedPostForShare.media}
        />
      )}

      {/* General Popup */}
      <Popup 
        popup={popup} 
        onClose={closePopup} 
        onConfirm={handlePopupConfirm}
        onCancel={() => {
          setPostToDelete(null);
          closePopup();
        }}
      />
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


function AddCommentForm({ postId, onAddComment }: { postId: string, onAddComment: (postId: string, text: string, clearInput: () => void) => void }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const clearInput = () => setText('');
  
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={async e => {
        e.preventDefault();
        setLoading(true);
        await onAddComment(postId, text, clearInput);
        setLoading(false);
      }}
    >
      <input
        type="text"
        className="flex-1 border rounded-full px-3 py-2 text-sm"
        placeholder="Add a comment..."
        value={text}
        onChange={e => setText(e.target.value)}
        ref={inputRef}
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm flex-shrink-0"
        disabled={loading || !text.trim()}
      >
        {loading ? 'Posting...' : 'Comment'}
      </button>
    </form>
  );
}