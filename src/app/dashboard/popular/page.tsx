"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, Filter, Search, TrendingUp, Grid, List, Bookmark, Share2, Heart, MessageCircle } from 'lucide-react';
import PostDisplay from '@/components/PostDisplay';
import AlbumDisplay from '@/components/AlbumDisplay';

export default function PopularPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filters = [
    { id: 'all', label: 'All', icon: TrendingUp },
    { id: 'posts', label: 'Posts', icon: MessageCircle },
    { id: 'albums', label: 'Albums', icon: Grid },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
  ];

  const fetchPopularContent = async () => {
    try {
      const [postsResponse, albumsResponse] = await Promise.all([
        fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/posts'),
        fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/albums')
      ]);
      
      const [postsData, albumsData] = await Promise.all([
        postsResponse.json(),
        albumsResponse.json()
      ]);
      
      setPosts(postsData);
      setAlbums(albumsData);
    } catch (error) {
      console.error('Error fetching popular content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularContent();
  }, []);

  // Listen for album creation events to refresh content
  useEffect(() => {
    const handleAlbumCreated = () => {
      fetchPopularContent();
    };

    const handleAlbumDeleted = () => {
      fetchPopularContent();
    };

    window.addEventListener('albumCreated', handleAlbumCreated);
    window.addEventListener('albumDeleted', handleAlbumDeleted);
    return () => {
      window.removeEventListener('albumCreated', handleAlbumCreated);
      window.removeEventListener('albumDeleted', handleAlbumDeleted);
    };
  }, []);

  const filteredContent = () => {
    let filteredPosts = posts;
    let filteredAlbums = albums;

    if (searchQuery) {
      filteredPosts = posts.filter(post => 
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      filteredAlbums = albums.filter(album => 
        album.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (activeFilter) {
      case 'posts':
        return { posts: filteredPosts, albums: [] };
      case 'albums':
        return { posts: [], albums: filteredAlbums };
      case 'trending':
        // Sort by engagement or date for trending
        return { 
          posts: filteredPosts.slice(0, 5), 
          albums: filteredAlbums.slice(0, 3) 
        };
      default:
        return { posts: filteredPosts, albums: filteredAlbums };
    }
  };

  const { posts: displayPosts, albums: displayAlbums } = filteredContent();

  const handlePostShare = async (postId: string, shareOptions?: any) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/posts/${postId}/share', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shareOptions || {})
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(post => 
          post._id === postId ? { ...post, shares: data.shares, shared: data.shared } : post
        ));
        console.log('Post shared successfully!');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handlePostView = async (postId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/posts/${postId}/view', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(post => 
          post._id === postId ? { ...post, views: data.views } : post
        ));
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleLike = async (postId: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/posts/${postId}/like', { 
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
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/posts/${postId}/reaction', { 
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading popular content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Popular Feed</h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Discover trending posts and albums
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Search Toggle */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2 rounded-lg transition-colors ${showSearch ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                <Search className="w-5 h-5" />
              </button>
              
              {/* View Mode Toggle - Hidden on mobile */}
              <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
              
              {/* Filter Button */}
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="mt-3 sm:mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts and albums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm sm:text-base ${
                    activeFilter === filter.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>{displayPosts.length + displayAlbums.length} items</span>
              {searchQuery && (
                <span className="text-blue-600">
                  Results for "{searchQuery}"
                </span>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <span>{displayPosts.length} posts</span>
              <span>{displayAlbums.length} albums</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          {displayPosts.length === 0 && displayAlbums.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                {searchQuery ? (
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                ) : (
                  <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No results found' : 'No content available'}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? `Try adjusting your search terms or browse all content.`
                  : 'No posts or albums found. Check back later for fresh content!'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter('all');
                  }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium text-sm sm:text-base"
                >
                  Show All Content
                </button>
              )}
            </div>
          ) : (
            <div className={`space-y-6 sm:space-y-8 ${viewMode === 'grid' ? 'sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:space-y-0' : ''}`}>
              {/* Albums Section */}
              {displayAlbums.length > 0 && (
                <div className={viewMode === 'grid' ? 'sm:col-span-full' : ''}>
                  {viewMode === 'list' && (
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Grid className="w-5 h-5 text-blue-500" />
                        Albums ({displayAlbums.length})
                      </h2>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View all
                      </button>
                    </div>
                  )}
                  <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' : 'space-y-4 sm:space-y-6'}`}>
                    {displayAlbums.map((album) => (
                      <div key={album._id} className={viewMode === 'grid' ? 'bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow' : ''}>
                        <AlbumDisplay album={album} isOwner={false} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts Section */}
              {displayPosts.length > 0 && (
                <div className={viewMode === 'grid' ? 'sm:col-span-full' : ''}>
                  {viewMode === 'list' && (
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-green-500" />
                        Posts ({displayPosts.length})
                      </h2>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View all
                      </button>
                    </div>
                  )}
                  <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' : 'space-y-4 sm:space-y-6'}`}>
                    {displayPosts.map((post) => (
                      <div key={post._id} className={viewMode === 'grid' ? 'bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow' : ''}>
                        <PostDisplay 
                          post={post} 
                          isOwner={false}
                          onLike={handleLike}
                          onReaction={handleReaction}
                          onShare={handlePostShare}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-3 z-20">
        <button className="w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group">
          <Bookmark className="w-5 h-5 text-gray-600 group-hover:text-blue-500" />
        </button>
        <button className="w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group">
          <Share2 className="w-5 h-5 text-gray-600 group-hover:text-green-500" />
        </button>
      </div>

      {/* Mobile Bottom Safe Area */}
      <div className="sm:hidden h-safe-area-inset-bottom"></div>
    </div>
  );
}