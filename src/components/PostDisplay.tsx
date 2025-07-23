'use client';
import { useState } from 'react';

interface PostDisplayProps {
  post: any;
  isOwner?: boolean;
  onLike?: (postId: string) => void;
  onComment?: (postId: string, comment: string) => void;
  onSave?: (postId: string) => void;
}

export default function PostDisplay({ 
  post, 
  isOwner = false,
  onLike,
  onComment,
  onSave
}: PostDisplayProps) {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');

  const getMediaUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
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
          <div className="font-semibold">{post.user?.name || 'Unknown User'}</div>
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
          <button 
            onClick={() => onLike && onLike(post._id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              post.liked ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
            }`}
          >
            <span className="text-xl">❤️</span>
            <span className="text-sm font-medium">
              {post.likes ? (Array.isArray(post.likes) ? post.likes.length : post.likes) : 0}
            </span>
          </button>
          
          <button 
            onClick={() => setShowCommentInput(!showCommentInput)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-colors"
          >
            <span className="text-xl">💬</span>
            <span className="text-sm font-medium">
              {post.comments ? post.comments.length : 0}
            </span>
          </button>
        </div>
        
        <button 
          onClick={() => onSave && onSave(post._id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            post.savedBy && post.savedBy.length > 0 ? 'text-blue-500 bg-blue-50' : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
          }`}
        >
          <span className="text-xl">{post.savedBy && post.savedBy.length > 0 ? '💾' : '🔖'}</span>
          <span className="text-sm font-medium">{post.savedBy && post.savedBy.length > 0 ? 'Saved' : 'Save'}</span>
        </button>
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
                <span className="text-sm font-medium">{comment.user?.name || 'User'}</span>
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
    </div>
  );
} 