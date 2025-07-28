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
          await fetch(`http://localhost:5000/api/posts/${post._id}/view`, {
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
    return `http://localhost:5000${url}`;
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

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <img 
          src={post.user?.avatar || '/avatars/1.png.png'} 
          alt="avatar" 
          className="w-10 h-10 rounded-full" 
        />
        <div className="flex-1">
          {post.user?.userId ? (
            <a 
              href={`/dashboard/profile/${String(post.user.userId)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold hover:underline cursor-pointer"
            >
              {post.user?.name || 'Unknown User'}
            </a>
          ) : (
            <div className="font-semibold">{post.user?.name || 'Unknown User'}</div>
          )}
          <div className="text-xs text-gray-400">
            {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-gray-800">{post.content}</p>
      </div>

      {/* Show media if present */}
      {post.media && post.media.url && (
        <div className="mb-3">
          {post.media.type === 'video' ? (
            <video 
              src={getMediaUrl(post.media.url)} 
              controls 
              className="w-full h-96 object-cover rounded-lg shadow-lg"
              style={{ maxHeight: '70vh' }}
            />
          ) : (
            <img
              src={getMediaUrl(post.media.url)}
              alt="media"
              className="w-full h-96 object-cover rounded-lg shadow-lg"
              style={{ maxHeight: '70vh' }}
            />
          )}
        </div>
      )}

      {/* Social Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-6">
          {/* Reaction Button with Popup */}
          <div className="relative">
            <button 
              onMouseEnter={handleReactionButtonMouseEnter}
              onMouseLeave={handleReactionButtonMouseLeave}
              onClick={() => onLike && onLike(post._id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                getCurrentReaction() ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <span className="text-xl">{getMostCommonReactionEmoji()}</span>
              <span className="text-sm font-medium">
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
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-colors"
          >
            <span className="text-xl">💬</span>
            <span className="text-sm font-medium">
              {post.comments ? post.comments.length : 0}
            </span>
          </button>
          
          {/* Views count */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600">
            <span className="text-xl">👁️</span>
            <span className="text-sm font-medium">
              {post.views ? (Array.isArray(post.views) ? post.views.length : post.views) : 0}
            </span>
          </div>
          
          <button 
            onClick={() => setShowSharePopup(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-green-500 hover:bg-green-50 transition-colors"
          >
            <span className="text-xl">📤</span>
            <span className="text-sm font-medium">
              {post.shares ? (Array.isArray(post.shares) ? post.shares.length : post.shares) : 0}
            </span>
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onSave && onSave(post._id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              post.savedBy && post.savedBy.length > 0 ? 'text-blue-500 bg-blue-50' : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
            }`}
          >
            <span className="text-xl">{post.savedBy && post.savedBy.length > 0 ? '💾' : '🔖'}</span>
            <span className="text-sm font-medium">{post.savedBy && post.savedBy.length > 0 ? 'Saved' : 'Save'}</span>
          </button>
          
          {/* Edit and Delete buttons - only show if showEditDelete is true */}
          {showEditDelete && (
            <>
              <button 
                onClick={() => onEdit && onEdit(post)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                title="Edit post"
              >
                <span className="text-xl">✏️</span>
                <span className="text-sm font-medium">Edit</span>
              </button>
              
              <button 
                onClick={() => onDelete && onDelete(post._id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Delete post"
              >
                <span className="text-xl">🗑️</span>
                <span className="text-sm font-medium">Delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Comment Input */}
      {showCommentInput && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
                src={comment.user?.avatar || '/avatars/1.png.png'} 
                alt="avatar" 
                className="w-6 h-6 rounded-full" 
              />
              <div className="flex-1">
                {comment.user?.userId ? (
                  <a 
                    href={`/dashboard/profile/${String(comment.user.userId)}`} 
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
          {post.comments.length > 3 && (
            <button className="text-sm text-blue-500 hover:text-blue-700">
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