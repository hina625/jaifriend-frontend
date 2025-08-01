"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Popup from '@/components/Popup';

interface ProfileSettings {
  firstName: string;
  lastName: string;
  aboutMe: string;
  location: string;
  website: string;
  relationship: string;
  school: string;
  schoolCompleted: boolean;
  workingAt: string;
  companyWebsite: string;
}

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

const ProfileSettingsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    firstName: 'Hina Sadaf -BSCS-2nd-029',
    lastName: '',
    aboutMe: '',
    location: '',
    website: '',
    relationship: 'None',
    school: '',
    schoolCompleted: false,
    workingAt: '',
    companyWebsite: ''
  });

  useEffect(() => {
    // Load profile settings from backend API
    const loadProfileSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('🔍 Loading profile settings...');
        console.log('🔍 Token available:', !!token);
        
        if (!token) {
          console.log('❌ No token found, using localStorage fallback');
          // Fallback to localStorage if no token
          const savedSettings = localStorage.getItem('profileSettings');
          if (savedSettings) {
            setProfileSettings(JSON.parse(savedSettings));
          }
          return;
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/profile/me`;
        console.log('🌐 Making request to:', apiUrl);
        console.log('🔐 Sending token:', token.substring(0, 20) + '...');

        const response = await fetch(apiUrl, { 
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);

        if (response.ok) {
          const userData = await response.json();
          console.log('✅ User data loaded:', userData);
          
          // Map user data to settings format
          const nameParts = (userData.name || '').split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          const mappedSettings = {
            firstName,
            lastName,
            aboutMe: userData.bio || '',
            location: userData.location || '',
            website: userData.website || '',
            relationship: 'None', // Not in user model yet
            school: '', // Not in user model yet
            schoolCompleted: false, // Not in user model yet
            workingAt: userData.workplace || '',
            companyWebsite: '' // Not in user model yet
          };
          
          console.log('📋 Mapped profile settings:', mappedSettings);
          setProfileSettings(mappedSettings);
          // Also save to localStorage as backup
          localStorage.setItem('profileSettings', JSON.stringify(mappedSettings));
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ API request failed:', response.status, errorData);
          // Fallback to localStorage if API fails
          const savedSettings = localStorage.getItem('profileSettings');
          if (savedSettings) {
            setProfileSettings(JSON.parse(savedSettings));
          }
        }
      } catch (error) {
        console.error('❌ Error loading profile settings:', error);
        // Fallback to localStorage if network error
        const savedSettings = localStorage.getItem('profileSettings');
        if (savedSettings) {
          setProfileSettings(JSON.parse(savedSettings));
        }
      }
    };
    
    loadProfileSettings();
  }, []);

  const showPopup = (type: 'success' | 'error' | 'info', title: string, message: string) => {
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

  const handleInputChange = (field: keyof ProfileSettings, value: string | boolean) => {
    setProfileSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Map the settings to the correct API format
        const profileData = {
          name: `${profileSettings.firstName} ${profileSettings.lastName}`.trim(),
          bio: profileSettings.aboutMe,
          location: profileSettings.location,
          website: profileSettings.website,
          workplace: profileSettings.workingAt,
          // Add other fields as needed
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/profile/update`, { 
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profileData)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Profile updated successfully:', result);
          
          // Save to localStorage as backup
          localStorage.setItem('profileSettings', JSON.stringify(profileSettings));
          
          showPopup('success', 'Success', 'Profile updated successfully!');
          
          // Get current user ID and navigate to profile page
          try {
            const currentUserResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/profile/me`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (currentUserResponse.ok) {
              const currentUser = await currentUserResponse.json();
              setTimeout(() => {
                router.push(`/dashboard/profile/${currentUser.id}`);
              }, 1500);
            } else {
              // Fallback to "me" if we can't get the user ID
              setTimeout(() => {
                router.push('/dashboard/profile/me');
              }, 1500);
            }
          } catch (error) {
            console.error('Error getting current user ID:', error);
            // Fallback to "me" if there's an error
            setTimeout(() => {
              router.push('/dashboard/profile/me');
            }, 1500);
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update profile');
        }
      } else {
        throw new Error('No authentication token found');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile. Please try again.';
      showPopup('error', 'Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const relationshipOptions = [
    'None',
    'Single',
    'In a relationship',
    'Engaged',
    'Married',
    'It\'s complicated',
    'In an open relationship',
    'Widowed',
    'Separated',
    'Divorced'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Profile Setting</h1>
        
        <div className="space-y-6">
          {/* First Name and Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First name
              </label>
              <input
                type="text"
                value={profileSettings.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last name
              </label>
              <input
                type="text"
                value={profileSettings.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
          </div>

          {/* About Me */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About me
            </label>
            <textarea
              value={profileSettings.aboutMe}
              onChange={(e) => handleInputChange('aboutMe', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white resize-vertical"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={profileSettings.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            />
          </div>

          {/* Website and Relationship */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={profileSettings.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship
              </label>
              <select
                value={profileSettings.relationship}
                onChange={(e) => handleInputChange('relationship', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                {relationshipOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* School with Completed Checkbox */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School
            </label>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={profileSettings.school}
                onChange={(e) => handleInputChange('school', e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="schoolCompleted"
                  checked={profileSettings.schoolCompleted}
                  onChange={(e) => handleInputChange('schoolCompleted', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="schoolCompleted" className="ml-2 text-sm text-gray-700">
                  Completed
                </label>
              </div>
            </div>
          </div>

          {/* Working at and Company Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Working at
              </label>
              <input
                type="text"
                value={profileSettings.workingAt}
                onChange={(e) => handleInputChange('workingAt', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company website
              </label>
              <input
                type="url"
                value={profileSettings.companyWebsite}
                onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-8 py-3 rounded-md font-medium transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Popup Component */}
      <Popup popup={popup} onClose={closePopup} />
    </div>
  );
};

export default ProfileSettingsPage;