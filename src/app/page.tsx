'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { loginApi } from '../utils/api';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
import { setToken } from '../utils/auth';
import AuthGuard from '../components/AuthGuard';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface FormData {
  email: string;
  password: string;
  rememberDevice: boolean;
  username?: string;
  confirmPassword?: string;
}

interface Avatar {
  img: string;
  name: string;
  profileLink: string;
  isCustom?: boolean;
}

interface AvatarUploadModal {
  isOpen: boolean;
  name: string;
  profileLink: string;
  imageFile: File | null;
  imagePreview: string;
}

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
}

// Modal Component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  message?: { text: string; type: 'success' | 'error' | 'info' };
  children: React.ReactNode;
}> = ({ isOpen, onClose, message, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
        {message && (
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              {message.type === 'success' ? (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              ) : message.type === 'error' ? (
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
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {message.type === 'success' ? 'Success!' : 
                 message.type === 'error' ? 'Error!' : 'Information'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-base">{message.text}</p>
              
              <button
                onClick={onClose}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 text-base ${
                  message.type === 'success'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : message.type === 'error'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {message.type === 'success' ? 'Continue' : 'Try Again'}
              </button>
            </div>
          </div>
        )}

        {!message && (
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              ×
            </button>

            <div className="p-6 pt-12">
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Home(): React.ReactElement {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const [loginType, setLoginType] = useState<'username' | 'social'>('username');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberDevice: false,
    username: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [avatarModal, setAvatarModal] = useState<AvatarUploadModal>({
    isOpen: false,
    name: '',
    profileLink: '',
    imageFile: null,
    imagePreview: ''
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'register'>('login');
  const [modalMessage, setModalMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | undefined>(undefined);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const [avatars, setAvatars] = useState<Avatar[]>([
    { img: '👩🏻‍💼', name: 'Sarah Johnson', profileLink: '/profile/sarah-johnson' },
    { img: '👨🏻‍🦳', name: 'Michael Chen', profileLink: '/profile/michael-chen' },
    { img: '👩🏻', name: 'Emma Wilson', profileLink: '/profile/emma-wilson' },
    { img: '👩🏻‍🦰', name: 'Lisa Rodriguez', profileLink: '/profile/lisa-rodriguez' },
    { img: '👨🏻‍💼', name: 'David Kim', profileLink: '/profile/david-kim' },
    { img: '👩🏻‍🦱', name: 'Maya Patel', profileLink: '/profile/maya-patel' },
    { img: '🏢', name: 'TechCorp Inc', profileLink: '/profile/techcorp-inc' },
    { img: '👨🏻', name: 'Alex Thompson', profileLink: '/profile/alex-thompson' }
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showPopup = (type: 'success' | 'error', title: string, message: string) => {
    setPopup({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closePopup = () => {
    setPopup(prev => ({ ...prev, isOpen: false }));
    if (popup.type === 'success') {
      setAuthModalOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault(); // Prevent default form submission
    // Validate form fields before API call
    if (!formData.email.trim()) {
      showPopup('error', 'Validation Error', 'Please enter your email.');
      return;
    }
    
    if (!formData.password.trim()) {
      showPopup('error', 'Validation Error', 'Please enter your password.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Use actual API call instead of simulation
      const response = await loginApi({
        email: formData.email.trim(),
        password: formData.password.trim()
      });
      
      if (response?.token) {
        // Store token using auth utility
        setToken(response.token);
        localStorage.setItem('userEmail', formData.email.trim());
        
        // Store user data in localStorage for avatar and other user info
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          console.log('🔍 Login - Stored user data in localStorage:', response.user);
        }
        
        showPopup('success', 'Login Successful!', 'Welcome back! You will be redirected to your dashboard.');
        setTimeout(() => {
          if (response.isSetupDone) {
            router.push('/dashboard');
          } else {
            router.push('/start-up');
          }
        }, 1200);
      } else {
        showPopup('error', 'Login Failed', 'Invalid credentials. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Login failed. Please try again.';
      showPopup('error', 'Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarModalChange = (field: keyof AvatarUploadModal, value: any): void => {
    setAvatarModal(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarModal(prev => ({
          ...prev,
          imageFile: file,
          imagePreview: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAvatar = (): void => {
    if (avatarModal.name && avatarModal.profileLink && avatarModal.imagePreview) {
      const newAvatar: Avatar = {
        img: avatarModal.imagePreview,
        name: avatarModal.name,
        profileLink: avatarModal.profileLink,
        isCustom: true
      };
      
      setAvatars(prev => [...prev, newAvatar]);
      setAvatarModal({
        isOpen: false,
        name: '',
        profileLink: '',
        imageFile: null,
        imagePreview: ''
      });
    }
  };

  const closeModal = (): void => {
    setAvatarModal({
      isOpen: false,
      name: '',
      profileLink: '',
      imageFile: null,
      imagePreview: ''
    });
  };

  const trendingTags: string[] = ['#game', '#double', '#online', '#bifold', '#glass'];

  return (
    <AuthGuard requireAuth={false} redirectTo="/dashboard">
      <div className={`w-full min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'} overflow-x-hidden`}>
        {/* Standalone Popup Modal */}
        {popup.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  {popup.type === 'success' ? (
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{popup.title}</h3>
                  <p className="text-gray-600 mb-6 text-base">{popup.message}</p>
                  
                  <button
                    onClick={closePopup}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 text-base ${
                      popup.type === 'success'
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {popup.type === 'success' ? 'Continue' : 'Try Again'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className={`sticky top-0 z-40 backdrop-blur-md border-b w-full transition-colors duration-200 ${
          isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'
        }`}>
          <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3 w-full">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm sm:text-base">J</span>
              </div>
              <span className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>jaifriend</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => { setAuthType('login'); setAuthModalOpen(true); setModalMessage(undefined); }}
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-blue-400' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => router.push('/register')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
              >
                Register
              </button>
            </div>
          </div>
        </header>

        {/* Avatar Upload Modal */}
        {avatarModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Add Your Avatar</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    {avatarModal.imagePreview ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                        <img 
                          src={avatarModal.imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-500 text-xs">No image</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={avatarModal.name}
                    onChange={(e) => handleAvatarModalChange('name', e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Link
                  </label>
                  <input
                    type="text"
                    value={avatarModal.profileLink}
                    onChange={(e) => handleAvatarModalChange('profileLink', e.target.value)}
                    placeholder="/profile/your-username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAvatar}
                    disabled={!avatarModal.name || !avatarModal.profileLink || !avatarModal.imagePreview}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Add Avatar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="w-full px-4 py-8 lg:py-12 box-border">
          {/* Hero Section */}
          <div className="text-center mb-12 lg:mb-16">
            <p className="text-blue-400 font-medium mb-4 tracking-wide text-sm sm:text-base">WELCOME!</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-blue-500 mb-8 lg:mb-10 leading-tight px-2">
              Connect with your family and friends
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>and share your moments.
            </h1>
            
            {/* Avatar Images */}
            <div className="flex justify-center items-center space-x-2 sm:space-x-3 mb-6 overflow-x-auto pb-2 px-4">
              {avatars.map((avatar: Avatar, i: number) => (
                <button key={i} className="group relative">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform duration-300 shadow-lg border-2 border-gray-100 overflow-hidden">
                    {avatar.isCustom ? (
                      <img 
                        src={avatar.img} 
                        alt={avatar.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg sm:text-xl md:text-2xl">{avatar.img}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                    {avatar.name}
                  </div>
                </button>
              ))}
              
              {/* Add Avatar Button */}
              <button
                onClick={() => setAvatarModal({ ...avatarModal, isOpen: true })}
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform duration-300 shadow-lg border-2 border-blue-200 group relative"
              >
                <span className="text-white text-xl sm:text-2xl font-bold">+</span>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                  Add Your Avatar
                </div>
              </button>
            </div>

            {/* Avatar Names */}
            <div className="flex justify-center items-center space-x-3 sm:space-x-4 mb-8 overflow-x-auto pb-2 px-4">
              {avatars.slice(0, 4).map((avatar: Avatar, i: number) => (
                <button key={i} className="text-sm text-gray-600 hover:text-blue-500 transition-colors flex-shrink-0 font-medium">
                  {avatar.name}
                </button>
              ))}
              {avatars.length > 4 && (
                <span className="text-sm text-gray-400">
                  +{avatars.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Login Form */}
          <div className="w-full bg-white dark:bg-dark-800 rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 mb-12 lg:mb-16 border border-gray-100 dark:border-dark-700 transition-colors duration-200">
            <div className="flex mb-8 w-full max-w-md mx-auto">
              <button
                className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-300 relative ${
                  loginType === 'username'
                    ? 'text-gray-900 bg-gray-100 rounded-lg'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setLoginType('username')}
              >
                Email Login
              </button>
              <button
                className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-300 relative ${
                  loginType === 'social'
                    ? 'text-gray-900 bg-gray-100 rounded-lg'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setLoginType('social')}
              >
                Social login
              </button>
            </div>

            {loginType === 'username' ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-6 xl:items-end">
                  <div className="xl:col-span-1">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-dark-600 transition-all duration-300 text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base"
                      required
                    />
                  </div>
                  
                  <div className="relative xl:col-span-1">
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-dark-600 pr-12 transition-all duration-300 text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>

                  <div className="xl:col-span-1">
                    <button
                      type="submit"
                      disabled={isLoading || !formData.email.trim() || !formData.password.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-xl text-base"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Logging in...
                        </div>
                      ) : (
                        'Login'
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-start pt-2">
                  <input
                    type="checkbox"
                    name="rememberDevice"
                    id="rememberDevice"
                    checked={formData.rememberDevice}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="rememberDevice" className="ml-3 text-sm sm:text-base text-gray-600 font-medium">
                    Remember this device
                  </label>
                </div>
              </form>
            ) : (
              <div className="space-y-4 w-full max-w-md mx-auto">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-base">
                  Continue with Facebook
                </button>
                <button className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-base">
                  Continue with Google
                </button>
                <button className="w-full bg-gray-800 hover:bg-gray-900 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-base">
                  Continue with Apple
                </button>
              </div>
            )}
          </div>

          {/* Features Section */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-12 lg:mb-16 w-full">
            <div className="space-y-8 order-2 lg:order-1">
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-3 text-lg tracking-wide">SHARE</h3>
                  <p className="text-gray-600 leading-relaxed text-base">Share what's new and life moments with your friends.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-3 text-lg tracking-wide">DISCOVER</h3>
                  <p className="text-gray-600 leading-relaxed text-base">Discover new people, create new connections and make new friends.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-3 text-lg tracking-wide">100% PRIVACY</h3>
                  <p className="text-gray-600 leading-relaxed text-base">You have full control over your personal information that you share.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-3 text-lg tracking-wide">MORE SECURITY</h3>
                  <p className="text-gray-600 leading-relaxed text-base">Your account is fully secure. We never share your data with third party.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-6 order-1 lg:order-2 w-full">
              {/* Feature Icons - Top Row */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cyan-200 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-300 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-pink-200 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>

              {/* Middle Row */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-300 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-300 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-300 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>

              {/* Bottom Row */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-300 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-pink-300 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-pink-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cyan-300 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h3v4h2v-7.5c0-.83.67-1.5 1.5-1.5S12 9.67 12 10.5V11h2.5c.83 0 1.5.67 1.5 1.5V18h2v-5.5c0-1.1-.9-2-2-2H13.5v-.5c0-1.38-1.12-2.5-2.5-2.5S8.5 8.62 8.5 10v.5H7c-.55 0-1 .45-1 1V18H4z"/>
                </svg>
              </div>
            </div>
          </div>
        </main>

        {/* Trending Section - Full Width */}
        <section className="bg-green-50 py-12 lg:py-16 w-full">
          <div className="px-4 sm:px-6 lg:px-8 text-center w-full box-border">
            <p className="text-gray-500 font-medium mb-6 tracking-wider text-sm sm:text-base uppercase">TRENDING !</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 mb-12 lg:mb-16 leading-tight px-2">
              See what people are talking about.
            </h2>
            
            <div className="space-y-2 lg:space-y-3 text-center">
              {trendingTags.map((tag: string, index: number) => (
                <div 
                  key={tag} 
                  className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-green-300 opacity-70 hover:opacity-100 hover:text-green-400 cursor-pointer transition-all duration-500 px-2"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    letterSpacing: '0.02em'
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Discover Section */}
        <div className="w-full px-4 py-12 lg:py-16 box-border">
          <div className="bg-white rounded-3xl shadow-lg p-8 lg:p-10 text-center mb-12 lg:mb-16 w-full">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-8">Discover Jaifriend</h2>
            <div className="flex justify-center space-x-8 lg:space-x-12">
              <div className="text-center">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <span className="text-white text-2xl lg:text-3xl">🔍</span>
                </div>
                <p className="font-medium text-gray-700 text-lg">Explore</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <span className="text-white text-2xl lg:text-3xl">💬</span>
                </div>
                <p className="font-medium text-gray-700 text-lg">Forum</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white py-8 lg:py-10 border-t border-gray-200 w-full">
          <div className="px-4 w-full box-border">
            <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-6 text-sm lg:text-base text-gray-600">
              <span>© 2025 Jaifriend</span>
              <button className="hover:text-blue-500 transition-colors">Terms of Use</button>
              <button className="hover:text-blue-500 transition-colors">Privacy Policy</button>
              <button className="hover:text-blue-500 transition-colors">Contact Us</button>
              <button className="hover:text-blue-500 transition-colors">About</button>
              <button className="hover:text-blue-500 transition-colors">Directory</button>
              <button className="hover:text-blue-500 transition-colors">Forum</button>
              <button className="hover:text-blue-500 transition-colors">🌐 Language</button>
            </div>
          </div>
        </footer>

        {/* Auth Modal (Only for Login now) */}
        <Modal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} message={modalMessage}>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h2>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-300 text-gray-700 placeholder-gray-400 text-base"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-300 text-gray-700 placeholder-gray-400 text-base"
              required
            />
            <button
              onClick={() => {
                // Validate form fields before API call
                if (!formData.email.trim()) {
                  setModalMessage({ text: 'Please enter your email.', type: 'error' });
                  return;
                }
                
                if (!formData.password.trim()) {
                  setModalMessage({ text: 'Please enter your password.', type: 'error' });
                  return;
                }

                setIsLoading(true);
                setModalMessage(undefined);
                
                // Use actual API call for modal login
                loginApi({
                  email: formData.email.trim(),
                  password: formData.password.trim()
                })
                .then(response => {
                  if (response?.token) {
                    setToken(response.token);
                    localStorage.setItem('userEmail', formData.email.trim());
                    
                    setModalMessage({ text: 'Login successful! Redirecting...', type: 'success' });
                    setTimeout(() => {
                      if (response.isSetupDone) {
                        router.push('/dashboard');
                      } else {
                        router.push('/start-up');
                      }
                    }, 1200);
                  } else {
                    setModalMessage({ text: 'Invalid credentials. Please try again.', type: 'error' });
                  }
                })
                .catch(error => {
                  console.error('Login error:', error);
                  const errorMessage = error?.response?.data?.message || error?.message || 'Login failed. Please try again.';
                  setModalMessage({ text: errorMessage, type: 'error' });
                })
                .finally(() => {
                  setIsLoading(false);
                });
              }}
              disabled={isLoading || !formData.email.trim() || !formData.password.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-xl text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                'Login'
              )}
            </button>
            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">Don't have an account?{' '}
                <button 
                  type="button" 
                  className="text-blue-500 hover:underline font-medium" 
                  onClick={() => {
                    setAuthModalOpen(false);
                    router.push('/register');
                  }}
                >
                  Register
                </button>
              </span>
            </div>
          </div>
        </Modal>
      </div>
    </AuthGuard>
  );
}
