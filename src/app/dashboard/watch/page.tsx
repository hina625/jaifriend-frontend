"use client";
import React, { useState, useEffect } from 'react';
import { Play, ThumbsUp, MessageCircle, Share2, MoreHorizontal, Plus, Settings, Users, User, FileText, Heart, Bookmark } from 'lucide-react';
import axios from 'axios';
import ReactionPopup, { ReactionType } from '@/components/ReactionPopup';
import { getCurrentUserId } from '@/utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app';

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
  reactions?: Array<{
    user: string;
    type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
    createdAt: string;
  }>;
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
  
  // Always use HTTPS to avoid mixed content errors
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app';
  const secureUrl = apiUrl.replace('http://', 'https://');
  
  // Ensure proper URL construction with forward slash
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  
  return `${secureUrl}${cleanPath}`;
}

const WatchPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showReactionPopup, setShowReactionPopup] = useState<string | null>(null);
  const [reactionButtonHovered, setReactionButtonHovered] = useState<string | null>(null);
  const [showReactionsTemporarily, setShowReactionsTemporarily] = useState<string | null>(null);
  const [isReacting, setIsReacting] = useState(false);

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
  const fetchAllVideos = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      console.log('Fetching videos from backend...');
      
      // Try to fetch videos from all sources with individual error handling
      let allVideos: Video[] = [];
      let fetchErrors: string[] = [];
      
      try {
        console.log('Fetching from /api/videos endpoint...');
        const videosResponse = await axios.get(`${API_URL}/api/videos`);
        console.log('Videos response:', videosResponse.data);
        allVideos = [...allVideos, ...videosResponse.data];
      } catch (err) {
        console.error('Error fetching videos:', err);
        fetchErrors.push('Videos');
      }
      
      try {
        console.log('Fetching from /api/posts/videos endpoint...');
        const postsResponse = await axios.get(`${API_URL}/api/posts/videos`);
        console.log('Posts videos response:', postsResponse.data);
        allVideos = [...allVideos, ...postsResponse.data];
      } catch (err) {
        console.error('Error fetching posts videos:', err);
        fetchErrors.push('Posts with videos');
      }
      
      try {
        console.log('Fetching from /api/albums/videos endpoint...');
        const albumsResponse = await axios.get(`${API_URL}/api/albums/videos`);
        console.log('Albums videos response:', albumsResponse.data);
        allVideos = [...allVideos, ...albumsResponse.data];
      } catch (err) {
        console.error('Error fetching albums videos:', err);
        fetchErrors.push('Albums with videos');
      }

      console.log('📊 Total videos found:', allVideos.length);
      
      // Sort videos by creation date (newest first)
      allVideos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      console.log('Final videos array:', allVideos);
      setVideos(allVideos);
      
      // Show warning if some sources failed but we have videos
      if (fetchErrors.length > 0 && allVideos.length > 0) {
        console.warn('Some video sources failed to load:', fetchErrors.join(', '));
      }
      
      // Only set error if no videos were loaded at all
      if (allVideos.length === 0 && fetchErrors.length > 0) {
        setError(`Failed to load videos from: ${fetchErrors.join(', ')}`);
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Error in fetchAllVideos:', err);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
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

      let endpoint = `${API_URL}/api/videos/${videoId}/like`;
      if (category === 'post') {
        endpoint = `${API_URL}/api/posts/${videoId}/like`;
      } else if (category === 'album') {
        // For albums, we need to extract the album ID from the combined ID
        const albumId = videoId.split('_')[0];
        endpoint = `${API_URL}/api/albums/${albumId}/like`;
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

      let endpoint = `${API_URL}/api/videos/${videoId}/comment`;
      if (category === 'post') {
        endpoint = `${API_URL}/api/posts/${videoId}/comment`;
      } else if (category === 'album') {
        const albumId = videoId.split('_')[0];
        endpoint = `${API_URL}/api/albums/${albumId}/comment`;
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

      let endpoint = `${API_URL}/api/videos/${videoId}/share`;
      if (category === 'album') {
        const albumId = videoId.split('_')[0];
        endpoint = `${API_URL}/api/albums/${albumId}/share`;
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

  // Handle review video
  const handleReview = async (videoId: string, rating: number, category: string = 'video') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to review videos');
        return;
      }

      let endpoint = `${API_URL}/api/videos/${videoId}/review`;
      if (category === 'post') {
        endpoint = `${API_URL}/api/posts/${videoId}/review`;
      } else if (category === 'album') {
        const albumId = videoId.split('_')[0];
        endpoint = `${API_URL}/api/albums/${albumId}/review`;
      }

      const response = await axios.post(
        endpoint,
        { rating, text: `Rated ${rating} stars` },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Review submitted successfully! You rated this ${rating} stars.`);
    } catch (err) {
      console.error('Error reviewing video:', err);
      alert('Failed to submit review');
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

      let endpoint = `${API_URL}/api/videos/${videoId}/save`;
      if (category === 'post') {
        endpoint = `${API_URL}/api/posts/${videoId}/save`;
      } else if (category === 'album') {
        const albumId = videoId.split('_')[0];
        endpoint = `${API_URL}/api/albums/${albumId}/save`;
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

  // Handle reactions (like, love, haha, wow, sad, angry)
  const handleReaction = async (videoId: string, reactionType: ReactionType, category: string = 'video') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add a reaction.');
        return;
      }

      setIsReacting(true);

      let endpoint = `${API_URL}/api/videos/${videoId}/reaction`;
      if (category === 'post') {
        endpoint = `${API_URL}/api/posts/${videoId}/reaction`;
      } else if (category === 'album') {
        const albumId = videoId.split('_')[0];
        endpoint = `${API_URL}/api/albums/${albumId}/reaction`;
      }

      // Call backend API directly
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reactionType: reactionType
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Reaction added successfully:', data);
        
        // Show success feedback
        const reactionEmojis: { [key: string]: string } = {
          'like': '👍',
          'love': '❤️',
          'haha': '😂',
          'wow': '😮',
          'sad': '😢',
          'angry': '😠'
        };
        
        const emoji = reactionEmojis[reactionType] || '😊';
        alert(`${emoji} Reaction added successfully!`);
        
        // Update local state to reflect the new reaction
        // For now, we'll refresh the page to get updated data
        // In a real app, you'd update the local state
        window.location.reload();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to add reaction:', errorData);
        alert(`Failed to add reaction: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      alert('Error adding reaction. Please try again.');
    } finally {
      setIsReacting(false);
      // Automatically close the popup after reaction selection
      setShowReactionPopup(null);
    }
  };

  // Helper functions for reactions - Exact same as FeedPost
  const getCurrentReaction = (video: Video) => {
    // Check if user has any reaction on this video
    if (video.reactions && video.reactions.length > 0) {
      // Find user's reaction
      const userReaction = video.reactions.find((r: any) => 
        r.user === getCurrentUserId() || r.userId === getCurrentUserId()
      );
      return userReaction ? userReaction.type : null;
    }
    return null;
  };

  const getMostCommonReactionEmoji = (video: Video) => {
    if (!video.reactions || video.reactions.length === 0) return '👍';
    
    const reactionCounts: { [key: string]: number } = {};
    video.reactions.forEach((reaction: any) => {
      reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
    });
    
    const mostCommon = Object.keys(reactionCounts).reduce((a, b) => 
      reactionCounts[a] > reactionCounts[b] ? a : b
    );
    
    const reactionEmojis: { [key: string]: string } = {
      'like': '👍',
      'love': '❤️',
      'haha': '😂',
      'wow': '😮',
      'sad': '😢',
      'angry': '😠'
    };
    
    return reactionEmojis[mostCommon] || '👍';
  };

  // Get reaction count - Exact same as FeedPost
  const getReactionCount = (video: Video): number => {
    if (video.reactions && Array.isArray(video.reactions)) {
      return video.reactions.length;
    }
    // Fallback to likes count for backward compatibility
    return video.likes ? (Array.isArray(video.likes) ? video.likes.length : video.likes) : 0;
  };

  // Function to update reaction count locally (for future use) - Exact same as FeedPost
  const updateReactionCount = (newCount: number) => {
    // This function can be used to update the reaction count without refreshing
    // For now, we'll keep the page refresh approach
    console.log('Reaction count updated to:', newCount);
  };



  // Reaction popup handlers
  const handleReactionButtonMouseEnter = (videoId: string) => {
    setReactionButtonHovered(videoId);
    setShowReactionPopup(videoId);
  };

  const handleReactionButtonMouseLeave = (videoId: string) => {
    setReactionButtonHovered(null);
    // Delay hiding to allow moving to popup
    setTimeout(() => {
      if (!showReactionPopup) {
        setShowReactionPopup(null);
      }
    }, 100);
  };

  const handleReactionPopupMouseEnter = () => {
    setShowReactionPopup(showReactionPopup);
  };

  const handleReactionPopupMouseLeave = () => {
    setShowReactionPopup(null);
    setReactionButtonHovered(null);
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
                  src={video.user.avatar ? (video.user.avatar.startsWith('http') ? video.user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/${video.user.avatar}`) : '/avatars/1.png.png'} 
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
                onClick={() => {
                  const videoElement = document.querySelector(`video[src="${getMediaUrl(video.videoUrl)}"]`) as HTMLVideoElement;
                  if (videoElement) {
                    if (videoElement.paused) {
                      videoElement.play();
                    } else {
                      videoElement.pause();
                    }
                  }
                }}
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
                  onClick={async () => {
                    setPlayingVideoId(video._id);
                    
                    // Track view when video is played
                    try {
                      const token = localStorage.getItem('token');
                      if (token) {
                        let endpoint = `${API_URL}/api/videos/${video._id}/view`;
                        if (video.category === 'post') {
                          endpoint = `${API_URL}/api/posts/${video._id}/view`;
                        } else if (video.category === 'album') {
                          const albumId = video._id.split('_')[0];
                          endpoint = `${API_URL}/api/albums/${albumId}/view`;
                        }
                        
                        await fetch(endpoint, {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${token}` }
                        });
                      }
                    } catch (error) {
                      console.error('Error tracking view:', error);
                    }
                  }}
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

                {/* Post Actions - Same as Feed Posts */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-center space-x-8">
            {/* React Button */}
            <div className="relative flex flex-col items-center">
              <button 
                onMouseEnter={() => handleReactionButtonMouseEnter(video._id)}
                onMouseLeave={() => handleReactionButtonMouseLeave(video._id)}
                onClick={() => onLike(video._id, video.category || 'video')}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  getCurrentReaction(video) ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">{getMostCommonReactionEmoji(video)}</span>
              </button>
              <span className="text-xs text-gray-600 mt-1">React</span>
              
              {/* Reaction Popup */}
              <div
                onMouseEnter={handleReactionPopupMouseEnter}
                onMouseLeave={handleReactionPopupMouseLeave}
              >
                <ReactionPopup
                  isOpen={showReactionPopup === video._id}
                  onClose={() => setShowReactionPopup(null)}
                  onReaction={(reactionType) => handleReaction(video._id, reactionType, video.category || 'video')}
                  currentReaction={getCurrentReaction(video)}
                  position="top"
                />
              </div>
            </div>
            
            {/* Comment Button */}
            <div className="flex flex-col items-center">
              <button 
                className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                onClick={() => {
                  const commentInput = document.querySelector(`input[placeholder="Add a comment..."]`) as HTMLInputElement;
                  if (commentInput) {
                    commentInput.focus();
                  }
                }}
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <span className="text-xs text-gray-600 mt-1">Comment</span>
            </div>
            
            {/* Share Button */}
            <div className="flex flex-col items-center">
                <button 
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isShared ? 'bg-green-100 text-green-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                  onClick={() => onShare(video._id, video.category || 'video')}
                >
                  <Share2 className="w-5 h-5" />
                </button>
              <span className="text-xs text-gray-600 mt-1">Share</span>
            </div>
            
            {/* Review Button */}
            <div className="flex flex-col items-center">
              <button 
                className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-yellow-500 hover:bg-gray-200 transition-colors"
                onClick={() => {
                  const rating = prompt('Rate this video (1-5 stars):', '5');
                  if (rating && !isNaN(Number(rating)) && Number(rating) >= 1 && Number(rating) <= 5) {
                    handleReview(video._id, Number(rating), video.category || 'video');
                  }
                }}
              >
                <span className="text-xl">⭐</span>
              </button>
              <span className="text-xs text-gray-600 mt-1">Review</span>
            </div>
            
            {/* Save Button */}
            <div className="flex flex-col items-center">
              <button 
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isSaved ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => onSave(video._id, video.category || 'video')}
              >
                <Bookmark className="w-5 h-5" />
              </button>
              <span className="text-xs text-gray-600 mt-1">Save</span>
            </div>
          </div>

          {/* Temporary Reaction Display - Shows briefly after adding reaction */}
          {showReactionsTemporarily === video._id && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
              <div className="flex flex-wrap gap-2">
                {(() => {
                  if (video.reactions && Array.isArray(video.reactions) && video.reactions.length > 0) {
                    const reactionCounts: { [key: string]: number } = {};
                    video.reactions.forEach((reaction: any) => {
                      reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
                    });
                    
                    const reactionEmojis: { [key: string]: string } = {
                      'like': '👍',
                      'love': '❤️',
                      'haha': '😂',
                      'wow': '😮',
                      'sad': '😢',
                      'angry': '😠'
                    };
                    
                    return Object.entries(reactionCounts).map(([type, count]) => (
                      <div key={type} className="flex items-center space-x-1 bg-blue-50 dark:bg-blue-900/20 rounded-full px-3 py-1 border border-blue-200 dark:border-blue-700">
                        <span className="text-lg">{reactionEmojis[type] || '😊'}</span>
                        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{count}</span>
                      </div>
                    ));
                  } else if (video.likes && Array.isArray(video.likes) && video.likes.length > 0) {
                    return (
                      <div className="flex items-center space-x-1 bg-blue-50 dark:bg-blue-900/20 rounded-full px-3 py-1 border border-blue-200 dark:border-blue-700">
                        <span className="text-lg">👍</span>
                        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{video.likes.length}</span>
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-blue-500 dark:text-blue-400 text-sm font-medium">
                        Reaction added! 🎉
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          )}

          {/* Engagement Stats */}
          <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {getReactionCount(video) > 0 && (
                  <>
                    <div className="flex -space-x-1 mr-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">{getMostCommonReactionEmoji(video)}</span>
                      </div>
                      {getReactionCount(video) > 1 && (
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">❤</span>
                        </div>
                      )}
                    </div>
                    <span>{getReactionCount(video)}</span>
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
                    src={comment.user.avatar ? (comment.user.avatar.startsWith('http') ? comment.user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/${comment.user.avatar}`) : '/avatars/1.png.png'} 
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
      <div className="w-full h-full overflow-y-auto scrollbar-hide flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full overflow-y-auto scrollbar-hide flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-xl mx-auto mb-6 flex items-center justify-center">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-gray-600 text-lg mb-2">{error}</p>
          <p className="text-gray-500 text-sm mb-6">Unable to load videos from the feed.</p>
          <div className="space-x-4">
            <button 
              onClick={() => fetchAllVideos(true)}
              disabled={refreshing}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {refreshing ? 'Refreshing...' : 'Retry'}
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
    <div className="w-full h-full overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Watch</h1>
            {!loading && !error && (
              <p className="text-sm text-gray-500 mt-1">
                {videos.length} video{videos.length !== 1 ? 's' : ''} from feed
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => fetchAllVideos(true)}
              disabled={refreshing}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              title="Refresh videos"
            >
              <div className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </button>
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
