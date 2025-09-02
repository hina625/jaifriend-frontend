"use client";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Search, Camera, Video, Music, FileText, Plus, MapPin, Globe, Calendar, Users, Eye, Phone } from 'lucide-react';
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
  education?: string;
  isOnline?: boolean;
  joinedDate?: string;
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

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userImages, setUserImages] = useState<UserImages>({ avatar: null, cover: null });
  const [posts, setPosts] = useState<Post[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const tabs = [
    { id: 'timeline', label: 'Timeline', count: posts.length },
    { id: 'albums', label: 'Albums', count: albums.length }
  ];

  const filters = [
    { id: 'all', label: 'All', icon: <FileText className="w-4 h-4" /> },
    { id: 'text', label: 'Text', icon: <FileText className="w-4 h-4" /> },
    { id: 'photos', label: 'Photos', icon: <Camera className="w-4 h-4" /> },
    { id: 'videos', label: 'Videos', icon: <Video className="w-4 h-4" /> },
    { id: 'sounds', label: 'Sounds', icon: <Music className="w-4 h-4" /> }
  ];

  useEffect(() => {
    fetchUserProfile();
    fetchUserImages();
    fetchUserPosts();
    fetchUserAlbums();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/register');
        return;
      }

  const response = await fetch(`${API_URL}/api/profile/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setLoading(false);
      } else {
        console.error('Failed to fetch user profile:', response.status);
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

  const response = await fetch(`${API_URL}/api/userimages`, {
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
      if (!token) return;

  const response = await fetch(`${API_URL}/api/posts/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const postsData = await response.json();
        setPosts(postsData);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const fetchUserAlbums = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

  const response = await fetch(`${API_URL}/api/albums/user`, {
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

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setEditContent(post.content);
    setShowEditModal(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/posts/${postId}`, {
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
  const response = await fetch(`${API_URL}/api/posts/${editingPost._id}`, {
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

  const getMediaUrl = (url: string) => {
    if (!url) return '/default-avatar.svg';
    if (url.startsWith('http')) return url;
  return `${API_URL}/${url}`;
  };

  const getFilteredContent = () => {
    let combinedContent = [
      ...posts.map((post: any) => ({ ...post, type: 'post' })),
      ...albums.map((album: any) => ({ ...album, type: 'album' }))
    ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (searchQuery) {
      combinedContent = combinedContent.filter(item => {
        if (item.type === 'post') {
          return item.content.toLowerCase().includes(searchQuery.toLowerCase());
        } else if (item.type === 'album') {
          return item.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return false;
      });
    }

    switch (activeFilter) {
      case 'text':
        combinedContent = combinedContent.filter(item => {
          if (item.type === 'post') {
            return !item.media || item.media.length === 0;
          }
          return false;
        });
        break;
      case 'photos':
        combinedContent = combinedContent.filter(item => {
          if (item.type === 'post') {
            return item.media && item.media.some((media: any) =>
              media.type?.startsWith('image/') || media.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
            );
          } else if (item.type === 'album') {
            return item.media && item.media.length > 0;
          }
          return false;
        });
        break;
      case 'videos':
        combinedContent = combinedContent.filter(item => {
          if (item.type === 'post') {
            return item.media && item.media.some((media: any) =>
              media.type?.startsWith('video/') || media.url?.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)
            );
          }
          return false;
        });
        break;
      case 'sounds':
        combinedContent = combinedContent.filter(item => {
          if (item.type === 'post') {
            return item.media && item.media.some((media: any) =>
              media.type?.startsWith('audio/') || media.url?.match(/\.(mp3|wav|ogg|aac|flac)$/i)
            );
          }
          return false;
        });
        break;
      default:
        break;
    }

    return combinedContent;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 overflow-x-hidden max-w-full pb-4">
      {/* Cover Photo Section */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 overflow-hidden">
        {userImages.cover && (
          <img
            src={getMediaUrl(userImages.cover)}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Header */}
      <div className="relative px-3 pb-4 -mt-20">
        <div className="w-full max-w-full">
          {/* Profile Picture and Actions */}
          <div className="flex flex-col items-center gap-3 mb-4">
            {/* Profile Picture */}
            <div className="relative">
              <img
                src={userImages.avatar ? getMediaUrl(userImages.avatar) : '/default-avatar.svg'} onError={(e) => { console.log('❌ Avatar load failed for user:', userImages.avatar ? getMediaUrl(userImages.avatar) : '/default-avatar.svg'); e.currentTarget.src = '/default-avatar.svg'; }}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover bg-gray-200"
              />
            </div>

            {/* User Info */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.name}</h1>
              <p className="text-lg text-gray-600 mb-3">@{user.username}</p>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2">
                <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <span className="text-lg">〰️</span>
                  <span className="text-sm font-medium">Wave</span>
                </button>
                
                <button className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                  <span className="text-lg">✏️</span>
                  <span className="text-sm font-medium">Edit</span>
                </button>
                
                <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  <span className="text-sm font-medium">Activities</span>
                </button>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="mb-4 text-center">
            {user.bio && (
              <p className="text-gray-700 mb-3">{user.bio}</p>
            )}

            <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3 justify-center">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {user.website}
                  </a>
                </div>
              )}
              {user.joinedDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
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
            {/* Content Layout - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Left Sidebar - User Information */}
              <div className="lg:col-span-1 space-y-4">
                {/* Search Box */}
                <div className="bg-white rounded-xl shadow-sm p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search for posts"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>

                {/* User Details Card */}
                <div className="bg-white rounded-xl shadow-sm p-3 space-y-3">
                  {/* Status */}
                  <div className="text-center">
                    <p className="text-gray-800 font-medium">{user.bio || 'No bio added yet'}</p>
                  </div>

                  {/* Online Status */}
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm text-gray-600">{user.isOnline ? 'Online' : 'Offline'}</span>
                  </div>

                  {/* Connections */}
                  <div className="space-y-3">
                    <div className="text-center mb-3">
                      <h4 className="text-sm font-semibold text-gray-700">Connections</h4>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Users className="w-5 h-5 flex-shrink-0 text-blue-500" />
                        <span className="text-lg font-bold">{user.following?.length || 0}</span>
                        <span className="text-sm text-blue-600">Following</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                      <div className="flex items-center gap-2 text-green-700">
                        <Users className="w-5 h-5 flex-shrink-0 text-green-500" />
                        <span className="text-lg font-bold">{user.followers?.length || 0}</span>
                        <span className="text-sm text-green-600">Followers</span>
                      </div>
                    </div>
                  </div>

                  {/* Posts Count */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span>{posts.length} posts</span>
                  </div>

                  {/* Additional User Details */}
                  {user.gender && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-lg">👤</span>
                      <span>{user.gender}</span>
                    </div>
                  )}

                  {user.workplace && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-lg">💼</span>
                      <span>{user.workplace}</span>
                    </div>
                  )}

                  {user.education && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-lg">🎓</span>
                      <span>{user.education}</span>
                    </div>
                  )}

                  {user.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-lg">🏠</span>
                      <span>{user.location}</span>
                    </div>
                  )}

                  {user.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{user.address}</span>
                    </div>
                  )}

                  {user.country && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-lg">🌍</span>
                      <span>{user.country}</span>
                    </div>
                  )}

                  {user.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}

                  {user.dateOfBirth && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-lg">🎂</span>
                      <span>{new Date(user.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                  )}

                  {user.joinedDate && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  {user.website && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Globe className="w-4 h-4 flex-shrink-0" />
                      <a
                        href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        {user.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Content Area - Posts and Content */}
              <div className="lg:col-span-3 space-y-4">
                {/* Content Filter Buttons */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style jsx>{`
                      .filter-scroll::-webkit-scrollbar {
                        display: none;
                      }
                    `}</style>
                    <div className="filter-scroll flex items-center gap-2">
                      {filters.map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setActiveFilter(filter.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                            activeFilter === filter.id
                              ? 'bg-red-100 text-red-600 border border-red-200'
                              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {filter.icon}
                          <span className="text-sm font-medium">{filter.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Posts Feed */}
                <div className="space-y-4">
                  {(() => {
                    const filteredContent = getFilteredContent();

                    if (filteredContent.length === 0) {
                      return (
                        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                          <div className="text-gray-400 mb-3">
                            <FileText className="w-16 h-16 mx-auto" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No content found</h3>
                          <p className="text-gray-600 text-sm">
                            {searchQuery ? 'Try adjusting your search terms' : 'This user hasn\'t shared anything yet'}
                          </p>
                        </div>
                      );
                    }

                    return filteredContent.map((item: any) => {
                      if (item.type === 'album') {
                        return (
                          <div key={item._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <img
                                  src={user?.avatar ? getMediaUrl(user.avatar) : '/default-avatar.svg'} onError={(e) => { console.log('❌ Avatar load failed for user:', user?.avatar ? getMediaUrl(user.avatar) : '/default-avatar.svg'); e.currentTarget.src = '/default-avatar.svg'; }}
                                  alt={user?.name || 'User'}
                                  className="w-10 h-10 rounded-full border-2 border-blue-400"
                                />
                                <div>
                                  <h4 className="font-semibold text-gray-900">{user?.name || 'User'}</h4>
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
                              onPostUpdate={(updatedPost) => {
                                // Update the post in the local state
                                setPosts(prevPosts => 
                                  prevPosts.map(post => 
                                    post._id === updatedPost._id ? updatedPost : post
                                  )
                                );
                              }}
                              onLike={async (postId) => {
                                try {
                                  const token = localStorage.getItem('token');
                                  if (!token) return;
                                  
                                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}/like`, {
                                    method: 'POST',
                                    headers: {
                                      'Authorization': `Bearer ${token}`
                                    }
                                  });
                                  
                                  if (response.ok) {
                                    fetchUserPosts();
                                  }
                                } catch (error) {
                                  console.error('Error liking post:', error);
                                }
                              }}
                              onReaction={async (postId, reactionType) => {
                                try {
                                  const token = localStorage.getItem('token');
                                  if (!token) return;
                                  
                                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}/reaction`, {
                                    method: 'POST',
                                    headers: {
                                      'Authorization': `Bearer ${token}`,
                                      'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ reactionType })
                                  });
                                  
                                  if (response.ok) {
                                    fetchUserPosts();
                                  }
                                } catch (error) {
                                  console.error('Error adding reaction:', error);
                                }
                              }}
                              onComment={async (postId, comment) => {
                                try {
                                  const token = localStorage.getItem('token');
                                  if (!token) return;
                                  
                                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}/comment`, {
                                    method: 'POST',
                                    headers: {
                                      'Authorization': `Bearer ${token}`,
                                      'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ content: comment })
                                  });
                                  
                                  if (response.ok) {
                                    fetchUserPosts();
                                  }
                                } catch (error) {
                                  console.error('Error commenting on post:', error);
                                }
                              }}
                              onSave={async (postId) => {
                                try {
                                  const token = localStorage.getItem('token');
                                  if (!token) return;
                                  
                                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}/save`, {
                                    method: 'POST',
                                    headers: {
                                      'Authorization': `Bearer ${token}`
                                    }
                                  });
                                  
                                  if (response.ok) {
                                    fetchUserPosts();
                                  }
                                } catch (error) {
                                  console.error('Error saving post:', error);
                                }
                              }}
                              onShare={async (postId, shareOptions) => {
                                try {
                                  const token = localStorage.getItem('token');
                                  if (!token) return;
                                  
                                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${postId}/share`, {
                                    method: 'POST',
                                    headers: {
                                      'Authorization': `Bearer ${token}`,
                                      'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(shareOptions)
                                  });
                                  
                                  if (response.ok) {
                                    showPopup('success', 'Post Shared', 'Post has been shared successfully!');
                                    fetchUserPosts();
                                  }
                                } catch (error) {
                                  console.error('Error sharing post:', error);
                                  showPopup('error', 'Share Failed', 'Failed to share post');
                                }
                              }}
                              onDelete={handleDeletePost}
                              onEdit={handleEditPost}
                              onToggleComments={async (postId) => {
                                console.log('Toggle comments for post:', postId);
                              }}
                              isOwner={true}
                              showEditDelete={true}
                            />
                          </div>
                        );
                      }
                    });
                  })()}
                </div>
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

export default ProfilePage;
