"use client";

import React, { useState, useEffect } from 'react';
import Popup, { PopupState } from '@/components/Popup';
import { getSettingsApi, updatePrivacyApi } from '@/utils/api';

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

const PrivacySettingsPage = () => {
  const [loading, setLoading] = useState(false);
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
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    const token = getToken();
    if (!token) {
      showPopup('error', 'Authentication Error', 'Please log in to view your privacy settings.');
      return;
    }

    try {
      const data = await getSettingsApi(token);
      const privacy = data.privacy || {};
      
      // Map backend privacy settings to frontend format
      setPrivacySettings({
        status: privacy.showOnlineStatus ? 'Online' : 'Offline',
        whoCanFollowMe: privacy.profileVisibility === 'public' ? 'Everyone' : 
                       privacy.profileVisibility === 'friends' ? 'Friends only' : 'No one',
        whoCanMessageMe: privacy.allowMessages ? 'Everyone' : 'Friends only',
        whoCanSeeMyFriends: 'Everyone', // Default value
        whoCanPostOnMyTimeline: 'People I Follow', // Default value
        whoCanSeeMyBirthday: privacy.showLastSeen ? 'Everyone' : 'Only me',
        confirmRequestWhenSomeoneFollowsYou: 'No', // Default value
        showMyActivities: 'Yes', // Default value
        shareMyLocationWithPublic: 'Yes', // Default value
        allowSearchEnginesToIndex: 'Yes' // Default value
      });
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      showPopup('error', 'Error', 'Failed to load privacy settings. Please try again.');
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

  const handleSettingChange = (setting: keyof PrivacySettings, value: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    const token = getToken();
    if (!token) {
      showPopup('error', 'Authentication Error', 'Please log in to save your privacy settings.');
      return;
    }

    setLoading(true);
    try {
      // Convert frontend settings to backend format
      const backendPrivacySettings = {
        profileVisibility: privacySettings.whoCanFollowMe === 'Everyone' ? 'public' :
                          privacySettings.whoCanFollowMe === 'Friends only' ? 'friends' : 'private',
        showOnlineStatus: privacySettings.status === 'Online',
        showLastSeen: privacySettings.whoCanSeeMyBirthday === 'Everyone',
        allowMessages: privacySettings.whoCanMessageMe === 'Everyone'
      };

      console.log('🔧 About to call updatePrivacyApi with token:', token ? 'Token exists' : 'No token');
      console.log('🔧 Backend privacy settings:', backendPrivacySettings);

      await updatePrivacyApi(token, backendPrivacySettings);

      showPopup('success', 'Success', 'Privacy settings saved successfully! Your profile privacy has been updated.');
      
    } catch (error: any) {
      console.error('Error saving privacy settings:', error);
      console.error('🔧 Error details:', {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method
      });
      const errorMessage = error.message || 'Failed to save privacy settings. Please try again.';
      showPopup('error', 'Error', errorMessage);
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
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Privacy Settings</h1>
        
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
            <li>• Your privacy settings are automatically applied to your profile</li>
          </ul>
        </div>
      </div>

      {/* Popup */}
      <Popup popup={popup} onClose={closePopup} />
    </div>
  );
};

export default PrivacySettingsPage;