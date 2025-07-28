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
      className={`absolute z-50 bg-white rounded-full shadow-lg border border-gray-200 p-2 ${
        position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
      } left-0 transform -translate-x-1/2`}
    >
      <div className="flex items-center gap-1">
        {reactions.map((reaction) => (
          <button
            key={reaction.type}
            onClick={() => {
              onReaction(reaction.type);
              onClose();
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg hover:scale-110 transition-all duration-200 ${
              reaction.color
            } ${
              currentReaction === reaction.type 
                ? 'ring-2 ring-blue-300 ring-offset-2' 
                : 'hover:shadow-md'
            }`}
            title={reaction.label}
          >
            {reaction.emoji}
          </button>
        ))}
      </div>
    </div>
  );
} 