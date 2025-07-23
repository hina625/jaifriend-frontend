'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AlbumDisplay from '@/components/AlbumDisplay';
import PostDisplay from '@/components/PostDisplay';

export default function SavedPosts() {
  const [savedAlbums, setSavedAlbums] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchSaved = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        // Fetch saved albums
        const savedAlbumsRes = await fetch('http://localhost:5000/api/albums/saved', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (savedAlbumsRes.ok) {
          const savedAlbumsData = await savedAlbumsRes.json();
          setSavedAlbums(savedAlbumsData);
        } else if (savedAlbumsRes.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        // Fetch saved posts
        const savedPostsRes = await fetch('http://localhost:5000/api/posts/saved', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (savedPostsRes.ok) {
          const savedPostsData = await savedPostsRes.json();
          setSavedPosts(savedPostsData);
        }
      } catch (error) {
        console.error('Error fetching saved albums:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuthAndFetchSaved();
  }, [router]);

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
        setSavedAlbums(prev => prev.map(album => 
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
        setSavedAlbums(prev => prev.map(album => 
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
        // Remove from saved list if unsaved
        if (!data.saved) {
          setSavedAlbums(prev => prev.filter(album => album._id !== albumId));
        } else {
          setSavedAlbums(prev => prev.map(album => 
            album._id === albumId ? { ...album, savedBy: data.savedBy, saved: data.saved } : album
          ));
        }
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
        setSavedAlbums(prev => prev.map(album => 
          album._id === albumId ? { ...album, shares: data.shares, shared: data.shared } : album
        ));
        alert('Album shared successfully!');
      }
    } catch (error) {
      console.error('Error sharing album:', error);
    }
  };

  // Handle post like
  const handlePostLike = async (postId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedPosts(prev => prev.map(post => 
          post._id === postId ? { ...post, likes: data.likes, liked: data.liked } : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Handle post save
  const handlePostSave = async (postId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/save`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Remove from saved list if unsaved
        if (!data.saved) {
          setSavedPosts(prev => prev.filter(post => post._id !== postId));
        } else {
          setSavedPosts(prev => prev.map(post => 
            post._id === postId ? { ...post, savedBy: data.savedBy, saved: data.saved } : post
          ));
        }
      }
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  // Handle post comment
  const handlePostComment = async (postId: string, comment: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: comment })
      });
      if (res.ok) {
        const data = await res.json();
        setSavedPosts(prev => prev.map(post => 
          post._id === postId ? { ...post, comments: data.comments } : post
        ));
      }
    } catch (error) {
      console.error('Error commenting on post:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Saved Posts</h1>
              <p className="text-sm text-gray-500">Your saved albums and posts</p>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading saved posts...</p>
          </div>
        ) : savedAlbums.length === 0 && savedPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🔖</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved posts yet</h3>
            <p className="text-gray-500 mb-6">
              When you save albums or posts, they'll appear here for easy access.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Explore Posts
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Saved Albums */}
            {savedAlbums.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Saved Albums ({savedAlbums.length})
                </h2>
                <div className="space-y-6">
                  {savedAlbums.map((album) => (
                    <AlbumDisplay
                      key={album._id}
                      album={album}
                      isOwner={false}
                      onLike={handleAlbumLike}
                      onComment={handleAlbumComment}
                      onSave={handleAlbumSave}
                      onShare={handleAlbumShare}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Saved Posts */}
            {savedPosts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Saved Posts ({savedPosts.length})
                </h2>
                <div className="space-y-6">
                  {savedPosts.map((post) => (
                    <PostDisplay
                      key={post._id}
                      post={post}
                      isOwner={false}
                      onLike={handlePostLike}
                      onComment={handlePostComment}
                      onSave={handlePostSave}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}