'use client';
import { useState, useEffect } from 'react';
import SharePopup, { ShareOptions } from './SharePopup';
import ReactionPopup, { ReactionType } from './ReactionPopup';

interface AlbumDisplayProps {
  album: any;
  onDelete?: (albumId: string) => void;
  isOwner?: boolean;
  onLike?: (albumId: string) => void;
  onReaction?: (albumId: string, reactionType: ReactionType) => void;
  onComment?: (albumId: string, comment: string) => void;
  onSave?: (albumId: string) => void;
  onShare?: (albumId: string, shareOptions?: ShareOptions) => void;
}

export default function AlbumDisplay({ 
  album, 
  onDelete, 
  isOwner = false,
  onLike,
  onReaction,
  onComment,
  onSave,
  onShare
}: AlbumDisplayProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [reactionTimeout, setReactionTimeout] = useState<NodeJS.Timeout | null>(null);

  // Track view when component mounts
  useEffect(() => {
    const trackView = async () => {
      const token = localStorage.getItem('token');
      if (token && album._id) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/albums/${album._id}/view`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (error) {
          console.error('Error tracking view:', error);
        }
      }
    };
    
    trackView();
  }, [album._id]);

  const getMediaUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}${url}`;
  };

  // Get current user's reaction
  const getCurrentReaction = (): ReactionType | null => {
    if (album.reactions && Array.isArray(album.reactions)) {
      const token = localStorage.getItem('token');
      if (token) {
        // In a real app, you'd decode the token to get userId
        // For now, we'll check if any reaction exists
        return album.reactions.length > 0 ? album.reactions[0].type : null;
      }
    }
    return null;
  };

  // Get reaction count
  const getReactionCount = (): number => {
    if (album.reactions && Array.isArray(album.reactions)) {
      return album.reactions.length;
    }
    // Fallback to likes count for backward compatibility
    return album.likes ? (Array.isArray(album.likes) ? album.likes.length : album.likes) : 0;
  };

  // Get most common reaction emoji
  const getMostCommonReactionEmoji = (): string => {
    if (album.reactions && Array.isArray(album.reactions) && album.reactions.length > 0) {
      const reactionCounts: { [key: string]: number } = {};
      album.reactions.forEach((reaction: any) => {
        reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
      });
      
      const mostCommon = Object.keys(reactionCounts).reduce((a, b) => 
        reactionCounts[a] > reactionCounts[b] ? a : b
      );
      
      const reactionEmojis: { [key: string]: string } = {
        like: '👍',
        love: '❤️',
        haha: '😂',
        wow: '😮',
        sad: '😢',
        angry: '😠'
      };
      
      return reactionEmojis[mostCommon] || '👍';
    }
    return '👍';
  };

  const handleReactionButtonMouseEnter = () => {
    if (reactionTimeout) {
      clearTimeout(reactionTimeout);
    }
    setShowReactionPopup(true);
  };

  const handleReactionButtonMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowReactionPopup(false);
    }, 300);
    setReactionTimeout(timeout);
  };

  const handleReactionPopupMouseEnter = () => {
    if (reactionTimeout) {
      clearTimeout(reactionTimeout);
    }
  };

  const handleReactionPopupMouseLeave = () => {
    setShowReactionPopup(false);
  };

  const handleReaction = (reactionType: ReactionType) => {
    if (onReaction) {
      onReaction(album._id, reactionType);
    }
    setShowReactionPopup(false);
  };

  // Get current user ID for save checking
  const getCurrentUserId = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || user._id;
      } catch {
        return null;
      }
    }
    return null;
  };

  const currentUserId = getCurrentUserId();
  // Check if current user has saved this album
  const isSaved = album.savedBy && Array.isArray(album.savedBy) && 
    album.savedBy.some((savedUser: any) => {
      // Handle both user ID strings and user objects
      if (typeof savedUser === 'string') {
        return savedUser === currentUserId;
      } else if (savedUser && typeof savedUser === 'object') {
        return savedUser._id === currentUserId || savedUser.userId === currentUserId;
      }
      return false;
    });

  const displayedMedia = showAllPhotos ? album.media : (album.media || []).slice(0, 3);
  const hasMoreMedia = (album.media || []).length > 3;

  return (
    <div className="bg-white rounded-xl shadow p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex items-center gap-2 mb-3">
        <img 
          src={album.user?.avatar || '/avatars/1.png.png'} 
          alt="avatar" 
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" 
        />
        <div className="flex-1 min-w-0">
          {album.user?._id ? (
            <a 
              href={`/dashboard/profile/${String(album.user._id)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-sm sm:text-base hover:underline cursor-pointer truncate block"
            >
              {album.user?.name || 'Unknown User'}
            </a>
          ) : (
            <div className="font-semibold text-sm sm:text-base truncate">{album.user?.name || 'Unknown User'}</div>
          )}
          <div className="text-xs text-gray-400">
            {new Date(album.createdAt).toLocaleString()}
          </div>
        </div>
        {isOwner && onDelete && (
          <button
            onClick={() => onDelete(album._id)}
            className="text-red-500 hover:text-red-700 text-xs sm:text-sm touch-manipulation"
            style={{ touchAction: 'manipulation' }}
          >
            🗑️ <span className="hidden sm:inline">Delete</span>
          </button>
        )}
      </div>

      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-lg">📸 {album.name}</h3>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
            Album
          </span>
        </div>
        <div className="text-sm text-gray-600">
          {album.media ? album.media.length : 0} media item{(album.media ? album.media.length : 0) !== 1 ? 's' : ''}
        </div>
      </div>

      {album.media && album.media.length > 0 && (
        <div className="mb-3">
          {displayedMedia.map((mediaItem: any, index: number) => (
            <div key={index} className="relative mb-3">
              {mediaItem.type === 'video' ? (
                <video 
                  src={getMediaUrl(mediaItem.url)} 
                  controls 
                  className="w-full h-64 sm:h-96 object-cover rounded-lg shadow-lg"
                  style={{ maxHeight: '70vh' }}
                />
              ) : (
                <img
                  src={getMediaUrl(mediaItem.url)}
                  alt={`Media ${index + 1}`}
                  className="w-full h-64 sm:h-96 object-cover rounded-lg shadow-lg"
                  style={{ maxHeight: '70vh' }}
                />
              )}
              {index === 2 && hasMoreMedia && !showAllPhotos && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <span className="text-white font-bold text-lg sm:text-xl">+{album.media.length - 3}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {hasMoreMedia && (
        <button
          onClick={() => setShowAllPhotos(!showAllPhotos)}
          className="text-blue-500 hover:text-blue-700 text-sm touch-manipulation"
          style={{ touchAction: 'manipulation' }}
        >
          {showAllPhotos ? 'Show Less' : `Show All ${album.media.length} Media`}
        </button>
      )}

      {/* Social Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Reaction Button with Popup */}
          <div className="relative">
            <button 
              onMouseEnter={handleReactionButtonMouseEnter}
              onMouseLeave={handleReactionButtonMouseLeave}
              onClick={() => onLike && onLike(album._id)}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors touch-manipulation ${
                getCurrentReaction() ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              <span className="text-lg sm:text-xl">{getMostCommonReactionEmoji()}</span>
              <span className="text-xs sm:text-sm font-medium">
                {getReactionCount()}
              </span>
            </button>
            
            {/* Reaction Popup */}
            <div
              onMouseEnter={handleReactionPopupMouseEnter}
              onMouseLeave={handleReactionPopupMouseLeave}
            >
              <ReactionPopup
                isOpen={showReactionPopup}
                onClose={() => setShowReactionPopup(false)}
                onReaction={handleReaction}
                currentReaction={getCurrentReaction()}
                position="top"
              />
            </div>
          </div>
          
          <button 
            onClick={() => setShowCommentInput(!showCommentInput)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-colors touch-manipulation"
            style={{ touchAction: 'manipulation' }}
          >
            <span className="text-lg sm:text-xl">💬</span>
            <span className="text-xs sm:text-sm font-medium">
              {album.comments ? album.comments.length : 0}
            </span>
          </button>

          {/* Views count */}
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-gray-600">
            <span className="text-lg sm:text-xl">👁️</span>
            <span className="text-xs sm:text-sm font-medium">{album.views ? album.views.length : 0}</span>
          </div>
          
          <button 
            onClick={() => setShowSharePopup(true)}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors touch-manipulation ${
              album.shares && album.shares.length > 0 ? 'text-green-500 bg-green-50' : 'text-gray-600 hover:text-green-500 hover:bg-green-50'
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            <span className="text-lg sm:text-xl">📤</span>
            <span className="text-xs sm:text-sm font-medium">
              {album.shares ? (Array.isArray(album.shares) ? album.shares.length : album.shares) : 0}
            </span>
          </button>
        </div>
        
        <button 
          onClick={() => onSave && onSave(album._id)}
          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors touch-manipulation ${
            isSaved ? 'text-blue-500 bg-blue-50' : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          <span className="text-lg sm:text-xl">{isSaved ? '💾' : '🔖'}</span>
          <span className="text-xs sm:text-sm font-medium hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Comment Input */}
      {showCommentInput && (
        <div className="mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base"
            />
            <button
              onClick={() => {
                if (commentText.trim() && onComment) {
                  onComment(album._id, commentText);
                  setCommentText('');
                  setShowCommentInput(false);
                }
              }}
              disabled={!commentText.trim()}
              className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm sm:text-base touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              Post
            </button>
          </div>
        </div>
      )}

      {/* Comments Display */}
      {album.comments && album.comments.length > 0 && (
        <div className="mt-3 space-y-2">
          {album.comments.slice(0, 3).map((comment: any, index: number) => (
            <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
              <img 
                src={comment.user?.avatar || '/avatars/1.png.png'} 
                alt="avatar" 
                className="w-6 h-6 rounded-full" 
              />
              <div className="flex-1">
                {comment.user?._id ? (
                  <a 
                    href={`/dashboard/profile/${String(comment.user._id)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:underline cursor-pointer"
                  >
                    {comment.user?.name || 'User'}
                  </a>
                ) : (
                  <span className="text-sm font-medium">{comment.user?.name || 'User'}</span>
                )}
                <span className="text-sm text-gray-600 ml-2">{comment.text}</span>
              </div>
            </div>
          ))}
          {album.comments.length > 3 && (
            <button className="text-sm text-blue-500 hover:text-blue-700">
              View all {album.comments.length} comments
            </button>
          )}
        </div>
      )}

      {/* Share Popup */}
      <SharePopup
        isOpen={showSharePopup}
        onClose={() => setShowSharePopup(false)}
        onShare={(shareOptions) => {
          if (onShare) {
            onShare(album._id, shareOptions);
          }
        }}
        postContent={album.name}
        postMedia={album.media}
        isAlbum={true}
      />
    </div>
  );
} 