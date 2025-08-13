'use client';
import { useState, useRef, useEffect } from 'react';
import { createReel, CreateReelData } from '@/utils/reelsApi';

interface ReelsCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ReelData {
  title: string;
  description: string;
  media: File | null;
  privacy: 'everyone' | 'friends' | 'private';
  hashtags?: string[];
  category?: string;
  music?: {
    title: string;
    artist: string;
    url: string;
    startTime: number;
  };
}

export default function ReelsCreationModal({ isOpen, onClose, onSuccess }: ReelsCreationModalProps) {
  const [step, setStep] = useState<'media-select' | 'create'>('media-select');
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'everyone' | 'friends' | 'private'>('everyone');
  const [category, setCategory] = useState('general');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('media-select');
      setSelectedMedia(null);
      setMediaPreview('');
      setTitle('');
      setDescription('');
      setCategory('general');
      setHashtags([]);
      setHashtagInput('');
      setError('');
      setDragActive(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    console.log('📁 File selected:', file.name, file.type, file.size);
    
    // Validate file type
    if (!file.type.startsWith('video/') && !file.type.startsWith('image/')) {
      setError('Please select a valid video or image file');
      return;
    }
    
    // Validate file size (max 100MB for videos)
    const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }
    
    console.log('✅ File validation passed');
    setSelectedMedia(file);
    const url = URL.createObjectURL(file);
    setMediaPreview(url);
    setStep('create');
    setError(''); // Clear any previous errors
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleShare = async () => {
    if (!selectedMedia || !title.trim()) return;
    
    setIsUploading(true);
    setError('');
    
    try {
      console.log('🎬 Creating reel with data:', { title, description, hashtags, category, privacy });
      console.log('📁 Selected media:', selectedMedia);
      
      // Calculate video duration if it's a video file
      let duration = 0;
      if (selectedMedia.type.startsWith('video/')) {
        duration = await getVideoDuration(selectedMedia);
        console.log('⏱️ Video duration:', duration);
      }
      
      const reelData: CreateReelData = {
        title,
        description,
        hashtags,
        duration,
        category,
        privacy,
        aspectRatio: '9:16' // Default for reels
      };
      
      console.log('📊 Reel data prepared:', reelData);
      console.log('📤 Calling createReel API...');
      
      const result = await createReel(reelData, selectedMedia);
      console.log('✅ Reel created successfully:', result);
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('❌ Error creating reel:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to create reel. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, '');
    if (tag && !hashtags.includes(tag) && hashtags.length < 10) {
      setHashtags([...hashtags, tag]);
      setHashtagInput('');
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  const handleHashtagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHashtag();
    }
  };

  const handleBackToMediaSelect = () => {
    setStep('media-select');
    setSelectedMedia(null);
    setMediaPreview('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPrivacyIcon = (privacyType: string) => {
    switch (privacyType) {
      case 'everyone':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
          </svg>
        );
      case 'friends':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        );
      case 'private':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl w-full max-w-5xl h-[90vh] max-h-[600px] overflow-hidden shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-300 flex flex-col">
        
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Create Reel</h2>
              <p className="text-xs text-gray-600">Share your creative content with the world</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-lg transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Content Area - Step Based */}
        <div className="flex flex-1 overflow-hidden">
          
          {step === 'media-select' ? (
            /* Step 1: Media Selection - Full Width */
            <div className="w-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-8 relative">
              <div 
                className={`text-center text-white w-full max-w-lg transition-all duration-300 ${
                  dragActive ? 'scale-105' : ''
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className={`border-2 border-dashed rounded-xl p-16 transition-all duration-300 ${
                  dragActive ? 'border-blue-400 bg-blue-500/10' : 'border-gray-500 hover:border-gray-400'
                }`}>
                  {/* Video/Film Icon */}
                  <div className="text-5xl mb-6">🎬</div>
                  
                  <h3 className="text-xl font-semibold mb-3 text-white">Upload Your Content</h3>
                  <p className="text-gray-300 mb-8 text-sm leading-relaxed">
                    Drag and drop your video or image here, or click to browse
                  </p>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm"
                  >
                    Browse Files
                  </button>
                  
                  <div className="mt-6 text-xs text-gray-400">
                    <p>MP4, MOV, JPG, PNG • Max 500MB</p>
                  </div>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,image/*"
                  onChange={handleMediaSelect}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            /* Step 2: Media Preview + Form - Split Layout */
            <>
              {/* Media Preview Section */}
              <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4 relative min-w-0">
                <div className="relative w-full h-full flex items-center justify-center rounded-lg overflow-hidden">
                  {selectedMedia?.type.startsWith('video/') ? (
                    <video
                      ref={videoRef}
                      src={mediaPreview}
                      controls
                      className="w-full h-full object-contain max-h-full rounded-lg shadow-xl"
                      autoPlay
                      muted
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="w-full h-full object-contain max-h-full rounded-lg shadow-xl"
                    />
                  )}
                  
                  {/* Media Info Overlay */}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    Preview
                  </div>
                  
                  {selectedMedia && (
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                      {selectedMedia.name} • {formatFileSize(selectedMedia.size)}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Section */}
              <div className="w-72 bg-gray-50 border-l border-gray-200 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  
                  {/* Progress Indicator */}
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-white rounded-lg p-2 border border-gray-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span>Media selected</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span>Add details</span>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-800 text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                      </div>
                    </div>
                  )}

                  {/* Title Input */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-800">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Give your reel a catchy title..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white transition-all duration-200 hover:border-gray-400"
                      maxLength={100}
                    />
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Make it engaging</span>
                      <span className={`${title.length > 80 ? 'text-red-500' : 'text-gray-400'}`}>
                        {title.length}/100
                      </span>
                    </div>
                  </div>

                  {/* Description Input */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-800">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell viewers what your reel is about..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none bg-white transition-all duration-200 hover:border-gray-400"
                      rows={3}
                      maxLength={630}
                    />
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Add hashtags and mentions</span>
                      <span className={`${description.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
                        {description.length}/630
                      </span>
                    </div>
                  </div>

                  {/* Category Input */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-800">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white transition-all duration-200 hover:border-gray-400"
                    >
                      <option value="general">General</option>
                      <option value="comedy">Comedy</option>
                      <option value="dance">Dance</option>
                      <option value="food">Food</option>
                      <option value="travel">Travel</option>
                      <option value="fashion">Fashion</option>
                      <option value="beauty">Beauty</option>
                      <option value="fitness">Fitness</option>
                      <option value="education">Education</option>
                      <option value="music">Music</option>
                      <option value="gaming">Gaming</option>
                      <option value="sports">Sports</option>
                      <option value="technology">Technology</option>
                      <option value="lifestyle">Lifestyle</option>
                    </select>
                  </div>

                  {/* Hashtags Input */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-800">
                      Hashtags
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={hashtagInput}
                          onChange={(e) => setHashtagInput(e.target.value)}
                          onKeyPress={handleHashtagKeyPress}
                          placeholder="Add hashtag..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white transition-all duration-200 hover:border-gray-400"
                          maxLength={20}
                        />
                        <button
                          type="button"
                          onClick={addHashtag}
                          disabled={!hashtagInput.trim() || hashtags.length >= 10}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed text-sm"
                        >
                          Add
                        </button>
                      </div>
                      
                      {/* Display hashtags */}
                      {hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {hashtags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              #{tag}
                              <button
                                type="button"
                                onClick={() => removeHashtag(tag)}
                                className="ml-1 hover:text-blue-600 transition-colors"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        {hashtags.length}/10 hashtags • Press Enter to add
                      </div>
                    </div>
                  </div>

                  {/* Privacy Setting */}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-800">
                      Privacy Settings
                    </label>
                    <div className="space-y-1">
                      {[
                        { value: 'everyone', label: 'Everyone', description: 'Anyone can view' },
                        { value: 'friends', label: 'Friends', description: 'Only friends' },
                        { value: 'private', label: 'Private', description: 'Only you' }
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all duration-200 ${
                            privacy === option.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="privacy"
                            value={option.value}
                            checked={privacy === option.value}
                            onChange={(e) => setPrivacy(e.target.value as any)}
                            className="sr-only"
                          />
                          <div className={`flex items-center justify-center w-3 h-3 rounded-full border-2 ${
                            privacy === option.value
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {privacy === option.value && (
                              <div className="w-1 h-1 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-gray-700 min-w-0">
                            {getPrivacyIcon(option.value)}
                            <div className="min-w-0">
                              <div className="font-medium text-sm">{option.label}</div>
                              <div className="text-xs text-gray-500 truncate">{option.description}</div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Back Button */}
                  <button
                    onClick={handleBackToMediaSelect}
                    className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 py-2 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Media Selection
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {getPrivacyIcon(privacy)}
              <span className="capitalize font-medium text-xs">{privacy}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-md flex items-center justify-center transition-all duration-200 group">
                <span className="text-xs font-bold group-hover:scale-110 transition-transform">#</span>
              </button>
              <button className="w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-md flex items-center justify-center transition-all duration-200 group">
                <span className="text-xs font-bold group-hover:scale-110 transition-transform">@</span>
              </button>
              <button className="w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-md flex items-center justify-center transition-all duration-200 group">
                <span className="text-sm group-hover:scale-110 transition-transform">😊</span>
              </button>
            </div>
          </div>
          
          {/* Share Button */}
          <button
            onClick={handleShare}
            disabled={!selectedMedia || !title.trim() || isUploading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-5 py-2 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed text-sm shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Publishing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span>Share Reel</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}