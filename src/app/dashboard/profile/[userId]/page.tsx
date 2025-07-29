"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Edit, Trash2, MoreVertical, Search, Filter, Camera, Video, Music, FileText, Plus, Heart, MessageCircle, Share2, Bookmark, Settings, Camera as CameraIcon, UserPlus, UserCheck, MapPin, Globe, Calendar, Phone, ArrowLeft, BarChart3, Users, Clock, Link as LinkIcon, Gift } from 'lucide-react';
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
    { id: 'all', label: 'All', icon: <Filter className="w-4 h-4" /> },
    { id: 'text', label: 'Text', icon: <FileText className="w-4 h-4" /> },
    { id: 'photos', label: 'Photos', icon: <CameraIcon className="w-4 h-4" /> },
    { id: 'videos', label: 'Videos', icon: <Video className="w-4 h-4" /> },
    { id: 'sounds', label: 'Sounds', icon: <Music className="w-4 h-4" /> }
  ];

  useEffect(() => {
    if (actualUserId) {
      fetchUserProfile();
      fetchUserContent();
    }
  }, [actualUserId]);

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

      const response = await fetch(`http://localhost:5000/api/users/${actualUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('User data received:', userData);
        setUser(userData);
        setIsFollowing(userData.isFollowing);
        setIsBlocked(userData.isBlocked);
        
        // Check if this is the current user's profile
        const currentUserResponse = await fetch('http://localhost:5000/api/profile/me', {
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
        console.error('Profile fetch error:', errorData);
        setError(errorData.error || 'User not found');
        showPopup('error', 'Error', errorData.error || 'User not found');
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
      
      // Fetch posts
      const postsResponse = await fetch(`http://localhost:5000/api/users/${actualUserId}/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData);
      }

      // Fetch albums
      const albumsResponse = await fetch(`http://localhost:5000/api/users/${actualUserId}/albums`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (albumsResponse.ok) {
        const albumsData = await albumsResponse.json();
        setAlbums(albumsData);
      }
    } catch (error) {
      console.error('Error fetching user content:', error);
    }
  };

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) return;

      const response = await fetch(`http://localhost:5000/api/users/${user.id}/follow`, {
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

      const response = await fetch(`http://localhost:5000/api/users/${user.id}/block`, {
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

  const handleDeletePost = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
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

      const response = await fetch(`http://localhost:5000/api/posts/${editingPost._id}`, {
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
    return `http://localhost:5000${url}`;
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Profile...</h2>
          <p className="text-gray-600">Fetching user data and posts</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error ? 'Error Loading Profile' : 'User Not Found'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The user profile you're looking for doesn't exist."}
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.href = '/dashboard/profile/users'}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Browse All Users
            </button>
            <br />
            <button 
              onClick={() => window.history.back()}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button and More Options */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cover Photo Section */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 overflow-hidden">
        {user.coverPhoto && (
          <img
            src={getMediaUrl(user.coverPhoto)}
            alt="Cover"
            className="w-full h-full object-cover"
          />
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
      <div className="relative px-4 md:px-8 pb-6 -mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div className="flex items-end gap-4">
              {/* Profile Picture */}
              <div className="relative">
                <img
                  src={getMediaUrl(user.avatar)}
                  alt={user.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl object-cover bg-gray-200"
                />
                <button className="absolute bottom-2 right-2 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-gray-700 transition-colors">
                  <CameraIcon className="w-4 h-4" />
                </button>
                {user.isOnline && (
                  <div className="absolute bottom-6 right-6 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user.name}</h1>
                  {user.isVerified && (
                    <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                      PRO
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-lg mb-2">@{user.username}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 md:pb-4">
              {!isCurrentUser ? (
                <>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleMessage}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Message
                  </button>
                  <button 
                    onClick={handleFollow}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
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
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                    <FileText className="w-4 h-4" />
                    Activities
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-4 border-b-2 transition-colors whitespace-nowrap min-w-fit ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {activeTab === 'timeline' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 sticky top-24">
                {/* Search Box */}
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

                {/* User Stats */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{getLastSeenText(user.lastSeen)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{user.following || 0} Following</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{user.followers || 0} Followers</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{posts.length} posts</span>
                  </div>
                  {user.website && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <LinkIcon className="w-4 h-4" />
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
                      <MapPin className="w-4 h-4" />
                      <span>Living in {user.location}</span>
                    </div>
                  )}
                </div>

                {/* Profile Picture */}
                <div className="pt-4 border-t">
                  <img
                    src={getMediaUrl(user.avatar)}
                    alt={user.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Filter Tabs */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex border-b -mb-4">
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
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
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start gap-3">
                    <img
                      src={getMediaUrl(user.avatar)}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        {user.isVerified && (
                          <div className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                            PRO
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">1 w</p>
                      <p className="text-gray-800">{user.bio}</p>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Posts */}
              {getFilteredPosts().length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <FileText className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery ? 'Try adjusting your search terms' : 'No posts to display.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
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
          </div>
        )}

        {/* Other tabs content */}
        {activeTab === 'photos' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Videos</h2>
            <p className="text-gray-600">No videos yet.</p>
          </div>
        )}

        {activeTab === 'following' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Following ({user.following || 0})</h2>
            <p className="text-gray-600">Following list coming soon!</p>
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Followers ({user.followers || 0})</h2>
            <p className="text-gray-600">Followers list coming soon!</p>
          </div>
        )}

        {activeTab !== 'timeline' && activeTab !== 'photos' && activeTab !== 'videos' && activeTab !== 'following' && activeTab !== 'followers' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            <p className="text-gray-600">This section is coming soon!</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => router.push('/dashboard')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-50"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Edit Post Modal */}
      {showEditModal && editingPost && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Post</h3>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="What's on your mind?"
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPost(null);
                  setEditContent('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
}