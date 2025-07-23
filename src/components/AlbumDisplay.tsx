'use client';
import { useState } from 'react';

interface AlbumDisplayProps {
  album: any;
  onDelete?: (albumId: string) => void;
  isOwner?: boolean;
  onLike?: (albumId: string) => void;
  onComment?: (albumId: string, comment: string) => void;
  onSave?: (albumId: string) => void;
  onShare?: (albumId: string) => void;
}

export default function AlbumDisplay({ 
  album, 
  onDelete, 
  isOwner = false,
  onLike,
  onComment,
  onSave,
  onShare
}: AlbumDisplayProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);

  const getMediaUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  const displayedMedia = showAllPhotos ? album.media : (album.media || []).slice(0, 3);
  const hasMoreMedia = (album.media || []).length > 3;

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <img 
          src={album.user?.avatar || '/avatars/1.png.png'} 
          alt="avatar" 
          className="w-10 h-10 rounded-full" 
        />
        <div className="flex-1">
          <div className="font-semibold">{album.user?.name || 'Unknown User'}</div>
          <div className="text-xs text-gray-400">
            {new Date(album.createdAt).toLocaleString()}
          </div>
        </div>
        {isOwner && onDelete && (
          <button
            onClick={() => onDelete(album._id)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            🗑️ Delete
          </button>
        )}
      </div>

      <div className="mb-3">
        <h3 className="font-semibold text-lg mb-2">📸 {album.name}</h3>
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
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                  style={{ maxHeight: '70vh' }}
                />
              ) : (
                <img
                  src={getMediaUrl(mediaItem.url)}
                  alt={`Media ${index + 1}`}
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                  style={{ maxHeight: '70vh' }}
                />
              )}
              {index === 2 && hasMoreMedia && !showAllPhotos && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <span className="text-white font-bold text-xl">+{album.media.length - 3}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {hasMoreMedia && (
        <button
          onClick={() => setShowAllPhotos(!showAllPhotos)}
          className="text-blue-500 hover:text-blue-700 text-sm"
        >
          {showAllPhotos ? 'Show Less' : `Show All ${album.media.length} Media`}
        </button>
      )}

      {/* Social Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onLike && onLike(album._id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              album.liked ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
            }`}
          >
            <span className="text-xl">❤️</span>
            <span className="text-sm font-medium">
              {album.likes ? (Array.isArray(album.likes) ? album.likes.length : album.likes) : 0}
            </span>
          </button>
          
          <button 
            onClick={() => setShowCommentInput(!showCommentInput)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-colors"
          >
            <span className="text-xl">💬</span>
            <span className="text-sm font-medium">
              {album.comments ? album.comments.length : 0}
            </span>
          </button>

          {/* Views count */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600">
            <span className="text-xl">👁️</span>
            <span className="text-sm font-medium">{album.views ? album.views.length : 0}</span>
          </div>
          
          <button 
            onClick={() => onShare && onShare(album._id)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-green-500 hover:bg-green-50 transition-colors"
          >
            <span className="text-xl">📤</span>
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
        
        <button 
          onClick={() => onSave && onSave(album._id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            album.savedBy && album.savedBy.length > 0 ? 'text-blue-500 bg-blue-50' : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
          }`}
        >
          <span className="text-xl">{album.savedBy && album.savedBy.length > 0 ? '💾' : '🔖'}</span>
          <span className="text-sm font-medium">{album.savedBy && album.savedBy.length > 0 ? 'Saved' : 'Save'}</span>
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
                  onComment(album._id, commentText);
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
                <span className="text-sm font-medium">{comment.user?.name || 'User'}</span>
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
    </div>
  );
} 