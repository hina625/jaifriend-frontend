'use client';
import { useState, useRef, useEffect } from 'react';

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

interface ReactionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onReaction: (reactionType: ReactionType) => void;
  currentReaction?: ReactionType | null;
  position?: 'top' | 'bottom';
  isReacting?: boolean;
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
  position = 'top',
  isReacting
}: ReactionPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      onMouseDown={(e) => {
        // Prevent outside mousedown listener from closing before click handlers run
        e.stopPropagation();
      }}
      className={`absolute z-50 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 ${
        isMobile ? 'p-1' : 'p-2 sm:p-3'
      } ${
        position === 'top' 
          ? `bottom-full ${isMobile ? 'mb-1' : 'mb-2 sm:mb-3'}` 
          : `top-full ${isMobile ? 'mt-1' : 'mt-2 sm:mt-3'}`
      } left-1/2 transform -translate-x-1/2 pointer-events-auto ${
        isMobile ? 'max-w-xs' : 'max-w-sm'
      }`}
    >
      <div className={`flex items-center ${
        isMobile ? 'gap-0.5' : 'gap-1 sm:gap-2'
      }`}>
        {reactions.map((reaction) => (
          <button
            key={reaction.type}
            onClick={(e) => {
              e.stopPropagation();
              onReaction(reaction.type);
              onClose();
            }}
            disabled={isReacting}
            className={`${
              isMobile ? 'w-7 h-7' : 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10'
            } rounded-full flex items-center justify-center text-white ${
              isMobile ? 'text-xs' : 'text-sm sm:text-base md:text-lg'
            } hover:scale-110 transition-all duration-200 touch-manipulation ${
              reaction.color
            } ${
              currentReaction === reaction.type 
                ? `ring-2 ring-blue-300 dark:ring-blue-400 ${
                    isMobile ? 'ring-offset-0.5' : 'ring-offset-1 sm:ring-offset-2'
                  } dark:ring-offset-gray-800` 
                : 'hover:shadow-md'
            } ${
              isReacting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title={isReacting ? 'Processing...' : reaction.label}
            style={{ touchAction: 'manipulation' }}
          >
            {isReacting ? (
              <div className={`animate-spin rounded-full border-b-2 border-white ${
                isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5'
              }`}></div>
            ) : (
              reaction.emoji
            )}
          </button>
        ))}
      </div>
    </div>
  );
} 
