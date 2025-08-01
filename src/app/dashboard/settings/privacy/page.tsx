"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Popup from '@/components/Popup';

interface PrivacySettings {
  status: string;
  whoCanFollowMe: string;
  whoCanMessageMe: string;
  whoCanSeeMyFriends: string;
  whoCanPostOnMyTimeline: string;
  whoCanSeeMyBirthday: string;
  confirmRequestWhenSomeoneFollowsYou: string;
  showMyActivities: string;
  shareMyLocationWithPublic: string;
  allowSearchEnginesToIndex: string;
}

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

const PrivacySettingsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    status: 'Online',
    whoCanFollowMe: 'Everyone',
    whoCanMessageMe: 'Everyone',
    whoCanSeeMyFriends: 'Everyone',
    whoCanPostOnMyTimeline: 'People I Follow',
    whoCanSeeMyBirthday: 'Everyone',
    confirmRequestWhenSomeoneFollowsYou: 'No',
    showMyActivities: 'Yes',
    shareMyLocationWithPublic: 'Yes',
    allowSearchEnginesToIndex: 'Yes'
  });

  useEffect(() => {
    // Load privacy settings from backend API
    const loadSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // Fallback to localStorage if no token
          const savedSettings = localStorage.getItem('privacySettings');
          if (savedSettings) {
            setPrivacySettings(JSON.parse(savedSettings));
          }
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/privacy/settings`, { 
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          setPrivacySettings(result.data);
          // Also save to localStorage as backup
          localStorage.setItem('privacySettings', JSON.stringify(result.data));
        } else {
          // Fallback to localStorage if API fails
          const savedSettings = localStorage.getItem('privacySettings');
          if (savedSettings) {
            setPrivacySettings(JSON.parse(savedSettings));
          }
        }
      } catch (error) {
        console.error('Error fetching privacy settings:', error);
        // Fallback to localStorage if network error
        const savedSettings = localStorage.getItem('privacySettings');
        if (savedSettings) {
          setPrivacySettings(JSON.parse(savedSettings));
        }
      }
    };
    
    loadSettings();
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

  const handleSettingChange = (setting: keyof PrivacySettings, value: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Try backend API first
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/privacy/settings`, { 
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(privacySettings)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Privacy settings saved:', result);
          
          // Update settings with backend data
          setPrivacySettings(result.data);
          localStorage.setItem('privacySettings', JSON.stringify(result.data));
          
          showPopup('success', 'Success', 'Privacy settings saved successfully!');
          
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('privacySettingsUpdated'));
          
          // Navigate to profile page after successful save
          setTimeout(() => {
            router.push('/dashboard/profile/me');
          }, 1500);
        } else {
          // Fallback to localStorage if API fails
          throw new Error('API failed, using localStorage');
        }
      } else {
        // Fallback to localStorage if no token
        throw new Error('No token, using localStorage');
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      
      // Fallback to localStorage
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Save to localStorage (replace with actual API call)
        localStorage.setItem('privacySettings', JSON.stringify(privacySettings));
        
        console.log('Privacy settings saved (local):', privacySettings);
        showPopup('success', 'Success', 'Privacy settings saved successfully! (Saved locally)');
      } catch (localError) {
        console.error('Error in local save:', localError);
        showPopup('error', 'Error', 'Failed to save privacy settings. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const privacyOptions = [
    {
      key: 'status',
      question: 'Status',
      options: ['Online', 'Offline', 'Away', 'Busy']
    },
    {
      key: 'whoCanFollowMe',
      question: 'Who can follow me ?',
      options: ['Everyone', 'Friends only', 'No one']
    },
    {
      key: 'whoCanMessageMe',
      question: 'Who can message me ?',
      options: ['Everyone', 'Friends only', 'People I Follow', 'No one']
    },
    {
      key: 'whoCanSeeMyFriends',
      question: 'Who can see my friends?',
      options: ['Everyone', 'Friends only', 'Only me']
    },
    {
      key: 'whoCanPostOnMyTimeline',
      question: 'Who can post on my timeline ?',
      options: ['Everyone', 'Friends only', 'People I Follow', 'Only me']
    },
    {
      key: 'whoCanSeeMyBirthday',
      question: 'Who can see my birthday?',
      options: ['Everyone', 'Friends only', 'Only me']
    },
    {
      key: 'confirmRequestWhenSomeoneFollowsYou',
      question: 'Confirm request when someone follows you ?',
      options: ['Yes', 'No']
    },
    {
      key: 'showMyActivities',
      question: 'Show my activities ?',
      options: ['Yes', 'No']
    },
    {
      key: 'shareMyLocationWithPublic',
      question: 'Share my location with public?',
      options: ['Yes', 'No']
    },
    {
      key: 'allowSearchEnginesToIndex',
      question: 'Allow search engines to index my profile and posts?',
      options: ['Yes', 'No']
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Privacy Setting</h1>
        
        <div className="space-y-6">
          {privacyOptions.map((option, index) => (
            <div key={option.key} className="border-b border-gray-200 pb-4">
              <div className="mb-2">
                <label className="block text-sm text-gray-600 mb-1">
                  {option.question}
                </label>
                <select
                  value={privacySettings[option.key as keyof PrivacySettings]}
                  onChange={(e) => handleSettingChange(option.key as keyof PrivacySettings, e.target.value)}
                  className="w-full max-w-xs px-3 py-2 text-gray-900 bg-transparent border-none focus:outline-none font-medium text-base appearance-none cursor-pointer hover:bg-gray-50 rounded"
                >
                  {option.options.map((optionValue) => (
                    <option key={optionValue} value={optionValue}>
                      {optionValue}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
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

        {/* Information Note */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Privacy Information:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• These settings control who can interact with you and see your content</li>
            <li>• Changes take effect immediately after saving</li>
            <li>• You can update these settings at any time</li>
            <li>• Some settings may affect your visibility on the platform</li>
          </ul>
        </div>
      </div>

      {/* Popup Component */}
      <Popup popup={popup} onClose={closePopup} />
    </div>
  );
};

export default PrivacySettingsPage;