"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface SwitchAccountModal {
  isOpen: boolean;
}

export default function CompleteNavbar() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>({
    name: 'Waleed',
    avatar: '/avatars/1.png.png',
    balance: '$0.00',
    pokes: 0
  });
  
  const [openDropdown, setOpenDropdown] = useState<null | 'people' | 'messages' | 'notifications' | 'profile'>(null);
  const [nightMode, setNightMode] = useState(false);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  const [switchAccountModal, setSwitchAccountModal] = useState<SwitchAccountModal>({
    isOpen: false
  });

  // Load user profile from API
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:5000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setProfile(data))
        .catch(() => console.log('Profile load failed'));
    }
  }, []);

  // Load night mode preference
  useEffect(() => {
    const savedNightMode = localStorage.getItem('nightMode') === 'true';
    setNightMode(savedNightMode);
    if (savedNightMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleDropdownClick = (dropdownType: 'people' | 'messages' | 'notifications' | 'profile') => {
    setOpenDropdown(openDropdown === dropdownType ? null : dropdownType);
  };

  // Profile Functions
  const handleMyProfile = () => {
    setOpenDropdown(null);
    router.push('/dashboard/profile');
  };

  const handleSwitchAccount = () => {
    setOpenDropdown(null);
    setSwitchAccountModal({ isOpen: true });
  };

  const handleAddAccount = () => {
    setSwitchAccountModal({ isOpen: false });
    showPopup('info', 'Redirecting...', 'Taking you to the home page to add a new account.');
    setTimeout(() => {
      closePopup();
      router.push('/');
    }, 1500);
  };

  const handleUpgradeToPro = () => {
    setOpenDropdown(null);
    router.push('/dashboard/upgrade');
  };

  const handleAdvertising = () => {
    setOpenDropdown(null);
    router.push('/dashboard/advertising');
  };

  const handleSubscriptions = () => {
    setOpenDropdown(null);
    router.push('/dashboard/subscriptions');
  };

  const handlePrivacySettings = () => {
    setOpenDropdown(null);
    router.push('/dashboard/settings/privacy');
  };

  const handleGeneralSettings = () => {
    setOpenDropdown(null);
    router.push('/dashboard/settings/general');
  };

  const handleInviteFriends = () => {
    setOpenDropdown(null);
    const shareUrl = `${window.location.origin}/invite?ref=${profile.id}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join Jaifriend',
        text: 'Join me on Jaifriend - the best social platform!',
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        showPopup('success', 'Link Copied!', 'Invite link has been copied to your clipboard.');
      });
    }
  };

  const handleNightModeToggle = () => {
    const newNightMode = !nightMode;
    setNightMode(newNightMode);
    localStorage.setItem('nightMode', newNightMode.toString());
    
    if (newNightMode) {
      document.documentElement.classList.add('dark');
      showPopup('success', 'Night Mode On', 'Dark theme has been activated.');
    } else {
      document.documentElement.classList.remove('dark');
      showPopup('success', 'Night Mode Off', 'Light theme has been activated.');
    }
  };

  const handleLogout = () => {
    setOpenDropdown(null);
    showPopup('info', 'Logging Out...', 'Please wait while we log you out safely.');
    
    setTimeout(() => {
      // Clear all user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('nightMode');
      
      // Remove dark mode
      document.documentElement.classList.remove('dark');
      
      closePopup();
      
      // Show success message and redirect
      showPopup('success', 'Logged Out Successfully!', 'You have been logged out. Redirecting to home page...');
      
      setTimeout(() => {
        closePopup();
        router.push('/');
      }, 1500);
    }, 1000);
  };

  // Notification Functions
  const handleNotificationSound = () => {
    const currentSetting = localStorage.getItem('notificationSound') !== 'false';
    const newSetting = !currentSetting;
    localStorage.setItem('notificationSound', newSetting.toString());
    
    if (newSetting) {
      showPopup('success', 'Sound Enabled', 'Notification sounds have been turned on.');
    } else {
      showPopup('success', 'Sound Disabled', 'Notification sounds have been turned off.');
    }
  };

  // Balance and Pokes click handlers
  const handleBalanceClick = () => {
    setOpenDropdown(null);
    router.push('/wallet');
  };

  const handlePokesClick = () => {
    setOpenDropdown(null);
    router.push('/pokes');
  };

  return (
    <>
      {/* Success/Error Popup Modal */}
      {popup.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                {popup.type === 'success' ? (
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                ) : popup.type === 'error' ? (
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{popup.title}</h3>
                <p className="text-gray-600 mb-6">{popup.message}</p>
                
                {(popup.title !== 'Logging Out...' && popup.title !== 'Redirecting...') && (
                  <button
                    onClick={closePopup}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                      popup.type === 'success'
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : popup.type === 'error'
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Switch Account Modal */}
      {switchAccountModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="p-6">
              {/* Close button */}
              <button
                onClick={() => setSwitchAccountModal({ isOpen: false })}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ×
              </button>

              <div className="text-center pt-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a5 5 0 11-11 0 5 5 0 0111 0z"></path>
                  </svg>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Switch Account</h3>
                <p className="text-gray-600 mb-6">Would you like to add a new account?</p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleAddAccount}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200"
                  >
                    Add Account
                  </button>
                  
                  <button
                    onClick={() => setSwitchAccountModal({ isOpen: false })}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className={`w-full flex justify-center items-center px-4 py-2 z-50 fixed top-0 left-0 shadow-md border-b transition-colors ${
        nightMode 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-2 w-full max-w-5xl justify-center mx-auto">
          
          {/* Logo and App Name */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg w-8 h-8 flex items-center justify-center shadow-sm">
              <span className="text-white text-lg font-bold">J</span>
            </div>
            <span className={`text-xl font-bold text-blue-600 tracking-wide ${nightMode ? 'text-blue-400' : ''}`}>
              jaifriend
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 flex justify-center max-w-lg mx-4">
            <div className={`rounded-full px-4 py-2 w-full flex items-center gap-2 focus-within:ring-2 focus-within:ring-blue-400 transition-all ${
              nightMode 
                ? 'bg-gray-800 focus-within:bg-gray-700 text-white' 
                : 'bg-gray-100 focus-within:bg-white'
            }`}>
              <span className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-400'}`}>🔍</span>
              <input
                type="text"
                placeholder="Search for people, pages, groups and #hashtags"
                className={`bg-transparent outline-none border-none flex-1 text-sm ${
                  nightMode 
                    ? 'text-white placeholder-gray-400' 
                    : 'text-gray-700 placeholder-gray-400'
                }`}
              />
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-1 relative">
            
            {/* People Icon */}
            <div className="dropdown-container relative">
              <button
                className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
                  openDropdown === 'people' 
                    ? 'bg-blue-100 text-blue-600' 
                    : nightMode
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                onClick={() => handleDropdownClick('people')}
              >
                👥
              </button>
              
              {openDropdown === 'people' && (
                <div className={`absolute top-10 right-0 w-72 rounded-xl shadow-xl border p-4 z-50 ${
                  nightMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-100'
                }`}>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center">
                        <span className="text-purple-600 text-lg">👥</span>
                      </div>
                    </div>
                    <h3 className={`text-base font-semibold mb-1 ${nightMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      You do not have any requests
                    </h3>
                  </div>
                </div>
              )}
            </div>

            {/* Messages Icon */}
            <div className="dropdown-container relative">
              <button
                className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
                  openDropdown === 'messages' 
                    ? 'bg-blue-100 text-blue-600' 
                    : nightMode
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                onClick={() => handleDropdownClick('messages')}
              >
                💬
              </button>
              
              {openDropdown === 'messages' && (
                <div className={`absolute top-10 right-0 w-72 rounded-xl shadow-xl border p-4 z-50 ${
                  nightMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-100'
                }`}>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center">
                        <span className="text-red-500 text-lg">💬</span>
                      </div>
                    </div>
                    <h3 className={`text-base font-semibold mb-1 ${nightMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      No more message
                    </h3>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Icon */}
            <div className="dropdown-container relative">
              <button
                className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
                  openDropdown === 'notifications' 
                    ? 'bg-blue-100 text-blue-600' 
                    : nightMode
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                onClick={() => handleDropdownClick('notifications')}
              >
                🔔
              </button>
              
              {openDropdown === 'notifications' && (
                <div className={`absolute top-10 right-0 w-72 rounded-xl shadow-xl border z-50 overflow-hidden ${
                  nightMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-100'
                }`}>
                  {/* Tabs */}
                  <div className={`flex border-b ${nightMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <button className={`flex-1 px-3 py-2 text-xs font-medium ${
                      nightMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                    }`}>
                      Activities
                    </button>
                    <button className={`flex-1 px-3 py-2 text-xs font-medium text-blue-600 border-b-2 border-blue-600 ${
                      nightMode ? 'text-blue-400' : ''
                    }`}>
                      Notifications
                    </button>
                  </div>
                  
                  {/* Notification Sound Toggle */}
                  <div className={`p-3 border-b ${nightMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <button 
                      className={`flex items-center justify-between w-full rounded-lg px-2 py-1 transition-colors ${
                        nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                      onClick={handleNotificationSound}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>🔊</span>
                        <span className={`text-xs ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Turn off notification sound
                        </span>
                      </div>
                    </button>
                  </div>
                  
                  {/* No Notifications */}
                  <div className="p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3 mx-auto">
                      <span className="text-blue-600 text-lg">🔔</span>
                    </div>
                    <h3 className={`text-base font-semibold ${nightMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      You do not have any notifications
                    </h3>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="dropdown-container relative">
              <button
                className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
                  openDropdown === 'profile' 
                    ? 'border-blue-400 ring-2 ring-blue-200' 
                    : nightMode
                    ? 'border-gray-600 hover:border-gray-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleDropdownClick('profile')}
              >
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>
              
              {openDropdown === 'profile' && (
                <div className={`absolute top-10 right-0 w-64 rounded-xl shadow-xl border z-50 overflow-hidden ${
                  nightMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-100'
                }`}>
                  {/* Profile Header */}
                  <div className={`p-3 border-b ${nightMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div 
                      className={`flex items-center gap-2 cursor-pointer rounded-lg p-2 -m-2 transition-colors ${
                        nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                      onClick={handleMyProfile}
                    >
                      <img
                        src={profile.avatar}
                        alt="Profile"
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h3 className={`font-semibold text-sm ${nightMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          My Profile
                        </h3>
                        <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {profile.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <button 
                        className={`flex items-center gap-1 rounded-lg px-2 py-1 transition-colors ${
                          nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        }`}
                        onClick={handleBalanceClick}
                      >
                        <span className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>💰</span>
                        <span className={`text-xs font-medium ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {profile.balance}
                        </span>
                      </button>
                      <button 
                        className={`flex items-center gap-1 rounded-lg px-2 py-1 transition-colors ${
                          nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        }`}
                        onClick={handlePokesClick}
                      >
                        <span className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>👍</span>
                        <span className={`text-xs font-medium ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {profile.pokes} Pokes
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button 
                      className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors ${
                        nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                      onClick={handleSwitchAccount}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                        nightMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>🔄</span>
                      <span className={`text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Switch Account
                      </span>
                    </button>
                    
                    <button 
                      className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors ${
                        nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                      onClick={handleUpgradeToPro}
                    >
                      <span className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-sm">⭐</span>
                      <span className={`text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Upgrade To Pro
                      </span>
                      <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">PRO</span>
                    </button>
                    
                    <button 
                      className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors ${
                        nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                      onClick={handleAdvertising}
                    >
                      <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-sm">📢</span>
                      <span className={`text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Advertising
                      </span>
                    </button>
                    
                    <button 
                      className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors ${
                        nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                      onClick={handleSubscriptions}
                    >
                      <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-sm">📄</span>
                      <span className={`text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Subscriptions
                      </span>
                    </button>
                    
                    <button 
                      className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors ${
                        nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                      onClick={handlePrivacySettings}
                    >
                      <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-sm">🛡️</span>
                      <span className={`text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Privacy Setting
                      </span>
                    </button>
                    
                    <button 
                      className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors ${
                        nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                      onClick={handleGeneralSettings}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                        nightMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>⚙️</span>
                      <span className={`text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        General Setting
                      </span>
                    </button>
                    
                    <button 
                      className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors ${
                        nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                      onClick={handleInviteFriends}
                    >
                      <span className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-sm">📧</span>
                      <span className={`text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Invite Your Friends
                      </span>
                    </button>
                  </div>

                  {/* Bottom Section */}
                  <div className={`border-t py-1 ${nightMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <button 
                      className={`w-full px-3 py-2 flex items-center justify-between transition-colors ${
                        nightMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                      onClick={handleNightModeToggle}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-sm">🌙</span>
                        <span className={`text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Night mode
                        </span>
                      </div>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${
                        nightMode ? 'bg-blue-500' : 'bg-gray-200'
                      }`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow ${
                          nightMode ? 'translate-x-5' : 'translate-x-0.5'
                        }`}></div>
                      </div>
                    </button>
                    
                    <button 
                      className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors text-red-600 group ${
                        nightMode ? 'hover:bg-red-900' : 'hover:bg-red-50'
                      }`}
                      onClick={handleLogout}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors text-sm ${
                        nightMode ? 'bg-red-900 group-hover:bg-red-800' : 'bg-red-100 group-hover:bg-red-200'
                      }`}>🚪</span>
                      <span className="font-medium text-sm">Log Out</span>
                    </button>
                  </div>

                  {/* Footer */}
                  <div className={`px-3 py-2 text-xs ${
                    nightMode ? 'bg-gray-900 text-gray-400' : 'bg-gray-50 text-gray-500'
                  }`}>
                    <div className="mb-1">© 2025 Jaifriend</div>
                    <div className="flex items-center gap-1 mb-1">
                      <span>🌐</span>
                      <span>Language</span>
                    </div>
                    <div className="text-xs leading-tight">
                      About • Directory • Contact Us • Developers • Privacy Policy • Terms of Use • Refund
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}