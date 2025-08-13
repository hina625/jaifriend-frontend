'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, ChevronDown, Smile, Paperclip, Send, MoreHorizontal, Globe } from 'lucide-react';
import { getCurrentUserId } from '@/utils/auth';
import SharePopup, { ShareOptions } from './SharePopup';
import ReactionPopup, { ReactionType } from './ReactionPopup';
import PostOptionsDropdown from './PostOptionsDropdown';

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
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [showReactionsTemporarily, setShowReactionsTemporarily] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Track view when component mounts
  useEffect(() => {
    console.log('📸 PostDisplay mounted - Post ID:', post._id, 'Media count:', post.media?.length || 0);
    
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

  // Monitor post changes
  useEffect(() => {
    console.log('📸 PostDisplay post changed - Post ID:', post._id, 'Media:', post.media);
  }, [post]);

  const getMediaUrl = (url: string) => {
    if (!url) return '/default-avatar.svg';
    if (url.startsWith('http')) return url;
    
    // Handle localhost URLs that might be stored incorrectly
    if (url.includes('localhost:3000')) {
              const correctedUrl = url.replace('http://localhost:3000', 'https://jaifriend-backend-production.up.railway.app');
      console.log('🔗 getMediaUrl - Fixed localhost URL:', { original: url, corrected: correctedUrl });
      return correctedUrl;
    }
    
    // Handle hardcoded placeholder avatars that don't exist
    if (url.includes('/avatars/') || url.includes('/covers/')) {
      console.log('🔗 getMediaUrl - Placeholder avatar detected:', url);
      return '/default-avatar.svg';
    }
    
            const fullUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}${url}`;
    console.log('📸 getMediaUrl - Original:', url, 'Full:', fullUrl);
    return fullUrl;
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
    // Show reactions temporarily after adding a reaction
    setShowReactionsTemporarily(true);
    setTimeout(() => {
      setShowReactionsTemporarily(false);
    }, 2000); // Hide after 2 seconds
  };

  // Get current user ID for save checking
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

  // Calculate total reactions (likes + other reactions if they exist)
  const totalReactions = (post.likes?.length || 0) + (post.reactions?.length || 0);

  return (
    <div className="bg-white rounded-xl shadow p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex items-center gap-2 mb-3">
        <img 
          src={post.user?.avatar ? getMediaUrl(post.user.avatar) : '/default-avatar.svg'} 
          alt="avatar" 
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 object-cover" 
          onError={(e) => {
            console.log('❌ Avatar load failed for user:', post.user?.name, 'URL:', post.user?.avatar);
            e.currentTarget.src = '/default-avatar.svg';
          }}
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
        {/* Content with word limit and Read More */}
        <div className="text-gray-800 text-sm sm:text-base">
          {(() => {
            const content = post.content || '';
            const wordCount = content.split(/\s+/).filter((word: string) => word && word.length > 0).length;
            
            if (wordCount > 300) {
              const words = content.split(/\s+/);
              const first300Words = words.slice(0, 300).join(' ');
              
              return (
                <div>
                  <span>{isExpanded ? content : first300Words}</span>
                  <span className="text-blue-600 cursor-pointer hover:underline ml-1" 
                        onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? '... Show Less' : '... Read More'}
                  </span>
                </div>
              );
            } else {
              return <span>{content}</span>;
            }
          })()}
        </div>
      </div>

      {/* Show media if present */}
      {post.media && post.media.length > 0 && (
        <div className="mb-3">
          {(() => {
            console.log('📸 PostDisplay media:', post.media);
            console.log('📸 Post ID:', post._id);
            console.log('📸 Media URLs:', post.media.map((m: any) => m.url));
            return post.media.map((media: any, index: number) => (
              <div key={index} className="mb-2">
                {media.type === 'video' ? (
                  <video 
                    src={getMediaUrl(media.url)} 
                    controls 
                    className="w-full h-48 sm:h-96 object-cover rounded-lg shadow-lg"
                    style={{ maxHeight: '70vh' }}
                  />
                ) : (
                  <img
                    src={getMediaUrl(media.url)}
                    alt="media"
                    className="w-full h-48 sm:h-96 object-cover rounded-lg shadow-lg"
                    style={{ maxHeight: '70vh' }}
                  />
                )}
              </div>
            ));
          })()}
        </div>
      )}

      {/* Engagement Metrics Section - Upper Section */}
      <div className="py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {/* Reactions - Left Side */}
          <div className="flex items-center space-x-2">
            <span className="text-pink-500 text-lg">❤️</span>
            <span className="text-blue-500 text-lg">👍</span>
            <span className="text-yellow-500 text-lg">😊</span>
            <span className="text-gray-600 text-sm font-medium ml-1">
              {totalReactions}
            </span>
            {/* Removed showReactionDetails indicator */}
          </div>
          
          {/* Content Statistics - Right Side */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-gray-500">
              <span className="text-lg">💬</span>
              <span className="text-sm">{post.comments?.length || 0} Comments</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500">
              <span className="text-lg">👁️</span>
              <span className="text-sm">{post.views?.length || post.views || 0} Views</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500">
              <span className="text-lg">⭐</span>
              <span className="text-sm">{post.reviews?.length || 0} Reviews</span>
            </div>
          </div>
        </div>
        
        {/* Temporary Reaction Display - Shows briefly after adding reaction */}
        {showReactionsTemporarily && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
            <div className="flex flex-wrap gap-2">
              {(() => {
                if (post.reactions && Array.isArray(post.reactions) && post.reactions.length > 0) {
                  const reactionCounts: { [key: string]: number } = {};
                  post.reactions.forEach((reaction: any) => {
                    reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
                  });
                  
                  const reactionEmojis: { [key: string]: string } = {
                    like: '👍',
                    love: '❤️',
                    haha: '😂',
                    wow: '😮',
                    sad: '😢',
                    angry: '😠'
                  };
                  
                  return Object.entries(reactionCounts).map(([type, count]) => (
                    <div key={type} className="flex items-center space-x-1 bg-gray-50 dark:bg-gray-700 rounded-full px-3 py-1">
                      <span className="text-lg">{reactionEmojis[type] || '😊'}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{count}</span>
                    </div>
                  ));
                } else if (post.likes && Array.isArray(post.likes) && post.likes.length > 0) {
                  return (
                    <div className="flex items-center space-x-1 bg-gray-50 dark:bg-gray-700 rounded-full px-3 py-1">
                      <span className="text-lg">👍</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{post.likes.length}</span>
                    </div>
                  );
                } else {
                  return (
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                      No reactions yet
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Section - Lower Section */}
      <div className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* React Button */}
          <div className="relative">
            <button 
              onMouseEnter={handleReactionButtonMouseEnter}
              onMouseLeave={handleReactionButtonMouseLeave}
              onClick={() => onLike && onLike(post._id)}
                className={`flex items-center space-x-2 transition-colors touch-manipulation ${
                  getCurrentReaction() ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm">😊</span>
                </div>
                <span className="text-sm font-medium">React</span>
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
          
            {/* Comment Button */}
          <button 
            onClick={() => setShowCommentInput(!showCommentInput)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors touch-manipulation"
            style={{ touchAction: 'manipulation' }}
          >
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-lg">💬</span>
              </div>
              <span className="text-sm font-medium">Comment</span>
          </button>
          
            {/* Share Button */}
          <button 
            onClick={() => setShowSharePopup(true)}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-lg">📤</span>
              </div>
              <span className="text-sm font-medium">Share</span>
            </button>
            
            {/* Review Button */}
            <button 
              className="flex items-center space-x-2 text-gray-600 hover:text-yellow-500 transition-colors touch-manipulation"
            style={{ touchAction: 'manipulation' }}
          >
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-lg">⭐</span>
              </div>
              <span className="text-sm font-medium">Review</span>
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
                src={comment.user?.avatar ? getMediaUrl(comment.user.avatar) : '/default-avatar.svg'} 
                alt="avatar" 
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0 object-cover" 
                onError={(e) => {
                  console.log('❌ Comment avatar load failed for user:', comment.user?.name, 'URL:', comment.user?.avatar);
                  e.currentTarget.src = '/default-avatar.svg';
                }}
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
      </div>

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
