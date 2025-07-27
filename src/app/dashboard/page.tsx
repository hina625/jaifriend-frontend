'use client';
import { useEffect, useState, useRef } from 'react';
import AlbumDisplay from '@/components/AlbumDisplay';
import Link from 'next/link';

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
    const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
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
    } else {
      console.error('Failed to edit post');
    }
  };

  // Delete a comment
  const handleDeleteComment = async (postId: string, commentId: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/posts/${postId}/comment/${commentId}`, {
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

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/posts'),
      fetch('http://localhost:5000/api/albums')
    ])
      .then(responses => Promise.all(responses.map(res => res.json())))
      .then(([postsData, albumsData]) => {
        // Combine posts and albums into a single feed
        const combinedFeed = [
          ...postsData.map((post: any) => ({ ...post, type: 'post' })),
          ...albumsData.map((album: any) => ({ ...album, type: 'album' }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPosts(combinedFeed.filter(item => item.type === 'post'));
        setAlbums(combinedFeed.filter(item => item.type === 'album'));
        setLoadingPosts(false);
        setLoadingAlbums(false);
      })
      .catch(() => {
        setLoadingPosts(false);
        setLoadingAlbums(false);
      });
  }, []);

  const handlePost = async () => {
    if (!newPost.trim() && !mediaFiles.length) return;
    setPosting(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('content', newPost);
      mediaFiles.forEach(file => formData.append('media', file));
      const res = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });
      if (res.ok) {
        const post = await res.json();
        setPosts([post, ...posts]);
        setNewPost('');
        setMediaFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        console.error('Failed to post');
      }
    } catch (err) {
      console.error('Failed to post');
    } finally {
      setPosting(false);
    }
  };

  // Delete a post
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this post?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (res.ok) {
      setPosts(posts.filter(p => (p._id || p.id) !== id));
      if (editingPostId === id) cancelEditPost();
    } else {
      console.error('Failed to delete post');
    }
  };

  // Like a post
  const handleLike = async (postId: string) => {
    const token = localStorage.getItem('token');
    console.log('Liking post:', postId);
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Like response:', data);
        setPosts(posts => posts.map(p => (p._id === postId || p.id === postId) ? { 
          ...p, 
          likes: data.likes || p.likes,
          liked: data.liked 
        } : p));
      } else {
        console.error('Failed to like post:', res.status, res.statusText);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Save a post
  const handleSave = async (postId: string) => {
    const token = localStorage.getItem('token');
    console.log('Saving post:', postId);
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/save`, {
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
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
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
  const handleShare = async (postId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(posts => posts.map(p => (p._id === postId || p.id === postId) ? { ...p, shares: data.shares, shared: data.shared } : p));
        
        // Show success message
        const post = posts.find(p => (p._id === postId || p.id === postId));
        if (post) {
          console.log('Post Shared!');
        }
      } else {
        console.error('Failed to share post');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  // Handle album deletion
  const handleAlbumDelete = async (albumId: string) => {
    if (!window.confirm('Delete this album?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/albums/${albumId}`, {
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
    try {
      const res = await fetch(`http://localhost:5000/api/albums/${albumId}/like`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAlbums(prev => prev.map(album => 
          album._id === albumId ? { ...album, likes: data.likes, liked: data.liked } : album
        ));
      }
    } catch (error) {
      console.error('Error liking album:', error);
    }
  };

  // Handle album comment
  const handleAlbumComment = async (albumId: string, comment: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/albums/${albumId}/comment`, {
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
      const res = await fetch(`http://localhost:5000/api/albums/${albumId}/save`, {
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
      }
    } catch (error) {
      console.error('Error saving album:', error);
    }
  };

  // Handle album share
  const handleAlbumShare = async (albumId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/albums/${albumId}/share`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAlbums(prev => prev.map(album => 
          album._id === albumId ? { ...album, shares: data.shares, shared: data.shared } : album
        ));
        console.log('Album Shared!');
      }
    } catch (error) {
      console.error('Error sharing album:', error);
    }
  };

  // Helper to get full media URL
  const getMediaUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
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

  return (
    <div className="bg-[#f4f7fb] min-h-screen pt-2 sm:pt-4 pb-6 w-full">
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
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
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
        <div className="flex flex-col xl:flex-row gap-3 sm:gap-4 w-full">
          {/* Main content */}
          <div className="w-full xl:flex-1 max-w-none xl:max-w-2xl xl:mx-0">
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
                      setMediaFiles(prev => [...prev, ...fileArray]);
                    }
                  }}
                />
                <button
                  className="bg-gray-100 px-3 py-2 rounded-full text-xs sm:text-sm"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  disabled={posting}
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
                  <div className="text-xs text-gray-600 mb-1">Selected files:</div>
                  <div className="flex flex-wrap gap-1">
                    {mediaFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                        <span className="truncate max-w-[80px] sm:max-w-none">{file.name}</span>
                        <button
                          onClick={() => setMediaFiles(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
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

                  return combinedFeed.map((item: any) => {
                    if (item.type === 'album') {
                      return (
                        <AlbumDisplay
                          key={item._id}
                          album={item}
                          onDelete={handleAlbumDelete}
                          isOwner={false}
                          onLike={handleAlbumLike}
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
                                <Link href={`/dashboard/profile/${item.user._id || item.user.id || item.user.userId}`}>
                                  <img
                                    src={item.user.avatar || '/avatars/1.png.png'}
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-400 mr-2 cursor-pointer"
                                    alt={item.user.name || 'User'}
                                  />
                                </Link>
                              ) : (
                                <img
                                  src="/avatars/1.png.png"
                                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-400 mr-2"
                                  alt="User"
                                />
                              )}
                              {item.user ? (
                                <Link href={`/dashboard/profile/${item.user._id || item.user.id || item.user.userId}`} className="font-semibold text-sm sm:text-base hover:underline cursor-pointer">
                                  {item.user.name || 'Anonymous'}
                                </Link>
                              ) : (
                                <div className="font-semibold text-sm sm:text-base">Anonymous</div>
                              )}
                            </div>
                            {/* Media indicator */}
                            {item.media && item.media.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                {item.media.some((m: any) => m.type === 'video') && <span>🎥</span>}
                                {item.media.some((m: any) => m.type === 'image') && <span>📷</span>}
                                <span className="hidden sm:inline">{item.media.length} media</span>
                                <span className="sm:hidden">{item.media.length}</span>
                              </div>
                            )}
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
                            <div className="mb-2 sm:mb-3 text-sm sm:text-base">{item.content}</div>
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
                            <button 
                              className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${
                                Array.isArray(item.likes) && item.likes.length > 0 
                                  ? 'text-red-500 bg-red-50 border border-red-200' 
                                  : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                              }`} 
                              onClick={() => handleLike(item._id || item.id)}
                            >
                              <span>❤️</span>
                              <span className="font-medium">
                                {Array.isArray(item.likes) ? item.likes.length : 0}
                              </span>
                            </button>
                            <button 
                              className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${
                                Array.isArray(item.savedBy) && item.savedBy.length > 0 
                                  ? 'text-green-500 bg-green-50 border border-green-200' 
                                  : 'text-gray-500 hover:text-green-500 hover:bg-green-50'
                              }`} 
                              onClick={() => handleSave(item._id || item.id)}
                            >
                              <span>💾</span>
                              <span className="font-medium hidden sm:inline">
                                {Array.isArray(item.savedBy) && item.savedBy.length > 0 ? 'Saved' : 'Save'}
                              </span>
                            </button>
                            <button 
                              className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${
                                Array.isArray(item.shares) && item.shares.length > 0 
                                  ? 'text-purple-500 bg-purple-50 border border-purple-200' 
                                  : 'text-gray-500 hover:text-purple-500 hover:bg-purple-50'
                              }`} 
                              onClick={() => handleShare(item._id || item.id)}
                            >
                              <span>🔗</span>
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
                                        <span className="font-medium text-xs sm:text-sm">{comment.user?.name || 'Anonymous'}</span>
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
          <div className="w-full xl:w-1/4 flex flex-col gap-3 sm:gap-4">
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
              <div className="grid grid-cols-2 gap-2">
                <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308" className="rounded-lg aspect-square object-cover" />
                <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb" className="rounded-lg aspect-square object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
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