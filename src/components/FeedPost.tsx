'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Share2, ChevronDown, Smile, Paperclip, Send, MoreHorizontal, Globe } from 'lucide-react';
import PostOptionsDropdown from './PostOptionsDropdown';
import ReactionPopup, { ReactionType } from './ReactionPopup';
import { toggleCommentsApi, pinPostApi, boostPostApi } from '@/utils/api';
import SharePopup, { ShareOptions } from './SharePopup';
import { getCurrentUserId } from '@/utils/auth';

interface FeedPostProps {
  post: any;
  onLike: (postId: string) => void;
  onReaction?: (postId: string, reactionType: string) => void;
  onComment: (postId: string, comment: string) => void;
  onShare: (postId: string, shareOptions: ShareOptions) => void;
  onSave: (postId: string) => void;
  onDelete: (postId: string) => void;
  onEdit: (post: any) => void;
  isOwnPost: boolean;
}

const FeedPost: React.FC<FeedPostProps> = ({
  post,
  onLike,
  onReaction,
  onComment,
  onShare,
  onSave,
  onDelete,
  onEdit,
  isOwnPost
}) => {

  const router = useRouter();
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [reactionButtonHovered, setReactionButtonHovered] = useState(false);
  const [showReactionsTemporarily, setShowReactionsTemporarily] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [isTogglingComments, setIsTogglingComments] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<{[key: string]: boolean}>({});

  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const mediaPickerRef = useRef<HTMLDivElement>(null);
  const reactionButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle click outside to close pickers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (mediaPickerRef.current && !mediaPickerRef.current.contains(event.target as Node)) {
        setShowMediaPicker(false);
      }
      // Close reaction popup when clicking outside
      if (showReactionPopup && reactionButtonRef.current && !reactionButtonRef.current.contains(event.target as Node)) {
        setShowReactionPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showReactionPopup]);

  const getMediaUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
            return `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}${url}`;
  };

  const getUserAvatar = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.avatar) {
        if (user.avatar.includes('localhost:3000')) {
          const correctedUrl = user.avatar.replace('http://localhost:3000', 'https://jaifriend-frontend-n6zr.vercel.app');
          return correctedUrl;
        }
        
        if (user.avatar.includes('/avatars/') || user.avatar.includes('/covers/')) {
          return '/default-avatar.svg';
        }
        
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app';
        if (user.avatar.startsWith('http')) {
          return user.avatar;
        }
        return `${baseUrl}${user.avatar}`;
      }
      return '/default-avatar.svg';
    } catch {
      return '/default-avatar.svg';
    }
  };

  const handleComment = () => {
    if (commentText.trim()) {
      onComment(post._id, commentText);
      setCommentText('');
      setShowCommentInput(false);
    }
  };

  const handleCommentLike = (commentId: string) => {
    // TODO: Implement comment like functionality
    console.log('Like comment:', commentId);
    // You can add API call here to like/unlike comments
    // Example: onCommentLike(post._id, commentId);
  };

  const handleCommentReply = (commentId: string, userName: string) => {
    setCommentText(`@${userName} `);
    // Focus on the comment input
    const input = document.querySelector('input[placeholder="Write a comment and press enter"]') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  };

  const handleReaction = async (reactionType: ReactionType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add a reaction.');
        return;
      }

      setIsReacting(true);

      // Call backend API directly
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${post._id}/reaction`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reactionType: reactionType
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Reaction added successfully:', data);
        
        // Show success feedback
        const reactionEmojis: { [key: string]: string } = {
          'like': '👍',
          'love': '❤️',
          'haha': '😂',
          'wow': '😮',
          'sad': '😢',
          'angry': '😠'
        };
        
        const emoji = reactionEmojis[reactionType] || '😊';
        alert(`${emoji} Reaction added successfully!`);
        
        // Update local state to reflect the new reaction
        // For now, we'll refresh the page to get updated data
        // In a real app, you'd update the local state
        window.location.reload();
    } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to add reaction:', errorData);
        alert(`Failed to add reaction: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      alert('Error adding reaction. Please try again.');
    } finally {
      setIsReacting(false);
      // Automatically close the popup after reaction selection
    setShowReactionPopup(false);
      // Show reactions temporarily after adding a reaction
      setShowReactionsTemporarily(true);
      setTimeout(() => {
        setShowReactionsTemporarily(false);
      }, 2000); // Hide after 2 seconds
    }
  };

  // Function to update reaction count locally (for future use)
  const updateReactionCount = (newCount: number) => {
    // This function can be used to update the reaction count without refreshing
    // For now, we'll keep the page refresh approach
    console.log('Reaction count updated to:', newCount);
  };

  // Check if current user has saved this post
  const isPostSaved = (): boolean => {
    try {
      const currentUserId = getCurrentUserId();
      
      if (!currentUserId) {
        console.log('❌ isPostSaved: No currentUserId found - user may not be logged in');
        // Show a subtle indicator that the user needs to log in
        return false;
      }
      
      if (!post.savedBy) {
        console.log('❌ isPostSaved: No savedBy array in post data');
        return false;
      }
      
      console.log('🔍 Checking if post is saved:');
      console.log('  - Current user ID:', currentUserId);
      console.log('  - SavedBy array:', post.savedBy);
      console.log('  - SavedBy type:', typeof post.savedBy);
      console.log('  - Is array:', Array.isArray(post.savedBy));
      
      // Check if the current user ID exists in the savedBy array
      // Handle both cases: when savedBy contains user IDs and when it contains populated user objects
      const isSaved = Array.isArray(post.savedBy) && post.savedBy.some((savedUser: string | { _id?: string; id?: string; userId?: string }) => {
        let savedUserId: string | undefined;
        
        if (typeof savedUser === 'object' && savedUser !== null) {
          // If savedUser is an object (populated user), get the ID
          savedUserId = savedUser._id || savedUser.id || savedUser.userId;
          console.log('  - SavedUser object:', savedUser, '-> ID:', savedUserId);
        } else {
          // If savedUser is a string/primitive, use it directly
          savedUserId = savedUser;
          console.log('  - SavedUser string:', savedUser, '-> ID:', savedUserId);
        }
        
        // Compare IDs (handle both string and ObjectId comparisons)
        const matches = savedUserId === currentUserId || savedUserId?.toString() === currentUserId?.toString();
        console.log('  - ID comparison:', savedUserId, '===', currentUserId, '->', matches);
        return matches;
      });
      
      console.log('💾 Final result - Is post saved:', isSaved);
      return isSaved;
    } catch (error) {
      console.error('Error checking if post is saved:', error);
      return false;
    }
  };

  // Handle edit post
  const handleEdit = () => {
    onEdit(post);
    setShowOptionsDropdown(false);
  };

  // Handle toggle comments
  const handleToggleComments = async () => {
    try {
      setIsTogglingComments(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to perform this action');
        return;
      }

      const response = await toggleCommentsApi(token, post._id);

      if (response.message) {
        // Refresh the page to show updated state
        window.location.reload();
      } else {
        alert('Failed to toggle comments');
      }
    } catch (error) {
      console.error('Error toggling comments:', error);
      alert('Error toggling comments');
    } finally {
      setIsTogglingComments(false);
      setShowOptionsDropdown(false);
    }
  };

  // Handle open post in new tab
  const handleOpenInNewTab = () => {
    const postUrl = `${window.location.origin}/dashboard/post/${post._id}`;
    window.open(postUrl, '_blank');
    setShowOptionsDropdown(false);
  };

  // Handle pin/unpin post
  const handlePin = async () => {
    try {
      setIsPinning(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to perform this action');
        return;
      }

      console.log('📌 Pinning/unpinning post:', post._id);
      const response = await pinPostApi(token, post._id);

      if (response.message) {
        console.log('✅ Pin response:', response);
        // Update the post state locally instead of reloading
        const updatedPost = { ...post, isPinned: response.isPinned };
        
        // Dispatch event to update parent component
        window.dispatchEvent(new CustomEvent('postUpdated', { 
          detail: { postId: post._id, updatedPost } 
        }));
        
        // Show success message
        alert(response.message);
      } else {
        alert('Failed to pin/unpin post');
      }
    } catch (error) {
      console.error('Error pinning/unpinning post:', error);
      alert('Error pinning/unpinning post');
    } finally {
      setIsPinning(false);
      setShowOptionsDropdown(false);
    }
  };

  // Handle boost/unboost post
  const handleBoost = async () => {
    try {
      setIsBoosting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to perform this action');
        return;
      }

      console.log('🚀 Boosting/unboosting post:', post._id);
      const response = await boostPostApi(token, post._id);

      if (response.message) {
        console.log('✅ Boost response:', response);
        // Update the post state locally instead of reloading
        const updatedPost = { ...post, isBoosted: response.isBoosted };
        
        // Dispatch event to update parent component
        window.dispatchEvent(new CustomEvent('postUpdated', { 
          detail: { postId: post._id, updatedPost } 
        }));
        
        // Show success message
        alert(response.message);
      } else {
        alert('Failed to boost/unboost post');
      }
    } catch (error) {
      console.error('Error boosting/unboosting post:', error);
      alert('Error boosting/unboosting post');
    } finally {
      setIsBoosting(false);
      setShowOptionsDropdown(false);
    }
  };

  // Handle save/unsave post
  const handleSave = async () => {
    try {
      console.log('🔄 handleSave called!');
      console.log('📝 Post ID:', post._id);
      console.log('🔗 onSave function exists:', !!onSave);
      
      if (!onSave) {
        console.error('❌ onSave function is not provided!');
        alert('Save functionality not available');
        return;
      }
      
      console.log('🔄 Calling onSave with post ID:', post._id);
      console.log('📋 Current savedBy:', post.savedBy);
      console.log('👤 Current user ID:', getCurrentUserId());
      console.log('💾 Is currently saved:', isPostSaved());
      
      onSave(post._id);
      console.log('✅ onSave called successfully');
      setShowOptionsDropdown(false);
    } catch (error) {
      console.error('❌ Error in handleSave:', error);
      alert('Error saving/unsaving post');
    }
  };

  // Handle delete post
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      onDelete(post._id);
      setShowOptionsDropdown(false);
    }
  };


  const handleReview = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add a review.');
        return;
      }

      // For now, we'll just show an alert. In a real app, you'd open a review modal
      const rating = prompt('Rate this post (1-5 stars):');
      if (rating && !isNaN(Number(rating)) && Number(rating) >= 1 && Number(rating) <= 5) {
        const reviewText = prompt('Write your review (optional):');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${post._id}/review`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            rating: Number(rating),
            text: reviewText || ''
          })
        });

        if (response.ok) {
          alert('Review added successfully!');
          // Refresh the post data or update the UI
          window.location.reload();
        } else {
          alert('Failed to add review. Please try again.');
        }
      } else if (rating !== null) {
        alert('Please enter a valid rating between 1 and 5.');
      }
    } catch (error) {
      console.error('Error adding review:', error);
      alert('Error adding review. Please try again.');
    }
  };



  const getCurrentReaction = (): ReactionType | null => {
    // Check if user has any reaction on this post
    if (post.reactions && post.reactions.length > 0) {
      // Find user's reaction
      const userReaction = post.reactions.find((r: any) => 
        r.user === getCurrentUserId() || r.userId === getCurrentUserId()
      );
      return userReaction ? userReaction.type : null;
    }
    return null;
  };

  const getMostCommonReactionEmoji = (): string => {
    if (!post.reactions || post.reactions.length === 0) return '👍';
    
    const reactionCounts: { [key: string]: number } = {};
    post.reactions.forEach((reaction: any) => {
      reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
    });
    
    const mostCommon = Object.keys(reactionCounts).reduce((a, b) => 
      reactionCounts[a] > reactionCounts[b] ? a : b
    );
    
    const reactionEmojis: { [key: string]: string } = {
      'like': '👍',
      'love': '❤️',
      'haha': '😂',
      'wow': '😮',
      'sad': '😢',
      'angry': '😠'
    };
    
    return reactionEmojis[mostCommon] || '👍';
  };

  // Get reaction count
  const getReactionCount = (): number => {
    if (post.reactions && Array.isArray(post.reactions)) {
      return post.reactions.length;
    }
    // Fallback to likes count for backward compatibility
    return post.likes ? (Array.isArray(post.likes) ? post.likes.length : post.likes) : 0;
  };

  const startEditComment = (comment: any) => {
    setEditingCommentId(comment._id || comment.id);
    setEditCommentText(comment.text || comment.content || '');
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const saveEditComment = async (commentId: string) => {
    if (!editCommentText.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again to edit comments.');
        return;
      }

      console.log('Editing comment:', { commentId, editCommentText, postId: post._id });
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${post._id}/comment/${commentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: editCommentText })
      });
      
      console.log('Edit response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Edit success data:', data);
        
        // Update the comment in the post
        const updatedPost = { ...post };
        const commentIndex = updatedPost.comments.findIndex((c: any) => (c._id || c.id) === commentId);
        if (commentIndex !== -1) {
          updatedPost.comments[commentIndex] = data.comment;
          // Trigger parent component update
          window.dispatchEvent(new CustomEvent('postUpdated'));
        }
        cancelEditComment();
        // Show success message
        alert('Comment updated successfully!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Edit failed:', errorData);
        alert(`Failed to update comment: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to edit comment:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    setDeletingCommentId(commentId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again to delete comments.');
        setDeletingCommentId(null);
        return;
      }

      console.log('Deleting comment:', { commentId, postId: post._id });
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/posts/${post._id}/comment/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Delete response status:', res.status);
      
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        console.log('Delete success data:', data);
        
        // Remove the comment from the post
        const updatedPost = { ...post };
        updatedPost.comments = updatedPost.comments.filter((c: any) => (c._id || c.id) !== commentId);
        // Trigger parent component update
        window.dispatchEvent(new CustomEvent('postUpdated'));
        // Show success message
        alert('Comment deleted successfully!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Delete failed:', errorData);
        alert(`Failed to delete comment: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleShare = () => {
    setShowSharePopup(true);
  };

  const handleShareConfirm = (shareOptions: ShareOptions) => {
    onShare(post._id, shareOptions);
    setShowSharePopup(false);
  };

  const navigateToProfile = () => {
    let userId = '';
    
    // Handle populated user object (when userId is the full user object)
    if (post.user?.userId && typeof post.user.userId === 'object' && post.user.userId._id) {
      userId = post.user.userId._id;
    } else {
      userId = post.user?.userId || post.user?._id || post.user?.id;
    }
    
    if (userId) {
      router.push(`/dashboard/profile/${userId}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  // Get current user ID for like checking
  const currentUserId = getCurrentUserId();
  const isLiked = post.likes?.includes(currentUserId);

  // Calculate total reactions (likes + other reactions if they exist)
  const totalReactions = (post.likes?.length || 0) + (post.reactions?.length || 0);

  const handleMediaUpload = async (type: 'photo' | 'video' | 'file') => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
    setShowMediaPicker(false); // Close media picker after file input is clicked
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      event.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('postId', post._id);

    setIsUploading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to upload media.');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/upload/post-media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Media uploaded successfully:', data);
        alert('Media uploaded successfully!');
        // Refresh the post data or update the UI
        window.location.reload();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Media upload failed:', errorData);
        alert(`Failed to upload media: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network error during media upload:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsUploading(false);
      event.target.value = ''; // Clear the file input
    }
  };

  // Toggle post content expansion
  const togglePostExpansion = (postId: string) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4 transition-colors duration-200">
      {/* Post Header - Matching the image structure */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Profile Picture with Online Status */}
            <div className="relative">
              <div 
                className="w-12 h-12 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                onClick={navigateToProfile}
              >
                <img
                  src={post.user?.avatar ? getMediaUrl(post.user.avatar) : '/default-avatar.svg'}
                  alt={post.user?.name || 'User'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log('❌ Avatar load failed for user:', post.user?.name, 'URL:', post.user?.avatar);
                    e.currentTarget.src = '/default-avatar.svg';
                  }}
                />
              </div>
              {/* Online Status Indicator */}
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <div 
                  className="font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 transition-colors text-base truncate"
                  onClick={navigateToProfile}
                >
                  {post.user?.name || 'User'}
                </div>
                {/* Verified Badge */}
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{formatDate(post.createdAt)}</span>
                
                {/* Pin indicator */}
                {post.isPinned && (
                  <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                    <span className="text-sm">📌</span>
                    <span className="text-xs">Pinned</span>
                  </div>
                )}
                
                {/* Boost indicator */}
                {post.isBoosted && (
                  <div className="flex items-center space-x-1 text-purple-600 dark:text-purple-400">
                    <span className="text-sm">🚀</span>
                    <span className="text-xs">Boosted</span>
                  </div>
                )}
                
                {/* Reel indicator */}
                {post.type === 'reel' && (
                  <div className="flex items-center space-x-1 text-red-500 dark:text-red-400">
                    <span className="text-sm">🎬</span>
                    <span className="text-xs">Reel</span>
                  </div>
                )}
                
                <Globe className="w-3 h-3" />
                {post.isShared && (
                  <span className="text-blue-600">📤 Shared</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Options Dropdown */}
          {isOwnPost && (
            <div className="relative">
              <button
                onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </button>
              
              <PostOptionsDropdown
                isOpen={showOptionsDropdown}
                onClose={() => setShowOptionsDropdown(false)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComments={handleToggleComments}
                onOpenInNewTab={handleOpenInNewTab}
                onPin={handlePin}
                onBoost={handleBoost}
                onSave={handleSave}
                commentsEnabled={post.commentsEnabled !== false}
                isPinned={post.isPinned}
                isBoosted={post.isBoosted}
                isSaved={isPostSaved()}
                position="bottom"
                isOwnPost={isOwnPost}
              />
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        {/* Title for posts and reels - Display first */}
        {post.title && (
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {post.title}
            </h3>
          </div>
        )}
        
                {/* Fallback title for reels without titles */}
        {post.type === 'reel' && !post.title && (
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-gray-500">
              Untitled Reel
            </h3>
          </div>
        )}
        

        
        {/* Content with word limit and Read More */}
        <div className="text-gray-900 dark:text-white text-base leading-relaxed mb-4">
          {(() => {
            const content = post.content || '';
            const wordCount = content.split(/\s+/).filter((word: string) => word && word.length > 0).length;
            const isExpanded = expandedPosts[post._id] || false;
            
            if (wordCount > 300) {
              const words = content.split(/\s+/);
              const first300Words = words.slice(0, 300).join(' ');
              
              return (
                <div>
                  <span>{isExpanded ? content : first300Words}</span>
                  <span className="text-blue-600 cursor-pointer hover:underline ml-1" 
                        onClick={() => togglePostExpansion(post._id)}>
                    {isExpanded ? '... Show Less' : '... Read More'}
                  </span>
                </div>
              );
            } else {
              return <span>{content}</span>;
            }
          })()}
        </div>
        
        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="mb-4">
            {post.media.map((media: any, index: number) => (
              <div key={index} className="mb-2">
                {media.type === 'video' ? (
                  <video
                    src={getMediaUrl(media.url)}
                    controls
                    className="w-full rounded-lg max-h-96 object-cover"
                  />
                ) : (
                  <img
                    src={getMediaUrl(media.url)}
                    alt="Post media"
                    className="w-full rounded-lg max-h-96 object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons - Matching the image structure */}
      <div className="px-4 pb-4">
        {/* Top Section: Engagement Metrics */}
        <div className="flex items-center justify-end mb-4">
          {/* Right Side: Engagement Metrics */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
              </svg>
              <span>{post.comments?.length || 0} Comments</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
              <span>{post.views?.length || 0} Views</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span>{post.reviews?.length || 0} Reviews</span>
            </div>
          </div>
        </div>
        
        {/* Temporary Reaction Display - Shows briefly after adding reaction */}
        {showReactionsTemporarily && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
            <div className="flex flex-wrap gap-2">
              {(() => {
                if (post.reactions && Array.isArray(post.reactions) && post.reactions.length > 0) {
                  const reactionCounts: { [key: string]: number } = {};
                  post.reactions.forEach((reaction: any) => {
                    reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
                  });
                  
                  const reactionEmojis: { [key: string]: string } = {
                    'like': '👍',
                    'love': '❤️',
                    'haha': '😂',
                    'wow': '😮',
                    'sad': '😢',
                    'angry': '😠'
                  };
                  
                  return Object.entries(reactionCounts).map(([type, count]) => (
                    <div key={type} className="flex items-center space-x-1 bg-blue-50 dark:bg-blue-900/20 rounded-full px-3 py-1 border border-blue-200 dark:border-blue-700">
                      <span className="text-lg">{reactionEmojis[type] || '😊'}</span>
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{count}</span>
                    </div>
                  ));
                } else if (post.likes && Array.isArray(post.likes) && post.likes.length > 0) {
                  return (
                    <div className="flex items-center space-x-1 bg-blue-50 dark:bg-blue-900/20 rounded-full px-3 py-1 border border-blue-200 dark:border-blue-700">
                      <span className="text-lg">👍</span>
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{post.likes.length}</span>
                    </div>
                  );
                } else {
                  return (
                    <div className="text-blue-500 dark:text-blue-400 text-sm font-medium">
                      Reaction added! 🎉
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        )}

        {/* Bottom Section: Action Buttons */}
        <div className="flex items-center justify-between py-6 px-6">
          <div className="flex items-center space-x-16">
            {/* React Button */}
            <div className="relative">
            <button
              onClick={() => setShowReactionPopup(!showReactionPopup)}
                disabled={isReacting}
                className="flex flex-col items-center space-y-3 text-gray-600 hover:text-yellow-600 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ touchAction: 'manipulation' }}
                ref={reactionButtonRef}
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  {isReacting ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
                  ) : (
                    <span className="text-2xl">{getMostCommonReactionEmoji()}</span>
                  )}
              </div>
                <span className="text-base font-medium">
                  {isReacting ? 'Processing...' : 'React'}
                </span>
                {/* Show reaction count if any reactions exist */}
                {post.reactions && post.reactions.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {post.reactions.length}
                  </span>
                )}
            </button>
              
              {/* Reaction Popup */}
              {showReactionPopup && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-50">
                  <ReactionPopup
                    isOpen={showReactionPopup}
                    onClose={() => setShowReactionPopup(false)}
                    onReaction={handleReaction}
                    currentReaction={getCurrentReaction()}
                    position="top"
                    isReacting={isReacting}
                  />
                </div>
              )}
            </div>
            
            {/* Comment Button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex flex-col items-center space-y-3 text-gray-600 hover:text-blue-600 transition-colors touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-base font-medium">Comment</span>
            </button>
            
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex flex-col items-center space-y-3 text-gray-600 hover:text-green-600 transition-colors touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                </svg>
              </div>
              <span className="text-base font-medium">Share</span>
            </button>
            
            {/* Review Button */}
            <button
              onClick={handleReview}
              className="flex flex-col items-center space-y-3 text-gray-600 hover:text-yellow-600 transition-colors touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-.1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <span className="text-base font-medium">Review</span>
            </button>
            
            {/* Save Button */}
            <button
              onClick={handleSave}
              className="flex flex-col items-center space-y-3 text-gray-600 hover:text-purple-600 transition-colors touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isPostSaved() 
                  ? 'bg-purple-100 dark:bg-gray-900/20 text-purple-600 dark:text-purple-400' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}>
                <svg className="w-6 h-6" fill={isPostSaved() ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <span className="text-base font-medium">{isPostSaved() ? 'Saved' : 'Save'}</span>
            </button>
          </div>
          
          {/* Right side - Empty for balance */}
          <div className="w-20"></div>
        </div>

        {/* Remove the old reaction popup section since we moved it above */}

        {/* Comment Input - Only Show When Comments Are Visible */}
        {showComments && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-3">
              <img
                src={getUserAvatar()}
                alt="Your avatar"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = '/default-avatar.svg';
                }}
              />
              <div className="flex-1 w-full">
                <div className="flex flex-col space-y-3">
                  {/* Comment Input */}
                  <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg px-3 py-2 shadow-sm border border-gray-200 dark:border-gray-600">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment and press enter"
                      className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
              />
                <div className="flex items-center space-x-2 ml-2">
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="text-gray-400 hover:text-blue-500 p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" 
                    title="Add emoji"
                  >
                    😊
                  </button>
                  <button 
                    onClick={() => setShowMediaPicker(!showMediaPicker)}
                        className="text-gray-400 hover:text-green-500 p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" 
                    title="Add media"
                  >
                    📷
                  </button>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        Post Comment
                      </button>
                      <button
                        onClick={() => {
                          setCommentText('');
                          setShowEmojiPicker(false);
                          setShowMediaPicker(false);
                        }}
                        className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-sm"
                      >
                        Cancel
              </button>
            </div>
              </div>
            </div>
            
            {/* Emoji Picker */}
            {showEmojiPicker && (
                  <div ref={emojiPickerRef} className="mt-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow-lg">
                <div className="grid grid-cols-8 gap-2">
                  {['😊', '😂', '❤️', '👍', '🎉', '🔥', '😍', '🤔', '😭', '😡', '😱', '🥳', '😎', '🤗', '😴', '🤫'].map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCommentText(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-2xl hover:scale-110 transition-transform p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Media Picker */}
            {showMediaPicker && (
                  <div ref={mediaPickerRef} className="mt-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button 
                        onClick={() => handleMediaUpload('photo')}
                        disabled={isUploading}
                        className="flex flex-col items-center space-y-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors group"
                      >
                        <span className="text-2xl">📷</span>
                        <span className="text-sm font-medium">Photo</span>
                        <span className="text-xs opacity-80">JPG, PNG, GIF</span>
                        {isUploading && <span className="text-xs animate-pulse">Uploading...</span>}
                  </button>
                      <button 
                        onClick={() => handleMediaUpload('video')}
                        disabled={isUploading}
                        className="flex flex-col items-center space-y-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors group"
                      >
                        <span className="text-2xl">🎥</span>
                        <span className="text-sm font-medium">Video</span>
                        <span className="text-xs opacity-80">MP4, MOV, AVI</span>
                        {isUploading && <span className="text-xs animate-pulse">Uploading...</span>}
                  </button>
                      <button 
                        onClick={() => handleMediaUpload('file')}
                        disabled={isUploading}
                        className="flex flex-col items-center space-y-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors group"
                      >
                        <span className="text-2xl">📁</span>
                        <span className="text-sm font-medium">File</span>
                        <span className="text-xs opacity-80">PDF, DOC, ZIP</span>
                        {isUploading && <span className="text-xs animate-pulse">Uploading...</span>}
                  </button>
                    </div>
                    
                    {/* File Upload Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*,.pdf,.doc,.docx,.zip,.rar"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {/* Upload Progress */}
                    {isUploading && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          <span className="text-sm text-blue-600 dark:text-blue-400">Uploading media...</span>
                </div>
              </div>
            )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Comments Display - Only Show When Comments Are Visible */}
        {showComments && post.comments && post.comments.length > 0 && (
          <div className="mt-4 space-y-4">
            {post.comments.slice(0, 3).map((comment: any, index: number) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <img
                  src={comment.user?.avatar ? getMediaUrl(comment.user.avatar) : '/default-avatar.svg'}
                  alt={comment.user?.name || 'User'}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.svg';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                      {comment.user?.name || comment.user?.username || 'User'}
                    </span>
                    {comment.user?.verified && (
                      <span className="text-red-500 text-xs">✓</span>
                    )}
                  </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
                      {formatDate(comment.createdAt || comment.date)}
                    </span>
                  </div>
                  
                  {editingCommentId === (comment._id || comment.id) ? (
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 mb-3 border border-gray-200 dark:border-gray-600">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <input
                          type="text"
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              saveEditComment(comment._id || comment.id);
                            } else if (e.key === 'Escape') {
                              cancelEditComment();
                            }
                          }}
                          className="flex-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Edit your comment..."
                          autoFocus
                        />
                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <button
                          onClick={() => saveEditComment(comment._id || comment.id)}
                          disabled={!editCommentText.trim()}
                            className="flex-1 sm:flex-none px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditComment}
                            className="flex-1 sm:flex-none px-3 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-700 rounded-lg px-4 py-3 mb-3 relative group border border-gray-200 dark:border-gray-600">
                      <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 pr-20">
                        {comment.text || comment.content}
                      </div>
                      
                      {/* Edit/Delete Icons - Positioned to the right */}
                      {(() => {
                        const currentUserId = getCurrentUserId();
                        const commentUserId = comment.user?._id || comment.user?.id || comment.user?.userId;
                        const canEdit = currentUserId && commentUserId && (
                          comment.user?._id === currentUserId || 
                          comment.user?.id === currentUserId || 
                          comment.user?.userId === currentUserId
                        );
                        
                        return canEdit;
                      })() && (
                        <div className="absolute top-3 right-3 flex items-center space-x-2">
                          <button
                            onClick={() => startEditComment(comment)}
                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Edit comment"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteComment(comment._id || comment.id)}
                            disabled={deletingCommentId === (comment._id || comment.id)}
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                            title="Delete comment"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Comment Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <button 
                      onClick={() => handleCommentLike(comment._id || comment.id)}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center space-x-1"
                    >
                      <span>👍</span>
                      <span>Like</span>
                      {comment.likes && comment.likes.length > 0 && (
                        <span className="text-xs">({comment.likes.length})</span>
                      )}
                    </button>
                    <button 
                      onClick={() => handleCommentReply(comment._id || comment.id, comment.user?.name || 'User')}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center space-x-1"
                    >
                        <span>💬</span>
                        <span>Reply</span>
                    </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* View All Comments Button */}
            {post.comments.length > 3 && (
              <div className="text-center pt-2">
                <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors">
                View all {post.comments.length} comments
              </button>
              </div>
            )}
          </div>
        )}
        
        {/* Show Message When No Comments */}
        {showComments && (!post.comments || post.comments.length === 0) && (
          <div className="mt-4 text-center text-gray-500 dark:text-gray-400 text-sm p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            No comments yet. Be the first to comment! 💬
          </div>
        )}
      </div>

      {/* Share Popup */}
      {showSharePopup && (
        <SharePopup
          isOpen={showSharePopup}
          onClose={() => setShowSharePopup(false)}
          onShare={handleShareConfirm}
          postContent={post.content}
          postMedia={post.media}
        />
      )}
    </div>
  );
};

export default FeedPost; 