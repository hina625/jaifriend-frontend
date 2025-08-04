"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import DarkModeToggle from './DarkModeToggle';

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface SwitchAccountModal {
  isOpen: boolean;
}

interface Profile {
  name: string;
  avatar: string;
  balance: string;
  pokes: number;
}

interface MenuItem {
  name: string;
  icon: string;
  color: string;
  href: string;
}

interface SettingsMenuItem {
  name: string;
  icon: string;
  href: string;
}

interface MenuSections {
  me: MenuItem[];
  community: MenuItem[];
  explore: MenuItem[];
}

interface SettingsSections {
  settings: SettingsMenuItem[];
  profile: SettingsMenuItem[];
  security: SettingsMenuItem[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

type DropdownType = 'people' | 'messages' | 'notifications' | 'profile' | null;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  
  // Layout States
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Navbar States
  const [profile, setProfile] = useState<Profile>({
    name: 'Waleed',
    avatar: '/avatars/1.png.png',
    balance: '$0.00',
    pokes: 0
  });
  
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  const [switchAccountModal, setSwitchAccountModal] = useState<SwitchAccountModal>({
    isOpen: false
  });

  // Sidebar States - Default to closed for dropdown behavior
  const [communityOpen, setCommunityOpen] = useState<boolean>(false);
  const [exploreOpen, setExploreOpen] = useState<boolean>(false);
  const [meOpen, setMeOpen] = useState<boolean>(false);
  
  // Settings Sidebar States
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [profileSettingsOpen, setProfileSettingsOpen] = useState<boolean>(false);
  const [securitySettingsOpen, setSecuritySettingsOpen] = useState<boolean>(false);

  // Profile Sidebar State
  const [profileSidebarOpen, setProfileSidebarOpen] = useState<boolean>(false);

  // Check if current route is settings
  const isSettingsPage = pathname.startsWith('/dashboard/settings');

  // Handle screen size changes
  useEffect(() => {
    const handleResize = (): void => {
      const width = window.innerWidth;
      setIsMobile(width < 1024); // Changed to 1024 to include tablets in mobile layout
      
      // For mobile and tablet, start with sidebar closed
      if (width < 1024) {
        setSidebarOpen(false);
        setSidebarCollapsed(false);
      } else {
        // Desktop behavior
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent): void {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  // Auto-open settings sections when on settings page
  useEffect(() => {
    if (isSettingsPage) {
      setSettingsOpen(true);
      setProfileSettingsOpen(true);
      setSecuritySettingsOpen(true);
    }
  }, [isSettingsPage]);

  // Load user profile from API
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
              fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setProfile(data))
        .catch(() => console.log('Profile load failed'));
    }
  }, []);

  // Listen for image updates from settings page
  useEffect(() => {
    const handleImagesUpdated = () => {
      console.log('Images updated event received in DasboardLayout, refreshing profile...');
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => setProfile(data))
          .catch(() => console.log('Profile refresh failed'));
      }
    };

    const handlePrivacySettingsUpdated = () => {
      console.log('Privacy settings updated event received in DasboardLayout, refreshing profile...');
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => setProfile(data))
          .catch(() => console.log('Profile refresh failed'));
      }
    };

    const handlePasswordChanged = () => {
      console.log('Password changed event received in DasboardLayout, refreshing profile...');
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => setProfile(data))
          .catch(() => console.log('Profile refresh failed'));
      }
    };

    window.addEventListener('imagesUpdated', handleImagesUpdated);
    window.addEventListener('privacySettingsUpdated', handlePrivacySettingsUpdated);
    window.addEventListener('passwordChanged', handlePasswordChanged);

    return () => {
      window.removeEventListener('imagesUpdated', handleImagesUpdated);
      window.removeEventListener('privacySettingsUpdated', handlePrivacySettingsUpdated);
      window.removeEventListener('passwordChanged', handlePasswordChanged);
    };
  }, []);

  // Listen for profile updates from settings pages
  useEffect(() => {
    const handleProfileUpdated = () => {
      console.log('Profile updated event received in DasboardLayout, refreshing profile...');
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => setProfile(data))
          .catch(() => console.log('Profile refresh failed'));
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdated);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdated);
    };
  }, []);

  // Menu sections for sidebar
  const menuSections: MenuSections = {
    me: [
      { name: "News Feed", icon: "📰", color: "bg-orange-100", href: "/dashboard" },
      { name: "Albums", icon: "📸", color: "bg-green-100", href: "/dashboard/albums" },
      { name: "Saved Posts", icon: "🔖", color: "bg-pink-100", href: "/dashboard/saved" },
    ],
    community: [
      { name: "Watch", icon: "👁️", color: "bg-green-100", href: "/dashboard/watch" },
      { name: "Events", icon: "📅", color: "bg-red-100", href: "/dashboard/events" },
      { name: "Market", icon: "🛒", color: "bg-blue-100", href: "/dashboard/market" },
      { name: "Forum", icon: "💭", color: "bg-purple-100", href: "/dashboard/forum" },
      { name: "My Products", icon: "📦", color: "bg-cyan-100", href: "/dashboard/products" },
      { name: "My Groups", icon: "👨‍👩‍👧‍👦", color: "bg-blue-100", href: "/dashboard/groups" },
      { name: "My Pages", icon: "📄", color: "bg-orange-100", href: "/dashboard/pages" },
    ],
    explore: [
      { name: "Explore", icon: "🔍", color: "bg-purple-100", href: "/dashboard/explore" },
      { name: "Popular Posts", icon: "📈", color: "bg-yellow-100", href: "/dashboard/popular" },
      { name: "Games", icon: "🎮", color: "bg-gray-100", href: "/dashboard/games" },
      { name: "Movies", icon: "🎬", color: "bg-gray-100", href: "/dashboard/movies" },
      { name: "Jobs", icon: "💼", color: "bg-yellow-100", href: "/dashboard/jobs" },
      { name: "Offers", icon: "🎁", color: "bg-green-100", href: "/dashboard/offers" },
    ]
  };

  // Settings sections for settings sidebar
  const settingsSections: SettingsSections = {
    settings: [
      { name: "General", icon: "⚙️", href: "/dashboard/settings" },
      { name: "Notification Settings", icon: "🔔", href: "/dashboard/settings/notifications" },
      { name: "Invitation Links", icon: "🔗", href: "/dashboard/settings/invitations" },
      { name: "Social Links", icon: "📋", href: "/dashboard/settings/social" },
    ],
    profile: [
      { name: "Profile Settings", icon: "👤", href: "/dashboard/settings/profile" },
      { name: "My Addresses", icon: "📍", href: "/dashboard/settings/addresses" },
      { name: "Avatar & Cover", icon: "📸", href: "/dashboard/settings/avatar" },
      { name: "Verification", icon: "✅", href: "/dashboard/settings/verification" },
      { name: "My Information", icon: "📄", href: "/dashboard/settings/info" },
    ],
    security: [
      { name: "Privacy", icon: "🛡️", href: "/dashboard/settings/privacy" },
      { name: "Password", icon: "🔒", href: "/dashboard/settings/password" },
    ]
  };

  // Popup Functions
  const showPopup = (type: 'success' | 'error' | 'info', title: string, message: string): void => {
    setPopup({ isOpen: true, type, title, message });
  };

  const closePopup = (): void => {
    setPopup(prev => ({ ...prev, isOpen: false }));
  };

  // Navbar Functions
  const handleDropdownClick = (dropdownType: 'people' | 'messages' | 'notifications' | 'profile'): void => {
    if (dropdownType === 'profile') {
      setProfileSidebarOpen(true);
      setOpenDropdown(null);
      // Close main sidebar on mobile when opening profile sidebar
      if (isMobile) {
        setSidebarOpen(false);
      }
    } else if (dropdownType === 'notifications') {
      // Navigate to notifications page instead of showing dropdown
      router.push('/dashboard/notifications');
      setOpenDropdown(null);
    } else {
    setOpenDropdown(openDropdown === dropdownType ? null : dropdownType);
    }
  };

  const handleMyProfile = async (): Promise<void> => {
    setOpenDropdown(null);
    
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Get current user's profile to get their ID
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/profile/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          // Open profile in new tab instead of redirecting
          window.open(`/dashboard/profile/${userData.id}`, '_blank');
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
    
    // Fallback to general profile page in new tab
    window.open('/dashboard/profile', '_blank');
  };

  const handleSwitchAccount = (): void => {
    setOpenDropdown(null);
    setSwitchAccountModal({ isOpen: true });
  };

  const handleAddAccount = (): void => {
    setSwitchAccountModal({ isOpen: false });
    showPopup('info', 'Redirecting...', 'Taking you to the home page to add a new account.');
    setTimeout(() => {
      closePopup();
      router.push('/');
    }, 1500);
  };

  const handleLogout = (): void => {
    setOpenDropdown(null);
    showPopup('info', 'Logging Out...', 'Please wait while we log you out safely.');
    
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      closePopup();
      showPopup('success', 'Logged Out Successfully!', 'You have been logged out. Redirecting to home page...');
      
      setTimeout(() => {
        closePopup();
        router.push('/');
      }, 1500);
    }, 1000);
  };

  const handleNotificationSound = (): void => {
    const currentSetting = localStorage.getItem('notificationSound') !== 'false';
    const newSetting = !currentSetting;
    localStorage.setItem('notificationSound', newSetting.toString());
    
    if (newSetting) {
      showPopup('success', 'Sound Enabled', 'Notification sounds have been turned on.');
    } else {
      showPopup('success', 'Sound Disabled', 'Notification sounds have been turned off.');
    }
  };

  // Sidebar Functions
  const renderMenuItems = (items: MenuItem[], collapsed: boolean = false): React.ReactElement => {
    if (collapsed) {
      return (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200 group relative ${
                pathname === item.href 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
              title={item.name}
            >
              <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-sm group-hover:scale-110 transition-transform leading-none`}>
                {item.icon}
              </div>
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {item.name}
              </div>
            </Link>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
              pathname === item.href 
                ? 'bg-blue-50 text-blue-600' 
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center text-lg group-hover:scale-110 transition-transform leading-none`}>
              {item.icon}
            </div>
            <span className="text-sm font-medium">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    );
  };

  const renderSettingsMenuItems = (items: SettingsMenuItem[]): React.ReactElement => (
    <div className="space-y-1">
      {items.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
            pathname === item.href
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="text-lg mr-3 leading-none flex items-center justify-center w-6">{item.icon}</span>
          {item.name}
        </Link>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      {/* Popup Modals */}
      {popup.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                {popup.type === 'success' ? (
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                ) : popup.type === 'error' ? (
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{popup.title}</h3>
                <p className="mb-6 text-gray-600 dark:text-gray-300">{popup.message}</p>
                
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
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6 relative">
              <button
                onClick={() => setSwitchAccountModal({ isOpen: false })}
                className="absolute top-4 right-4 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>

              <div className="text-center pt-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a5 5 0 11-11 0 5 5 0 0111 0z"></path>
                  </svg>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Switch Account</h3>
                <p className="mb-6 text-gray-600 dark:text-gray-300">Would you like to add a new account?</p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleAddAccount}
                    className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Add Account
                  </button>
                  
                  <button
                    onClick={() => setSwitchAccountModal({ isOpen: false })}
                    className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="w-full flex justify-center items-center px-4 py-2 z-50 fixed top-0 left-0 shadow-md border-b bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 transition-colors duration-200">
        <div className="flex items-center gap-2 w-full max-w-7xl justify-between mx-auto">
          
          {/* Left Side - Mobile Menu + Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            {isMobile && (
              <button
                onClick={() => {
                  setSidebarOpen(!sidebarOpen);
                  // Close profile sidebar when opening main sidebar
                  if (!sidebarOpen) {
                    setProfileSidebarOpen(false);
                  }
                }}
                className="w-10 h-10 rounded-lg bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                ☰
              </button>
            )}
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 dark:bg-blue-500 rounded-lg w-8 h-8 flex items-center justify-center shadow-sm">
                <span className="text-white text-lg font-bold">J</span>
              </div>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400 tracking-wide hidden sm:block">
                jaifriend
              </span>
            </div>
          </div>

          {/* Center - Search Bar (Hidden on mobile and tablet) */}
          <div className="hidden lg:flex flex-1 justify-center max-w-lg mx-4">
            <div className="rounded-full px-4 py-2 w-full flex items-center gap-2 focus-within:ring-2 focus-within:ring-blue-400 transition-all bg-gray-100 dark:bg-gray-700 focus-within:bg-white dark:focus-within:bg-gray-600">
              <span className="text-sm text-gray-500 dark:text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search for people, pages, groups and #hashtags"
                className="bg-transparent outline-none border-none flex-1 text-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-1 relative">
            {/* Mobile Search Icon */}
            {isMobile && (
              <button className="w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300">
                🔍
              </button>
            )}

            {/* Desktop Icons Only */}
            {!isMobile && (
              <>
                {/* People Icon */}
                <div className="dropdown-container relative">
                  <button
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all touch-manipulation ${
                      openDropdown === 'people' 
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                    onClick={() => handleDropdownClick('people')}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      handleDropdownClick('people');
                    }}
                    style={{ touchAction: 'manipulation' }}
                  >
                    👥
                  </button>
                  
                  {openDropdown === 'people' && (
                    <div className="absolute top-10 right-0 w-72 rounded-xl shadow-xl p-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
                          <span className="text-purple-600 dark:text-purple-400 text-lg">👥</span>
                        </div>
                        <h3 className="text-base font-semibold mb-1 text-gray-900 dark:text-white">
                          You do not have any requests
                        </h3>
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages Icon */}
                <div className="dropdown-container relative">
                  <button
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all touch-manipulation ${
                      openDropdown === 'messages' 
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                    onClick={() => handleDropdownClick('messages')}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      handleDropdownClick('messages');
                    }}
                    style={{ touchAction: 'manipulation' }}
                  >
                    💬
                  </button>
                  
                  {openDropdown === 'messages' && (
                    <div className="absolute top-10 right-0 w-72 rounded-xl shadow-xl p-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
                          <span className="text-red-500 dark:text-red-400 text-lg">💬</span>
                        </div>
                        <h3 className="text-base font-semibold mb-1 text-gray-900 dark:text-white">
                          No more message
                        </h3>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notifications Icon */}
                <div className="relative">
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all touch-manipulation bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
                    onClick={() => router.push('/dashboard/notifications')}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      router.push('/dashboard/notifications');
                    }}
                    style={{ touchAction: 'manipulation' }}
                  >
                    🔔
                        </button>
                </div>
              </>
            )}

            {/* Dark Mode Toggle */}
            <DarkModeToggle size="sm" variant="icon" className="mr-2" />

            {/* Profile Avatar */}
            <div className="dropdown-container relative">
              <button
                className={`w-8 h-8 rounded-full overflow-hidden transition-all touch-manipulation ${
                  profileSidebarOpen 
                    ? 'ring-2 ring-blue-200 dark:ring-blue-800' 
                    : 'hover:ring-2 hover:ring-gray-200 dark:hover:ring-gray-600'
                }`}
                onClick={() => handleDropdownClick('profile')}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleDropdownClick('profile');
                }}
                style={{ touchAction: 'manipulation' }}
              >
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover pointer-events-none"
                />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Layout Container */}
      <div className="flex">
        {/* Sidebar */}
        {/* Mobile Sidebar Overlay */}
        {isMobile && (sidebarOpen || profileSidebarOpen) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[55]" onClick={() => {
            setSidebarOpen(false);
            setProfileSidebarOpen(false);
          }} />
        )}

        {/* Mobile Sidebar - Slide out overlay */}
        {isMobile ? (
          <>
            {/* Main Sidebar */}
            <aside className={`fixed left-0 top-0 w-64 h-screen bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 shadow-xl overflow-y-auto overflow-x-hidden flex flex-col z-[60] transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
              <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
              <h2 className="text-gray-900 dark:text-white font-bold text-lg">
                {isSettingsPage ? 'Settings' : 'Menu'}
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors text-gray-700 dark:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto scrollbar-hide">
              {isSettingsPage ? (
                <>
                  {/* Back to Dashboard */}
                  <div className="mb-4">
                                            <Link
                          href="/dashboard"
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                        >
                          <span>←</span>
                          <span>Back to Dashboard</span>
                        </Link>
                  </div>

                  {/* SETTINGS Section */}
                  <div className="mb-4">
                    <button 
                      onClick={() => setSettingsOpen(!settingsOpen)} 
                      className="flex items-center justify-between w-full mb-2 p-2 rounded-lg hover:bg-[#eaf0fb] transition-colors focus:outline-none"
                    >
                      <h3 className="text-[#022e8a] font-bold text-sm">SETTINGS</h3>
                      {!isMobile && (
                      <span className={`text-[#022e8a] transition-transform duration-200 ${settingsOpen ? 'rotate-180' : ''}`}>▼</span>
                      )}
                    </button>
                    {(settingsOpen || isMobile) && (
                      <div className="pl-2">
                        {renderSettingsMenuItems(settingsSections.settings)}
                      </div>
                    )}
                  </div>

                  {/* PROFILE Section */}
                  <div className="mb-4">
                    <button 
                      onClick={() => setProfileSettingsOpen(!profileSettingsOpen)} 
                      className="flex items-center justify-between w-full mb-2 p-2 rounded-lg hover:bg-[#eaf0fb] transition-colors focus:outline-none"
                    >
                      <h3 className="text-[#022e8a] font-bold text-sm">PROFILE</h3>
                      {!isMobile && (
                      <span className={`text-[#022e8a] transition-transform duration-200 ${profileSettingsOpen ? 'rotate-180' : ''}`}>▼</span>
                      )}
                    </button>
                    {(profileSettingsOpen || isMobile) && (
                      <div className="pl-2">
                        {renderSettingsMenuItems(settingsSections.profile)}
                      </div>
                    )}
                  </div>

                  {/* SECURITY Section */}
                  <div className="mb-4">
                    <button 
                      onClick={() => setSecuritySettingsOpen(!securitySettingsOpen)} 
                      className="flex items-center justify-between w-full mb-2 p-2 rounded-lg hover:bg-[#eaf0fb] transition-colors focus:outline-none"
                    >
                      <h3 className="text-[#022e8a] font-bold text-sm">SECURITY</h3>
                      {!isMobile && (
                      <span className={`text-[#022e8a] transition-transform duration-200 ${securitySettingsOpen ? 'rotate-180' : ''}`}>▼</span>
                      )}
                    </button>
                    {(securitySettingsOpen || isMobile) && (
                      <div className="pl-2">
                        {renderSettingsMenuItems(settingsSections.security)}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* ME Section */}
                  <div className="mb-4">
                    <button 
                      onClick={() => setMeOpen(!meOpen)} 
                      className="flex items-center justify-between w-full mb-2 p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
                    >
                      <h3 className="text-gray-900 font-semibold text-sm">ME</h3>
                      {!isMobile && (
                      <span className={`text-gray-500 transition-transform duration-200 ${meOpen ? 'rotate-180' : ''}`}>▼</span>
                      )}
                    </button>
                    {(meOpen || isMobile) && (
                      <div className="pl-2">
                        {renderMenuItems(menuSections.me)}
                      </div>
                    )}
                  </div>

                  {/* COMMUNITY Section */}
                  <div className="mb-4">
                    <button 
                      onClick={() => setCommunityOpen(!communityOpen)} 
                      className="flex items-center justify-between w-full mb-2 p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
                    >
                      <h3 className="text-gray-900 font-semibold text-sm">COMMUNITY</h3>
                      {!isMobile && (
                      <span className={`text-gray-500 transition-transform duration-200 ${communityOpen ? 'rotate-180' : ''}`}>▼</span>
                      )}
                    </button>
                    {(communityOpen || isMobile) && (
                      <div className="pl-2">
                        {renderMenuItems(menuSections.community)}
                      </div>
                    )}
                  </div>

                  {/* EXPLORE Section */}
                  <div className="mb-4">
                    <button 
                      onClick={() => setExploreOpen(!exploreOpen)} 
                      className="flex items-center justify-between w-full mb-2 p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
                    >
                      <h3 className="text-gray-900 font-semibold text-sm">EXPLORE</h3>
                      {!isMobile && (
                      <span className={`text-gray-500 transition-transform duration-200 ${exploreOpen ? 'rotate-180' : ''}`}>▼</span>
                      )}
                    </button>
                    {(exploreOpen || isMobile) && (
                      <div className="pl-2">
                        {renderMenuItems(menuSections.explore)}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">© 2025 Jaifriend</div>
              <div className="text-xs text-gray-500">🌐 Language</div>
            </div>
          </aside>

            {/* Profile Sidebar */}
            <aside className={`fixed left-0 top-0 w-80 h-screen bg-white border-r border-gray-200 shadow-xl overflow-y-auto overflow-x-hidden flex flex-col z-[60] transform transition-transform duration-300 ${
              profileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-gray-900 font-bold text-lg">Profile</h2>
                <button
                  onClick={() => setProfileSidebarOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto scrollbar-hide">
                {/* Profile Section */}
                <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={profile.avatar}
                    alt="avatar"
                    className="w-16 h-16 rounded-full border border-gray-200 object-cover"
                  />
                  <div className="flex flex-col">
                    <span 
                      className="font-semibold text-lg text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={handleMyProfile}
                    >
                      My Profile
                    </span>
                    <div className="flex gap-2 mt-2">
                      <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-medium text-gray-700 dark:text-gray-300">
                        💳 {profile.balance}
                      </span>
                      <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-medium text-gray-700 dark:text-gray-300">
                        👍 {profile.pokes} Pokes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                  <button 
                    className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-left w-full transition-colors"
                    onClick={handleSwitchAccount}
                  >
                    <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">🔄</span>
                    <span className="font-medium text-gray-900 dark:text-white">Switch Account</span>
                  </button>
                  
                  <button 
                    className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-left w-full transition-colors"
                    onClick={() => router.push('/dashboard/upgrade')}
                  >
                    <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">🛠️</span>
                    <span className="font-medium text-gray-900 dark:text-white">Upgrade To Pro</span>
                  </button>
                  
                  <button 
                    className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-left w-full transition-colors"
                    onClick={() => router.push('/dashboard/advertising')}
                  >
                    <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">📢</span>
                    <span className="font-medium text-gray-900 dark:text-white">Advertising</span>
                  </button>
                  
                  <button 
                    className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-left w-full transition-colors"
                    onClick={() => router.push('/dashboard/subscriptions')}
                  >
                    <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">💳</span>
                    <span className="font-medium text-gray-900 dark:text-white">Subscriptions</span>
                  </button>
                  
                  <div className="border-t border-gray-200 my-4"></div>
                  
                  <button 
                    className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-left w-full transition-colors"
                    onClick={() => router.push('/dashboard/settings/privacy')}
                  >
                    <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">✔️</span>
                    <span className="font-medium text-gray-900 dark:text-white">Privacy Setting</span>
                  </button>
                  
                  <button 
                    className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-left w-full transition-colors"
                    onClick={() => router.push('/dashboard/settings')}
                  >
                    <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">⚙️</span>
                    <span className="font-medium text-gray-900 dark:text-white">General Setting</span>
                  </button>
                  
                  <button 
                    className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-left w-full transition-colors"
                    onClick={() => router.push('/dashboard/invite')}
                  >
                    <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">✉️</span>
                    <span className="font-medium text-gray-900 dark:text-white">Invite Your Friends</span>
                  </button>
                  
                  <div className="border-t border-gray-200 my-4"></div>
                  
                  <div className="flex items-center gap-3 py-3 px-4">
                    <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">🌙</span>
                    <span className="font-medium flex-1 text-gray-900 dark:text-white">Night mode</span>
                    <input 
                      type="checkbox" 
                      id="night-mode-toggle-sidebar"
                      className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                      onChange={(e) => {
                        // Toggle dark mode logic here
                        console.log('Night mode toggled:', e.target.checked);
                      }}
                      aria-label="Toggle night mode"
                    />
                  </div>
                  
                  <button 
                    className="flex items-center gap-3 py-3 px-4 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-left w-full transition-colors"
                    onClick={handleLogout}
                  >
                    <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">🚪</span>
                    <span className="font-medium text-red-600 dark:text-red-400">Log Out</span>
                  </button>
                </div>

                {/* Footer */}
                <div className="mt-8 p-4 border-t border-gray-200">
                  <div className="text-xs text-gray-400 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span>© 2025 Jaifriend</span>
                      <span>•</span>
                      <button className="underline cursor-pointer hover:text-gray-600">Language</button>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button className="underline cursor-pointer hover:text-gray-600 text-xs">About</button>
                      <button className="underline cursor-pointer hover:text-gray-600 text-xs">Directory</button>
                      <button className="underline cursor-pointer hover:text-gray-600 text-xs">Contact Us</button>
                      <button className="underline cursor-pointer hover:text-gray-600 text-xs">Developers</button>
                      <button className="underline cursor-pointer hover:text-gray-600 text-xs">Privacy Policy</button>
                      <button className="underline cursor-pointer hover:text-gray-600 text-xs">Terms of Use</button>
                      <button className="underline cursor-pointer hover:text-gray-600 text-xs">Refund</button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </>
        ) : (
          <>
            {/* Collapse Toggle Button - REMOVED */}

            <aside className={`bg-white border-r border-gray-200 overflow-y-auto overflow-x-hidden flex flex-col fixed left-0 top-0 h-screen transition-all duration-300 scrollbar-hide ${
              sidebarCollapsed ? 'w-16' : 'w-64'
            }`}>
              
              <div className="flex-1 p-4 overflow-y-auto scrollbar-hide">
                {isSettingsPage ? (
                  <>
                    {!sidebarCollapsed && (
                      <div className="mb-4">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                        >
                          <span>←</span>
                          <span>Back to Dashboard</span>
                        </Link>
                      </div>
                    )}

                    {/* SETTINGS Section */}
                    <div className="mb-4">
                      {!sidebarCollapsed && (
                        <button 
                          onClick={() => setSettingsOpen(!settingsOpen)} 
                          className="flex items-center justify-between w-full mb-2 p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
                        >
                          <h3 className="text-gray-900 font-semibold text-sm">SETTINGS</h3>
                          <span className={`text-gray-500 transition-transform duration-200 ${settingsOpen ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                      )}
                      {(settingsOpen || sidebarCollapsed) && (
                        <div className={sidebarCollapsed ? '' : 'pl-2'}>
                          {sidebarCollapsed ? (
                            <div className="flex flex-col gap-1">
                              {settingsSections.settings.map((item) => (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 border-2 group relative ${
                                    pathname === item.href 
                                      ? 'bg-[#eaf0fb] border-[#022e8a] shadow scale-105' 
                                      : 'hover:bg-[#eaf0fb] border-transparent'
                                  }`}
                                  title={item.name}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-sm shadow group-hover:scale-110 transition-transform leading-none">
                                    {item.icon}
                                  </div>
                                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                    {item.name}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            renderSettingsMenuItems(settingsSections.settings)
                          )}
                        </div>
                      )}
                    </div>

                    {sidebarCollapsed && <div className="border-t border-gray-200 my-2"></div>}

                    {/* PROFILE Section */}
                    <div className="mb-4">
                      {!sidebarCollapsed && (
                        <button 
                          onClick={() => setProfileSettingsOpen(!profileSettingsOpen)} 
                          className="flex items-center justify-between w-full mb-2 p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
                        >
                          <h3 className="text-gray-900 font-semibold text-sm">PROFILE</h3>
                          <span className={`text-gray-500 transition-transform duration-200 ${profileSettingsOpen ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                      )}
                      {(profileSettingsOpen || sidebarCollapsed) && (
                        <div className={sidebarCollapsed ? '' : 'pl-2'}>
                          {sidebarCollapsed ? (
                            <div className="flex flex-col gap-1">
                              {settingsSections.profile.map((item) => (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 border-2 group relative ${
                                    pathname === item.href 
                                      ? 'bg-[#eaf0fb] border-[#022e8a] shadow scale-105' 
                                      : 'hover:bg-[#eaf0fb] border-transparent'
                                  }`}
                                  title={item.name}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-sm shadow group-hover:scale-110 transition-transform leading-none">
                                    {item.icon}
                                  </div>
                                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                    {item.name}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            renderSettingsMenuItems(settingsSections.profile)
                          )}
                        </div>
                      )}
                    </div>

                    {sidebarCollapsed && <div className="border-t border-gray-200 my-2"></div>}

                    {/* SECURITY Section */}
                    <div className="mb-4">
                      {!sidebarCollapsed && (
                        <button 
                          onClick={() => setSecuritySettingsOpen(!securitySettingsOpen)} 
                          className="flex items-center justify-between w-full mb-2 p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
                        >
                          <h3 className="text-gray-900 font-semibold text-sm">SECURITY</h3>
                          <span className={`text-gray-500 transition-transform duration-200 ${securitySettingsOpen ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                      )}
                      {(securitySettingsOpen || sidebarCollapsed) && (
                        <div className={sidebarCollapsed ? '' : 'pl-2'}>
                          {sidebarCollapsed ? (
                            <div className="flex flex-col gap-1">
                              {settingsSections.security.map((item) => (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 border-2 group relative ${
                                    pathname === item.href 
                                      ? 'bg-[#eaf0fb] border-[#022e8a] shadow scale-105' 
                                      : 'hover:bg-[#eaf0fb] border-transparent'
                                  }`}
                                  title={item.name}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-sm shadow group-hover:scale-110 transition-transform leading-none">
                                    {item.icon}
                                  </div>
                                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                    {item.name}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            renderSettingsMenuItems(settingsSections.security)
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* ME Section */}
                    <div className="mb-4">
                      <button 
                        onClick={() => setMeOpen(!meOpen)} 
                        className="flex items-center justify-between w-full mb-2 p-2 rounded-lg hover:bg-[#eaf0fb] transition-colors focus:outline-none"
                      >
                        <h3 className="text-[#022e8a] font-bold text-sm">ME</h3>
                        <span className={`text-[#022e8a] transition-transform duration-200 ${meOpen ? 'rotate-180' : ''}`}>▼</span>
                      </button>
                      <div className="pl-2">
                        {renderMenuItems(menuSections.me, sidebarCollapsed)}
                      </div>
                    </div>

                    {sidebarCollapsed && <div className="border-t border-gray-200 my-2"></div>}

                    {/* COMMUNITY Section */}
                    <div className="mb-4">
                      <button 
                        onClick={() => setCommunityOpen(!communityOpen)} 
                        className="flex items-center justify-between w-full mb-2 p-2 rounded-lg hover:bg-[#eaf0fb] transition-colors focus:outline-none"
                      >
                        <h3 className="text-[#022e8a] font-bold text-sm">COMMUNITY</h3>
                        <span className={`text-[#022e8a] transition-transform duration-200 ${communityOpen ? 'rotate-180' : ''}`}>▼</span>
                      </button>
                      <div className="pl-2">
                        {renderMenuItems(menuSections.community, sidebarCollapsed)}
                      </div>
                    </div>

                    {sidebarCollapsed && <div className="border-t border-gray-200 my-2"></div>}

                    {/* EXPLORE Section */}
                    <div className="mb-4">
                      <button 
                        onClick={() => setExploreOpen(!exploreOpen)} 
                        className="flex items-center justify-between w-full mb-2 p-2 rounded-lg hover:bg-[#eaf0fb] transition-colors focus:outline-none"
                      >
                        <h3 className="text-[#022e8a] font-bold text-sm">EXPLORE</h3>
                        <span className={`text-[#022e8a] transition-transform duration-200 ${exploreOpen ? 'rotate-180' : ''}`}>▼</span>
                      </button>
                      <div className="pl-2">
                        {renderMenuItems(menuSections.explore, sidebarCollapsed)}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              {!sidebarCollapsed && (
                <div className="p-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-2">© 2025 Jaifriend</div>
                  <div className="text-xs text-gray-500">🌐 Language</div>
                </div>
              )}
            </aside>

            {/* Desktop Profile Sidebar */}
            <aside className={`bg-white border-r border-gray-200 overflow-y-auto overflow-x-hidden flex flex-col fixed left-0 top-0 h-screen transition-all duration-300 scrollbar-hide z-[60] ${
              profileSidebarOpen ? 'w-80' : 'w-0'
            }`}>
              {profileSidebarOpen && (
                <>
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-gray-900 font-bold text-lg">Profile</h2>
                    <button
                      onClick={() => setProfileSidebarOpen(false)}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto scrollbar-hide">
                    {/* Profile Section */}
                    <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={profile.avatar}
                        alt="avatar"
                        className="w-16 h-16 rounded-full border border-gray-200 object-cover"
                      />
                      <div className="flex flex-col">
                        <span 
                          className="font-semibold text-lg text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={handleMyProfile}
                        >
                          My Profile
                        </span>
                        <div className="flex gap-2 mt-2">
                          <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-medium text-gray-700 dark:text-gray-300">
                            💳 {profile.balance}
                          </span>
                          <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-medium text-gray-700 dark:text-gray-300">
                            👍 {profile.pokes} Pokes
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-2">
                      <button 
                        className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-left w-full transition-colors"
                        onClick={handleSwitchAccount}
                      >
                        <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">🔄</span>
                        <span className="font-medium text-gray-900 dark:text-white">Switch Account</span>
                      </button>
                      
                      <button 
                        className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-left w-full transition-colors"
                        onClick={() => router.push('/dashboard/upgrade')}
                      >
                        <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">🛠️</span>
                        <span className="font-medium text-gray-900 dark:text-white">Upgrade To Pro</span>
                      </button>
                      
                      <button 
                        className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-left w-full transition-colors"
                        onClick={() => router.push('/dashboard/advertising')}
                      >
                        <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">📢</span>
                        <span className="font-medium text-gray-900 dark:text-white">Advertising</span>
                      </button>
                      
                      <button 
                        className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-left w-full transition-colors"
                        onClick={() => router.push('/dashboard/subscriptions')}
                      >
                        <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">💳</span>
                        <span className="font-medium text-gray-900 dark:text-white">Subscriptions</span>
                      </button>
                      
                      <div className="border-t border-gray-200 my-4"></div>
                      
                      <button 
                        className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-left w-full transition-colors"
                        onClick={() => router.push('/dashboard/settings/privacy')}
                      >
                        <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">✔️</span>
                        <span className="font-medium text-gray-900 dark:text-white">Privacy Setting</span>
                      </button>
                      
                      <button 
                        className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-left w-full transition-colors"
                        onClick={() => router.push('/dashboard/settings')}
                      >
                        <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">⚙️</span>
                        <span className="font-medium text-gray-900 dark:text-white">General Setting</span>
                      </button>
                      
                      <button 
                        className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-left w-full transition-colors"
                        onClick={() => router.push('/dashboard/invite')}
                      >
                        <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">✉️</span>
                        <span className="font-medium text-gray-900 dark:text-white">Invite Your Friends</span>
                      </button>
                      
                      <div className="border-t border-gray-200 my-4"></div>
                      
                      <div className="flex items-center gap-3 py-3 px-4">
                        <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">🌙</span>
                        <span className="font-medium flex-1 text-gray-900 dark:text-white">Night mode</span>
                        <input 
                          type="checkbox" 
                          id="night-mode-toggle-desktop"
                          className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                          onChange={(e) => {
                            // Toggle dark mode logic here
                            console.log('Night mode toggled:', e.target.checked);
                          }}
                          aria-label="Toggle night mode"
                        />
                      </div>
                      
                      <button 
                        className="flex items-center gap-3 py-3 px-4 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-left w-full transition-colors"
                        onClick={handleLogout}
                      >
                        <span className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-lg">🚪</span>
                        <span className="font-medium text-red-600 dark:text-red-400">Log Out</span>
                      </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 p-4 border-t border-gray-200">
                      <div className="text-xs text-gray-400 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span>© 2025 Jaifriend</span>
                          <span>•</span>
                          <button className="underline cursor-pointer hover:text-gray-600">Language</button>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <button className="underline cursor-pointer hover:text-gray-600 text-xs">About</button>
                          <button className="underline cursor-pointer hover:text-gray-600 text-xs">Directory</button>
                          <button className="underline cursor-pointer hover:text-gray-600 text-xs">Contact Us</button>
                          <button className="underline cursor-pointer hover:text-gray-600 text-xs">Developers</button>
                          <button className="underline cursor-pointer hover:text-gray-600 text-xs">Privacy Policy</button>
                          <button className="underline cursor-pointer hover:text-gray-600 text-xs">Terms of Use</button>
                          <button className="underline cursor-pointer hover:text-gray-600 text-xs">Refund</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </aside>
          </>
        )}

        {/* Main Content Area */}
        <main className={`
          flex-1 transition-all duration-300 min-h-screen overflow-x-hidden bg-gray-50 dark:bg-dark-900
          ${isMobile 
            ? 'ml-0 pb-20' 
            : sidebarCollapsed 
              ? 'ml-16' 
              : 'ml-64'
          }
          ${!isMobile && profileSidebarOpen ? 'ml-80' : ''}
        `}>
          <div className="w-full h-full overflow-x-hidden pt-16">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700 z-50 overflow-x-hidden transition-colors duration-200">
          <div className="flex justify-around items-center py-2 w-full max-w-full">
            <Link
              href="/dashboard"
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                pathname === '/dashboard' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <span className="text-xl mb-1">🏠</span>
              <span className="text-xs font-medium">Home</span>
            </Link>
            
            <Link
              href="/dashboard/find-friends"
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                pathname === '/dashboard/find-friends' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <span className="text-xl mb-1">👥</span>
              <span className="text-xs font-medium">Friends</span>
            </Link>
            
            <Link
              href="/dashboard/messages"
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                pathname === '/dashboard/messages' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <span className="text-xl mb-1">💬</span>
              <span className="text-xs font-medium">Messages</span>
            </Link>
            
            <Link
              href="/dashboard/notifications"
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                pathname === '/dashboard/notifications' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <span className="text-xl mb-1">🔔</span>
              <span className="text-xs font-medium">Notifications</span>
            </Link>
            
            <div className="dropdown-container relative z-[60]">
              <button
                className={`flex flex-col items-center p-2 rounded-lg transition-colors touch-manipulation ${
                  profileSidebarOpen 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
                onClick={() => handleDropdownClick('profile')}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleDropdownClick('profile');
                }}
                style={{ touchAction: 'manipulation' }}
            >
              <img
                src={profile.avatar}
                alt="Profile"
                  className="w-6 h-6 rounded-full mb-1 object-cover pointer-events-none"
              />
              <span className="text-xs font-medium">Profile</span>
              </button>
            </div>
          </div>
        </nav>
      )}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar { 
          display: none;
        }
        
        /* Hide scrollbars for sidebar specifically */
        aside .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        aside .scrollbar-hide::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        
        /* Hide horizontal scrollbars */
        aside .scrollbar-hide::-webkit-scrollbar:horizontal {
          display: none;
          height: 0;
        }
        
        /* Hide vertical scrollbars */
        aside .scrollbar-hide::-webkit-scrollbar:vertical {
          display: none;
          width: 0;
        }
        
        /* Ensure sidebar content doesn't overflow horizontally */
        aside {
          overflow-x: hidden;
        }
        
        /* Hide scrollbars for all sidebar elements */
        aside * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        aside *::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        
        /* Mobile touch improvements */
        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Ensure dropdowns are properly positioned on mobile */
        @media (max-width: 640px) {
          .dropdown-container {
            position: relative;
          }
          
          .dropdown-container > div {
            position: absolute;
            right: 0;
            top: 100%;
            margin-top: 0.5rem;
            z-index: 50;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;