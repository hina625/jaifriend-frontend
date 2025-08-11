'use client';
import { useState, useRef, useEffect } from 'react';

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

interface ReactionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onReaction: (reactionType: ReactionType) => void;
  currentReaction?: ReactionType | null;
  position?: 'top' | 'bottom';
}

const reactions: { type: ReactionType; emoji: string; label: string; color: string }[] = [
  { type: 'like', emoji: '👍', label: 'Like', color: 'bg-blue-500' },
  { type: 'love', emoji: '❤️', label: 'Love', color: 'bg-red-500' },
  { type: 'haha', emoji: '😂', label: 'Haha', color: 'bg-yellow-500' },
  { type: 'wow', emoji: '😮', label: 'Wow', color: 'bg-yellow-500' },
  { type: 'sad', emoji: '😢', label: 'Sad', color: 'bg-yellow-500' },
  { type: 'angry', emoji: '😠', label: 'Angry', color: 'bg-orange-500' }
];

export default function ReactionPopup({ 
  isOpen, 
  onClose, 
  onReaction, 
  currentReaction,
  position = 'top'
}: ReactionPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
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

  return (
    <div 
      ref={popupRef}
      className={`absolute z-50 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-2 sm:p-3 ${
        position === 'top' ? 'bottom-full mb-2 sm:mb-3' : 'top-full mt-2 sm:mt-3'
      } left-0 transform -translate-x-1/2`}
    >
      <div className="flex items-center gap-1 sm:gap-2">
        {reactions.map((reaction) => (
          <button
            key={reaction.type}
            onClick={() => {
              onReaction(reaction.type);
              onClose();
            }}
            className={`w-12 h-12 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-lg sm:text-xl hover:scale-110 transition-all duration-200 touch-manipulation ${
              reaction.color
            } ${
              currentReaction === reaction.type 
                ? 'ring-2 ring-blue-300 dark:ring-blue-400 ring-offset-2 dark:ring-offset-gray-800' 
                : 'hover:shadow-md'
            }`}
            title={reaction.label}
            style={{ touchAction: 'manipulation' }}
          >
            {reaction.emoji}
          </button>
        ))}
      </div>
    </div>
  );
} 
