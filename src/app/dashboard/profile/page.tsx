"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Edit, BarChart3, List, Plus, Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react';

interface ProfileData {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverPhoto: string;
  workplace?: string;
  country?: string;
  address?: string;
  gender?: string;
  bio?: string;
  location?: string;
  following: number;
  followers: number;
  posts: number;
  isOnline: boolean;
  userPosts: any[];
  followingList: any[];
  followersList: any[];
  completionItems: any[];
}

interface ProfileCompletionItem {
  id: string;
  title: string;
  completed: boolean;
  icon: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>({
    id: '',
    name: 'Loading...',
    username: '@loading',
    avatar: '/avatars/1.png.png',
    coverPhoto: '/covers/default-cover.jpg',
    workplace: undefined,
    country: 'Pakistan',
    address: undefined,
    gender: 'Male',
    bio: '',
    location: '',
    following: 0,
    followers: 0,
    posts: 0,
    isOnline: true,
    userPosts: [],
    followingList: [],
    followersList: [],
    completionItems: []
  });

  const [activeTab, setActiveTab] = useState('Timeline');
  const [loading, setLoading] = useState(true);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [feedPosts, setFeedPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [creatingPost, setCreatingPost] = useState(false);
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  const tabs = [
    { id: 'Timeline', label: 'Timeline', icon: '📄' },
    { id: 'Feed', label: 'Feed', icon: '📰' },
    { id: 'Groups', label: 'Groups', icon: '👥' },
    { id: 'Likes', label: 'Likes', icon: '❤️' },
    { id: 'Following', label: `Following ${profile.following}`, icon: '👤' },
    { id: 'Followers', label: `Followers ${profile.followers}`, icon: '👥' },
    { id: 'Photos', label: 'Photos', icon: '📷' },
    { id: 'Videos', label: 'Videos', icon: '🎥' },
    { id: 'Reels', label: 'Reels', icon: '🎬' },
    { id: 'Products', label: 'Products', icon: '🛍️' }
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'Feed') {
      loadFeed();
    }
    if (activeTab === 'Likes') {
      loadLikedPosts();
    }
    if (activeTab === 'Groups') {
      loadGroups();
    }
  }, [activeTab]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('http://localhost:5000/api/profile/me', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        console.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeed = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('http://localhost:5000/api/profile/feed', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFeedPosts(data);
      }
    } catch (error) {
      console.error('Error loading feed:', error);
    }
  };

  const loadLikedPosts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('http://localhost:5000/api/profile/liked-posts', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setLikedPosts(await res.json());
  };
  const loadGroups = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('http://localhost:5000/api/profile/groups', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setGroups(await res.json());
  };

  const handleBackClick = () => {
    window.history.back();
  };

  const handleEditProfile = () => {
    window.location.href = '/dashboard/profile/edit';
  };

  const handleCoverPhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      const token = localStorage.getItem('token');
      
      // For now, we'll simulate upload by using a placeholder
      // In a real app, you'd upload to a file server first
      const coverPhotoUrl = URL.createObjectURL(file);
      
      const response = await fetch('http://localhost:5000/api/profile/cover', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ coverPhoto: coverPhotoUrl })
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({ ...prev, coverPhoto: data.coverPhoto }));
        alert('Cover photo updated successfully!');
      } else {
        alert('Failed to update cover photo');
      }
    } catch (error) {
      console.error('Error updating cover photo:', error);
      alert('Error updating cover photo');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const token = localStorage.getItem('token');
      
      // For now, we'll simulate upload
      const avatarUrl = URL.createObjectURL(file);
      
      const response = await fetch('http://localhost:5000/api/profile/avatar', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ avatar: avatarUrl })
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({ ...prev, avatar: data.avatar }));
        alert('Profile picture updated successfully!');
      } else {
        alert('Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      alert('Error updating profile picture');
    }
  };

  const handleCompletionItemClick = (item: ProfileCompletionItem) => {
    if (!item.completed) {
      // Navigate to appropriate edit section
      console.log('Complete:', item.title);
      if (item.id === 'workplace' || item.id === 'address') {
        window.location.href = '/dashboard/profile/edit';
      }
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    setCreatingPost(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newPostContent })
      });
      if (response.ok) {
        setNewPostContent('');
        await loadProfile();
        await loadFeed();
      } else {
        alert('Failed to create post');
      }
    } catch (error) {
      alert('Error creating post');
    } finally {
      setCreatingPost(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 d';
    if (diffDays < 7) return `${diffDays} d`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} w`;
    return `${Math.floor(diffDays / 30)} m`;
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

  let mainContent;
  if (activeTab === 'Feed') {
    mainContent = (
      <div className="space-y-4">
        {feedPosts.length > 0 ? feedPosts.map((post: any) => (
          <div key={post._id} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-start gap-3 mb-3">
              <img
                src={post.author?.avatar || profile.avatar}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {post.author?.name || profile.name}
                  </span>
                  <span className="text-gray-500 text-sm">• {formatDate(post.createdAt)}</span>
                </div>
                <p className="text-gray-700 mb-3">{post.content}</p>
                {/* Post Media */}
                {post.media && post.media.length > 0 && (
                  <div className="mb-3">
                    {post.media.map((media: any, index: number) => (
                      <img
                        key={index}
                        src={media.url}
                        alt="Post media"
                        className="w-full rounded-lg"
                      />
                    ))}
                  </div>
                )}
                {/* Post Actions */}
                <div className="flex items-center gap-4 text-gray-500">
                  <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{post.likes?.length || 0}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post.comments?.length || 0}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                    <Share className="w-4 h-4" />
                    <span className="text-sm">{post.shares?.length || 0}</span>
                  </button>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        )) : (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-gray-400 text-2xl">📄</span>
            </div>
            <p className="text-gray-600 font-medium">No posts in feed yet</p>
            <p className="text-gray-500 text-sm mt-1">Follow people to see their posts here!</p>
          </div>
        )}
      </div>
    );
  } else if (activeTab === 'Likes') {
    mainContent = (
      <div className="space-y-4">
        {likedPosts.length > 0 ? likedPosts.map((post: any) => (
          <div key={post._id} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-start gap-3 mb-3">
              <img
                src={post.author?.avatar || profile.avatar}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {post.author?.name || profile.name}
                  </span>
                  <span className="text-gray-500 text-sm">• {formatDate(post.createdAt)}</span>
                </div>
                <p className="text-gray-700 mb-3">{post.content}</p>
                {/* Post Media */}
                {post.media && post.media.length > 0 && (
                  <div className="mb-3">
                    {post.media.map((media: any, index: number) => (
                      <img
                        key={index}
                        src={media.url}
                        alt="Post media"
                        className="w-full rounded-lg"
                      />
                    ))}
                  </div>
                )}
                {/* Post Actions */}
                <div className="flex items-center gap-4 text-gray-500">
                  <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{post.likes?.length || 0}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post.comments?.length || 0}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                    <Share className="w-4 h-4" />
                    <span className="text-sm">{post.shares?.length || 0}</span>
                  </button>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        )) : (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-gray-400 text-2xl">❤️</span>
            </div>
            <p className="text-gray-600 font-medium">No liked posts yet</p>
            <p className="text-gray-500 text-sm mt-1">Like posts to see them here!</p>
          </div>
        )}
      </div>
    );
  } else if (activeTab === 'Groups') {
    mainContent = (
      <div className="space-y-4">
        {groups.length > 0 ? groups.map((group: any) => (
          <div key={group._id} className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-bold text-lg">{group.name}</h3>
            <p className="text-gray-600">{group.description}</p>
          </div>
        )) : (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-gray-400 text-2xl">👥</span>
            </div>
            <p className="text-gray-600 font-medium">No groups joined yet</p>
            <p className="text-gray-500 text-sm mt-1">Join groups to see them here!</p>
          </div>
        )}
      </div>
    );
  } else {
    mainContent = (
      <div className="space-y-4">
        {profile.userPosts.length > 0 ? profile.userPosts.map((post: any) => (
          <div key={post._id} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-start gap-3 mb-3">
              <img
                src={post.author?.avatar || profile.avatar}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {post.author?.name || profile.name}
                  </span>
                  <span className="text-gray-500 text-sm">• {formatDate(post.createdAt)}</span>
                </div>
                <p className="text-gray-700 mb-3">{post.content}</p>
                
                {/* Post Media */}
                {post.media && post.media.length > 0 && (
                  <div className="mb-3">
                    {post.media.map((media: any, index: number) => (
                      <img
                        key={index}
                        src={media.url}
                        alt="Post media"
                        className="w-full rounded-lg"
                      />
                    ))}
                  </div>
                )}
                
                {/* Post Actions */}
                <div className="flex items-center gap-4 text-gray-500">
                  <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{post.likes?.length || 0}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post.comments?.length || 0}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                    <Share className="w-4 h-4" />
                    <span className="text-sm">{post.shares?.length || 0}</span>
                  </button>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        )) : (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-gray-400 text-2xl">📄</span>
            </div>
            <p className="text-gray-600 font-medium">No posts yet</p>
            <p className="text-gray-500 text-sm mt-1">Start sharing your thoughts!</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo Section */}
      <div className="relative h-64 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
        {profile.coverPhoto && (
          <img
            src={profile.coverPhoto}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="absolute top-4 left-4 w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Cover Photo Controls */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <label className="px-3 py-1 bg-black bg-opacity-50 text-white text-sm rounded hover:bg-opacity-70 transition-all flex items-center gap-1 cursor-pointer">
            <Camera className="w-4 h-4" />
            Cover
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverPhotoChange}
              className="hidden"
              disabled={uploadingCover}
            />
          </label>
          <button className="px-3 py-1 bg-black bg-opacity-50 text-white text-sm rounded hover:bg-opacity-70 transition-all">
            ⬌
          </button>
        </div>

        {/* Profile Picture */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            <img
              src={profile.avatar}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <label className="absolute bottom-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-all cursor-pointer">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="pt-20 px-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h1>
            <p className="text-gray-600">{profile.username}</p>
            {profile.bio && (
              <p className="text-gray-700 mt-2">{profile.bio}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-100 rounded text-gray-700 hover:bg-gray-200 transition-all">
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleEditProfile}
              className="px-3 py-1 bg-gray-100 rounded text-gray-700 hover:bg-gray-200 transition-all flex items-center gap-1"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button className="px-3 py-1 bg-gray-100 rounded text-gray-700 hover:bg-gray-200 transition-all flex items-center gap-1">
              <List className="w-4 h-4" />
              Activities
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search for posts"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">👁️</span>
                  <span className={profile.isOnline ? 'text-green-600' : 'text-gray-500'}>
                    {profile.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">👤</span>
                  <span>{profile.following} Following</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">👥</span>
                  <span>{profile.followers} Followers</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">📄</span>
                  <span>{profile.posts} posts</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center">😊</span>
                  <span>{profile.gender}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">🌍</span>
                  <span>Living in {profile.country}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Post Creation */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
              <div className="flex items-start gap-3">
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="What's going on? #Hashtag.. @Mention.. Link.."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newPostContent}
                    onChange={e => setNewPostContent(e.target.value)}
                    disabled={creatingPost}
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      onClick={handleCreatePost}
                      disabled={creatingPost}
                    >
                      {creatingPost ? 'Posting...' : 'Post'}
                    </button>
                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      🎥
                    </button>
                    <button className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors">
                      📷
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Type Tabs */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
              <div className="flex gap-4">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">
                  All
                </button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
                  📄 Text
                </button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
                  📷 Photos
                </button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
                  🎥 Videos
                </button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
                  🔊 Sounds
                </button>
              </div>
            </div>

            {/* User Posts or Feed or Likes or Groups */}
            {mainContent}
          </div>
        </div>

        {/* Profile Completion Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Completion</h2>
          <div className="space-y-3">
            {profile.completionItems?.map((item: ProfileCompletionItem) => (
              <div
                key={item.id}
                onClick={() => handleCompletionItemClick(item)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  item.completed 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className={`flex-1 ${item.completed ? 'text-green-700' : 'text-gray-700'}`}>
                  {item.title}
                </span>
                {item.completed ? (
                  <span className="text-green-500">✓</span>
                ) : (
                  <span className="text-gray-400">+</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ProfilePage; 