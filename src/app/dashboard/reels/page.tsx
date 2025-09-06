'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReelsCreationModal from '@/components/ReelsCreationModal';
import { getReels, Reel, ReelsResponse } from '@/utils/reelsApi';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Play, Pause, Volume2, VolumeX } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';

export default function ReelsPage() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [showTrending, setShowTrending] = useState(false);
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  const categories = [
    { id: 'general', name: 'General', icon: '🎬' },
    { id: 'comedy', name: 'Comedy', icon: '😂' },
    { id: 'dance', name: 'Dance', icon: '💃' },
    { id: 'food', name: 'Food', icon: '🍕' },
    { id: 'travel', name: 'Travel', icon: '✈️' },
    { id: 'fashion', name: 'Fashion', icon: '👗' },
    { id: 'beauty', name: 'Beauty', icon: '💄' },
    { id: 'fitness', name: 'Fitness', icon: '💪' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'technology', name: 'Technology', icon: '💻' },
    { id: 'lifestyle', name: 'Lifestyle', icon: '🌟' }
  ];

  // Load reels
  const loadReels = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🎬 Loading reels with params:', { category: selectedCategory, trending: showTrending });
      
      let response: ReelsResponse | Reel[];
      if (showTrending) {
        response = await getReels({ trending: true, page: 1, limit: 20 });
        setReels(Array.isArray(response) ? response : response.reels || []);
      } else {
        response = await getReels({ category: selectedCategory, page: 1, limit: 20 });
        setReels(Array.isArray(response) ? response : response.reels || []);
      }
      
      console.log('📡 Reels loaded:', response);
      setCurrentReelIndex(0);
    } catch (error: any) {
      console.error('❌ Error loading reels:', error);
      setError(error.message || 'Failed to load reels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReels();
  }, [selectedCategory, showTrending]);

  // Debug modal state changes
  useEffect(() => {
    console.log('🔍 Modal state changed:', showCreateModal);
  }, [showCreateModal]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        handleReelChange('up');
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        handleReelChange('down');
      } else if (e.key === ' ') {
        e.preventDefault();
        const video = document.querySelector('video');
        if (video) {
          if (isPlaying) {
            video.pause();
          } else {
            video.play();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentReelIndex, isPlaying]);

  const handleCreateSuccess = () => {
    console.log('🎬 Reel creation successful!');
    setShowCreateModal(false);
    loadReels();
    alert('🎬 Reel created successfully!');
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowTrending(false);
  };

  const handleTrendingToggle = () => {
    setShowTrending(!showTrending);
    if (!showTrending) {
      setSelectedCategory('general');
    }
  };

  const handleReelChange = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentReelIndex > 0) {
      setCurrentReelIndex(currentReelIndex - 1);
    } else if (direction === 'down' && currentReelIndex < reels.length - 1) {
      setCurrentReelIndex(currentReelIndex + 1);
    }
  };

  const handleLike = async (reelId: string) => {
    if (isLiking) return;
    
    try {
      setIsLiking(reelId);
      // Here you would call the like API
      console.log('❤️ Liking reel:', reelId);
      // Update local state optimistically
      setReels(prev => prev.map(reel => 
        reel._id === reelId 
          ? { ...reel, likes: [...reel.likes, 'current-user-id'] }
          : reel
      ));
    } catch (error) {
      console.error('Error liking reel:', error);
    } finally {
      setIsLiking(null);
    }
  };

  const handleShare = async (reelId: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this reel!',
          url: `${window.location.origin}/dashboard/reels/${reelId}`
        });
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(`${window.location.origin}/dashboard/reels/${reelId}`);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing reel:', error);
    }
  };

  // Touch handlers for swipe navigation and double-tap to like
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;

    if (isUpSwipe) {
      handleReelChange('up');
    } else if (isDownSwipe) {
      handleReelChange('down');
    }
  };

  // Double-tap to like functionality
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double tap detected
      if (currentReel) {
        handleLike(currentReel._id);
        setShowLikeAnimation(true);
        setTimeout(() => setShowLikeAnimation(false), 1000);
      }
    }
    setLastTap(now);
  };

  const currentReel = reels[currentReelIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading reels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Error: {error}</p>
          <button 
            onClick={loadReels}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-white text-2xl font-bold mb-2">No reels found</h2>
          <p className="text-gray-400 mb-6">Be the first to create a reel in this category!</p>
          <div className="text-white text-sm mb-4">
            Modal State: {showCreateModal ? 'OPEN' : 'CLOSED'}
          </div>
          <button
            onClick={() => {
              console.log('🎬 Create reel button clicked!');
              alert('Button clicked! Opening modal...');
              setShowCreateModal(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            Create Your First Reel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-white">Reels</h1>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Create
            </button>
          </div>

          {/* Category Navigation */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={handleTrendingToggle}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap ${
                showTrending
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              🔥 Trending
            </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  disabled={showTrending}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap ${
                    !showTrending && selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50'
                  }`}
                >
                {category.icon} {category.name}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Reels Container - Instagram-like dimensions */}
      <div 
        className="relative h-[calc(100vh-120px)] overflow-hidden flex items-center justify-center bg-black"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Reel Video Container - Instagram Reels aspect ratio (9:16) */}
        {currentReel && (
          <div 
            className="relative w-full max-w-[375px] h-[667px] bg-black mx-auto sm:max-w-[414px] sm:h-[736px] md:max-w-[375px] md:h-[667px]"
            onDoubleClick={handleDoubleTap}
          >
            <video
              key={currentReel._id}
              className="w-full h-full object-cover rounded-none"
              autoPlay
              muted={isMuted}
              loop
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={currentReel.videoUrl} type="video/mp4" />
            </video>

            {/* Double-tap like animation */}
            {showLikeAnimation && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="animate-ping">
                  <Heart className="w-20 h-20 text-red-500 fill-red-500" />
                </div>
              </div>
            )}

            {/* Video Controls Overlay - Instagram style */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                onClick={() => {
                  const video = document.querySelector('video');
                  if (video) {
                    if (isPlaying) {
                      video.pause();
                    } else {
                      video.play();
                    }
                  }
                }}
                className="w-20 h-20 bg-black bg-opacity-30 rounded-full flex items-center justify-center text-white hover:bg-opacity-50 transition-all duration-200 pointer-events-auto opacity-0 hover:opacity-100"
              >
                {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
              </button>
            </div>

            {/* Reel Info Overlay - Instagram style */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/70 to-transparent">
              <div className="flex items-end justify-between">
                {/* Left Side - User Info & Description */}
                <div className="flex-1 pr-16">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <img
                        src={currentReel.user.avatar || '/default-avatar.svg'}
                        alt={currentReel.user.name}
                        className="w-12 h-12 rounded-full border-2 border-white"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-black"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-base">@{currentReel.user.username}</h3>
                      <p className="text-gray-300 text-sm">{currentReel.user.name}</p>
                    </div>
                    <button className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors">
                      Follow
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-white text-sm leading-relaxed">{currentReel.title}</p>
                    
                    {currentReel.hashtags && currentReel.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {currentReel.hashtags.slice(0, 5).map((tag, index) => (
                          <span key={index} className="text-blue-400 text-sm font-medium">#{tag}</span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-gray-300 text-xs">
                      <span>{new Date(currentReel.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{currentReel.views || 0} views</span>
                    </div>

                    {/* Music Info - Instagram style */}
                    {currentReel.music && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                          </svg>
                        </div>
                        <span className="text-white text-sm font-medium">{currentReel.music.title}</span>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span className="text-gray-300 text-xs">{currentReel.music.artist}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Action Buttons - Instagram style */}
                <div className="flex flex-col items-center gap-6">
                  {/* Like Button */}
                  <button
                    onClick={() => handleLike(currentReel._id)}
                    disabled={isLiking === currentReel._id}
                    className="flex flex-col items-center gap-1 text-white hover:text-red-500 transition-colors"
                  >
                    <div className="w-12 h-12 bg-black bg-opacity-30 rounded-full flex items-center justify-center hover:bg-opacity-50 transition-all duration-200">
                      <Heart className={`w-7 h-7 ${currentReel.likes.includes('current-user-id') ? 'fill-red-500 text-red-500' : ''}`} />
                    </div>
                    <span className="text-xs font-semibold text-white">{currentReel.likes.length}</span>
                  </button>

                  {/* Comment Button */}
                  <button
                    onClick={() => setShowComments(showComments === currentReel._id ? null : currentReel._id)}
                    className="flex flex-col items-center gap-1 text-white hover:text-blue-400 transition-colors"
                  >
                    <div className="w-12 h-12 bg-black bg-opacity-30 rounded-full flex items-center justify-center hover:bg-opacity-50 transition-all duration-200">
                      <MessageCircle className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-semibold text-white">{currentReel.comments.length}</span>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={() => handleShare(currentReel._id)}
                    className="flex flex-col items-center gap-1 text-white hover:text-green-400 transition-colors"
                  >
                    <div className="w-12 h-12 bg-black bg-opacity-30 rounded-full flex items-center justify-center hover:bg-opacity-50 transition-all duration-200">
                      <Share className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-semibold text-white">{currentReel.shares.length}</span>
                  </button>

                  {/* Save Button */}
                  <button className="flex flex-col items-center gap-1 text-white hover:text-yellow-400 transition-colors">
                    <div className="w-12 h-12 bg-black bg-opacity-30 rounded-full flex items-center justify-center hover:bg-opacity-50 transition-all duration-200">
                      <Bookmark className="w-7 h-7" />
                    </div>
                  </button>

                  {/* More Options */}
                  <button className="flex flex-col items-center gap-1 text-white hover:text-gray-400 transition-colors">
                    <div className="w-12 h-12 bg-black bg-opacity-30 rounded-full flex items-center justify-center hover:bg-opacity-50 transition-all duration-200">
                      <MoreHorizontal className="w-7 h-7" />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Volume Control - Instagram style */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-30 rounded-full flex items-center justify-center text-white hover:bg-opacity-50 transition-all duration-200"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Navigation Arrows - Instagram style */}
            {currentReelIndex > 0 && (
              <button
                onClick={() => handleReelChange('up')}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-30 rounded-full flex items-center justify-center text-white hover:bg-opacity-50 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            )}

            {currentReelIndex < reels.length - 1 && (
              <button
                onClick={() => handleReelChange('down')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-30 rounded-full flex items-center justify-center text-white hover:bg-opacity-50 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}

            {/* Reel Counter - Instagram style */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-30 px-3 py-1.5 rounded-full">
              <span className="text-white text-sm font-semibold">
                {currentReelIndex + 1} / {reels.length}
              </span>
            </div>

            {/* Progress Bar - Instagram style */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-black bg-opacity-30">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${((currentReelIndex + 1) / reels.length) * 100}%` }}
              ></div>
            </div>
        </div>
        )}
      </div>

      {/* Comments Modal - Instagram style */}
      {showComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full h-3/4 rounded-t-3xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
              <button
                onClick={() => setShowComments(null)}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 space-y-4 mb-4 overflow-y-auto scrollbar-hide">
              {currentReel?.comments.map((comment, index) => (
                <div key={index} className="flex items-start gap-3">
                  <img
                    src={comment.user.avatar || '/default-avatar.svg'}
                    alt={comment.user.name}
                    className="w-10 h-10 rounded-full border-2 border-gray-200"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900">{comment.user.name}</span>
                      <span className="text-gray-500 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{comment.text}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <button className="text-gray-500 hover:text-red-500 text-xs font-medium">Like</button>
                      <button className="text-gray-500 hover:text-blue-500 text-xs font-medium">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <img
                src="/default-avatar.svg"
                alt="Your avatar"
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button 
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!commentText.trim()}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Reel Modal */}
      <ReelsCreationModal
        isOpen={showCreateModal}
        onClose={() => {
          console.log('🚪 Closing modal');
          setShowCreateModal(false);
        }}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
