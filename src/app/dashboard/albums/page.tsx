"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Camera, ArrowLeft, Settings, Users, User, X } from 'lucide-react';
import Popup, { PopupState } from '../../../components/Popup';

const PhotoAlbumManager: React.FC = () => {
  const [currentView, setCurrentView] = useState<'albums' | 'create'>('albums');
  const [albumName, setAlbumName] = useState<string>('');
  const [selectedPhotos, setSelectedPhotos] = useState<(File | string)[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [creatingAlbum, setCreatingAlbum] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [editAlbumName, setEditAlbumName] = useState('');
  const [editPhotos, setEditPhotos] = useState<File[]>([]);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app';
  // Fetch real albums from API
  useEffect(() => {
    const fetchAlbums = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        // Check if token exists and is valid
        if (!token || token === 'null' || token === 'undefined') {
          console.error('No valid token found');
          setIsAuthenticated(false);
          return;
        }
        
        const response = await fetch(`${API_URL}/api/albums/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const albumsData = await response.json();
          setAlbums(albumsData);
        } else if (response.status === 401) {
          console.error('Authentication failed');
          setIsAuthenticated(false);
          localStorage.removeItem('token');
        } else {
          console.error('Failed to fetch albums');
        }
      } catch (error) {
        console.error('Error fetching albums:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  const handleCreateAlbum = (): void => {
    setCurrentView('create');
  };

  const handleGoBack = (): void => {
    setCurrentView('albums');
    setAlbumName('');
    setSelectedPhotos([]);
  };

  const handleAddPhotoUrl = () => {
    if (photoUrlInput.trim()) {
      setSelectedPhotos(prev => [...prev, photoUrlInput.trim()]);
      setPhotoUrlInput('');
    }
  };

  const showPopup = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    setPopup({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closePopup = () => {
    setPopup(prev => ({ ...prev, isOpen: false }));
  };

  const handlePublish = async (): Promise<void> => {
    if (!albumName.trim()) {
      showPopup('error', 'Missing Album Name', 'Please enter an album name');
      return;
    }
    if (selectedPhotos.length === 0) {
      showPopup('error', 'No Photos Selected', 'Please select at least one photo');
      return;
    }
    
    setCreatingAlbum(true);
    try {
      const token = localStorage.getItem('token');
      
      // Check if token exists and is valid
      if (!token || token === 'null' || token === 'undefined') {
        showPopup('error', 'Authentication Error', 'Please log in again');
        setIsAuthenticated(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('name', albumName);
      
      // Add photos to form data
      selectedPhotos.forEach((photo, index) => {
        if (typeof photo === 'string') {
          // If it's a URL, add it as mediaUrls
          formData.append('mediaUrls', photo);
        } else {
          // If it's a file, add it as photos
          formData.append('photos', photo);
        }
      });

      const response = await fetch(`${API_URL}/api/albums`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const newAlbum = await response.json();
        setAlbums(prev => [newAlbum, ...prev]);
        showPopup('success', 'Album Created!', `Album "${albumName}" created successfully!`);
        setAlbumName('');
        setSelectedPhotos([]);
        
        // Dispatch event to refresh feed
        window.dispatchEvent(new CustomEvent('albumCreated'));
        
        // Redirect to dashboard feed immediately
        window.location.href = '/dashboard';
      } else if (response.status === 401) {
        console.error('Authentication failed');
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        showPopup('error', 'Authentication Error', 'Please log in again');
      } else {
        console.error('Server response error:', response.status, response.statusText);
        try {
          const error = await response.json();
          console.error('Server error details:', error);
          showPopup('error', 'Failed to Create Album', error.message || error.error || 'Something went wrong');
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          showPopup('error', 'Failed to Create Album', `Server error: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error: unknown) {
      console.error('Error creating album:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        albumName,
        selectedPhotosCount: selectedPhotos.length,
        token: localStorage.getItem('token') ? 'Present' : 'Missing'
      });
      showPopup('error', 'Network Error', 'Failed to create album. Please try again.');
    } finally {
      setCreatingAlbum(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedPhotos(prev => [...prev, ...fileArray]);
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const getMediaUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}/${url}`;
  };

  // Edit album handlers
  const startEditAlbum = (album: any) => {
    setEditingAlbumId(album._id);
    setEditAlbumName(album.name);
    setEditPhotos([]);
    setMenuOpen(null);
  };

  const cancelEditAlbum = () => {
    setEditingAlbumId(null);
    setEditAlbumName('');
    setEditPhotos([]);
  };

  const handleEditAlbum = async (albumId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if token exists and is valid
      if (!token || token === 'null' || token === 'undefined') {
        showPopup('error', 'Authentication Error', 'Please log in again');
        setIsAuthenticated(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('name', editAlbumName);
      
      // Add new photos to form data
      editPhotos.forEach((photo, index) => {
        if (typeof photo === 'string') {
          // If it's a URL, add it as mediaUrls
          formData.append('mediaUrls', photo);
        } else {
          // If it's a file, add it as photos
          formData.append('photos', photo);
        }
      });

      const response = await fetch(`${API_URL}/api/albums/${albumId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const updatedAlbum = await response.json();
        setAlbums(prev => prev.map(a => a._id === albumId ? updatedAlbum : a));
        showPopup('success', 'Album Updated!', 'Album updated successfully!');
        setEditingAlbumId(null);
        setEditAlbumName('');
        setEditPhotos([]);
        
        // Dispatch event to refresh feed
        window.dispatchEvent(new CustomEvent('albumUpdated'));
      } else if (response.status === 401) {
        console.error('Authentication failed');
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        showPopup('error', 'Authentication Error', 'Please log in again');
      } else {
        console.error('Server response error:', response.status, response.statusText);
        try {
          const error = await response.json();
          console.error('Server error details:', error);
          showPopup('error', 'Failed to Update Album', error.message || error.error || 'Something went wrong');
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          showPopup('error', 'Failed to Update Album', `Server error: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error: unknown) {
      console.error('Error updating album:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        albumId,
        editAlbumName,
        editPhotosCount: editPhotos.length,
        token: localStorage.getItem('token') ? 'Present' : 'Missing'
      });
      showPopup('error', 'Network Error', 'Failed to update album. Please try again.');
    }
  };

  const handleEditPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setEditPhotos(prev => [...prev, ...fileArray]);
    }
  };

  // Delete album
  const handleDeleteAlbum = async (albumId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if token exists and is valid
      if (!token || token === 'null' || token === 'undefined') {
        showPopup('error', 'Authentication Error', 'Please log in again');
        setIsAuthenticated(false);
        return;
      }
      
      const response = await fetch(`${API_URL}/api/albums/${albumId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAlbums(prev => prev.filter(a => a._id !== albumId));
        showPopup('success', 'Album Deleted!', 'Album deleted successfully!');
        
        // Dispatch event to refresh feed
        window.dispatchEvent(new CustomEvent('albumDeleted'));
      } else if (response.status === 401) {
        console.error('Authentication failed');
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        showPopup('error', 'Authentication Error', 'Please log in again');
      } else {
        const error = await response.json();
        showPopup('error', 'Failed to Delete Album', error.message || 'Something went wrong');
      }
    } catch (error: unknown) {
      console.error('Error deleting album:', error);
      showPopup('error', 'Network Error', 'Failed to delete album. Please try again.');
    }
    setMenuOpen(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access your albums</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'albums') {
      return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="h-full overflow-y-auto scrollbar-hide">
      {/* Popup Modal */}
      <Popup popup={popup} onClose={closePopup} />
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">My Albums</h1>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
          {/* Albums List */}
          {loading ? (
            <div className="text-center text-gray-400 py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-4"></div>
              Loading albums...
            </div>
          ) : albums.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-12">
              {albums.map((album, idx) => (
                <div key={album._id || idx} className="bg-white rounded-lg shadow border border-gray-200 p-3 sm:p-4 relative">
                  {/* Dropdown menu button */}
                  <button
                    className="absolute top-2 right-2 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 z-10"
                    onClick={() => setMenuOpen(menuOpen === album._id ? null : album._id)}
                  >
                    <span className="text-lg">⋮</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {menuOpen === album._id && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-20 sm:hidden" 
                        onClick={() => setMenuOpen(null)}
                      />
                      <div className="absolute right-2 top-10 w-40 sm:w-48 bg-white border rounded-lg shadow-lg z-30">
                        <button
                          className="w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-100 text-sm rounded-t-lg"
                          onClick={() => startEditAlbum(album)}
                        >
                          ✏️ Edit Album
                        </button>
                        <button
                          className="w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-100 text-red-600 text-sm"
                          onClick={() => handleDeleteAlbum(album._id)}
                        >
                          🗑️ Delete Album
                        </button>
                        <button
                          className="w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-100 text-sm rounded-b-lg"
                          onClick={() => setMenuOpen(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                  
                  {/* Edit album form */}
                  {editingAlbumId === album._id ? (
                    <div className="mb-2 p-2 sm:p-3 bg-blue-50 rounded border border-blue-200 mt-2">
                      <input
                        type="text"
                        className="w-full border rounded p-2 mb-2 text-sm"
                        value={editAlbumName}
                        onChange={e => setEditAlbumName(e.target.value)}
                        placeholder="Edit album name..."
                      />
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="mb-2 text-xs sm:text-sm w-full"
                        onChange={handleEditPhotoUpload}
                      />
                      {editPhotos.length > 0 && (
                        <div className="text-xs text-gray-600 mb-2">Selected: {editPhotos.length} photo(s)</div>
                      )}
                      <div className="flex gap-2">
                        <button
                          className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-blue-700 transition text-xs sm:text-sm"
                          onClick={() => handleEditAlbum(album._id)}
                          disabled={!editAlbumName.trim()}
                        >
                          Save
                        </button>
                        <button
                          className="bg-gray-300 px-2 sm:px-3 py-1 rounded hover:bg-gray-400 transition text-xs sm:text-sm"
                          onClick={cancelEditAlbum}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                  
                  <div className="font-semibold text-base sm:text-lg mb-2 pr-8">{album.name}</div>
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2">
                    {album.media && album.media.length > 0 ? (
                      album.media.slice(0, 6).map((media: any, pidx: number) => {
                        const mediaUrl = getMediaUrl(media.url);
                        
                        if (media.type === 'video' || media.url.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
                          return (
                            <video
                              key={pidx}
                              src={mediaUrl}
                              className="w-full aspect-square object-cover rounded"
                              muted
                              preload="metadata"
                            />
                          );
                        } else {
                          return (
                            <img
                              key={pidx}
                              src={mediaUrl}
                              alt="album media"
                              className="w-full aspect-square object-cover rounded"
                            />
                          );
                        }
                      })
                    ) : (
                      <div className="col-span-3 text-xs text-gray-400 py-4 text-center">No media</div>
                    )}
                    {album.media && album.media.length > 6 && (
                      <div className="aspect-square bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                        +{album.media.length - 6}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Created: {album.createdAt ? new Date(album.createdAt).toLocaleDateString() : ''}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Empty State */}
          {(!loading && albums.length === 0) && (
            <div className="text-center px-4">
              {/* Empty State Icon */}
              <div className="mx-auto w-20 sm:w-24 h-20 sm:h-24 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 sm:mb-8">
                <div className="relative">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Camera className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 sm:w-6 h-5 sm:h-6 bg-purple-400 rounded-md opacity-70"></div>
                </div>
              </div>

              {/* Empty State Text */}
              <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8">
                You haven't created any <span className="text-purple-600 font-medium">albums</span> yet.
              </p>

              {/* Create Album Button */}
              <button
                onClick={handleCreateAlbum}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
              >
                Create album
              </button>
            </div>
          )}
        </div>

        {/* Floating Action Button - Only show when albums exist */}
        {albums.length > 0 && (
          <button
            onClick={handleCreateAlbum}
            className="fixed bottom-6 right-4 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-30"
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto scrollbar-hide">
      {/* Popup Modal */}
      <Popup popup={popup} onClose={closePopup} />
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Create Album</h1>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Album Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-24 sm:pb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8">
          {/* Form Header */}
          <div className="flex items-center mb-6 sm:mb-8">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Create album</h2>
          </div>

          {/* Album Name Field */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">Album name</label>
            <input
              type="text"
              value={albumName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAlbumName(e.target.value)}
              placeholder="Choose your album name"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Photos Section */}
          <div className="mb-8 sm:mb-12">
            <label className="block text-sm font-medium text-gray-700 mb-4">Photos</label>
            
            {/* Photo URL Input */}
            <div className="mb-4 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={photoUrlInput}
                onChange={e => setPhotoUrlInput(e.target.value)}
                placeholder="Paste image URL (e.g. from Cloudinary)"
                className="border px-3 py-2 rounded flex-1 text-sm"
              />
              <button
                type="button"
                onClick={handleAddPhotoUrl}
                className="bg-blue-500 text-white px-4 py-2 rounded whitespace-nowrap text-sm touch-manipulation"
                style={{ touchAction: 'manipulation' }}
              >
                Add URL
              </button>
            </div>
            
            {/* Photo Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 md:p-12 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer touch-manipulation" style={{ touchAction: 'manipulation' }}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg mx-auto mb-3 sm:mb-4 flex items-center justify-center relative">
                  <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  <div className="absolute -top-1 -right-1">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base px-2 sm:px-4 font-medium">
                  Tap to upload photos or videos
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 sm:mt-2">
                  Supports: JPG, PNG, GIF, MP4, MOV, AVI
                </p>
              </label>
            </div>
            
            {/* Selected Photos Preview */}
            {selectedPhotos.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">{selectedPhotos.length} file(s) selected</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {selectedPhotos.map((media: any, index: number) => (
                    <div key={index} className="relative group">
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {(() => {
                        if (typeof media === 'string') {
                          if (/\.(mp4|webm|ogg|mov|avi)$/i.test(media)) {
                            return (
                              <video 
                                src={media} 
                                className="w-full aspect-square object-cover rounded-lg border" 
                                controls
                                muted
                                preload="metadata"
                              />
                            );
                          }
                          return (
                            <img src={media} alt="media url" className="w-full aspect-square object-cover rounded-lg border" />
                          );
                        } else if (media.type && media.type.startsWith('video')) {
                          const videoUrl = URL.createObjectURL(media);
                          return (
                            <video 
                              src={videoUrl} 
                              className="w-full aspect-square object-cover rounded-lg border" 
                              controls
                              muted
                              preload="metadata"
                            />
                          );
                        } else if (media.type && media.type.startsWith('image')) {
                          const imageUrl = URL.createObjectURL(media);
                          return (
                            <img src={imageUrl} alt="media file" className="w-full aspect-square object-cover rounded-lg border" />
                          );
                        } else {
                          return (
                            <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                              <Camera className="w-4 h-4 text-gray-400" />
                            </div>
                          );
                        }
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
            <button
              onClick={handleGoBack}
              className="flex items-center justify-center px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors w-full sm:w-auto touch-manipulation border border-gray-300 rounded-lg hover:bg-gray-50"
              style={{ touchAction: 'manipulation' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go back
            </button>
            <button
              onClick={handlePublish}
              disabled={!albumName.trim() || selectedPhotos.length === 0 || creatingAlbum}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-sm w-full sm:w-auto touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              {creatingAlbum ? 'Creating...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoAlbumManager;
