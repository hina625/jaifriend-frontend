"use client";
import React, { useState, useEffect } from 'react';
import { Play, ThumbsUp, MessageCircle, Share2, MoreHorizontal, Plus, Settings, Users, User, FileText, Heart, Bookmark } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface UserInfo {
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  isPro: boolean;
  userId?: string;
}

interface Comment {
  _id: string;
  user: {
    name: string;
    avatar: string;
    userId?: string;
  };
  text: string;
  createdAt: string;
}

interface Video {
  _id: string;
  user: UserInfo;
  title?: string;
  description?: string;
  hashtag?: string;
  videoUrl: string;
  videoThumbnail?: string;
  isYoutube: boolean;
  isSponsored?: boolean;
  category?: string;
  likes: string[];
  views: string[];
  comments: Comment[];
  shares: string[];
  savedBy: string[];
  createdAt: string;
}

interface VideoPostProps {
  video: Video;
  onLike: (videoId: string, category: string) => void;
  onComment: (videoId: string, comment: string, category: string) => void;
  onShare: (videoId: string, category: string) => void;
  onSave: (videoId: string, category: string) => void;
  currentUserId?: string;
  playingVideoId: string | null;
  setPlayingVideoId: (id: string | null) => void;
}

function extractYoutubeId(url: string) {
  const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : '';
}

function getMediaUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:5000${url}`;
}

const WatchPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  // Get current user ID from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId);
      } catch (err) {
        console.error('Error parsing token:', err);
      }
    }
  }, []);

  // Fetch videos from backend
  useEffect(() => {
    const fetchAllVideos = async () => {
      try {
        setLoading(true);
        console.log('Fetching videos from backend...');
        
        // Try to fetch videos from all sources with individual error handling
        let allVideos: Video[] = [];
        
        try {
          console.log('Fetching from /videos endpoint...');
          const videosResponse = await axios.get(`${API_URL}/videos`);
          console.log('Videos response:', videosResponse.data);
          allVideos = [...allVideos, ...videosResponse.data];
        } catch (err) {
          console.error('Error fetching videos:', err);
        }
        
        try {
          console.log('Fetching from /posts/videos endpoint...');
          const postsResponse = await axios.get(`${API_URL}/posts/videos`);
          console.log('Posts videos response:', postsResponse.data);
          allVideos = [...allVideos, ...postsResponse.data];
        } catch (err) {
          console.error('Error fetching posts videos:', err);
        }
        
        try {
          console.log('Fetching from /albums/videos endpoint...');
          const albumsResponse = await axios.get(`${API_URL}/albums/videos`);
          console.log('Albums videos response:', albumsResponse.data);
          allVideos = [...allVideos, ...albumsResponse.data];
        } catch (err) {
          console.error('Error fetching albums videos:', err);
        }

        // If no videos found from backend, use mock videos
        if (allVideos.length === 0) {
          console.log('No videos found from backend, using mock videos...');
          const mockVideos: Video[] = [
            {
              _id: 'mock1',
              user: {
                name: 'John Doe',
                username: 'johndoe',
                avatar: '/avatars/1.png.png',
                verified: true,
                isPro: false,
                userId: 'user1'
              },
              title: 'Amazing Sunset View',
              description: 'Beautiful sunset captured during my evening walk. Nature is truly amazing! 🌅',
              hashtag: '#sunset #nature #beautiful #evening',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              videoThumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop',
              isYoutube: false,
              isSponsored: false,
              category: 'video',
              likes: ['user1', 'user2'],
              views: ['user1', 'user2', 'user3', 'user4'],
              comments: [
                {
                  _id: 'comment1',
                  user: {
                    name: 'Jane Smith',
                    avatar: '/avatars/2.png.png',
                    userId: 'user2'
                  },
                  text: 'This is absolutely stunning! 😍',
                  createdAt: new Date(Date.now() - 3600000).toISOString()
                }
              ],
              shares: ['user3'],
              savedBy: ['user1'],
              createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
              _id: 'mock2',
              user: {
                name: 'Sarah Wilson',
                username: 'sarahw',
                avatar: '/avatars/3.png.png',
                verified: false,
                isPro: true,
                userId: 'user3'
              },
              title: 'Cooking Tutorial: Pasta Carbonara',
              description: 'Learn how to make authentic Italian pasta carbonara in just 15 minutes! 🍝',
              hashtag: '#cooking #pasta #tutorial #food',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
              videoThumbnail: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=450&fit=crop',
              isYoutube: false,
              isSponsored: true,
              category: 'video',
              likes: ['user1', 'user2', 'user3', 'user4', 'user5'],
              views: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6'],
              comments: [
                {
                  _id: 'comment2',
                  user: {
                    name: 'Mike Johnson',
                    avatar: '/avatars/4.png.png',
                    userId: 'user4'
                  },
                  text: 'Tried this recipe and it was delicious!',
                  createdAt: new Date(Date.now() - 7200000).toISOString()
                },
                {
                  _id: 'comment3',
                  user: {
                    name: 'Lisa Brown',
                    avatar: '/avatars/5.png.png',
                    userId: 'user5'
                  },
                  text: 'Can\'t wait to try this! Looks amazing',
                  createdAt: new Date(Date.now() - 10800000).toISOString()
                }
              ],
              shares: ['user1', 'user2'],
              savedBy: ['user1', 'user3', 'user4'],
              createdAt: new Date(Date.now() - 172800000).toISOString()
            },
            {
              _id: 'mock3',
              user: {
                name: 'Alex Chen',
                username: 'alexchen',
                avatar: '/avatars/6.png.png',
                verified: true,
                isPro: true,
                userId: 'user6'
              },
              title: 'Travel Vlog: Tokyo Adventures',
              description: 'Exploring the amazing city of Tokyo! From street food to temples, this city has it all! 🇯🇵',
              hashtag: '#travel #tokyo #japan #vlog #adventure',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              videoThumbnail: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=450&fit=crop',
              isYoutube: false,
              isSponsored: false,
              category: 'video',
              likes: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7'],
              views: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9'],
              comments: [
                {
                  _id: 'comment4',
                  user: {
                    name: 'Emma Davis',
                    avatar: '/avatars/7.png.png',
                    userId: 'user7'
                  },
                  text: 'Tokyo is on my bucket list! This makes me want to go even more!',
                  createdAt: new Date(Date.now() - 1800000).toISOString()
                },
                {
                  _id: 'comment5',
                  user: {
                    name: 'David Lee',
                    avatar: '/avatars/8.png.png',
                    userId: 'user8'
                  },
                  text: 'Amazing footage! What camera are you using?',
                  createdAt: new Date(Date.now() - 5400000).toISOString()
                }
              ],
              shares: ['user1', 'user2', 'user3'],
              savedBy: ['user1', 'user2', 'user3', 'user4'],
              createdAt: new Date(Date.now() - 259200000).toISOString()
            }
          ];
          allVideos = mockVideos;
        }

        // Sort videos by creation date (newest first)
        allVideos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        console.log('Final videos array:', allVideos);
        setVideos(allVideos);
        setError(null);
      } catch (err) {
        console.error('Error in fetchAllVideos:', err);
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    fetchAllVideos();
  }, []);

  // Handle like/unlike video
  const handleLike = async (videoId: string, category: string = 'video') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to like videos');
        return;
      }

      let endpoint = `${API_URL}/videos/${videoId}/like`;
      if (category === 'post') {
        endpoint = `${API_URL}/posts/${videoId}/like`;
      } else if (category === 'album') {
        // For albums, we need to extract the album ID from the combined ID
        const albumId = videoId.split('_')[0];
        endpoint = `${API_URL}/albums/${albumId}/like`;
      }

      const response = await axios.post(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVideos(prevVideos => 
        prevVideos.map(video => 
          video._id === videoId 
            ? { ...video, likes: response.data.likes || response.data.likes?.length || [] }
            : video
        )
      );
    } catch (err) {
      console.error('Error liking video:', err);
      alert('Failed to like video');
    }
  };

  // Handle comment on video
  const handleComment = async (videoId: string, comment: string, category: string = 'video') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to comment');
        return;
      }

      if (!comment.trim()) {
        alert('Please enter a comment');
        return;
      }

      let endpoint = `${API_URL}/videos/${videoId}/comment`;
      if (category === 'post') {
        endpoint = `${API_URL}/posts/${videoId}/comment`;
      } else if (category === 'album') {
        const albumId = videoId.split('_')[0];
        endpoint = `${API_URL}/albums/${albumId}/comment`;
      }

      const response = await axios.post(
        endpoint,
        { text: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVideos(prevVideos => 
        prevVideos.map(video => 
          video._id === videoId 
            ? { ...video, comments: [...video.comments, response.data.comment || response.data] }
            : video
        )
      );

      // Clear comment text
      setCommentText(prev => ({ ...prev, [videoId]: '' }));
    } catch (err) {
      console.error('Error commenting on video:', err);
      alert('Failed to add comment');
    }
  };

  // Handle share video
  const handleShare = async (videoId: string, category: string = 'video') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to share videos');
        return;
      }

      let endpoint = `${API_URL}/videos/${videoId}/share`;
      if (category === 'album') {
        const albumId = videoId.split('_')[0];
        endpoint = `${API_URL}/albums/${albumId}/share`;
      }

      const response = await axios.post(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVideos(prevVideos => 
        prevVideos.map(video => 
          video._id === videoId 
            ? { ...video, shares: response.data.shares || [] }
            : video
        )
      );
    } catch (err) {
      console.error('Error sharing video:', err);
      alert('Failed to share video');
    }
  };

  // Handle save/unsave video
  const handleSave = async (videoId: string, category: string = 'video') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to save videos');
        return;
      }

      let endpoint = `${API_URL}/videos/${videoId}/save`;
      if (category === 'post') {
        endpoint = `${API_URL}/posts/${videoId}/save`;
      } else if (category === 'album') {
        const albumId = videoId.split('_')[0];
        endpoint = `${API_URL}/albums/${albumId}/save`;
      }

      const response = await axios.post(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVideos(prevVideos => 
        prevVideos.map(video => 
          video._id === videoId 
            ? { ...video, savedBy: response.data.savedBy || [] }
            : video
        )
      );
    } catch (err) {
      console.error('Error saving video:', err);
      alert('Failed to save video');
    }
  };

  const VideoPost: React.FC<VideoPostProps> = ({ video, onLike, onComment, onShare, onSave, currentUserId, playingVideoId, setPlayingVideoId }) => {
    const isLiked = currentUserId && video.likes.includes(currentUserId);
    const isSaved = currentUserId && video.savedBy.includes(currentUserId);
    const isShared = currentUserId && video.shares.includes(currentUserId);

    const formatTimeAgo = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return `${diffInSeconds}s`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
      return `${Math.floor(diffInSeconds / 2592000)}mo`;
    };

    const getSourceBadge = () => {
      switch (video.category) {
        case 'post':
          return <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">Post</span>;
        case 'album':
          return <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded">Album</span>;
        default:
          return <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Video</span>;
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        {/* Post Header */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                <img 
                  src={video.user.avatar || '/avatars/1.png.png'} 
                  alt={video.user.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/avatars/1.png.png';
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900 mr-2">{video.user.name}</span>
                  {video.user.verified && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  {video.user.isPro && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded font-medium mr-2">
                      PRO
                    </span>
                  )}
                  {getSourceBadge()}
                </div>
                <div className="text-sm text-gray-500">{formatTimeAgo(video.createdAt)}</div>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Post Content */}
        <div className="px-4 pb-2">
          {video.hashtag && (
            <p className="text-blue-600 text-sm mb-3">{video.hashtag}</p>
          )}
          {video.title && (
            <p className="font-medium text-gray-900 mb-1">{video.title}</p>
          )}
          {video.description && (
            <p className="text-gray-600 text-sm mb-3">{video.description}</p>
          )}
        </div>

        {/* Video Container */}
        <div className="relative bg-black mx-4 mb-4 rounded-lg overflow-hidden" style={{aspectRatio: '16/9'}}>
          {playingVideoId === video._id ? (
            video.isYoutube ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${extractYoutubeId(video.videoUrl)}?autoplay=1`}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              <video
                src={getMediaUrl(video.videoUrl)}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <>
          {/* Video Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
            {video.videoThumbnail ? (
              <img 
                src={video.videoThumbnail} 
                alt="Video thumbnail"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-lg font-medium">Video Content</div>
              </div>
            )}
          </div>
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
                <button
                  className="w-16 h-16 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg transition-colors"
                  onClick={() => setPlayingVideoId(video._id)}
                >
              <Play className="w-8 h-8 text-white ml-1" />
            </button>
          </div>
          {/* YouTube Badge */}
          {video.isYoutube && (
            <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center">
              <div className="w-4 h-4 bg-red-600 rounded-sm mr-2 flex items-center justify-center">
                <span className="text-white text-xs font-bold">▶</span>
              </div>
              YouTube
            </div>
          )}
          {/* Sponsored Badge */}
          {video.isSponsored && (
            <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded text-xs">
              Sponsored
            </div>
              )}
            </>
          )}
        </div>

        {/* Post Actions */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button 
                className={`flex items-center transition-colors ${isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
                onClick={() => onLike(video._id, video.category || 'video')}
              >
                {isLiked ? <Heart className="w-5 h-5 mr-2 fill-current" /> : <ThumbsUp className="w-5 h-5 mr-2" />}
                <span className="text-sm font-medium">Like</span>
              </button>
              <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <MessageCircle className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Comment</span>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              {video.category !== 'post' && (
                <button 
                  className={`transition-colors ${isShared ? 'text-green-500' : 'text-gray-600 hover:text-green-500'}`}
                  onClick={() => onShare(video._id, video.category || 'video')}
                >
                  <Share2 className="w-5 h-5" />
                </button>
              )}
              <button 
                className={`transition-colors ${isSaved ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'}`}
                onClick={() => onSave(video._id, video.category || 'video')}
              >
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {video.likes.length > 0 && (
                  <>
                    <div className="flex -space-x-1 mr-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <ThumbsUp className="w-3 h-3 text-white" />
                      </div>
                      {video.likes.length > 1 && (
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">❤</span>
                        </div>
                      )}
                    </div>
                    <span>{video.likes.length}</span>
                  </>
                )}
              </div>
              {video.comments.length > 0 && (
                <span>{video.comments.length} comments</span>
              )}
            </div>
            <span>{video.views.length} views</span>
          </div>

          {/* Comments Section */}
          {video.comments.length > 0 && (
            <div className="mt-4 space-y-3">
              {video.comments.slice(0, 3).map((comment) => (
                <div key={comment._id} className="flex items-start space-x-2">
                  <img 
                    src={comment.user.avatar || '/avatars/1.png.png'} 
                    alt={comment.user.name}
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/avatars/1.png.png';
                    }}
                  />
                  <div className="flex-1">
                    <span className="font-medium text-sm">{comment.user.name}</span>
                    <span className="text-sm text-gray-600 ml-2">{comment.text}</span>
                  </div>
                </div>
              ))}
              {video.comments.length > 3 && (
                <button className="text-blue-600 text-sm hover:underline">
                  View all {video.comments.length} comments
                </button>
              )}
            </div>
          )}

          {/* Add Comment */}
          <div className="mt-4 flex items-center space-x-2">
            <img 
              src="/avatars/1.png.png" 
              alt="Your avatar"
              className="w-6 h-6 rounded-full"
            />
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText[video._id] || ''}
              onChange={(e) => setCommentText(prev => ({ ...prev, [video._id]: e.target.value }))}
              className="flex-1 text-sm border-none outline-none bg-transparent"
            />
            <button 
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
              onClick={() => onComment(video._id, commentText[video._id] || '', video.category || 'video')}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-xl mx-auto mb-6 flex items-center justify-center">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-gray-600 text-lg mb-2">{error}</p>
          <p className="text-gray-500 text-sm mb-6">Backend connection failed. You can still watch sample videos.</p>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry Backend
            </button>
            <button 
              onClick={() => {
                // Load mock videos directly
                const mockVideos: Video[] = [
                  {
                    _id: 'mock1',
                    user: {
                      name: 'John Doe',
                      username: 'johndoe',
                      avatar: '/avatars/1.png.png',
                      verified: true,
                      isPro: false,
                      userId: 'user1'
                    },
                    title: 'Amazing Sunset View',
                    description: 'Beautiful sunset captured during my evening walk. Nature is truly amazing! 🌅',
                    hashtag: '#sunset #nature #beautiful #evening',
                    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    videoThumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop',
                    isYoutube: false,
                    isSponsored: false,
                    category: 'video',
                    likes: ['user1', 'user2'],
                    views: ['user1', 'user2', 'user3', 'user4'],
                    comments: [
                      {
                        _id: 'comment1',
                        user: {
                          name: 'Jane Smith',
                          avatar: '/avatars/2.png.png',
                          userId: 'user2'
                        },
                        text: 'This is absolutely stunning! 😍',
                        createdAt: new Date(Date.now() - 3600000).toISOString()
                      }
                    ],
                    shares: ['user3'],
                    savedBy: ['user1'],
                    createdAt: new Date(Date.now() - 86400000).toISOString()
                  },
                  {
                    _id: 'mock2',
                    user: {
                      name: 'Sarah Wilson',
                      username: 'sarahw',
                      avatar: '/avatars/3.png.png',
                      verified: false,
                      isPro: true,
                      userId: 'user3'
                    },
                    title: 'Cooking Tutorial: Pasta Carbonara',
                    description: 'Learn how to make authentic Italian pasta carbonara in just 15 minutes! 🍝',
                    hashtag: '#cooking #pasta #tutorial #food',
                    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                    videoThumbnail: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=450&fit=crop',
                    isYoutube: false,
                    isSponsored: true,
                    category: 'video',
                    likes: ['user1', 'user2', 'user3', 'user4', 'user5'],
                    views: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6'],
                    comments: [
                      {
                        _id: 'comment2',
                        user: {
                          name: 'Mike Johnson',
                          avatar: '/avatars/4.png.png',
                          userId: 'user4'
                        },
                        text: 'Tried this recipe and it was delicious!',
                        createdAt: new Date(Date.now() - 7200000).toISOString()
                      },
                      {
                        _id: 'comment3',
                        user: {
                          name: 'Lisa Brown',
                          avatar: '/avatars/5.png.png',
                          userId: 'user5'
                        },
                        text: 'Can\'t wait to try this! Looks amazing',
                        createdAt: new Date(Date.now() - 10800000).toISOString()
                      }
                    ],
                    shares: ['user1', 'user2'],
                    savedBy: ['user1', 'user3', 'user4'],
                    createdAt: new Date(Date.now() - 172800000).toISOString()
                  },
                  {
                    _id: 'mock3',
                    user: {
                      name: 'Alex Chen',
                      username: 'alexchen',
                      avatar: '/avatars/6.png.png',
                      verified: true,
                      isPro: true,
                      userId: 'user6'
                    },
                    title: 'Travel Vlog: Tokyo Adventures',
                    description: 'Exploring the amazing city of Tokyo! From street food to temples, this city has it all! 🇯🇵',
                    hashtag: '#travel #tokyo #japan #vlog #adventure',
                    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                    videoThumbnail: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=450&fit=crop',
                    isYoutube: false,
                    isSponsored: false,
                    category: 'video',
                    likes: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7'],
                    views: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9'],
                    comments: [
                      {
                        _id: 'comment4',
                        user: {
                          name: 'Emma Davis',
                          avatar: '/avatars/7.png.png',
                          userId: 'user7'
                        },
                        text: 'Tokyo is on my bucket list! This makes me want to go even more!',
                        createdAt: new Date(Date.now() - 1800000).toISOString()
                      },
                      {
                        _id: 'comment5',
                        user: {
                          name: 'David Lee',
                          avatar: '/avatars/8.png.png',
                          userId: 'user8'
                        },
                        text: 'Amazing footage! What camera are you using?',
                        createdAt: new Date(Date.now() - 5400000).toISOString()
                      }
                    ],
                    shares: ['user1', 'user2', 'user3'],
                    savedBy: ['user1', 'user2', 'user3', 'user4'],
                    createdAt: new Date(Date.now() - 259200000).toISOString()
                  }
                ];
                setVideos(mockVideos);
                setError(null);
              }}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Watch Sample Videos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Watch</h1>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Users className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <User className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Video Posts */}
        {videos.length > 0 ? (
          videos.map((video: Video) => (
            <VideoPost 
              key={video._id} 
              video={video} 
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onSave={handleSave}
              currentUserId={currentUserId || undefined}
              playingVideoId={playingVideoId}
              setPlayingVideoId={setPlayingVideoId}
            />
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-xl mx-auto mb-6 flex items-center justify-center">
              <FileText className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-gray-600 text-lg">No videos available</p>
            <p className="text-gray-500 text-sm mt-2">Be the first to upload a video!</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors">
        <Plus className="w-6 h-6" />
      </button>

      {/* Side Icons */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 space-y-4">
        <button className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
          <User className="w-5 h-5" />
        </button>
        <button className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default WatchPage;