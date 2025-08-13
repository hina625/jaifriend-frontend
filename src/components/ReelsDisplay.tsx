'use client';
import { useState, useEffect, useRef } from 'react';
import { Reel, getReels, toggleLike, toggleSave, addComment, shareReel, formatDuration, formatViewCount, formatLikeCount, hasUserLiked, hasUserSaved } from '@/utils/reelsApi';

interface ReelsDisplayProps {
  initialCategory?: string;
  userId?: string;
  hashtag?: string;
  trending?: boolean;
}

export default function ReelsDisplay({ 
  initialCategory = 'general', 
  userId, 
  hashtag, 
  trending = false 
}: ReelsDisplayProps) {
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  useEffect(() => {
    loadReels();
  }, [initialCategory, userId, hashtag, trending]);

  const loadReels = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🎬 Loading reels with params:', { hashtag, userId, trending, initialCategory, page });
      
      let response: any;
      if (hashtag) {
        response = await getReels({ hashtag, page, limit: 10 });
      } else if (userId) {
        response = await getReels({ userId, page, limit: 10 });
      } else if (trending) {
        const trendingReels = await getReels({ trending: true, page, limit: 10 });
        response = { reels: trendingReels, pagination: { hasNextPage: false, currentPage: page } };
      } else {
        response = await getReels({ category: initialCategory, page, limit: 10 });
      }
      
      console.log('📡 API Response:', response);
      
      // Handle different response types properly
      let reelsArray: Reel[] = [];
      let pagination: any = null;
      
      if (Array.isArray(response)) {
        reelsArray = response;
        console.log('📋 Response is array, length:', reelsArray.length);
      } else if (response && typeof response === 'object' && 'reels' in response) {
        reelsArray = response.reels || [];
        pagination = response.pagination;
        console.log('📋 Response has reels property, count:', reelsArray.length);
        console.log('📊 Pagination:', pagination);
      } else {
        console.log('⚠️ Unexpected response structure:', response);
      }
      
      if (page === 1) {
        setReels(reelsArray);
        setCurrentReelIndex(0);
      } else {
        setReels(prev => [...prev, ...reelsArray]);
      }
      
      setHasNextPage(pagination?.hasNextPage || false);
      setCurrentPage(page);
      
      console.log('✅ Reels loaded successfully, total:', reelsArray.length);
    } catch (err: any) {
      console.error('❌ Error loading reels:', err);
      setError(err.message || 'Failed to load reels');
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    
    // Calculate which reel should be visible
    const reelHeight = containerHeight;
    const newIndex = Math.round(scrollTop / reelHeight);
    
    if (newIndex !== currentReelIndex && newIndex >= 0 && newIndex < reels.length) {
      setCurrentReelIndex(newIndex);
      
      // Pause all videos except current one
      reels.forEach((reel, index) => {
        const video = videoRefs.current[reel._id];
        if (video) {
          if (index === newIndex) {
            video.play().catch(() => {}); // Auto-play current video
          } else {
            video.pause();
            video.currentTime = 0; // Reset to beginning
          }
        }
      });
    }
    
    // Load more reels when near the end
    if (hasNextPage && newIndex >= reels.length - 2) {
      loadReels(currentPage + 1);
    }
  };

  const handleLike = async (reelId: string) => {
    try {
      const response = await toggleLike(reelId);
      setReels(prev => prev.map(reel => 
        reel._id === reelId 
          ? { ...reel, likes: response.likes, trendingScore: response.trendingScore }
          : reel
      ));
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleSave = async (reelId: string) => {
    try {
      const response = await toggleSave(reelId);
      setReels(prev => prev.map(reel => 
        reel._id === reelId 
          ? { ...reel, savedBy: response.saved }
          : reel
      ));
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const handleComment = async (reelId: string) => {
    if (!commentText.trim()) return;
    
    try {
      const response = await addComment(reelId, { text: commentText });
      setReels(prev => prev.map(reel => 
        reel._id === reelId 
          ? { 
              ...reel, 
              comments: [...reel.comments, response.comment],
              trendingScore: response.trendingScore
            }
          : reel
      ));
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleShare = async (reelId: string) => {
    try {
      console.log('🔄 Sharing reel:', reelId);
      console.log('🔗 API URL:', `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/reels/${reelId}/share`);
      
      const response = await shareReel(reelId);
      console.log('✅ Share response:', response);
      
      setReels(prev => prev.map(reel => 
        reel._id === reelId 
          ? { 
              ...reel, 
              shares: response.shares,
              trendingScore: response.trendingScore
            }
          : reel
      ));
      
      // Show success message or copy link to clipboard
      const reelUrl = `${window.location.origin}/dashboard/reels/${reelId}`;
      await navigator.clipboard.writeText(reelUrl);
      alert('Reel link copied to clipboard!');
    } catch (err: any) {
      console.error('❌ Error sharing reel:', err);
      console.error('❌ Error details:', err.response?.data || err.message);
      alert('Failed to share reel. Please try again.');
    }
  };

  const handleVideoClick = (reelId: string) => {
    const video = videoRefs.current[reelId];
    if (video) {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  };

  const handleDoubleTap = (reelId: string) => {
    // Auto-like on double tap
    handleLike(reelId);
    
    // Show heart animation
    const heartElement = document.createElement('div');
    heartElement.innerHTML = '❤️';
    heartElement.className = 'absolute inset-0 flex items-center justify-center text-6xl animate-pulse pointer-events-none z-10';
    heartElement.style.animation = 'pulse 0.6s ease-out';
    
    const videoContainer = document.querySelector(`[data-reel-id="${reelId}"]`);
    if (videoContainer) {
      videoContainer.appendChild(heartElement);
      setTimeout(() => {
        heartElement.remove();
      }, 600);
    }
  };

  if (loading && reels.length === 0) {
    return (
      <div className="flex items-center justify-center h-[580px] sm:h-screen max-w-[310px] mx-auto sm:max-w-none">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && reels.length === 0) {
    return (
      <div className="flex items-center justify-center h-[580px] sm:h-screen max-w-[310px] mx-auto sm:max-w-none">
        <div className="text-center">
          <div className="text-red-500 text-lg sm:text-xl mb-2">⚠️</div>
          <div className="text-gray-600 text-sm sm:text-base">{error}</div>
          <button 
            onClick={() => loadReels()}
            className="mt-4 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-[580px] sm:h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide max-w-[310px] mx-auto sm:max-w-none"
      onScroll={handleScroll}
    >
      {reels.length === 0 && !loading ? (
        <div className="h-[580px] sm:h-screen snap-start flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold mb-2">No reels yet</h3>
            <p className="text-gray-300 mb-4">Be the first to create a reel!</p>
            <button
              onClick={() => window.location.href = '/dashboard/reels'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Create Reel
            </button>
          </div>
        </div>
      ) : (
        reels.map((reel, index) => (
        <div 
          key={reel._id}
          className="h-[580px] sm:h-screen snap-start relative bg-black flex items-center justify-center"
          data-reel-id={reel._id}
        >
          {/* Video Container */}
          <div 
            className="relative w-full h-full flex items-center justify-center"
            onDoubleClick={() => handleDoubleTap(reel._id)}
          >
            <video
              ref={(el) => {
                if (el) videoRefs.current[reel._id] = el;
              }}
              src={reel.videoUrl}
              className="w-full h-full object-contain"
              loop
              muted
              playsInline
              onClick={() => handleVideoClick(reel._id)}
            />
            
            {/* Play/Pause Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="bg-black/50 rounded-full p-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 5v10l8-5-8-5z" />
                </svg>
              </div>
            </div>
            
            {/* Music Indicator */}
            {reel.music && (
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-black/70 backdrop-blur-sm text-white text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-2">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c0 2.21 1.79 4 4 4s4-1.79 4-4V5l8-2z" />
                </svg>
                <span className="truncate max-w-16 sm:max-w-24">{reel.music.title}</span>
              </div>
            )}
            
            {/* Trending Badge */}
            {reel.isTrending && (
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1">
                <span>🔥</span>
                <span>Trending</span>
              </div>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="absolute right-2 sm:right-4 bottom-16 sm:bottom-20 flex flex-col items-center gap-4 sm:gap-6">
            {/* Like Button */}
            <button
              onClick={() => handleLike(reel._id)}
              className="flex flex-col items-center gap-1 text-white"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${
                hasUserLiked(reel, undefined) ? 'bg-red-500' : 'bg-black/30 hover:bg-black/50'
              }`}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill={hasUserLiked(reel, undefined) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-medium">{formatLikeCount(reel.likes.length)}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => setShowComments(showComments === reel._id ? null : reel._id)}
              className="flex flex-col items-center gap-1 text-white"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-medium">{reel.comments.length}</span>
            </button>

            {/* Save Button */}
            <button
              onClick={() => handleSave(reel._id)}
              className="flex flex-col items-center gap-1 text-white"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${
                hasUserSaved(reel, undefined) ? 'bg-blue-500' : 'bg-black/30 hover:bg-black/50'
              }`}>
                <svg className="w-5 h-5 sm:w-6 h-6" fill={hasUserSaved(reel, undefined) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-medium">Save</span>
            </button>

            {/* Share Button */}
            <button 
              onClick={() => handleShare(reel._id)}
              className="flex flex-col items-center gap-1 text-white"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-medium">{reel.shares.length}</span>
            </button>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-16 sm:right-20 text-white">
            <div className="mb-2">
              <h3 className="text-base sm:text-lg font-semibold mb-1">{reel.title}</h3>
              <p className="text-xs sm:text-sm text-gray-200 mb-2">{reel.description}</p>
              
              {/* Hashtags */}
              {reel.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                  {reel.hashtags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="text-blue-400 text-xs sm:text-sm">#{tag}</span>
                  ))}
                </div>
              )}
              
              {/* User Info */}
              <div className="flex items-center gap-2">
                <img 
                  src={reel.user.avatar} 
                  alt={reel.user.name}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white"
                />
                <div>
                  <div className="font-medium text-xs sm:text-sm">{reel.user.name}</div>
                  <div className="text-xs text-gray-300">{reel.category} • {formatDuration(reel.duration)}</div>
                </div>
              </div>
              
              {/* View Count */}
              <div className="text-xs text-gray-300 mt-1">
                {formatViewCount(reel.views.length)} views
              </div>
            </div>
          </div>

          {/* Comments Panel */}
          {showComments === reel._id && (
            <div className="absolute right-0 top-0 h-full w-64 sm:w-80 bg-black/90 backdrop-blur-sm text-white p-3 sm:p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold">Comments ({reel.comments.length})</h3>
                <button 
                  onClick={() => setShowComments(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Add Comment */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-2 sm:px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-white/40 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleComment(reel._id)}
                  />
                  <button
                    onClick={() => handleComment(reel._id)}
                    disabled={!commentText.trim()}
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
                  >
                    Post
                  </button>
                </div>
              </div>
              
              {/* Comments List */}
              <div className="space-y-3">
                {reel.comments.map((comment) => (
                  <div key={comment._id} className="flex gap-2 sm:gap-3">
                    <img 
                      src={comment.user.avatar} 
                      alt={comment.user.name}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-xs sm:text-sm">{comment.user.name}</div>
                      <div className="text-xs sm:text-sm text-gray-300">{comment.text}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))
      )}
      
      {/* Loading indicator for more reels */}
      {loading && reels.length > 0 && (
        <div className="h-[580px] sm:h-screen snap-start flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}
