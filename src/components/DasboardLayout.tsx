"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

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

interface MenuSections {
  me: MenuItem[];
  community: MenuItem[];
  explore: MenuItem[];
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

  // Handle screen size changes
  useEffect(() => {
    const handleResize = (): void => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      
      // Auto-collapse on tablet, auto-expand on desktop
      if (width < 1024 && width >= 768) {
        setSidebarCollapsed(true);
      } else if (width >= 1024) {
        setSidebarCollapsed(false);
      }
      
      // Close mobile sidebar on resize
      if (width >= 768) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

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

  // Popup Functions
  const showPopup = (type: 'success' | 'error' | 'info', title: string, message: string): void => {
    setPopup({ isOpen: true, type, title, message });
  };

  const closePopup = (): void => {
    setPopup(prev => ({ ...prev, isOpen: false }));
  };

  // Navbar Functions
  const handleDropdownClick = (dropdownType: 'people' | 'messages' | 'notifications' | 'profile'): void => {
    setOpenDropdown(openDropdown === dropdownType ? null : dropdownType);
  };

  const handleMyProfile = (): void => {
    setOpenDropdown(null);
    router.push('/dashboard/profile');
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
        <div className="flex flex-col gap-1">
          {items.map((item) => (
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
              <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-sm shadow group-hover:scale-110 transition-transform`}>
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
      <div className={`grid gap-1 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {items.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={isMobile ? () => setSidebarOpen(false) : undefined}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 border-2 group ${
              pathname === item.href 
                ? 'bg-[#eaf0fb] border-[#022e8a] shadow scale-105 text-[#022e8a]' 
                : 'hover:bg-[#eaf0fb] border-transparent text-[#34495e]'
            }`}
          >
            <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl ${item.color} flex items-center justify-center ${isMobile ? 'text-sm' : 'text-lg'} shadow group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
            <span className="text-xs font-semibold text-center leading-tight">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
      <nav className="w-full flex justify-center items-center px-4 py-2 z-50 fixed top-0 left-0 shadow-md border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 w-full max-w-7xl justify-between mx-auto">
          
          {/* Left Side - Mobile Menu + Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
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

          {/* Center - Search Bar (Hidden on mobile) */}
          <div className="hidden md:flex flex-1 justify-center max-w-lg mx-4">
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

            {/* Desktop Icons */}
            {!isMobile && (
              <>
                {/* People Icon */}
                <div className="dropdown-container relative">
                  <button
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
                      openDropdown === 'people' 
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                    onClick={() => handleDropdownClick('people')}
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
                      openDropdown === 'messages' 
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                    onClick={() => handleDropdownClick('messages')}
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
                <div className="dropdown-container relative">
                  <button
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
                      openDropdown === 'notifications' 
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                    onClick={() => handleDropdownClick('notifications')}
                  >
                    🔔
                  </button>
                  
                  {openDropdown === 'notifications' && (
                    <div className="absolute top-10 right-0 w-72 rounded-xl shadow-xl z-50 overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                          Activities
                        </button>
                        <button className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400">
                          Notifications
                        </button>
                      </div>
                      
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <button 
                          className="flex items-center justify-between w-full rounded-lg px-2 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={handleNotificationSound}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">🔊</span>
                            <span className="text-xs text-gray-900 dark:text-white">
                              Turn off notification sound
                            </span>
                          </div>
                        </button>
                      </div>
                      
                      <div className="p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 mx-auto">
                          <span className="text-blue-600 dark:text-blue-400 text-lg">🔔</span>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          You do not have any notifications
                        </h3>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Profile Avatar */}
            <div className="dropdown-container relative">
              <button
                className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
                  openDropdown === 'profile' 
                    ? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
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
                <div className="absolute top-10 right-0 w-64 rounded-xl shadow-xl z-50 overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  {/* Profile Header */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <div 
                      className="flex items-center gap-2 cursor-pointer rounded-lg p-2 -m-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleMyProfile}
                    >
                      <img
                        src={profile.avatar}
                        alt="Profile"
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                          My Profile
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {profile.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <button 
                        className="flex items-center gap-1 rounded-lg px-2 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => router.push('/wallet')}
                      >
                        <span className="text-sm">💰</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {profile.balance}
                        </span>
                      </button>
                      <button 
                        className="flex items-center gap-1 rounded-lg px-2 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => router.push('/pokes')}
                      >
                        <span className="text-sm">👍</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {profile.pokes} Pokes
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button 
                      className="w-full px-3 py-2 text-left flex items-center gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleSwitchAccount}
                    >
                      <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm">🔄</span>
                      <span className="text-sm text-gray-900 dark:text-white">Switch Account</span>
                    </button>
                    
                    <button 
                      className="w-full px-3 py-2 text-left flex items-center gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => router.push('/dashboard/upgrade')}
                    >
                      <span className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-sm">⭐</span>
                      <span className="text-sm text-gray-900 dark:text-white">Upgrade To Pro</span>
                      <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">PRO</span>
                    </button>
                    
                    <button 
                      className="w-full px-3 py-2 text-left flex items-center gap-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => router.push('/dashboard/settings/privacy')}
                    >
                      <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-sm">🛡️</span>
                      <span className="text-sm text-gray-900 dark:text-white">Privacy Settings</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                    <button 
                      className="w-full px-3 py-2 text-left flex items-center gap-2 transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={handleLogout}
                    >
                      <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-sm">🚪</span>
                      <span className="font-medium text-sm">Log Out</span>
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400">
                    <div className="mb-1">© 2025 Jaifriend</div>
                    <div className="flex items-center gap-1 mb-1">
                      <span>🌐</span>
                      <span>Language</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Layout Container */}
      <div className="flex">
        {/* Sidebar */}
        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        {isMobile ? (
          <aside className={`fixed left-0 top-16 w-80 h-[calc(100vh-4rem)] bg-[#f4f7fb] shadow-xl overflow-y-auto flex flex-col z-40 transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="p-4 border-b border-[#eaf0fb] flex items-center justify-between">
              <h2 className="text-[#022e8a] font-bold text-lg">Menu</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto scrollbar-hide">
              {/* ME Section */}
              <div className="mb-4">
                <button 
                  onClick={() => setMeOpen(!meOpen)} 
                  className="flex items-center justify-between w-full mb-2 p-2 rounded-lg hover:bg-[#eaf0fb] transition-colors focus:outline-none"
                >
                  <h3 className="text-[#022e8a] font-bold text-sm">ME</h3>
                  <span className={`text-[#022e8a] transition-transform duration-200 ${meOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {meOpen && (
                  <div className="pl-2">
                    {renderMenuItems(menuSections.me)}
                  </div>
                )}
              </div>

              {/* COMMUNITY Section */}
              <div className="mb-4">
                <button 
                  onClick={() => setCommunityOpen(!communityOpen)} 
                  className="flex items-center justify-between w-full mb-2 p-2 rounded-lg hover:bg-[#eaf0fb] transition-colors focus:outline-none"
                >
                  <h3 className="text-[#022e8a] font-bold text-sm">COMMUNITY</h3>
                  <span className={`text-[#022e8a] transition-transform duration-200 ${communityOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {communityOpen && (
                  <div className="pl-2">
                    {renderMenuItems(menuSections.community)}
                  </div>
                )}
              </div>

              {/* EXPLORE Section */}
              <div className="mb-4">
                <button 
                  onClick={() => setExploreOpen(!exploreOpen)} 
                  className="flex items-center justify-between w-full mb-2 p-2 rounded-lg hover:bg-[#eaf0fb] transition-colors focus:outline-none"
                >
                  <h3 className="text-[#022e8a] font-bold text-sm">EXPLORE</h3>
                  <span className={`text-[#022e8a] transition-transform duration-200 ${exploreOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {exploreOpen && (
                  <div className="pl-2">
                    {renderMenuItems(menuSections.explore)}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[#eaf0fb]">
              <div className="text-xs text-[#34495e] mb-2">© 2025 Jaifriend</div>
              <div className="text-xs text-[#34495e]">🌐 Language</div>
            </div>
          </aside>
        ) : (
          <>
            {/* Collapse Toggle Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="fixed left-2 top-20 z-30 w-8 h-8 bg-[#022e8a] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#034bb3] transition-colors"
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>

            <aside className={`bg-[#f4f7fb] shadow-lg overflow-y-auto flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] transition-all duration-300 scrollbar-hide ${
              sidebarCollapsed ? 'w-16' : 'w-80'
            }`}>
              
              <div className="flex-1 p-3 overflow-y-auto scrollbar-hide">
                {/* ME Section */}
                <div className="mb-4">
                  {!sidebarCollapsed && (
                    <button 
                      onClick={() => setMeOpen(!meOpen)} 
                      className="flex items-center justify-between w-full mb-2 p-2 rounded-lg hover:bg-[#eaf0fb] transition-colors focus:outline-none"
                    >
                      <h3 className="text-[#022e8a] font-bold text-sm">ME</h3>
                      <span className={`text-[#022e8a] transition-transform duration-200 ${meOpen ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                  )}
                  {(meOpen || sidebarCollapsed) && (
                    <div className={sidebarCollapsed ? '' : 'pl-2'}>
                      {renderMenuItems(menuSections.me, sidebarCollapsed)}
                    </div>
                  )}
                </div>

                {sidebarCollapsed && <div className="border-t border-[#eaf0fb] my-2"></div>}

                {/* COMMUNITY Section */}
                <div className="mb-4">
                  {!sidebarCollapsed && (
                    <button 
                      onClick={() => setCommunityOpen(!communityOpen)} 
                      className="flex items-center justify-between w-full mb-2 p-2 rounded-lg hover:bg-[#eaf0fb] transition-colors focus:outline-none"
                    >
                      <h3 className="text-[#022e8a] font-bold text-sm">COMMUNITY</h3>
                      <span className={`text-[#022e8a] transition-transform duration-200 ${communityOpen ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                  )}
                  {(communityOpen || sidebarCollapsed) && (
                    <div className={sidebarCollapsed ? '' : 'pl-2'}>
                      {renderMenuItems(menuSections.community, sidebarCollapsed)}
                    </div>
                  )}
                </div>

                {sidebarCollapsed && <div className="border-t border-[#eaf0fb] my-2"></div>}

                {/* EXPLORE Section */}
                <div className="mb-4">
                  {!sidebarCollapsed && (
                    <button 
                      onClick={() => setExploreOpen(!exploreOpen)} 
                      className="flex items-center justify-between w-full mb-2 p-2 rounded-lg hover:bg-[#eaf0fb] transition-colors focus:outline-none"
                    >
                      <h3 className="text-[#022e8a] font-bold text-sm">EXPLORE</h3>
                      <span className={`text-[#022e8a] transition-transform duration-200 ${exploreOpen ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                  )}
                  {(exploreOpen || sidebarCollapsed) && (
                    <div className={sidebarCollapsed ? '' : 'pl-2'}>
                      {renderMenuItems(menuSections.explore, sidebarCollapsed)}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              {!sidebarCollapsed && (
                <div className="p-3 border-t border-[#eaf0fb]">
                  <div className="text-xs text-[#34495e] mb-2">© 2025 Jaifriend</div>
                  <div className="text-xs text-[#34495e]">🌐 Language</div>
                </div>
              )}
            </aside>
          </>
        )}

        {/* Main Content Area */}
        <main className={`
          flex-1 transition-all duration-300 pt-16 min-h-screen
          ${isMobile 
            ? 'ml-0' 
            : sidebarCollapsed 
              ? 'ml-16' 
              : 'ml-80'
          }
        `}>
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar { 
          display: none;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;