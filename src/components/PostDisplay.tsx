'use client';
import { useState, useEffect } from 'react';
import SharePopup, { ShareOptions } from './SharePopup';
import ReactionPopup, { ReactionType } from './ReactionPopup';

interface PostDisplayProps {
  post: any;
  isOwner?: boolean;
  onLike?: (postId: string) => void;
  onReaction?: (postId: string, reactionType: ReactionType) => void;
  onComment?: (postId: string, comment: string) => void;
  onSave?: (postId: string) => void;
  onShare?: (postId: string, shareOptions: ShareOptions) => void;
  onDelete?: (postId: string) => void;
  onEdit?: (post: any) => void;
  showEditDelete?: boolean;
}

export default function PostDisplay({ 
  post, 
  isOwner = false,
  onLike,
  onReaction,
  onComment,
  onSave,
  onShare,
  onDelete,
  onEdit,
  showEditDelete = false
}: PostDisplayProps) {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [reactionTimeout, setReactionTimeout] = useState<NodeJS.Timeout | null>(null);

  // Track view when component mounts
  useEffect(() => {
    const trackView = async () => {
      const token = localStorage.getItem('token');
      if (token && post._id) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${post._id}/view`, {
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
  }, [post._id]);

  const getMediaUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}${url}`;
  };

  // Get current user's reaction
  const getCurrentReaction = (): ReactionType | null => {
    if (post.reactions && Array.isArray(post.reactions)) {
      const token = localStorage.getItem('token');
      if (token) {
        // In a real app, you'd decode the token to get userId
        // For now, we'll check if any reaction exists
        return post.reactions.length > 0 ? post.reactions[0].type : null;
      }
    }
    return null;
  };

  // Get reaction count
  const getReactionCount = (): number => {
    if (post.reactions && Array.isArray(post.reactions)) {
      return post.reactions.length;
    }
    // Fallback to likes count for backward compatibility
    return post.likes ? (Array.isArray(post.likes) ? post.likes.length : post.likes) : 0;
  };

  // Get most common reaction emoji
  const getMostCommonReactionEmoji = (): string => {
    if (post.reactions && Array.isArray(post.reactions) && post.reactions.length > 0) {
      const reactionCounts: { [key: string]: number } = {};
      post.reactions.forEach((reaction: any) => {
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
      onReaction(post._id, reactionType);
    }
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
  // Check if current user has saved this post
  const isSaved = post.savedBy && Array.isArray(post.savedBy) && 
    post.savedBy.some((savedUser: any) => {
      // Handle both user ID strings and user objects
      if (typeof savedUser === 'string') {
        return savedUser === currentUserId;
      } else if (savedUser && typeof savedUser === 'object') {
        return savedUser._id === currentUserId || savedUser.userId === currentUserId;
      }
      return false;
    });

  return (
    <div className="bg-white rounded-xl shadow p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex items-center gap-2 mb-3">
        <img 
          src={post.user?.avatar ? getMediaUrl(post.user.avatar) : '/avatars/1.png.png'} 
          alt="avatar" 
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0" 
        />
        <div className="flex-1 min-w-0">
          {post.user ? (
            <a 
              href={`/dashboard/profile/${(() => {
                // Handle populated user object (when userId is the full user object)
                if (post.user.userId && typeof post.user.userId === 'object' && post.user.userId._id) {
                  return post.user.userId._id;
                }
                return String(post.user.userId || post.user._id || post.user.id || 'unknown');
              })()}`} 
              className="font-semibold hover:underline cursor-pointer text-sm sm:text-base truncate block text-blue-600"
            >
              {post.user?.name || 'Unknown User'}
            </a>
          ) : (
            <div className="font-semibold text-sm sm:text-base truncate">{post.user?.name || 'Unknown User'}</div>
          )}
          <div className="text-xs text-gray-400">
            {new Date(post.createdAt).toLocaleString()}
            {post.isShared && (
              <span className="ml-2 text-blue-600">📤 Shared</span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-gray-800 text-sm sm:text-base">{post.content}</p>
      </div>

      {/* Show media if present */}
      {post.media && post.media.url && (
        <div className="mb-3">
          {post.media.type === 'video' ? (
            <video 
              src={getMediaUrl(post.media.url)} 
              controls 
              className="w-full h-48 sm:h-96 object-cover rounded-lg shadow-lg"
              style={{ maxHeight: '70vh' }}
            />
          ) : (
            <img
              src={getMediaUrl(post.media.url)}
              alt="media"
              className="w-full h-48 sm:h-96 object-cover rounded-lg shadow-lg"
              style={{ maxHeight: '70vh' }}
            />
          )}
        </div>
      )}

      {/* Social Actions */}
      <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Reaction Button with Popup */}
          <div className="relative">
            <button 
              onMouseEnter={handleReactionButtonMouseEnter}
              onMouseLeave={handleReactionButtonMouseLeave}
              onClick={() => onLike && onLike(post._id)}
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
              {post.comments ? post.comments.length : 0}
            </span>
          </button>
          
          {/* Views count */}
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-gray-600">
            <span className="text-lg sm:text-xl">👁️</span>
            <span className="text-xs sm:text-sm font-medium">
              {post.views ? (Array.isArray(post.views) ? post.views.length : post.views) : 0}
            </span>
          </div>
          
          <button 
            onClick={() => setShowSharePopup(true)}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors touch-manipulation ${
              Array.isArray(post.shares) && post.shares.length > 0
                ? 'text-green-500 bg-green-50 border border-green-200'
                : 'text-gray-600 hover:text-green-500 hover:bg-green-50'
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            <span className="text-lg sm:text-xl">📤</span>
            <span className="text-xs sm:text-sm font-medium">
              {Array.isArray(post.shares) && post.shares.length > 0 ? post.shares.length : ''}
            </span>
          </button>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={() => onSave && onSave(post._id)}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors touch-manipulation ${
              isSaved ? 'text-blue-500 bg-blue-50' : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            <span className="text-lg sm:text-xl">{isSaved ? '💾' : '🔖'}</span>
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
          </button>
          
          {/* Edit and Delete buttons - only show if showEditDelete is true */}
          {showEditDelete && (
            <>
              <button 
                onClick={() => onEdit && onEdit(post)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-colors touch-manipulation"
                title="Edit post"
                style={{ touchAction: 'manipulation' }}
              >
                <span className="text-lg sm:text-xl">✏️</span>
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">Edit</span>
              </button>
              
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to delete this post?')) {
                    onDelete && onDelete(post._id);
                  }
                }}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors touch-manipulation"
                title="Delete post"
                style={{ touchAction: 'manipulation' }}
              >
                <span className="text-lg sm:text-xl">🗑️</span>
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">Delete</span>
              </button>
            </>
          )}
        </div>
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
              className="flex-1 px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
            <button
              onClick={() => {
                if (commentText.trim() && onComment) {
                  onComment(post._id, commentText);
                  setCommentText('');
                  setShowCommentInput(false);
                }
              }}
              disabled={!commentText.trim()}
              className="px-3 sm:px-4 py-1 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              Post
            </button>
          </div>
        </div>
      )}

      {/* Comments Display */}
      {post.comments && post.comments.length > 0 && (
        <div className="mt-3 space-y-2">
          {post.comments.slice(0, 3).map((comment: any, index: number) => (
            <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
              <img 
                src={comment.user?.avatar ? getMediaUrl(comment.user.avatar) : '/avatars/1.png.png'} 
                alt="avatar" 
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0" 
              />
              <div className="flex-1 min-w-0">
                {comment.user ? (
                  <a 
                    href={`/dashboard/profile/${(() => {
                      // Handle populated user object (when userId is the full user object)
                      if (comment.user.userId && typeof comment.user.userId === 'object' && comment.user.userId._id) {
                        return comment.user.userId._id;
                      }
                      return String(comment.user.userId || comment.user._id || comment.user.id || 'unknown');
                    })()}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm font-medium hover:underline cursor-pointer truncate block"
                  >
                    {comment.user?.name || 'User'}
                  </a>
                ) : (
                  <span className="text-xs sm:text-sm font-medium truncate">{comment.user?.name || 'User'}</span>
                )}
                <span className="text-xs sm:text-sm text-gray-600 ml-1 sm:ml-2 break-words">{comment.text}</span>
              </div>
            </div>
          ))}
          {post.comments.length > 3 && (
            <button className="text-xs sm:text-sm text-blue-500 hover:text-blue-700">
              View all {post.comments.length} comments
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
            onShare(post._id, shareOptions);
          }
        }}
        postContent={post.content}
        postMedia={post.media}
      />
    </div>
  );
} 