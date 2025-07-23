"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Camera, ArrowLeft, Settings, Users, User } from 'lucide-react';

const PhotoAlbumManager: React.FC = () => {
  const [currentView, setCurrentView] = useState<'albums' | 'create'>('albums');
  const [albumName, setAlbumName] = useState<string>('');
  const [selectedPhotos, setSelectedPhotos] = useState<(File | string)[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [editAlbumName, setEditAlbumName] = useState('');
  const [editPhotos, setEditPhotos] = useState<File[]>([]);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuthAndFetchAlbums = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      setIsAuthenticated(true);
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/albums/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setAlbums(data);
        } else if (res.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        } else {
          console.error('Failed to fetch albums');
        }
      } catch (error) {
        console.error('Error fetching albums:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuthAndFetchAlbums();
  }, []);

  const handleCreateAlbum = (): void => {
    setCurrentView('create');
  };

  const handleGoBack = (): void => {
    setCurrentView('albums');
    setAlbumName('');
    setSelectedPhotos([]);
  };

  const refreshAlbums = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const res = await fetch('http://localhost:5000/api/albums/user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAlbums(data);
      }
    } catch (error) {
      console.error('Error refreshing albums:', error);
    }
  };

  const handleAddPhotoUrl = () => {
    if (photoUrlInput.trim()) {
      setSelectedPhotos(prev => [...prev, photoUrlInput.trim()]);
      setPhotoUrlInput('');
    }
  };

  const handlePublish = async (): Promise<void> => {
    if (!albumName.trim()) {
      alert('Please enter an album name');
      return;
    }
    if (selectedPhotos.length === 0) {
      alert('Please select at least one photo');
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to create albums');
      return;
    }
    
    const formData = new FormData();
    formData.append('name', albumName);
    
    // Separate files and URLs
    const files: File[] = [];
    const urls: string[] = [];
    
    selectedPhotos.forEach(photo => {
      if (typeof photo === 'string') {
        urls.push(photo);
      } else {
        files.push(photo);
      }
    });
    
    // Add files to formData
    files.forEach(file => {
      formData.append('photos', file);
    });
    
    // Add URLs to formData
    if (urls.length > 0) {
      formData.append('photoUrls', JSON.stringify(urls));
    }
    try {
      const res = await fetch('http://localhost:5000/api/albums', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });
      if (res.ok) {
        const newAlbum = await res.json();
        alert(`Album "${albumName}" created successfully!`);
        setAlbumName('');
        setSelectedPhotos([]);
        setCurrentView('albums');
        // Add new album to the list
        setAlbums(prev => [newAlbum, ...prev]);
      } else {
        const errorData = await res.json();
        alert(`Failed to create album: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating album:', error);
      alert('Failed to create album. Please try again.');
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedPhotos(prev => [...prev, ...fileArray]);
    }
  };

  const getMediaUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
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
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to edit albums');
      return;
    }
    
    const formData = new FormData();
    formData.append('name', editAlbumName);
    
    // Add files to formData
    editPhotos.forEach(photo => {
      formData.append('photos', photo);
    });
    try {
      const res = await fetch(`http://localhost:5000/api/albums/${albumId}`, {
        method: 'PUT',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });
      if (res.ok) {
        const updatedAlbum = await res.json();
        alert('Album updated!');
        setEditingAlbumId(null);
        setEditAlbumName('');
        setEditPhotos([]);
        // Update album in the list
        setAlbums(prev => prev.map(album => 
          album._id === albumId ? updatedAlbum : album
        ));
      } else {
        const errorData = await res.json();
        alert(`Failed to update album: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating album:', error);
      alert('Failed to update album. Please try again.');
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
    if (!window.confirm('Delete this album?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/albums/${albumId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        alert('Album deleted!');
        setAlbums(prev => prev.filter(a => a._id !== albumId));
      } else {
        const errorData = await res.json();
        alert(`Failed to delete album: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting album:', error);
      alert('Failed to delete album. Please try again.');
    }
    setMenuOpen(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'albums') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900">My Albums</h1>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <Users className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <User className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Albums List */}
          {loading ? (
            <div className="text-center text-gray-400 py-12">Loading albums...</div>
          ) : albums.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {albums.map((album, idx) => (
                <div key={album._id || idx} className="bg-white rounded-lg shadow border border-gray-200 p-4 relative">
                  {/* Dropdown menu button */}
                  <button
                    className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100"
                    onClick={() => setMenuOpen(album._id)}
                  >
                    ⋮
                  </button>
                  {menuOpen === album._id && (
                    <div className="absolute right-2 top-10 w-48 bg-white border rounded shadow z-10">
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => startEditAlbum(album)}
                      >
                        ✏️ Edit Album
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                        onClick={() => handleDeleteAlbum(album._id)}
                      >
                        🗑️ Delete Album
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => setMenuOpen(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {/* Edit album form */}
                  {editingAlbumId === album._id ? (
                    <div className="mb-2 p-2 bg-blue-50 rounded border border-blue-200 mt-2">
                      <input
                        type="text"
                        className="w-full border rounded p-2 mb-2"
                        value={editAlbumName}
                        onChange={e => setEditAlbumName(e.target.value)}
                        placeholder="Edit album name..."
                      />
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="mb-2"
                        onChange={handleEditPhotoUpload}
                      />
                      {editPhotos.length > 0 && (
                        <div className="text-xs text-gray-600 mb-2">Selected: {editPhotos.length} photo(s)</div>
                      )}
                      <div className="flex gap-2">
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                          onClick={() => handleEditAlbum(album._id)}
                          disabled={!editAlbumName.trim()}
                        >
                          Save
                        </button>
                        <button
                          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition"
                          onClick={cancelEditAlbum}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                  <div className="font-semibold text-lg mb-2">{album.name}</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {album.photos && album.photos.length > 0 ? (
                      album.photos.map((photo: any, pidx: number) => (
                        <img
                          key={pidx}
                          src={getMediaUrl(photo.url)}
                          alt="album photo"
                          className="w-20 h-20 object-cover rounded"
                        />
                      ))
                    ) : (
                      <div className="text-xs text-gray-400">No photos</div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">Created: {album.createdAt ? new Date(album.createdAt).toLocaleString() : ''}</div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Empty State */}
          {(!loading && albums.length === 0) && (
            <div className="text-center">
              {/* Empty State Icon */}
              <div className="mx-auto w-24 h-24 bg-purple-100 rounded-2xl flex items-center justify-center mb-8">
                <div className="relative">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-400 rounded-md opacity-70"></div>
                </div>
              </div>

              {/* Empty State Text */}
              <p className="text-gray-600 text-lg mb-8">
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

        {/* Floating Action Button */}
        <button
          onClick={handleCreateAlbum}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Side Icons */}
        <div className="fixed right-6 top-1/2 transform -translate-y-1/2 space-y-4">
          <button className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
            <User className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">My Albums</h1>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Users className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <User className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Album Form */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Form Header */}
          <div className="flex items-center mb-8">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Create album</h2>
          </div>

          {/* Album Name Field */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">Album name</label>
            <input
              type="text"
              value={albumName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAlbumName(e.target.value)}
              placeholder="Choose your album name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Photos Section */}
          <div className="mb-12">
            <label className="block text-sm font-medium text-gray-700 mb-4">Photos</label>
            {/* Photo URL Input */}
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={photoUrlInput}
                onChange={e => setPhotoUrlInput(e.target.value)}
                placeholder="Paste image URL (e.g. from Cloudinary)"
                className="border px-2 py-1 rounded flex-1"
              />
              <button
                type="button"
                onClick={handleAddPhotoUrl}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Add URL
              </button>
            </div>
            {/* Photo Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center relative">
                  <Camera className="w-8 h-8 text-gray-400" />
                  <div className="absolute -top-1 -right-1">
                    <Plus className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm">Click to upload photos or videos, or drag and drop</p>
              </label>
            </div>
            {/* Selected Photos Preview */}
            {selectedPhotos.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">{selectedPhotos.length} file(s) selected</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPhotos.map((media: any, index: number) => {
                    if (typeof media === 'string') {
                      // URL: check if it's a video or image
                      if (/\.(mp4|webm|ogg)$/i.test(media)) {
                        return (
                          <video key={index} src={media} controls className="w-16 h-16 object-cover rounded-lg border" />
                        );
                      }
                      return (
                        <img key={index} src={media} alt="media url" className="w-16 h-16 object-cover rounded-lg border" />
                      );
                    } else if (media.type && media.type.startsWith('video')) {
                      // File: check if it's a video
                      const videoUrl = URL.createObjectURL(media);
                      return (
                        <video key={index} src={videoUrl} controls className="w-16 h-16 object-cover rounded-lg border" />
                      );
                    } else if (media.type && media.type.startsWith('image')) {
                      // File: image
                      const imageUrl = URL.createObjectURL(media);
                      return (
                        <img key={index} src={imageUrl} alt="media file" className="w-16 h-16 object-cover rounded-lg border" />
                      );
                    } else {
                      // Fallback
                      return (
                        <div key={index} className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Camera className="w-6 h-6 text-gray-400" />
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleGoBack}
              className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go back
            </button>
            <button
              onClick={handlePublish}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-sm"
            >
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default PhotoAlbumManager;