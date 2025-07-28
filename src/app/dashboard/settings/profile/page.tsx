"use client";
import React, { useState, useEffect } from 'react';

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

const ProfileSettingsPage = () => {
  const [loading, setLoading] = useState(false);
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
    // Load profile settings from API or localStorage
    const loadProfileSettings = () => {
      const savedSettings = localStorage.getItem('profileSettings');
      if (savedSettings) {
        setProfileSettings(JSON.parse(savedSettings));
      }
    };
    
    loadProfileSettings();
  }, []);

  const handleInputChange = (field: keyof ProfileSettings, value: string | boolean) => {
    setProfileSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage (replace with actual API call)
      localStorage.setItem('profileSettings', JSON.stringify(profileSettings));
      
      console.log('Profile settings saved:', profileSettings);
      alert('Profile settings saved successfully!');
    } catch (error) {
      console.error('Error saving profile settings:', error);
      alert('Failed to save profile settings. Please try again.');
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
    </div>
  );
};

export default ProfileSettingsPage;