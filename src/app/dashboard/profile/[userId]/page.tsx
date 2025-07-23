"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function UserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`http://localhost:5000/api/users/${userId}`);
        const userData = await res.json();
        setUser(userData);

        const postsRes = await fetch(`http://localhost:5000/api/posts?userId=${userId}`);
        const postsData = await postsRes.json();
        setPosts(postsData);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchUser();
  }, [userId]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <div className="p-8 text-center">User not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <img src={user.avatar || '/avatars/1.png.png'} className="w-20 h-20 rounded-full border-4 border-blue-500" alt={user.name} />
        <div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <div className="text-gray-500">@{user.username || user.email}</div>
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">Posts</h3>
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-gray-400">No posts yet.</div>
        ) : (
          posts.map(post => (
            <div key={post._id} className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-700 mb-2">{post.content}</div>
              {post.media && post.media.length > 0 && (
                <img src={`http://localhost:5000${post.media[0].url}`} className="w-full max-w-xs rounded" />
              )}
              <div className="text-xs text-gray-400 mt-2">{new Date(post.createdAt).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 