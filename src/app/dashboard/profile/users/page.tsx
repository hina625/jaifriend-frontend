"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  location?: string;
  followers?: number;
  following?: number;
  posts?: number;
}

const UsersListPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/register');
        return;
      }

      // Fetch suggested users (this will include our sample users)
      const response = await fetch('http://localhost:5000/api/users/suggested', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      } else {
        // Fallback: search for specific users
        const sampleUsernames = [
          'ahmed_khan', 'fatima_ali', 'hassan_raza', 'ayesha_malik', 
          'usman_ali', 'sana_ahmed', 'bilal_hassan'
        ];
        
        const fetchedUsers: User[] = [];
        for (const username of sampleUsernames) {
          try {
            const searchResponse = await fetch(`http://localhost:5000/api/users/search?q=${username}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (searchResponse.ok) {
              const searchResults = await searchResponse.json();
              const user = searchResults.find((u: any) => u.username === username);
              if (user) {
                fetchedUsers.push(user);
              }
            }
          } catch (error) {
            console.error(`Error fetching user ${username}:`, error);
          }
        }
        
        setUsers(fetchedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (index: number) => {
    const colors = [
      'bg-blue-500 hover:bg-blue-600',
      'bg-purple-500 hover:bg-purple-600',
      'bg-green-500 hover:bg-green-600',
      'bg-pink-500 hover:bg-pink-600',
      'bg-orange-500 hover:bg-orange-600',
      'bg-teal-500 hover:bg-teal-600',
      'bg-indigo-500 hover:bg-indigo-600'
    ];
    return colors[index % colors.length];
  };

  const handleUserClick = (userId: string) => {
    // Use window.location for more reliable navigation
    window.location.href = `/dashboard/profile/${userId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Profiles</h1>
              <p className="text-gray-600 mt-2">Browse through different user profiles</p>
            </div>
            <button 
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {users.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Users Found</h2>
            <p className="text-gray-600 mb-6">Make sure you have created sample users in the database.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user, index) => (
              <div
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
              >
                {/* User Header */}
                <div className={`h-24 ${getColorClasses(index)}`}></div>
                
                {/* User Info */}
                <div className="p-6 -mt-12">
                  <div className="flex items-center justify-center mb-4">
                    <img
                      src={user.avatar || `/avatars/${(index % 20) + 1}.png`}
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">@{user.username}</p>
                    <p className="text-gray-700 text-sm mb-3">{user.bio || 'No bio available'}</p>
                    <p className="text-gray-500 text-xs mb-4">{user.location || 'Location not set'}</p>
                    
                    {/* Stats */}
                    <div className="flex justify-center gap-4 text-xs text-gray-500 mb-4">
                      <span><strong className="text-gray-900">{user.followers || 0}</strong> followers</span>
                      <span><strong className="text-gray-900">{user.following || 0}</strong> following</span>
                      <span><strong className="text-gray-900">{user.posts || 0}</strong> posts</span>
                    </div>
                    
                    <button
                      className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition-colors ${getColorClasses(index)}`}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About These Profiles</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These are user profiles from the database. Each profile has unique content, styling, and sample posts that reflect their interests and professions.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersListPage; 