"use client";
import { useEffect, useState } from 'react';
import PostDisplay from '@/components/PostDisplay';
import AlbumDisplay from '@/components/AlbumDisplay';

export default function PopularPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/posts'),
      fetch('http://localhost:5000/api/albums')
    ])
      .then(responses => Promise.all(responses.map(res => res.json())))
      .then(([postsData, albumsData]) => {
        setPosts(postsData);
        setAlbums(albumsData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Popular Feed</h1>
        {posts.length === 0 && albums.length === 0 ? (
          <div className="bg-white p-8 rounded shadow text-center text-gray-500">No posts or albums found.</div>
        ) : (
          <div className="space-y-6">
            {/* Albums */}
            {albums.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Albums</h2>
                <div className="space-y-6">
                  {albums.map((album) => (
                    <AlbumDisplay key={album._id} album={album} isOwner={false} />
                  ))}
                </div>
              </div>
            )}
            {/* Posts */}
            {posts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Posts</h2>
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostDisplay key={post._id} post={post} isOwner={false} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}