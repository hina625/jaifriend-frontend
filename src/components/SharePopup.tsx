import React, { useState } from 'react';

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (shareOptions: ShareOptions) => void;
  postContent?: string;
  postMedia?: any;
  isAlbum?: boolean;
}

interface ShareOptions {
  shareOnTimeline: boolean;
  shareToPage: boolean;
  shareToGroup: boolean;
  customMessage: string;
  shareTo?: string;
}

const SharePopup: React.FC<SharePopupProps> = ({ 
  isOpen, 
  onClose, 
  onShare, 
  postContent = '',
  postMedia,
  isAlbum = false
}) => {
  const [shareMode, setShareMode] = useState<'share' | 'export'>('share');
  const [shareOptions, setShareOptions] = useState<ShareOptions>({
    shareOnTimeline: true,
    shareToPage: false,
    shareToGroup: false,
    customMessage: '',
    shareTo: 'friends'
  });

  if (!isOpen) return null;

  const handleShare = () => {
    onShare(shareOptions);
    onClose();
  };

  const handleCheckboxChange = (option: keyof ShareOptions) => {
    setShareOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Share {isAlbum ? 'album' : 'post'} on
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Content Preview */}
          {(postContent || postMedia) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3">
                {postMedia && postMedia.length > 0 && (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {postMedia[0].type === 'video' ? (
                      <video 
                        src={postMedia[0].url} 
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img 
                        src={postMedia[0].url} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    )}
                    {postMedia.length > 1 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">+{postMedia.length - 1}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {postContent || (isAlbum ? 'Album' : 'Post')}
                  </p>
                  {isAlbum && postMedia && (
                    <p className="text-xs text-gray-500 mt-1">
                      {postMedia.length} media item{postMedia.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setShareMode('share')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                shareMode === 'share' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Share
            </button>
            <button
              onClick={() => setShareMode('export')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                shareMode === 'export' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Export
            </button>
          </div>

          {/* Share Options */}
          <div className="space-y-4 mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={shareOptions.shareOnTimeline}
                onChange={() => handleCheckboxChange('shareOnTimeline')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">Share on my timeline</span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={shareOptions.shareToPage}
                onChange={() => handleCheckboxChange('shareToPage')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">Share to a page</span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={shareOptions.shareToGroup}
                onChange={() => handleCheckboxChange('shareToGroup')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">Share {isAlbum ? 'album' : 'post'} on a group</span>
            </label>

            {/* Privacy Options */}
            {shareOptions.shareOnTimeline && (
              <div className="ml-7 mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Privacy</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="privacy"
                      value="friends"
                      checked={shareOptions.shareTo === 'friends'}
                      onChange={(e) => setShareOptions(prev => ({ ...prev, shareTo: e.target.value }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Friends</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="privacy"
                      value="public"
                      checked={shareOptions.shareTo === 'public'}
                      onChange={(e) => setShareOptions(prev => ({ ...prev, shareTo: e.target.value }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Public</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Custom Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add a message (optional)
            </label>
            <textarea
              value={shareOptions.customMessage}
              onChange={(e) => setShareOptions(prev => ({ ...prev, customMessage: e.target.value }))}
              placeholder={isAlbum ? "Write something about this album..." : "Write something here..."}
              className="w-full h-24 sm:h-32 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {shareOptions.customMessage.length}/500
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 sm:py-3 px-3 sm:px-4 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors text-sm sm:text-base touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={!shareOptions.shareOnTimeline && !shareOptions.shareToPage && !shareOptions.shareToGroup}
              className="flex-1 py-2 sm:py-3 px-3 sm:px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm sm:text-base touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePopup;
export type { ShareOptions }; 