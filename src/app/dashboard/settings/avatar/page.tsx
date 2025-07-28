"use client";
import React, { useState, useRef } from 'react';

interface ImageSettings {
  avatar: string | null;
  cover: string | null;
}

const AvatarCoverSettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ImageSettings>({
    avatar: null,
    cover: null
  });
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (type: 'avatar' | 'cover', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImages(prev => ({
        ...prev,
        [type]: e.target?.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleCoverClick = () => {
    coverInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Avatar image must be less than 5MB');
        return;
      }
      handleImageUpload('avatar', file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('Cover image must be less than 10MB');
        return;
      }
      handleImageUpload('cover', file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save to localStorage (replace with actual API call)
      localStorage.setItem('userImages', JSON.stringify(images));
      
      console.log('Images saved:', images);
      alert('Avatar and cover images saved successfully!');
    } catch (error) {
      console.error('Error saving images:', error);
      alert('Failed to save images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Avatar & Cover Settings</h1>
        
        {/* Cover and Avatar Upload Area */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-8" style={{ height: '400px' }}>
          {/* Cover Photo Area */}
          <div 
            className="w-full h-full cursor-pointer relative group"
            onClick={handleCoverClick}
          >
            {images.cover ? (
              <img 
                src={images.cover} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200">
                <div className="mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16.5L12 9l8 7.5M4 9l8-7.5L20 9" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16.5h16v2H4v-2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Click to upload cover photo</p>
              </div>
            )}
            
            {/* Cover Upload Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-white text-center">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm">Change Cover</p>
              </div>
            </div>
          </div>

          {/* Avatar Area */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div 
              className="w-32 h-32 rounded-full border-4 border-white cursor-pointer relative group bg-white overflow-hidden shadow-lg"
              onClick={handleAvatarClick}
            >
              {images.avatar ? (
                <img 
                  src={images.avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-full">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              )}
              
              {/* Avatar Upload Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <div className="text-white text-center">
                  <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-xs">Change</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          className="hidden"
        />

        {/* Upload Guidelines */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Upload Guidelines:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Avatar: Recommended size 400x400px, max 5MB</li>
            <li>• Cover: Recommended size 1200x400px, max 10MB</li>
            <li>• Supported formats: JPG, PNG, GIF</li>
          </ul>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-8 py-3 rounded-md font-medium transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarCoverSettingsPage;