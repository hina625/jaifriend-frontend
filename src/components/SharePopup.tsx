import React, { useState } from 'react';

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (shareOptions: ShareOptions) => void;
  postContent?: string;
  postMedia?: any;
}

interface ShareOptions {
  shareOnTimeline: boolean;
  shareToPage: boolean;
  shareToGroup: boolean;
  customMessage: string;
}

const SharePopup: React.FC<SharePopupProps> = ({ 
  isOpen, 
  onClose, 
  onShare, 
  postContent = '',
  postMedia 
}) => {
  const [shareMode, setShareMode] = useState<'share' | 'export'>('share');
  const [shareOptions, setShareOptions] = useState<ShareOptions>({
    shareOnTimeline: true,
    shareToPage: false,
    shareToGroup: false,
    customMessage: ''
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
            <h3 className="text-xl font-semibold text-gray-900">Share the post on</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

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
              <span className="text-gray-700 font-medium">Share post on a group</span>
            </label>
          </div>

          {/* Custom Message */}
          <div className="mb-6">
            <textarea
              value={shareOptions.customMessage}
              onChange={(e) => setShareOptions(prev => ({ ...prev, customMessage: e.target.value }))}
              placeholder="Write something here.."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
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