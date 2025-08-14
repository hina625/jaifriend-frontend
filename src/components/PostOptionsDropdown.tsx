'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Trash2, MessageCircle, ExternalLink, Pin, Zap, X } from 'lucide-react';

interface PostOptionsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComments: () => void;
  onOpenInNewTab: () => void;
  onPin: () => void;
  onBoost: () => void;
  commentsEnabled?: boolean;
  isPinned?: boolean;
  isBoosted?: boolean;
  position?: 'top' | 'bottom';
  isOwnPost?: boolean; // Add this prop to check if current user owns the post
}

const PostOptionsDropdown: React.FC<PostOptionsDropdownProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleComments,
  onOpenInNewTab,
  onPin,
  onBoost,
  commentsEnabled = true,
  isPinned = false,
  isBoosted = false,
  position = 'bottom',
  isOwnPost = false
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const ownerOptions = Boolean(isOwnPost) ? [
    {
      icon: <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "Edit Post",
      subtitle: "Edit post information.",
      onClick: onEdit,
      className: "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
    },
    {
      icon: <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "Delete Post",
      subtitle: "Delete this post completely.",
      onClick: onDelete,
      className: "text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
    },
    {
      icon: <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: commentsEnabled ? "Disable comments" : "Enable comments",
      subtitle: "Allow or disallow members to comment on this post.",
      onClick: onToggleComments,
      className: "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
    }
  ] : [];
  
  const options = [
    // Owner-only options - only show if isOwnPost is true
    ...ownerOptions,
    {
      icon: <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "Open post in new tab",
      subtitle: "View this post in a new tab.",
      onClick: onOpenInNewTab,
      className: "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
    },

    {
      icon: <Pin className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: isPinned ? "Unpin Post" : "Pin Post",
      subtitle: isPinned ? "Unpin this post from the top of your profile." : "Pin this post to the top of your profile.",
      onClick: onPin,
      className: isPinned ? "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20" : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
    },
    {
      icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: isBoosted ? "Remove Boost" : "Boost Post",
      subtitle: isBoosted ? "Remove this post from the boosted list." : "Add this post from the boosted list.",
      onClick: onBoost,
      className: isBoosted ? "text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/20" : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
    }
  ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      <div className="sm:hidden fixed inset-0 bg-black bg-opacity-60 z-40" onClick={onClose} />
      
    <div
      ref={dropdownRef}
        className={`absolute z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-600 min-w-[280px] sm:min-w-[320px] max-w-[90vw] ${
        position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
        } right-0 sm:right-0 transform -translate-x-1/2 sm:translate-x-0`}
        style={{
          backgroundColor: 'white',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          border: '2px solid #e5e7eb',
          filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))'
        }}
      >
        {/* Mobile close button */}
        <div className="sm:hidden flex justify-end p-3 border-b-2 border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-t-xl">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-600"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        <div className="py-2 relative bg-white dark:bg-gray-800 rounded-b-xl">
        {options.map((option, index) => (
          <React.Fragment key={option.title}>
            <button
              onClick={() => {
                option.onClick();
                onClose();
              }}
                className={`w-full px-4 sm:px-4 py-4 sm:py-3 text-left transition-all duration-200 ${option.className} hover:scale-[1.02] active:scale-[0.98] touch-manipulation rounded-lg mx-2 sm:mx-0 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600`}
                style={{ touchAction: 'manipulation' }}
            >
                <div className="flex items-start gap-3 sm:gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {option.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                    {option.title}
                  </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                    {option.subtitle}
                  </div>
                </div>
              </div>
            </button>
            {index < options.length - 1 && (
                <div className="border-t-2 border-gray-200 dark:border-gray-600 mx-4 sm:mx-4" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
    </>
  );
};

export default PostOptionsDropdown;
