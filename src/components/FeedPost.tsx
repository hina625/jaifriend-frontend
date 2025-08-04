'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, User } from 'lucide-react';
import SharePopup, { ShareOptions } from './SharePopup';

interface FeedPostProps {
  post: any;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onShare: (postId: string, shareOptions: ShareOptions) => void;
  onSave: (postId: string) => void;
  onDelete: (postId: string) => void;
  onEdit: (post: any) => void;
  isOwnPost: boolean;
}

const FeedPost: React.FC<FeedPostProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onSave,
  onDelete,
  onEdit,
  isOwnPost
}) => {
  const router = useRouter();
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const getMediaUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}${url}`;
  };

  const handleComment = () => {
    if (commentText.trim()) {
      onComment(post._id, commentText);
      setCommentText('');
      setShowCommentInput(false);
    }
  };

  const handleShare = () => {
    setShowSharePopup(true);
  };

  const handleShareConfirm = (shareOptions: ShareOptions) => {
    onShare(post._id, shareOptions);
    setShowSharePopup(false);
  };

  const navigateToProfile = () => {
    let userId = '';
    
    // Handle populated user object (when userId is the full user object)
    if (post.user?.userId && typeof post.user.userId === 'object' && post.user.userId._id) {
      userId = post.user.userId._id;
    } else {
      userId = post.user?.userId || post.user?._id || post.user?.id;
    }
    
    if (userId) {
      router.push(`/dashboard/profile/${userId}`);
    }
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

  // Get current user ID for like checking
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
  const isLiked = post.likes?.includes(currentUserId);

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 mb-4 sm:mb-6 transition-colors duration-200">
      {/* Post Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
              onClick={navigateToProfile}
            >
              <img
                src={post.user?.avatar || '/avatars/1.png.png'}
                alt={post.user?.name || 'User'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
                             <div 
                 className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 transition-colors text-sm sm:text-base truncate"
                 onClick={navigateToProfile}
               >
                 {post.user?.name || 'User'}
               </div>
               <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {formatDate(post.createdAt)}
                {post.isShared && (
                  <span className="ml-2 text-blue-600">📤 Shared</span>
                )}
              </div>
            </div>
          </div>
          
          {isOwnPost && (
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
                style={{ touchAction: 'manipulation' }}
              >
                <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 top-8 sm:top-10 bg-white border rounded-lg shadow-lg z-10 min-w-[120px] sm:min-w-[140px]">
                  <button
                    onClick={() => {
                      onEdit(post);
                      setShowOptions(false);
                    }}
                    className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this post?')) {
                        onDelete(post._id);
                      }
                      setShowOptions(false);
                    }}
                    className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-red-600 hover:bg-gray-50 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

             {/* Post Content */}
       <div className="p-3 sm:p-4">
         <p className="text-gray-900 dark:text-white mb-3 sm:mb-4 whitespace-pre-wrap text-sm sm:text-base">{post.content}</p>
        
        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="mb-3 sm:mb-4">
            {post.media.map((media: any, index: number) => (
              <div key={index} className="mb-2">
                {media.type === 'video' ? (
                  <video
                    src={getMediaUrl(media.url)}
                    controls
                    className="w-full rounded-lg max-h-64 sm:max-h-96"
                  />
                ) : (
                  <img
                    src={getMediaUrl(media.url)}
                    alt="Post media"
                    className="w-full rounded-lg max-h-64 sm:max-h-96 object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => onLike(post._id)}
              className={`flex items-center space-x-1 transition-colors touch-manipulation ${
                isLiked
                  ? 'text-red-500' 
                  : 'text-gray-500 hover:text-red-500'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs sm:text-sm">{post.likes?.length || 0}</span>
            </button>
            
            <button
              onClick={() => setShowCommentInput(!showCommentInput)}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">{post.comments?.length || 0}</span>
            </button>
            
            <button
              onClick={handleShare}
              className={`flex items-center space-x-1 transition-colors touch-manipulation ${
                Array.isArray(post.shares) && post.shares.length > 0
                  ? 'text-green-500 bg-green-50 border border-green-200'
                  : 'text-gray-500 hover:text-green-500'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">
                {Array.isArray(post.shares) && post.shares.length > 0 ? `(${post.shares.length})` : ''}
              </span>
            </button>
          </div>
          
          <button
            onClick={() => onSave(post._id)}
            className={`transition-colors touch-manipulation ${
              post.savedBy?.includes(currentUserId) 
                ? 'text-blue-500' 
                : 'text-gray-500 hover:text-blue-500'
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${post.savedBy?.includes(currentUserId) ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Comment Input */}
        {showCommentInput && (
          <div className="mt-3 sm:mt-4">
            <div className="flex space-x-2">
                             <input
                 type="text"
                 value={commentText}
                 onChange={(e) => setCommentText(e.target.value)}
                 placeholder="Write a comment..."
                 className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                 onKeyPress={(e) => e.key === 'Enter' && handleComment()}
               />
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm touch-manipulation"
                style={{ touchAction: 'manipulation' }}
              >
                Post
              </button>
            </div>
          </div>
        )}

        {/* Comments */}
        {post.comments && post.comments.length > 0 && (
          <div className="mt-3 sm:mt-4 space-y-2">
            {post.comments.slice(0, 3).map((comment: any, index: number) => (
              <div key={index} className="flex items-start space-x-2">
                <img
                  src={comment.user?.avatar || '/avatars/1.png.png'}
                  alt={comment.user?.name || 'User'}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0"
                />
                                 <div className="flex-1 min-w-0">
                   <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white">{comment.user?.name || 'User'}</span>
                   <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 ml-1 sm:ml-2 break-words">{comment.content}</span>
                 </div>
              </div>
            ))}
                         {post.comments.length > 3 && (
               <button className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                 View all {post.comments.length} comments
               </button>
             )}
          </div>
        )}
      </div>

      {/* Share Popup */}
      {showSharePopup && (
        <SharePopup
          isOpen={showSharePopup}
          onClose={() => setShowSharePopup(false)}
          onShare={handleShareConfirm}
          postContent={post.content}
          postMedia={post.media}
        />
      )}
    </div>
  );
};

export default FeedPost; 