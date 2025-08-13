'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { loginApi } from '../utils/api';
import { setToken, setAuth } from '../utils/auth';

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
        console.log('🔐 Login successful, response:', response);
        
        // Store both token and user data for proper authentication
        if (response.user) {
          // Use setAuth to store both token and user data
          setAuth(response.token, response.user);
          console.log('✅ Stored user data:', response.user);
        } else {
          // Fallback: store token and create basic user object
          const basicUser = {
            id: response.userId || response.id,
            email: formData.email.trim(),
            name: response.name || formData.email.split('@')[0]
          };
          setAuth(response.token, basicUser);
          console.log('✅ Stored basic user data:', basicUser);
        }
        
        localStorage.setItem('userEmail', formData.email.trim());
        console.log('🔑 Token stored, redirecting in 1.2 seconds...');
        
        showPopup('success', 'Login Successful!', 'Welcome back! You will be redirected to your dashboard.');
        setTimeout(() => {
          console.log('🚀 Redirecting to dashboard...');
          if (response.isSetupDone) {
            router.push('/dashboard');
          } else {
            router.push('/start-up');
          }
        }, 1200);
      } else {
        console.log('❌ Login failed, no token in response:', response);
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

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              jaifriend
            </span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect, share, and discover with friends and family. Your social world, simplified.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => { setAuthType('login'); setAuthModalOpen(true); setModalMessage(undefined); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg"
            >
              Get Started
            </button>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-lg"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Connect</h3>
            <p className="text-gray-600">Stay connected with friends and family</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Share</h3>
            <p className="text-gray-600">Share your moments and memories</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Discover</h3>
            <p className="text-gray-600">Discover new content and connections</p>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {authModalOpen && (
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
                    if (response.user) {
                      setAuth(response.token, response.user);
                    } else {
                      const basicUser = {
                        id: response.userId || response.id,
                        email: formData.email.trim(),
                        name: response.name || formData.email.split('@')[0]
                      };
                      setAuth(response.token, basicUser);
                    }
                    
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
      )}
    </div>
  );
}
