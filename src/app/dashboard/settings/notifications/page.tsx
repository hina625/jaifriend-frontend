"use client";
import React, { useState, useEffect } from 'react';

interface NotificationSettings {
  someonelikedMyPosts: boolean;
  someoneCommentedOnMyPosts: boolean;
  someoneSharedOnMyPosts: boolean;
  someoneFollowedMe: boolean;
  someoneLikedMyPages: boolean;
  someoneVisitedMyProfile: boolean;
  someoneMentionedMe: boolean;
  someoneJoinedMyGroups: boolean;
  someoneAcceptedMyFriendRequest: boolean;
  someonePostedOnMyTimeline: boolean;
}

const NotificationSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('notification');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    someonelikedMyPosts: true,
    someoneCommentedOnMyPosts: true,
    someoneSharedOnMyPosts: true,
    someoneFollowedMe: true,
    someoneLikedMyPages: true,
    someoneVisitedMyProfile: true,
    someoneMentionedMe: true,
    someoneJoinedMyGroups: true,
    someoneAcceptedMyFriendRequest: true,
    someonePostedOnMyTimeline: true,
  });

  useEffect(() => {
    // Load notification settings from API or localStorage
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('notificationSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    };
    
    loadSettings();
  }, []);

  const handleSettingChange = (setting: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage (replace with actual API call)
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
      
      console.log('Notification settings saved:', settings);
      alert('Notification settings saved successfully!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const notificationOptions = [
    { key: 'someonelikedMyPosts', label: 'Someone liked my posts' },
    { key: 'someoneCommentedOnMyPosts', label: 'Someone commented on my posts' },
    { key: 'someoneSharedOnMyPosts', label: 'Someone shared on my posts' },
    { key: 'someoneFollowedMe', label: 'Someone followed me' },
    { key: 'someoneLikedMyPages', label: 'Someone liked my pages' },
    { key: 'someoneVisitedMyProfile', label: 'Someone visited my profile' },
    { key: 'someoneMentionedMe', label: 'Someone mentioned me' },
    { key: 'someoneJoinedMyGroups', label: 'Someone joined my groups' },
    { key: 'someoneAcceptedMyFriendRequest', label: 'Someone accepted my friend/follow request' },
    { key: 'someonePostedOnMyTimeline', label: 'Someone posted on my timeline' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Notification Settings</h1>
        
        {/* Tabs */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('notification')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'notification'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Notification Settings
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ml-6 ${
              activeTab === 'email'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Email notification
          </button>
        </div>

        {/* Content */}
        {activeTab === 'notification' ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notify me when</h3>
              
              <div className="space-y-4">
                {notificationOptions.map((option) => (
                  <div key={option.key} className="flex items-center">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id={option.key}
                        checked={settings[option.key as keyof NotificationSettings]}
                        onChange={(e) => handleSettingChange(option.key as keyof NotificationSettings, e.target.checked)}
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      {settings[option.key as keyof NotificationSettings] && (
                        <svg
                          className="absolute inset-0 h-5 w-5 text-blue-600 pointer-events-none"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <label 
                      htmlFor={option.key}
                      className="ml-3 text-sm text-gray-700 cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-8 py-3 rounded-md font-medium transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Email Notifications</h3>
              <p className="text-gray-600">Email notification settings will be implemented here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettingsPage;