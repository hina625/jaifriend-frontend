'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, ChevronDown, Smile, Paperclip, Send, MoreHorizontal, Globe } from 'lucide-react';
import { getCurrentUserId } from '@/utils/auth';
import SharePopup, { ShareOptions } from './SharePopup';
import ReactionPopup, { ReactionType } from './ReactionPopup';

interface AlbumDisplayProps {
  album: any;
  onDelete?: (albumId: string) => void;
  isOwner?: boolean;
  onLike?: (albumId: string) => void;
  onReaction?: (albumId: string, reactionType: ReactionType) => void;
  onComment?: (albumId: string, comment: string) => void;
  onDeleteComment?: (albumId: string, commentId: string) => void;
  onSave?: (albumId: string) => void;
  onShare?: (albumId: string, shareOptions?: ShareOptions) => void;
  deletingComments?: {[key: string]: boolean};
}

export default function AlbumDisplay({ 
  album, 
  onDelete, 
  isOwner = false,
  onLike,
  onReaction,
  onComment,
  onDeleteComment,
  onSave,
  onShare,
  deletingComments = {}
}: AlbumDisplayProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [reactionTimeout, setReactionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showReactionsTemporarily, setShowReactionsTemporarily] = useState(false);

  // Debug: Log album data
  useEffect(() => {
    console.log('🎯 AlbumDisplay received album:', {
      id: album._id,
      name: album.name,
      mediaCount: album.media?.length || 0,
      media: album.media,
      user: album.user,
      hasMedia: !!album.media,
      mediaIsArray: Array.isArray(album.media),
      mediaLength: album.media?.length
    });
    
    // Check video format support
    checkVideoSupport();
    
    // Diagnose album issues
    diagnoseAlbumIssue(album);
  }, [album]);

  // Track view when component mounts
  useEffect(() => {
    const trackView = async () => {
      const token = localStorage.getItem('token');
      if (token && album._id) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/albums/${album._id}/view`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (error) {
          console.error('Error tracking view:', error);
        }
      }
    };
    
    trackView();
  }, [album._id]);

  const getMediaUrl = (url: string) => {
    if (!url) {
      console.warn('Empty URL provided to getMediaUrl');
      return '';
    }
    
    if (url.startsWith('http')) {
      console.log('Using absolute URL:', url);
      return url;
    }
    
    const constructedUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}${url}`;
    console.log('Constructed URL:', {
      original: url,
      constructed: constructedUrl,
      baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'
    });
    
    return constructedUrl;
  };

  // Test if video URL is accessible (disabled due to CORS issues)
  const testVideoUrl = async (url: string) => {
    // Skip HEAD requests due to CORS issues
    console.log('⚠️ Skipping video URL test due to CORS restrictions');
    return false;
  };

  // Check if backend is properly serving video files (disabled due to CORS issues)
  const checkBackendVideoServing = async (url: string) => {
    // Skip HEAD requests due to CORS issues
    console.log('⚠️ Skipping backend video serving check due to CORS restrictions');
    return false;
  };

  // Try different video extensions if the original URL fails (disabled due to CORS issues)
  const tryVideoExtensions = async (baseUrl: string) => {
    // Skip HEAD requests due to CORS issues
    console.log('⚠️ Skipping extension testing due to CORS restrictions');
    return null;
  };

  // Check video format support
  const checkVideoSupport = () => {
    const video = document.createElement('video');
    const formats = {
      'video/mp4': video.canPlayType('video/mp4'),
      'video/webm': video.canPlayType('video/webm'),
      'video/ogg': video.canPlayType('video/ogg'),
      'video/mov': video.canPlayType('video/quicktime'),
      'video/avi': video.canPlayType('video/x-msvideo')
    };
    
    console.log('Browser video format support:', formats);
    return formats;
  };

  // Diagnose album creation issues
  const diagnoseAlbumIssue = (album: any) => {
    console.log('🔍 Album Diagnosis:', {
      albumId: album._id,
      albumName: album.name,
      mediaCount: album.media?.length || 0,
      mediaDetails: album.media?.map((item: any, index: number) => ({
        index,
        url: item.url,
        type: item.type,
        mimetype: item.mimetype,
        hasUrl: !!item.url,
        urlStartsWithSlash: item.url?.startsWith('/'),
        urlStartsWithHttp: item.url?.startsWith('http')
      })) || [],
      createdAt: album.createdAt,
      updatedAt: album.updatedAt
    });
    
    // Check for common issues
    const issues = [];
    
    if (!album.media || album.media.length === 0) {
      issues.push('❌ No media items in album');
    }
    
    album.media?.forEach((item: any, index: number) => {
      if (!item.url) {
        issues.push(`❌ Media item ${index} has no URL`);
      } else if (!item.url.startsWith('/') && !item.url.startsWith('http')) {
        issues.push(`❌ Media item ${index} has invalid URL format: ${item.url}`);
      }
      if (!item.type) {
        issues.push(`❌ Media item ${index} has no type specified`);
      }
    });
    
    if (issues.length > 0) {
      console.log('🚨 Album Issues Found:', issues);
    } else {
      console.log('✅ Album appears to be properly formatted');
    }
    
    return issues;
  };

  // Enhanced video handling
  const renderVideo = (mediaItem: any, index: number) => {
    const videoUrl = getMediaUrl(mediaItem.url);
    
    // Better video type detection
    const isVideo = mediaItem.type === 'video' || 
                   /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(mediaItem.url) ||
                   mediaItem.mimetype?.startsWith('video/');
    
    if (!isVideo) {
      console.warn('Item marked as video but URL suggests it might not be:', mediaItem);
    }
    
    console.log('Rendering video:', {
      url: mediaItem.url,
      fullUrl: videoUrl,
      type: mediaItem.type,
      mimetype: mediaItem.mimetype,
      isVideo: isVideo
    });
    
    // Test video URL accessibility
    if (videoUrl) {
      testVideoUrl(videoUrl);
    }
    
    return (
      <div className="relative" data-video-index={index}>
        <video 
          key={`${mediaItem.url}-${index}`}
          className="w-full h-64 sm:h-96 object-cover rounded-lg shadow-lg"
          style={{ maxHeight: '70vh' }}
          preload="metadata"
          poster={mediaItem.thumbnail || ''}
          controls
          muted
          playsInline
          src={videoUrl}
          onError={async (e) => {
            const video = e.currentTarget;
            const error = e.nativeEvent;
            
            // Validate video element exists
            if (!video) {
              console.error('Video element is null in error handler');
              return;
            }
            
            // Better error handling with fallbacks
            console.error('Video loading error details:', {
              videoElement: video,
              error: error,
              videoUrl: videoUrl,
              mediaItem: mediaItem,
              videoSrc: video?.src || 'undefined',
              videoCurrentSrc: video?.currentSrc || 'undefined',
              videoNetworkState: video?.networkState || 'undefined',
              videoReadyState: video?.readyState || 'undefined',
              videoError: video?.error || 'undefined',
              errorType: error?.type || 'unknown',
              errorTarget: error?.target || 'unknown',
              timestamp: new Date().toISOString()
            });
            
            // Check if it's a format issue
            if (video.error) {
              console.error('Video error code:', video.error.code);
              console.error('Video error message:', video.error.message);
            }
            
            // Show fallback content with clear error message
            video.style.display = 'none';
            
            const fallback = document.createElement('div');
            fallback.className = 'w-full h-64 sm:h-96 bg-gray-800 rounded-lg shadow-lg flex items-center justify-center';
            fallback.innerHTML = `
              <div class="text-center text-white">
                <div class="text-4xl mb-2">🎥</div>
                <div class="text-sm">Video could not be loaded</div>
                <div class="text-xs text-red-400 mt-2">File not found on server</div>
                <div class="text-xs text-gray-400 mt-1">URL: ${mediaItem.url || 'undefined'}</div>
                <div class="text-xs text-gray-400 mt-1">Full URL: ${videoUrl || 'undefined'}</div>
                <div class="text-xs text-yellow-400 mt-2">This suggests the video file was not properly uploaded</div>
                <button onclick="window.open('${videoUrl || '#'}', '_blank')" class="mt-2 px-3 py-1 bg-blue-500 rounded text-xs hover:bg-blue-600">
                  Try to open video
                </button>
                <button onclick="console.log('Video debug info:', {url: '${mediaItem.url || 'undefined'}', fullUrl: '${videoUrl || 'undefined'}', type: '${mediaItem.type || 'undefined'}', mimetype: '${mediaItem.mimetype || 'undefined'}', albumId: '${album._id || 'undefined'}', mediaIndex: ${index}})" class="mt-2 ml-2 px-3 py-1 bg-gray-500 rounded text-xs hover:bg-gray-600">
                  Debug Info
                </button>
                <div class="text-xs text-blue-400 mt-2">
                  💡 Try re-uploading the video or contact support
                </div>
              </div>
            `;
            
            // Find the parent container to append the fallback
            const parentContainer = video.parentNode;
            if (parentContainer) {
              parentContainer.appendChild(fallback);
            } else {
              console.error('Could not find parent container for video fallback');
            }
          }}
          onLoadStart={() => {
            console.log('Video loading started:', videoUrl);
          }}
          onCanPlay={() => {
            console.log('Video can play:', videoUrl);
          }}
          onLoadedData={() => {
            console.log('Video data loaded:', videoUrl);
          }}
          onLoad={() => {
            console.log('Video load event fired:', videoUrl);
          }}
          onLoadedMetadata={() => {
            console.log('Video metadata loaded:', videoUrl);
          }}
          onAbort={() => {
            console.log('Video loading aborted:', videoUrl);
          }}
          onSuspend={() => {
            console.log('Video loading suspended:', videoUrl);
          }}
          onStalled={() => {
            console.log('Video loading stalled:', videoUrl);
          }}
          onWaiting={() => {
            console.log('Video waiting for data:', videoUrl);
          }}
          onInvalid={() => {
            console.log('Video invalid event fired:', videoUrl);
          }}
          onDurationChange={() => {
            console.log('Video duration changed:', videoUrl);
          }}
          onRateChange={() => {
            console.log('Video playback rate changed:', videoUrl);
          }}
          onVolumeChange={() => {
            console.log('Video volume changed:', videoUrl);
          }}
          onSeeking={() => {
            console.log('Video seeking started:', videoUrl);
          }}
          onSeeked={() => {
            console.log('Video seeking completed:', videoUrl);
          }}
          onTimeUpdate={() => {
            // Only log occasionally to avoid spam
            if (Math.random() < 0.01) {
              console.log('Video time update:', videoUrl);
            }
          }}
          onProgress={() => {
            console.log('Video progress event:', videoUrl);
          }}
          onCanPlayThrough={() => {
            console.log('Video can play through:', videoUrl);
          }}
          onEmptied={() => {
            console.log('Video emptied event:', videoUrl);
          }}
        />
        {/* Video loading indicator */}
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
            🎥 Video
          </div>
        </div>
        
        {/* Debug info overlay (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs p-2 rounded opacity-0 hover:opacity-100 transition-opacity">
            <div>Type: {mediaItem.type}</div>
            <div>URL: {mediaItem.url}</div>
            <div>Full: {videoUrl}</div>
          </div>
        )}
      </div>
    );
  };

  // Get current user's reaction
  const getCurrentReaction = (): ReactionType | null => {
    if (album.reactions && Array.isArray(album.reactions)) {
      const token = localStorage.getItem('token');
      if (token) {
        // In a real app, you'd decode the token to get userId
        // For now, we'll check if any reaction exists
        return album.reactions.length > 0 ? album.reactions[0].type : null;
      }
    }
    return null;
  };

  // Get reaction count
  const getReactionCount = (): number => {
    if (album.reactions && Array.isArray(album.reactions)) {
      return album.reactions.length;
    }
    // Fallback to likes count for backward compatibility
    return album.likes ? (Array.isArray(album.likes) ? album.likes.length : album.likes) : 0;
  };

  // Get most common reaction emoji
  const getMostCommonReactionEmoji = (): string => {
    if (album.reactions && Array.isArray(album.reactions) && album.reactions.length > 0) {
      const reactionCounts: { [key: string]: number } = {};
      album.reactions.forEach((reaction: any) => {
        reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
      });
      
      const mostCommon = Object.keys(reactionCounts).reduce((a, b) => 
        reactionCounts[a] > reactionCounts[b] ? a : b
      );
      
      const reactionEmojis: { [key: string]: string } = {
        like: '👍',
        love: '❤️',
        haha: '😂',
        wow: '😮',
        sad: '😢',
        angry: '😠'
      };
      
      return reactionEmojis[mostCommon] || '👍';
    }
    return '👍';
  };

  const handleReactionButtonMouseEnter = () => {
    if (reactionTimeout) {
      clearTimeout(reactionTimeout);
    }
    setShowReactionPopup(true);
  };

  const handleReactionButtonMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowReactionPopup(false);
    }, 300);
    setReactionTimeout(timeout);
  };

  const handleReactionPopupMouseEnter = () => {
    if (reactionTimeout) {
      clearTimeout(reactionTimeout);
    }
  };

  const handleReactionPopupMouseLeave = () => {
    setShowReactionPopup(false);
  };

  const handleReaction = (reactionType: ReactionType) => {
    if (onReaction) {
      onReaction(album._id, reactionType);
    }
    setShowReactionPopup(false);
  };

  // Get current user ID for save checking
  const currentUserId = getCurrentUserId();
  // Check if current user has saved this album
  const isSaved = album.savedBy && Array.isArray(album.savedBy) && 
    album.savedBy.some((savedUser: any) => {
      // Handle both user ID strings and user objects
      if (typeof savedUser === 'string') {
        return savedUser === currentUserId;
      } else if (savedUser && typeof savedUser === 'object') {
        return savedUser._id === currentUserId || savedUser.userId === currentUserId;
      }
      return false;
    });

  const displayedMedia = showAllPhotos ? album.media : (album.media || []).slice(0, 3);
  const hasMoreMedia = (album.media || []).length > 3;

  // Debug rendering
  console.log('🎨 AlbumDisplay rendering:', {
    albumId: album._id,
    albumName: album.name,
    hasMedia: !!album.media,
    mediaLength: album.media?.length || 0,
    displayedMediaLength: displayedMedia?.length || 0,
    showAllPhotos,
    hasMoreMedia
  });

  return (
    <div className="bg-white rounded-xl shadow p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex items-center gap-2 mb-3">
        <img 
          src={album.user?.avatar ? (album.user.avatar.startsWith('http') ? album.user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}${album.user.avatar}`) : '/avatars/1.png.png'} 
          alt="avatar" 
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" 
        />
        <div className="flex-1 min-w-0">
          {album.user?._id ? (
            <a 
              href={`/dashboard/profile/${String(album.user._id)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-sm sm:text-base hover:underline cursor-pointer truncate block"
            >
              {album.user?.name || 'Unknown User'}
            </a>
          ) : (
            <div className="font-semibold text-sm sm:text-base truncate">{album.user?.name || 'Unknown User'}</div>
          )}
          <div className="text-xs text-gray-400">
            {new Date(album.createdAt).toLocaleString()}
          </div>
        </div>
        {isOwner && onDelete && (
          <button
            onClick={() => onDelete(album._id)}
            className="text-red-500 hover:text-red-700 text-xs sm:text-sm touch-manipulation"
            style={{ touchAction: 'manipulation' }}
          >
            🗑️ <span className="hidden sm:inline">Delete</span>
          </button>
        )}
      </div>

      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-lg">📸 {album.name}</h3>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
            Album
          </span>
        </div>
        <div className="text-sm text-gray-600">
          {album.media ? album.media.length : 0} media item{(album.media ? album.media.length : 0) !== 1 ? 's' : ''}
        </div>
      </div>

      {album.media && album.media.length > 0 && (
        <div className="mb-3">
          {displayedMedia.map((mediaItem: any, index: number) => {
            console.log('🎬 Rendering media item:', {
              index,
              mediaItem,
              url: mediaItem?.url,
              type: mediaItem?.type,
              mimetype: mediaItem?.mimetype
            });
            
            return (
            <div key={index} className="relative mb-3">
                {(() => {
                  // Enhanced video detection
                  const isVideo = mediaItem.type === 'video' || 
                                 /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(mediaItem.url) ||
                                 mediaItem.mimetype?.startsWith('video/');
                  
                  console.log('Media item:', {
                    index,
                    url: mediaItem.url,
                    type: mediaItem.type,
                    mimetype: mediaItem.mimetype,
                    isVideo: isVideo
                  });
                  
                  if (isVideo) {
                    return renderVideo(mediaItem, index);
                  } else {
                    return (
                <img
                  src={getMediaUrl(mediaItem.url)}
                  alt={`Media ${index + 1}`}
                  className="w-full h-64 sm:h-96 object-cover rounded-lg shadow-lg"
                  style={{ maxHeight: '70vh' }}
                        onError={(e) => {
                          console.error('Image loading error:', e);
                          const img = e.currentTarget;
                          img.style.display = 'none';
                          // Show fallback content
                          const fallback = document.createElement('div');
                          fallback.className = 'w-full h-64 sm:h-96 bg-gray-300 rounded-lg shadow-lg flex items-center justify-center';
                          fallback.innerHTML = `
                            <div class="text-center text-gray-600">
                              <div class="text-4xl mb-2">🖼️</div>
                              <div class="text-sm">Image could not be loaded</div>
                            </div>
                          `;
                          img.parentNode?.appendChild(fallback);
                        }}
                      />
                    );
                  }
                })()}
              {index === 2 && hasMoreMedia && !showAllPhotos && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <span className="text-white font-bold text-lg sm:text-xl">+{album.media.length - 3}</span>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
      
      {/* Debug: Show when no media */}
      {(!album.media || album.media.length === 0) && (
        <div className="mb-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-center text-yellow-800">
            <div className="text-2xl mb-2">⚠️</div>
            <div className="text-sm font-medium">No media found in album</div>
            <div className="text-xs text-yellow-600 mt-1">
              Album ID: {album._id}<br/>
              Media array: {JSON.stringify(album.media)}<br/>
              Media length: {album.media?.length || 'undefined'}
            </div>
          </div>
        </div>
      )}

      {hasMoreMedia && (
        <button
          onClick={() => setShowAllPhotos(!showAllPhotos)}
          className="text-blue-500 hover:text-blue-700 text-sm touch-manipulation"
          style={{ touchAction: 'manipulation' }}
        >
          {showAllPhotos ? 'Show Less' : `Show All ${album.media.length} Media`}
        </button>
      )}

      {/* Social Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Reaction Button with Popup */}
          <div className="relative">
            <button 
              onMouseEnter={handleReactionButtonMouseEnter}
              onMouseLeave={handleReactionButtonMouseLeave}
              onClick={() => onLike && onLike(album._id)}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors touch-manipulation ${
                getCurrentReaction() ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              <span className="text-lg sm:text-xl">{getMostCommonReactionEmoji()}</span>
              <span className="text-xs sm:text-sm font-medium">
                {getReactionCount()}
              </span>
            </button>
            

            
            {/* Reaction Popup */}
            <div
              onMouseEnter={handleReactionPopupMouseEnter}
              onMouseLeave={handleReactionPopupMouseLeave}
            >
              <ReactionPopup
                isOpen={showReactionPopup}
                onClose={() => setShowReactionPopup(false)}
                onReaction={handleReaction}
                currentReaction={getCurrentReaction()}
                position="top"
              />
            </div>
          </div>
          
          <button 
            onClick={() => setShowCommentInput(!showCommentInput)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-colors touch-manipulation"
            style={{ touchAction: 'manipulation' }}
          >
            <span className="text-lg sm:text-xl">💬</span>
            <span className="text-xs sm:text-sm font-medium">
              {album.comments ? album.comments.length : 0}
            </span>
          </button>

          {/* Views count */}
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-gray-600">
            <span className="text-lg sm:text-xl">👁️</span>
            <span className="text-xs sm:text-sm font-medium">{album.views ? album.views.length : 0}</span>
          </div>
          
          <button 
            onClick={() => setShowSharePopup(true)}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors touch-manipulation ${
              album.shares && album.shares.length > 0 ? 'text-green-500 bg-green-50' : 'text-gray-600 hover:text-green-500 hover:bg-green-50'
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            <span className="text-lg sm:text-xl">📤</span>
            <span className="text-xs sm:text-sm font-medium">
              {album.shares ? (Array.isArray(album.shares) ? album.shares.length : album.shares) : 0}
            </span>
          </button>
        </div>
        
        <button 
          onClick={() => onSave && onSave(album._id)}
          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors touch-manipulation ${
            isSaved ? 'text-blue-500 bg-blue-50' : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          <span className="text-lg sm:text-xl">{isSaved ? '💾' : '🔖'}</span>
          <span className="text-xs sm:text-sm font-medium hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
        </button>
      </div>
      
      

      {/* Comment Input */}
      {showCommentInput && (
        <div className="mt-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
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
              className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm sm:text-base touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              Post
            </button>
          </div>
        </div>
      )}

      {/* Comments Display */}
      {album.comments && album.comments.length > 0 && (
        <div className="mt-3 space-y-2">
          {album.comments.slice(0, 3).map((comment: any, index: number) => {
            // Check if current user is the comment author
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const isCommentAuthor = comment.user && (
              comment.user._id === currentUser._id || 
              comment.user.id === currentUser.id || 
              comment.user.userId === currentUser.id
            );
            
            return (
              <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg group transition-colors duration-200">
                <img 
                  src={comment.user?.avatar ? (comment.user.avatar.startsWith('http') ? comment.user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}${comment.user.avatar}`) : '/avatars/1.png.png'} 
                  alt="avatar" 
                  className="w-6 h-6 rounded-full" 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {comment.user?._id ? (
                      <a 
                        href={`/dashboard/profile/${String(comment.user._id)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:underline cursor-pointer text-gray-900 dark:text-white transition-colors duration-200"
                      >
                        {comment.user?.name || 'User'}
                      </a>
                    ) : (
                      <span className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">{comment.user?.name || 'User'}</span>
                    )}
                    
                    {/* Delete button for comment author */}
                    {isCommentAuthor && onDeleteComment && (
                      <button
                        onClick={() => onDeleteComment(album._id, comment._id || comment.id)}
                        disabled={deletingComments[`album-${album._id}-${comment._id || comment.id}`]}
                        className={`opacity-0 group-hover:opacity-100 ml-auto p-1 rounded transition-all duration-200 text-xs ${
                          deletingComments[`album-${album._id}-${comment._id || comment.id}`]
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                        title={deletingComments[`album-${album._id}-${comment._id || comment.id}`] ? 'Deleting...' : 'Delete comment'}
                      >
                        {deletingComments[`album-${album._id}-${comment._id || comment.id}`] ? '⏳' : '🗑️'}
                      </button>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">{comment.text}</span>
                </div>
              </div>
            );
          })}
          {album.comments.length > 3 && (
            <button className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200">
              View all {album.comments.length} comments
            </button>
          )}
        </div>
      )}

      {/* Share Popup */}
      <SharePopup
        isOpen={showSharePopup}
        onClose={() => setShowSharePopup(false)}
        onShare={(shareOptions) => {
          if (onShare) {
            onShare(album._id, shareOptions);
          }
        }}
        postContent={album.name}
        postMedia={album.media}
        isAlbum={true}
      />
    </div>
  );
} 
