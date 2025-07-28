"use client";
import React, { useState, useEffect } from 'react';
import Popup from '@/components/Popup';

interface SocialLinks {
  facebook: string;
  twitter: string;
  vkontakte: string;
  linkedin: string;
  instagram: string;
  youtube: string;
}

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

const SocialLinksPage = () => {
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    facebook: '',
    twitter: '',
    vkontakte: '',
    linkedin: '',
    instagram: '',
    youtube: ''
  });

  useEffect(() => {
    // Load social links from API or localStorage
    const loadSocialLinks = () => {
      const savedLinks = localStorage.getItem('socialLinks');
      if (savedLinks) {
        setSocialLinks(JSON.parse(savedLinks));
      }
    };
    
    loadSocialLinks();
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

  const handleInputChange = (platform: keyof SocialLinks, value: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage (replace with actual API call)
      localStorage.setItem('socialLinks', JSON.stringify(socialLinks));
      
      console.log('Social links saved:', socialLinks);
      showPopup('success', 'Success', 'Social links saved successfully!');
    } catch (error) {
      console.error('Error saving social links:', error);
      showPopup('error', 'Error', 'Failed to save social links. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const socialPlatforms = [
    { key: 'facebook', placeholder: 'Facebook Username' },
    { key: 'twitter', placeholder: 'Twitter Username' },
    { key: 'vkontakte', placeholder: 'Vkontakte Username' },
    { key: 'linkedin', placeholder: 'LinkedIn Username' },
    { key: 'instagram', placeholder: 'Instagram Username' },
    { key: 'youtube', placeholder: 'YouTube Username' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Social Links</h1>
        
        {/* Social Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {socialPlatforms.map((platform) => (
            <div key={platform.key}>
              <input
                type="text"
                value={socialLinks[platform.key as keyof SocialLinks]}
                onChange={(e) => handleInputChange(platform.key as keyof SocialLinks, e.target.value)}
                placeholder={platform.placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
              />
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-gray-700 hover:bg-gray-800 disabled:bg-gray-600 text-white px-8 py-3 rounded-md font-medium transition-colors duration-200 disabled:cursor-not-allowed"
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

export default SocialLinksPage;