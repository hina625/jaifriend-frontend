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
  const [localReactions, setLocalReactions] = useState<{[key: string]: string}>({});
  const [showReactionToast, setShowReactionToast] = useState(false);
  const [lastReaction, setLastReaction] = useState('');
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwnStory = currentStory?.user._id === currentUser._id || currentStory?.user._id === currentUser.id;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      // Add immediate local feedback
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = currentUser._id || currentUser.id;
      
      setLocalReactions(prev => ({
        ...prev,
        [currentStory._id]: reactionType
      }));
      
      // Show reaction toast
      setLastReaction(reactionType);
      setShowReactionToast(true);
      setTimeout(() => setShowReactionToast(false), 1500);
      
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
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999] p-2 sm:p-0">
      {/* Professional Story Container with Sidebar */}
      <div className="w-full max-w-6xl h-full max-h-[90vh] bg-black rounded-2xl overflow-hidden relative shadow-2xl flex">
        {/* Main Story View */}
        <div className="flex-1 relative">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
          <div 
            className="h-full bg-white transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Reaction Toast */}
        {showReactionToast && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded-full text-lg animate-bounce z-[200]">
            {lastReaction === 'like' && '👍 Liked!'}
            {lastReaction === 'love' && '❤️ Loved!'}
            {lastReaction === 'haha' && '😂 Haha!'}
            {lastReaction === 'wow' && '😮 Wow!'}
            {lastReaction === 'sad' && '😢 Sad!'}
            {lastReaction === 'angry' && '😠 Angry!'}
          </div>
        )}

        {/* Header */}
        <div className="absolute top-4 left-2 right-2 z-[100] flex items-center justify-between">
        <div className="flex items-center gap-3">
                     <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mx-auto">
             {currentStory.user.avatar ? (
               <img
                 src={currentStory.user.avatar} onError={(e) => { console.log('❌ Avatar load failed for user:', currentStory.user.avatar); e.currentTarget.src = '/default-avatar.svg'; }}
                 alt={currentStory.user.username}
                 className="w-full h-full rounded-full object-cover"
               />
             ) : (
               <span className="text-white text-2xl font-bold">
                 {currentStory.user.fullName?.charAt(0) || currentStory.user.username?.charAt(0) || 'U'}
               </span>
             )}
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
            className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors z-[100]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
        {currentIndex < stories.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors z-[100]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Story Content */}
        <div className="relative w-full h-full flex items-center justify-center pb-20">
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
          <div className="absolute bottom-20 left-2 right-2 text-white text-center">
            <div className="bg-black bg-opacity-50 rounded-lg p-3 max-w-md mx-auto text-sm">
              {currentStory.content}
            </div>
          </div>
        )}
       </div>
        </div>

        {/* Stories Sidebar */}
        <div className="w-80 bg-gray-900 border-l border-gray-700 p-4 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-white text-lg font-semibold mb-3">Stories</h3>
            
            {/* Create New Story */}
            <div className="mb-4 p-3 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 hover:border-gray-500 transition-colors cursor-pointer">
              <div className="flex items-center justify-center w-16 h-20 bg-gray-700 rounded-lg mb-2">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">+</span>
                </div>
              </div>
              <p className="text-gray-300 text-sm text-center">Create new story</p>
            </div>
          </div>

          {/* Other Stories */}
          <div className="space-y-3">
            {stories.map((story, index) => {
              const isActive = index === currentIndex;
              
              return (
                <div 
                  key={story._id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <div className="flex items-center gap-3">
                    {/* Story Thumbnail */}
                    <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      {story.mediaType === 'video' ? (
                        <video
                          src={story.media}
                          poster={story.thumbnail}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={story.media}
                          alt="Story"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    
                    {/* Story Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-center mb-1">
                        {/* User Avatar */}
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden">
                          {story.user?.avatar ? (
                            <img
                              src={story.user.avatar}
                              alt={story.user.username || 'User'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/default-avatar.svg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                              <span className="text-white text-base font-bold">
                                {story.user?.fullName?.charAt(0) || story.user?.username?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Story Content Preview */}
                      {story.content && (
                        <p className="text-xs opacity-75 line-clamp-2 text-center">
                          {story.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Views */}
            <div className="flex items-center gap-1 text-white">
              <Eye className="w-4 h-4" />
              <span className="text-xs">{currentStory.views?.length || 0}</span>
            </div>

            {/* Reaction Count */}
            {currentStory.reactions && currentStory.reactions.length > 0 && (
              <div className="flex items-center gap-1 text-white">
                <span className="text-xs">❤️ {currentStory.reactions.length}</span>
              </div>
            )}

            {/* Reactions */}
            <div className="flex items-center gap-1">
              {['like', 'love', 'haha', 'wow', 'sad', 'angry'].map((reaction) => {
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                const hasReacted = currentStory.reactions?.some((r: any) => 
                  r.userId === currentUser._id || r.userId === currentUser.id
                );
                const isCurrentReaction = hasReacted && currentStory.reactions?.some((r: any) => 
                  (r.userId === currentUser._id || r.userId === currentUser.id) && r.type === reaction
                );
                const isLocalReaction = localReactions[currentStory._id] === reaction;
                
                return (
                  <button
                    key={reaction}
                    onClick={() => handleReaction(reaction)}
                    className={`p-1 rounded-full hover:bg-opacity-70 transition-all duration-200 hover:scale-110 ${
                      isCurrentReaction || isLocalReaction
                        ? 'bg-blue-500 text-white' 
                        : 'bg-black bg-opacity-50 text-white'
                    }`}
                    title={reaction}
                  >
                    {reaction === 'like' && '👍'}
                    {reaction === 'love' && '❤️'}
                    {reaction === 'haha' && '😂'}
                    {reaction === 'wow' && '😮'}
                    {reaction === 'sad' && '😢'}
                    {reaction === 'angry' && '😠'}
                  </button>
                );
              })}
            </div>

            {/* Reply Button */}
            <button
              onClick={() => setShowReplies(!showReplies)}
              className={`p-1 rounded-full hover:bg-opacity-70 transition-colors ${
                showReplies 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-black bg-opacity-50 text-white'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Story Counter */}
          <div className="text-white text-xs">
            {currentIndex + 1} / {stories.length}
          </div>
        </div>

        {/* Replies Section */}
        {showReplies && (
          <div className="absolute bottom-20 left-2 right-2 bg-black bg-opacity-90 rounded-lg p-3 max-h-60 overflow-y-auto scrollbar-hide">
            <div className="text-white font-semibold mb-3 text-sm">Replies</div>
          
            {/* Reply Form */}
            <form onSubmit={handleSubmitReply} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Reply to this story..."
                  className="flex-1 px-2 py-1 bg-white bg-opacity-20 text-white placeholder-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  maxLength={200}
                />
                <button
                  type="submit"
                  disabled={!replyContent.trim() || isSubmittingReply}
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isSubmittingReply ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>

            {/* Replies List */}
            <div className="space-y-3">
              {currentStory.replies?.length === 0 ? (
                <div className="text-gray-400 text-center py-4 text-sm">No replies yet</div>
              ) : (
                currentStory.replies?.map((reply, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-white text-xs font-medium">
                        {reply.userId === 'current' ? 'You' : 'User'}
                      </div>
                      <div className="text-gray-300 text-xs">{reply.content}</div>
                      <div className="text-gray-400 text-xs mt-1">
                        {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
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
      </div> {/* Close mobile container */}
    </div>
  );
};

export default StoryViewer;
