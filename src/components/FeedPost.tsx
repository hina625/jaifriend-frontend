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
    return `http://localhost:5000${url}`;
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
    if (post.user?.userId) {
      router.push(`/dashboard/profile/${post.user.userId}`);
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

  return (
    <div className="bg-white rounded-lg shadow-sm border mb-6">
      {/* Post Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              onClick={navigateToProfile}
            >
              <img
                src={post.user?.avatar || '/avatars/1.png.png'}
                alt={post.user?.name || 'User'}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div 
                className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={navigateToProfile}
              >
                {post.user?.name || 'User'}
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(post.createdAt)}
              </div>
            </div>
          </div>
          
          {isOwnPost && (
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg z-10 min-w-[120px]">
                  <button
                    onClick={() => {
                      onEdit(post);
                      setShowOptions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete(post._id);
                      setShowOptions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <p className="text-gray-900 mb-4 whitespace-pre-wrap">{post.content}</p>
        
        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="mb-4">
            {post.media.map((media: any, index: number) => (
              <div key={index} className="mb-2">
                {media.type === 'video' ? (
                  <video
                    src={getMediaUrl(media.url)}
                    controls
                    className="w-full rounded-lg"
                  />
                ) : (
                  <img
                    src={getMediaUrl(media.url)}
                    alt="Post media"
                    className="w-full rounded-lg"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onLike(post._id)}
              className={`flex items-center space-x-1 transition-colors ${
                post.likes?.includes(post.user?.userId) 
                  ? 'text-red-500' 
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${post.likes?.includes(post.user?.userId) ? 'fill-current' : ''}`} />
              <span className="text-sm">{post.likes?.length || 0}</span>
            </button>
            
            <button
              onClick={() => setShowCommentInput(!showCommentInput)}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{post.comments?.length || 0}</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={() => onSave(post._id)}
            className={`transition-colors ${
              post.savedBy?.includes(post.user?.userId) 
                ? 'text-blue-500' 
                : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${post.savedBy?.includes(post.user?.userId) ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Comment Input */}
        {showCommentInput && (
          <div className="mt-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
              />
              <button
                onClick={handleComment}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        )}

        {/* Comments */}
        {post.comments && post.comments.length > 0 && (
          <div className="mt-4 space-y-2">
            {post.comments.slice(0, 3).map((comment: any, index: number) => (
              <div key={index} className="flex items-start space-x-2">
                <img
                  src={comment.user?.avatar || '/avatars/1.png.png'}
                  alt={comment.user?.name || 'User'}
                  className="w-6 h-6 rounded-full"
                />
                <div className="flex-1">
                  <span className="font-semibold text-sm">{comment.user?.name || 'User'}</span>
                  <span className="text-sm text-gray-700 ml-2">{comment.content}</span>
                </div>
              </div>
            ))}
            {post.comments.length > 3 && (
              <button className="text-sm text-gray-500 hover:text-blue-500">
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
          post={post}
        />
      )}
    </div>
  );
};

export default FeedPost; 