'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, User } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  username?: string;
  avatar?: string;
  isVerified?: boolean;
  followers?: number;
  following?: number;
}

interface PeopleYouMayKnowProps {
  onFollow?: (userId: string) => void;
}

const PeopleYouMayKnow: React.FC<PeopleYouMayKnowProps> = ({ onFollow }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const router = useRouter();

  // Add custom styles for horizontal scrolling
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .people-scroll-container::-webkit-scrollbar {
        display: none;
      }
      .people-scroll-container {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .people-card {
        scroll-snap-align: start;
      }
      .people-scroll-container {
        scroll-snap-type: x mandatory;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Fetch suggested users
  const fetchSuggestedUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUsers([]);
        return;
      }

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users/suggested`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Backend returns users directly, not wrapped in data.users
        const usersArray = Array.isArray(data) ? data : (data.users || []);
        
        if (usersArray && usersArray.length > 0) {
          // Sort users by verification status first, then by followers count for consistent sequence
          const sortedUsers = usersArray.sort((a: any, b: any) => {
            // Sort by verification status first (verified users first)
            if (a.isVerified && !b.isVerified) return -1;
            if (!a.isVerified && b.isVerified) return 1;
            // Then sort by followers count (higher first)
            return (b.followers || 0) - (a.followers || 0);
          });
          setUsers(sortedUsers);
          setLastUpdated(new Date());
        } else {
          setUsers([]);
        }
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching suggested users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle follow/unfollow
  const handleFollow = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to follow users');
        return;
      }

      const isFollowing = followedUsers.has(userId);
      
      // Optimistically update UI
      setFollowedUsers(prev => {
        const newSet = new Set(prev);
        if (isFollowing) {
          newSet.delete(userId);
        } else {
          newSet.add(userId);
        }
        return newSet;
      });

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Follow/Unfollow response:', data);
        
        if (onFollow) {
          onFollow(userId);
        }
      } else {
        // Revert optimistic update on failure
        setFollowedUsers(prev => {
          const newSet = new Set(prev);
          if (isFollowing) {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
        
        const errorData = await response.json().catch(() => ({}));
        alert(isFollowing ? 'Failed to unfollow user' : 'Failed to follow user');
      }
    } catch (error) {
      // Revert optimistic update on network error
      const isFollowing = followedUsers.has(userId);
      setFollowedUsers(prev => {
        const newSet = new Set(prev);
        if (isFollowing) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
      
      console.error('Error following/unfollowing user:', error);
      alert('Network error. Please try again.');
    }
  };

  // Navigate to user profile
  const navigateToProfile = (userId: string) => {
    router.push(`/dashboard/profile/${userId}`);
  };

  // Load users on component mount
  useEffect(() => {
    fetchSuggestedUsers();
  }, []);

  // Check if user is logged in
  const token = localStorage.getItem('token');
  
  // Show login prompt if no token
  if (!token) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-3 sm:mb-4 p-4">
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🔐</div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Login to see suggestions
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Sign in to discover people you may know
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading && users.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-3 sm:mb-4 p-4">
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-3"></div>
          <span className="text-gray-500 dark:text-gray-400">Loading suggestions...</span>
        </div>
      </div>
    );
  }

  // Show message when no users found (after loading)
  if (users.length === 0 && !loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-3 sm:mb-4 p-4">
        <div className="text-center py-6">
          <div className="text-4xl mb-3">👥</div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            People you may know
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            We couldn't find any users to suggest right now.
          </p>
          <button
            onClick={fetchSuggestedUsers}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-3 sm:mb-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            People you may know
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {users.length} {users.length === 1 ? 'person' : 'people'} suggested
            {lastUpdated && (
              <span className="ml-2">
                • Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchSuggestedUsers}
          disabled={loading}
          className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {loading && users.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <span className="ml-3 text-gray-500 dark:text-gray-400">Loading suggestions...</span>
        </div>
      ) : (
        /* Users List - Horizontal Scrollable Layout */
        <div className="relative">
          <div className="people-scroll-container flex gap-4 overflow-x-auto pb-4" style={{
            scrollBehavior: 'smooth'
          }}>
            {/* Gradient fade effects */}
            <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-white dark:from-gray-800 to-transparent pointer-events-none z-10"></div>
            <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none z-10"></div>
          {users.map((user) => {
            const isFollowing = followedUsers.has(user._id);
            
            return (
                <div 
                  key={user._id} 
                  className="people-card flex flex-col items-center min-w-[140px] max-w-[160px] p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group border border-gray-200 dark:border-gray-600 hover:shadow-md hover:scale-105 transform transition-all duration-200"
                  onClick={() => navigateToProfile(user._id)}
                >
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 mb-3 ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-blue-300 dark:group-hover:ring-blue-600 transition-all duration-200">
                  <img
                      src={user.avatar ? `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/${user.avatar}` : '/default-avatar.svg'}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/default-avatar.svg';
                    }}
                  />
                </div>
                
                  {/* Name and Verification */}
                  <div className="text-center mb-3 min-w-0 w-full">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1 px-1">
                    {user.name}
                  </h4>
                    {user.isVerified && (
                      <div className="inline-flex items-center justify-center w-4 h-4 bg-red-500 rounded-full mx-auto">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                </div>
                
                {/* Follow Button */}
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollow(user._id);
                    }}
                  disabled={loading}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    isFollowing
                      ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                      : 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    </div>
                  ) : (
                    isFollowing ? 'Following' : 'Follow'
                  )}
                </button>
              </div>
            );
          })}
          </div>
          
          {/* Scroll Indicator */}
          {users.length > 4 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PeopleYouMayKnow;
