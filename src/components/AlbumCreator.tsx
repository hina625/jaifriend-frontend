'use client';
import { useState, useRef } from 'react';

interface AlbumCreatorProps {
  onAlbumCreated: (album: any) => void;
}

export default function AlbumCreator({ onAlbumCreated }: AlbumCreatorProps) {
  const [albumName, setAlbumName] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateAlbum = async () => {
    if (!albumName.trim() || photos.length === 0) {
      alert('Please provide an album name and select at least one photo');
      return;
    }

    setIsCreating(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', albumName);
      photos.forEach(photo => {
        formData.append('photos', photo);
      });

      const response = await fetch('http://localhost:5000/api/albums', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (response.ok) {
        const album = await response.json();
        onAlbumCreated(album);
        setAlbumName('');
        setPhotos([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        const error = await response.json();
        alert(`Failed to create album: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating album:', error);
      alert('Failed to create album');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <h3 className="font-semibold mb-3">Create New Album</h3>
      
      <div className="mb-3">
        <input
          type="text"
          placeholder="Album name..."
          value={albumName}
          onChange={(e) => setAlbumName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          disabled={isCreating}
        />
      </div>

      <div className="mb-3">
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isCreating}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm"
          disabled={isCreating}
        >
          📷 Select Photos
        </button>
      </div>

      {photos.length > 0 && (
        <div className="mb-3">
          <div className="text-sm text-gray-600 mb-2">Selected Photos ({photos.length}):</div>
          <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
            {photos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-20 object-cover rounded"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleCreateAlbum}
        disabled={isCreating || !albumName.trim() || photos.length === 0}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg w-full"
      >
        {isCreating ? 'Creating Album...' : 'Create Album'}
      </button>
    </div>
  );
} 