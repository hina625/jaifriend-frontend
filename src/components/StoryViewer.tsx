import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Eye, Trash2 } from 'lucide-react';

interface Story {
  _id: string;
  content?: string;
  media: string;
  mediaType: 'image' | 'video';
  thumbnail?: string;
  user: {
    _id: string;
    username: string;
    avatar: string;
    fullName: string;
  };
  views: Array<{ userId: string; viewedAt: string }>;
  reactions: Array<{ userId: string; type: string; createdAt: string }>;
  replies: Array<{ userId: string; content: string; createdAt: string }>;
  createdAt: string;
  expiresAt: string;
  privacy: string;
}

interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex: number;
  onClose: () => void;
  onDelete?: (storyId: string) => void;
  onReact?: (storyId: string, reactionType: string) => void;
  onReply?: (storyId: string, content: string) => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  initialStoryIndex,
  onClose,
  onDelete,
  onReact,
  onReply
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [currentStory, setCurrentStory] = useState<Story>(stories[initialStoryIndex]);
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwnStory = currentStory?.user._id === currentUser._id || currentStory?.user._id === currentUser.id;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    setCurrentStory(stories[currentIndex]);
  }, [currentIndex, stories]);

  useEffect(() => {
    if (currentStory) {
      const now = Date.now();
      const expiresAt = new Date(currentStory.expiresAt).getTime();
      const remaining = Math.max(0, expiresAt - now);
      setTimeLeft(remaining);
      
      // Calculate progress (0 to 100)
      const totalDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const elapsed = totalDuration - remaining;
      const progressPercent = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(progressPercent);

      // Auto-advance progress bar
      progressIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTimeLeft = Math.max(0, prev - 1000);
          if (newTimeLeft === 0) {
            // Story expired, close viewer
            onClose();
          }
          return newTimeLeft;
        });
      }, 1000);

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      };
    }
  }, [currentStory, onClose]);

  const formatTimeLeft = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, stories.length]);

  const handleReaction = (reactionType: string) => {
    if (onReact && currentStory) {
      onReact(currentStory._id, reactionType);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !onReply || !currentStory) return;

    setIsSubmittingReply(true);
    try {
      await onReply(currentStory._id, replyContent.trim());
      setReplyContent('');
      setShowReplies(false);
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && currentStory && isOwnStory) {
      if (window.confirm('Are you sure you want to delete this story?')) {
        onDelete(currentStory._id);
        onClose();
      }
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 p-2 sm:p-0">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
        <div 
          className="h-full bg-white transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

              {/* Header */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
                     <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
             {currentStory.user.avatar ? (
               <img
                 src={currentStory.user.avatar}
                 alt={currentStory.user.username}
                 className="w-full h-full rounded-full object-cover"
               />
             ) : (
               <span className="text-white text-lg font-bold">
                 {currentStory.user.fullName?.charAt(0) || currentStory.user.username?.charAt(0) || 'U'}
               </span>
             )}
           </div>
                      <div className="text-white">
              <div className="font-semibold text-sm sm:text-base">{currentStory.user.fullName || currentStory.user.username}</div>
              <div className="text-xs sm:text-sm text-gray-300">
                {formatTimeLeft(timeLeft)} left
              </div>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isOwnStory && onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

              {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
        
        {currentIndex < stories.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors z-10"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

             {/* Story Content */}
       <div className="relative w-full h-full flex items-center justify-center pb-32 sm:pb-40">
         {currentStory.mediaType === 'image' ? (
           <img
             src={currentStory.media}
             alt="Story"
             className="max-w-full max-h-full object-contain"
           />
         ) : (
           <video
             ref={videoRef}
             src={currentStory.media}
             poster={currentStory.thumbnail}
             className="max-w-full max-h-full object-contain"
             controls
             autoPlay
             muted
           />
         )}

         {/* Content Overlay */}
         {currentStory.content && (
           <div className="absolute bottom-32 sm:bottom-40 left-2 sm:left-4 right-2 sm:right-4 text-white text-center">
             <div className="bg-black bg-opacity-50 rounded-lg p-3 sm:p-4 max-w-md mx-auto text-sm sm:text-base">
               {currentStory.content}
             </div>
           </div>
         )}
       </div>

              {/* Bottom Actions */}
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4">
              {/* Views */}
              <div className="flex items-center gap-1 sm:gap-2 text-white">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">{currentStory.views.length}</span>
              </div>

                        {/* Reactions */}
              <div className="flex items-center gap-1 sm:gap-2">
                {['like', 'love', 'haha', 'wow', 'sad', 'angry'].map((reaction) => (
                  <button
                    key={reaction}
                    onClick={() => handleReaction(reaction)}
                    className="p-1 sm:p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                    title={reaction}
                  >
                {reaction === 'like' && '👍'}
                {reaction === 'love' && '❤️'}
                {reaction === 'haha' && '😂'}
                {reaction === 'wow' && '😮'}
                {reaction === 'sad' && '😢'}
                {reaction === 'angry' && '😠'}
              </button>
            ))}
          </div>

                        {/* Reply Button */}
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="p-1 sm:p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
        </div>

                  {/* Story Counter */}
          <div className="text-white text-xs sm:text-sm">
            {currentIndex + 1} / {stories.length}
          </div>
      </div>

                             {/* Replies Section */}
         {showReplies && (
           <div className="absolute bottom-32 sm:bottom-40 left-2 sm:left-4 right-2 sm:right-4 bg-black bg-opacity-90 rounded-lg p-3 sm:p-4 max-h-60 overflow-y-auto scrollbar-hide">
                      <div className="text-white font-semibold mb-3 text-sm sm:text-base">Replies</div>
          
                      {/* Reply Form */}
            <form onSubmit={handleSubmitReply} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Reply to this story..."
                  className="flex-1 px-2 sm:px-3 py-1 sm:py-2 bg-white bg-opacity-20 text-white placeholder-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  maxLength={200}
                />
                <button
                  type="submit"
                  disabled={!replyContent.trim() || isSubmittingReply}
                  className="px-3 sm:px-4 py-1 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isSubmittingReply ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>

                      {/* Replies List */}
            <div className="space-y-3">
              {currentStory.replies.length === 0 ? (
                <div className="text-gray-400 text-center py-4 text-sm sm:text-base">No replies yet</div>
              ) : (
                currentStory.replies.map((reply, index) => (
                  <div key={index} className="flex items-start gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-600 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-white text-xs sm:text-sm font-medium">User</div>
                      <div className="text-gray-300 text-xs sm:text-sm">{reply.content}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
        </div>
      )}
      
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar { 
          display: none;
        }
      `}</style>
    </div>
  );
};

export default StoryViewer;
