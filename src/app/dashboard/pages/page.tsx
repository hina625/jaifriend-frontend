"use client";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, ArrowLeft, ArrowRight, ThumbsUp, Camera, Users, Menu, X, Search, Heart, MessageCircle, Share2, Globe, Calendar, Users2, Star } from 'lucide-react';

interface Tab {
  name: string;
  active: boolean;
}

interface FormData {
  pageName: string;
  pageURL: string;
  pageDescription: string;
  pageCategory: string;
}

interface Page {
  _id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  createdBy: {
    _id: string;
    name: string;
    username: string;
    avatar: string;
  };
  creatorName: string;
  creatorAvatar: string;
  likes: string[];
  followers: string[];
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

interface SuggestedPage {
  id: number;
  name: string;
  likes: number;
  category: string;
  icon: string;
  color: string;
}

interface MyPagesComponentProps {
  loading: boolean;
  userPages: Page[];
  onCreate: () => void;
  onOpenPage: (id: string) => void;
}

interface CreatePageFormProps {
  formData: FormData;
  categories: string[];
  creating: boolean;
  isFormValid: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onCreate: () => void;
  onGoBack: () => void;
}

interface SuggestedPagesComponentProps {
  suggestedPages: SuggestedPage[];
  onLike: (id: number) => void;
}

// Top-level components to prevent remount on each parent render
const MyPagesView: React.FC<MyPagesComponentProps> = ({ loading, userPages, onCreate, onOpenPage }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 min-h-80 flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-gray-500 text-lg font-medium">Loading your pages...</p>
      </div>
    );
  }

  if (userPages.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 min-h-80 flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center mb-6">
          <FileText className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">No pages yet</h3>
        <p className="text-gray-500 text-center mb-8 max-w-md">
          Create your first page to start building your online presence and connect with your audience.
        </p>
        <button
          onClick={onCreate}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Create New Page
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Your Pages</h3>
          <p className="text-gray-500 mt-1">{userPages.length} page{userPages.length !== 1 ? 's' : ''} • Click any page to open it</p>
        </div>
        <button
          onClick={onCreate}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Page
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {userPages.map((page) => (
          <div 
            key={page._id} 
            onClick={() => onOpenPage(page._id)}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer"
          >
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                  <FileText className="w-7 h-7 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 text-lg truncate">{page.name}</h4>
                    {page.isVerified && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Star className="w-3 h-3 text-white fill-current" />
                      </div>
                    )}
                </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">@{page.url}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-base mb-4 leading-relaxed line-clamp-3">{page.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200">
                  {page.category}
                </span>
                <div className="flex items-center gap-1 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{new Date(page.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="font-medium">{page.likes.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users2 className="w-4 h-4 text-blue-400" />
                    <span className="font-medium">{page.followers.length}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <div className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CreatePageFormView: React.FC<CreatePageFormProps> = ({ formData, categories, creating, isFormValid, onInputChange, onCreate, onGoBack }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-3xl mx-auto shadow-lg">
    {/* Form Header */}
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create New Page</h2>
          <p className="text-gray-500 mt-1">Build your online presence</p>
        </div>
      </div>
      <button
        onClick={onGoBack}
        className="sm:hidden p-3 hover:bg-gray-100 rounded-xl transition-colors"
      >
        <X className="w-6 h-6 text-gray-600" />
      </button>
    </div>

    <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
      {/* Page Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Page Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="pageName"
          value={formData.pageName}
          onChange={onInputChange}
          placeholder="Enter your page name"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          data-lpignore="true"
          data-form-type="other"
          className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200 ${
            formData.pageName.length > 0 
              ? formData.pageName.length >= 3 
                ? 'border-green-300 bg-green-50' 
                : 'border-red-300 bg-red-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        />
        {formData.pageName.length > 0 && (
          <div className={`text-sm mt-2 ${
            formData.pageName.length >= 3 ? 'text-green-600' : 'text-red-500'
          }`}>
            {formData.pageName.length >= 3 
              ? '✓ Page name is valid' 
              : `Page name must be at least 3 characters (${formData.pageName.length}/3)`
            }
          </div>
        )}
      </div>

      {/* Page URL */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Page URL <span className="text-red-500">*</span></label>
        <div className="flex">
          <span className="inline-flex items-center px-4 py-4 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium">
            https://jaifriend.com/
          </span>
          <input
            type="text"
            name="pageURL"
            value={formData.pageURL}
            onChange={onInputChange}
            placeholder="your-page-url"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-lpignore="true"
            data-form-type="other"
            className={`flex-1 p-4 border rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200 ${
              formData.pageURL.length > 0 
                ? formData.pageURL.length >= 3 && /^[a-z0-9-]+$/.test(formData.pageURL)
                  ? 'border-green-300 bg-green-50' 
                  : 'border-red-300 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          />
        </div>
        {formData.pageURL.length > 0 && (
          <div className={`text-sm mt-2 ${
            formData.pageURL.length >= 3 && /^[a-z0-9-]+$/.test(formData.pageURL) ? 'text-green-600' : 'text-red-500'
          }`}>
            {formData.pageURL.length >= 3 && /^[a-z0-9-]+$/.test(formData.pageURL)
              ? '✓ URL is valid' 
              : formData.pageURL.length < 3
              ? `URL must be at least 3 characters (${formData.pageURL.length}/3)`
              : 'URL can only contain lowercase letters, numbers, and hyphens'
            }
          </div>
        )}
      </div>

      {/* Page Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Page Description <span className="text-red-500">*</span></label>
        <textarea
          name="pageDescription"
          value={formData.pageDescription}
          onChange={onInputChange}
          rows={4}
          placeholder="Describe what your page is about..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          data-lpignore="true"
          data-form-type="other"
          className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base transition-all duration-200 ${
            formData.pageDescription.length > 0 
              ? formData.pageDescription.length >= 10 && formData.pageDescription.length <= 200
                ? 'border-green-300 bg-green-50' 
                : 'border-red-300 bg-red-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        />
        <div className="flex items-center justify_between mt-2">
          <p className="text-sm text-gray-500">
            Between 10 and 200 characters
          </p>
          <span className={`${'text-sm font-medium'} ${
            formData.pageDescription.length > 200 ? 'text-red-500' : 
            formData.pageDescription.length >= 10 ? 'text-green-500' : 'text-gray-400'
          }`}>
            {formData.pageDescription.length}/200
          </span>
        </div>
        {formData.pageDescription.length > 0 && (
          <div className={`text-sm mt-2 ${
            formData.pageDescription.length >= 10 && formData.pageDescription.length <= 200 ? 'text-green-600' : 'text-red-500'
          }`}>
            {formData.pageDescription.length >= 10 && formData.pageDescription.length <= 200
              ? '✓ Description is valid' 
              : formData.pageDescription.length < 10
              ? `Description must be at least 10 characters (${formData.pageDescription.length}/10)`
              : 'Description must be less than 200 characters'
            }
          </div>
        )}
      </div>

      {/* Page Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Page Category <span className="text-red-500">*</span></label>
        <select
          name="pageCategory"
          value={formData.pageCategory}
          onChange={onInputChange}
          className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200 hover:border-gray-300"
        >
          {categories.map((category: string) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-2">
          Choose the category that best describes your page
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4 mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={onGoBack}
          disabled={creating}
          className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 px-6 py-3 rounded-xl hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5" />
          Go back
        </button>
        <button
          onClick={onCreate}
          disabled={creating || !isFormValid}
          className="w-full sm:w-auto bg-gradient_to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
        >
          {creating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Page...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Create Page
            </>
          )}
        </button>
      </div>
    </form>
  </div>
);

const SuggestedPagesView: React.FC<SuggestedPagesComponentProps> = ({ suggestedPages, onLike }) => (
  <div className="space-y-8">
    {/* Promoted Section */}
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Promoted Pages</h3>
      <div className="bg-white rounded-2xl border border-gray-100 min-h-32 flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-orange-500" />
        </div>
        <p className="text-gray-500 text-lg font-medium">No promoted pages available</p>
      </div>
    </div>

    {/* Suggested Pages List */}
    <div>
      <h3 className="text-xl font-bold text_gray-900 mb-6">Suggested Pages</h3>
      <p className="text-gray-500 mb-4">Click any page to view details</p>
      <div className="space-y-4">
        {suggestedPages.map((page: SuggestedPage) => (
          <div 
            key={page.id} 
            onClick={() => {
              alert(`Page: ${page.name}\nCategory: ${page.category}\nLikes: ${page.likes}`);
            }}
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className={`${'w-14 h-14'} ${page.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  {page.icon === '🅿️' ? (
                    <span className="text-white font-bold text-lg">P</span>
                  ) : page.icon === '🎨' ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-yellow-500"></div>
                  ) : (
                    <FileText className="w-7 h-7 text-orange-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-gray-900 text-lg truncate mb-1">{page.name}</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{page.likes} people like this</span>
                    </span>
                    <span className="text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-lg">{page.category}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(page.id);
                }}
                className="flex items-center gap-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 transition-all duration-200 ml-4 flex-shrink-0 border border-gray-200 hover:border-blue-200"
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="hidden sm:inline">Like</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const LikedPagesView: React.FC = () => (
  <div className="bg-white rounded-2xl border border-gray-100 min-h-80 flex flex-col items-center justify-center p-8">
    <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl flex items_center justify-center mb-6">
      <Heart className="w-10 h-10 text-red-500" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">No liked pages yet</h3>
    <p className="text-gray-500 text-center max-w-md">
      Start exploring and like pages that interest you to see them here.
    </p>
  </div>
);

const PagesInterface: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('My Pages');
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [userPages, setUserPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    pageName: '',
    pageURL: '',
    pageDescription: '',
    pageCategory: 'Cars and Vehicles'
  });

  const tabs: Tab[] = [
    { name: 'My Pages', active: true },
    { name: 'Suggested pages', active: false },
    { name: 'Liked Pages', active: false }
  ];

  const categories: string[] = [
    'Cars and Vehicles',
    'Education',
    'Technology',
    'Business',
    'Entertainment',
    'Sports',
    'Food & Drink',
    'Travel',
    'Other'
  ];

  const suggestedPages: SuggestedPage[] = [
    {
      id: 1,
      name: 'Apnademand',
      likes: 0,
      category: 'Cars and Vehicles',
      icon: '📄',
      color: 'bg-orange-100'
    },
    {
      id: 2,
      name: 'BookMyEssay Official',
      likes: 0,
      category: 'Education',
      icon: '🎨',
      color: 'bg-blue-100'
    },
    {
      id: 3,
      name: 'Paperub Official',
      likes: 0,
      category: 'Other',
      icon: '🅿️',
      color: 'bg-orange-500'
    },
    {
      id: 4,
      name: 'jaifriend',
      likes: 0,
      category: 'Other',
      icon: '📄',
      color: 'bg-orange-100'
    },
    {
      id: 5,
      name: 'zorkea',
      likes: 0,
      category: 'Other',
      icon: '📄',
      color: 'bg-orange-100'
    }
  ];

  // Fetch pages from backend
  const fetchPages = async () => {
    try {
      setLoading(true);
      console.log('Fetching pages...');
      
      const [allPagesResponse, userPagesResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/pages`),
  fetch(`${API_URL}/api/pages/user`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);
      
      if (allPagesResponse.ok) {
        const allPagesData = await allPagesResponse.json();
        console.log('All pages fetched:', allPagesData.length);
        setPages(allPagesData);
      }
      
      if (userPagesResponse.ok) {
        const userPagesData = await userPagesResponse.json();
        console.log('User pages fetched:', userPagesData.length);
        setUserPages(userPagesData);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    
    // Auto-generate URL when page name changes
    if (name === 'pageName') {
      const url = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        pageURL: url
      }));
    } else {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    }
  };

  // Check if form is valid
  const isFormValid = (): boolean => {
    return (
      formData.pageName.trim().length >= 3 &&
      formData.pageURL.trim().length >= 3 &&
      /^[a-z0-9-]+$/.test(formData.pageURL.trim()) &&
      formData.pageDescription.trim().length >= 10 &&
      formData.pageDescription.trim().length <= 200
    );
  };

  const handleCreatePage = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if token exists and is valid
      if (!token || token === 'null' || token === 'undefined') {
        alert('Please log in to create a page');
        return;
      }

      // Enhanced validation with better feedback
      if (!formData.pageName.trim()) {
        alert('Page name is required');
        return;
      }

      if (formData.pageName.trim().length < 3) {
        alert('Page name must be at least 3 characters long');
        return;
      }

      if (!formData.pageURL.trim()) {
        alert('Page URL is required');
        return;
      }

      if (formData.pageURL.trim().length < 3) {
        alert('Page URL must be at least 3 characters long');
        return;
      }

      // Check if URL contains only valid characters
      if (!/^[a-z0-9-]+$/.test(formData.pageURL.trim())) {
        alert('Page URL can only contain lowercase letters, numbers, and hyphens');
        return;
      }

      if (!formData.pageDescription.trim()) {
        alert('Page description is required');
        return;
      }

      if (formData.pageDescription.length < 10) {
        alert('Page description must be at least 10 characters long');
        return;
      }

      if (formData.pageDescription.length > 200) {
        alert('Page description must be less than 200 characters');
        return;
      }

      setCreating(true);
      console.log('Creating page with data:', formData);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/pages`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.pageName,
          url: formData.pageURL,
          description: formData.pageDescription,
          category: formData.pageCategory,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error details:', errorData);
        alert('Error: ' + (errorData.error || 'Failed to create page'));
        return;
      }

      const data = await response.json();
      console.log('Page created successfully:', data);
      
      // Show success message
      alert('Page created successfully! Redirecting to your new page...');
      
      // Reset form data
      setFormData({
        pageName: '',
        pageURL: '',
        pageDescription: '',
        pageCategory: 'Cars and Vehicles'
      });
      
      // Close create form
      setShowCreateForm(false);
      
      // Refresh pages list
      await fetchPages();
      
      // Redirect to the newly created page
      router.push(`/dashboard/pages/${data._id}`);
    } catch (error: unknown) {
      console.error('Network error:', error);
      if (error instanceof Error) {
        alert('Error: ' + error.message);
      } else {
        alert('Network error occurred. Please check your connection and try again.');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleGoBack = (): void => {
    setShowCreateForm(false);
    setFormData({
      pageName: '',
      pageURL: '',
      pageDescription: '',
      pageCategory: 'Cars and Vehicles'
    });
  };

  const handleLikePage = (pageId: number): void => {
    console.log('Liked page:', pageId);
  };

  // My Pages Component
  const MyPagesComponent: React.FC = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-2xl border border-gray-100 min-h-80 flex flex-col items-center justify-center p-8">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-500 text-lg font-medium">Loading your pages...</p>
        </div>
      );
    }

    if (userPages.length === 0) {
      return (
        <div className="bg-white rounded-2xl border border-gray-100 min-h-80 flex flex-col items-center justify-center p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No pages yet</h3>
          <p className="text-gray-500 text-center mb-8 max-w-md">
            Create your first page to start building your online presence and connect with your audience.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Create New Page
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Your Pages</h3>
            <p className="text-gray-500 mt-1">{userPages.length} page{userPages.length !== 1 ? 's' : ''} • Click any page to open it</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Page
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {userPages.map((page) => (
            <div 
              key={page._id} 
              onClick={() => router.push(`/dashboard/pages/${page._id}`)}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <FileText className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 text-lg truncate">{page.name}</h4>
                      {page.isVerified && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Star className="w-3 h-3 text-white fill-current" />
                        </div>
                      )}
                  </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Globe className="w-4 h-4" />
                      <span className="text-sm">@{page.url}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-base mb-4 leading-relaxed line-clamp-3">{page.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200">
                    {page.category}
                  </span>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{new Date(page.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="font-medium">{page.likes.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users2 className="w-4 h-4 text-blue-400" />
                      <span className="font-medium">{page.followers.length}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle message functionality
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle share functionality
                      }}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <div className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Create Page Form Component
  const CreatePageForm: React.FC = () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-3xl mx-auto shadow-lg">
      {/* Form Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Page</h2>
            <p className="text-gray-500 mt-1">Build your online presence</p>
          </div>
        </div>
        <button
          onClick={handleGoBack}
          className="sm:hidden p-3 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
        {/* Page Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Page Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="pageName"
            value={formData.pageName}
            onChange={handleInputChange}
            placeholder="Enter your page name"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-lpignore="true"
            data-form-type="other"
            className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200 ${
              formData.pageName.length > 0 
                ? formData.pageName.length >= 3 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-red-300 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          />
          {formData.pageName.length > 0 && (
            <div className={`text-sm mt-2 ${
              formData.pageName.length >= 3 ? 'text-green-600' : 'text-red-500'
            }`}>
              {formData.pageName.length >= 3 
                ? '✓ Page name is valid' 
                : `Page name must be at least 3 characters (${formData.pageName.length}/3)`
              }
            </div>
          )}
        </div>

        {/* Page URL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Page URL <span className="text-red-500">*</span></label>
          <div className="flex">
            <span className="inline-flex items-center px-4 py-4 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium">
              https://jaifriend.com/
            </span>
            <input
              type="text"
              name="pageURL"
              value={formData.pageURL}
              onChange={handleInputChange}
              placeholder="your-page-url"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              data-lpignore="true"
              data-form-type="other"
              className={`flex-1 p-4 border rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200 ${
                formData.pageURL.length > 0 
                  ? formData.pageURL.length >= 3 && /^[a-z0-9-]+$/.test(formData.pageURL)
                    ? 'border-green-300 bg-green-50' 
                    : 'border-red-300 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            />
          </div>
          {formData.pageURL.length > 0 && (
            <div className={`text-sm mt-2 ${
              formData.pageURL.length >= 3 && /^[a-z0-9-]+$/.test(formData.pageURL) ? 'text-green-600' : 'text-red-500'
            }`}>
              {formData.pageURL.length >= 3 && /^[a-z0-9-]+$/.test(formData.pageURL)
                ? '✓ URL is valid' 
                : formData.pageURL.length < 3
                ? `URL must be at least 3 characters (${formData.pageURL.length}/3)`
                : 'URL can only contain lowercase letters, numbers, and hyphens'
              }
            </div>
          )}
        </div>

        {/* Page Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Page Description <span className="text-red-500">*</span></label>
          <textarea
            name="pageDescription"
            value={formData.pageDescription}
            onChange={handleInputChange}
            rows={4}
            placeholder="Describe what your page is about..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-lpignore="true"
            data-form-type="other"
            className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base transition-all duration-200 ${
              formData.pageDescription.length > 0 
                ? formData.pageDescription.length >= 10 && formData.pageDescription.length <= 200
                  ? 'border-green-300 bg-green-50' 
                  : 'border-red-300 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-500">
              Between 10 and 200 characters
            </p>
            <span className={`text-sm font-medium ${
              formData.pageDescription.length > 200 ? 'text-red-500' : 
              formData.pageDescription.length >= 10 ? 'text-green-500' : 'text-gray-400'
            }`}>
              {formData.pageDescription.length}/200
            </span>
          </div>
          {formData.pageDescription.length > 0 && (
            <div className={`text-sm mt-2 ${
              formData.pageDescription.length >= 10 && formData.pageDescription.length <= 200 ? 'text-green-600' : 'text-red-500'
            }`}>
              {formData.pageDescription.length >= 10 && formData.pageDescription.length <= 200
                ? '✓ Description is valid' 
                : formData.pageDescription.length < 10
                ? `Description must be at least 10 characters (${formData.pageDescription.length}/10)`
                : 'Description must be less than 200 characters'
              }
            </div>
          )}
        </div>

        {/* Page Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Page Category <span className="text-red-500">*</span></label>
          <select
            name="pageCategory"
            value={formData.pageCategory}
            onChange={handleInputChange}
            className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200 hover:border-gray-300"
          >
            {categories.map((category: string) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-2">
            Choose the category that best describes your page
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4 mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={handleGoBack}
          disabled={creating}
          className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 px-6 py-3 rounded-xl hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5" />
          Go back
        </button>
        <button
          onClick={handleCreatePage}
          disabled={creating || !isFormValid()}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
        >
          {creating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Page...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Create Page
            </>
          )}
        </button>
      </div>
      </form>
    </div>
  );

  // Suggested Pages Component
  const SuggestedPagesComponent: React.FC = () => (
    <div className="space-y-8">
      {/* Promoted Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Promoted Pages</h3>
        <div className="bg-white rounded-2xl border border-gray-100 min-h-32 flex flex-col items-center justify-center p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-gray-500 text-lg font-medium">No promoted pages available</p>
        </div>
      </div>

      {/* Suggested Pages List */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Suggested Pages</h3>
        <p className="text-gray-500 mb-4">Click any page to view details</p>
        <div className="space-y-4">
          {suggestedPages.map((page: SuggestedPage) => (
            <div 
              key={page.id} 
              onClick={() => {
                // For suggested pages, we can show a preview or navigate to a view page
                // For now, let's show an alert with page details
                alert(`Page: ${page.name}\nCategory: ${page.category}\nLikes: ${page.likes}`);
              }}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className={`w-14 h-14 ${page.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    {page.icon === '🅿️' ? (
                      <span className="text-white font-bold text-lg">P</span>
                    ) : page.icon === '🎨' ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-yellow-500"></div>
                    ) : (
                      <FileText className="w-7 h-7 text-orange-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-900 text-lg truncate mb-1">{page.name}</h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{page.likes} people like this</span>
                      </span>
                      <span className="text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-lg">{page.category}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikePage(page.id);
                  }}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 transition-all duration-200 ml-4 flex-shrink-0 border border-gray-200 hover:border-blue-200"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Like</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Liked Pages Component
  const LikedPagesComponent: React.FC = () => (
    <div className="bg-white rounded-2xl border border-gray-100 min-h-80 flex flex-col items-center justify-center p-8">
      <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl flex items-center justify-center mb-6">
        <Heart className="w-10 h-10 text-red-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">No liked pages yet</h3>
      <p className="text-gray-500 text-center max-w-md">
        Start exploring and like pages that interest you to see them here.
      </p>
    </div>
  );

  const renderContent = (): React.ReactElement => {
    if (showCreateForm) {
      return (
        <CreatePageFormView
          formData={formData}
          categories={categories}
          creating={creating}
          isFormValid={isFormValid()}
          onInputChange={handleInputChange}
          onCreate={handleCreatePage}
          onGoBack={handleGoBack}
        />
      );
    }

    switch (activeTab) {
      case 'My Pages':
        return (
          <MyPagesView
            loading={loading}
            userPages={userPages}
            onCreate={() => setShowCreateForm(true)}
            onOpenPage={(id) => router.push(`/dashboard/pages/${id}`)}
          />
        );
      case 'Suggested pages':
        return (
          <SuggestedPagesView
            suggestedPages={suggestedPages}
            onLike={(id) => handleLikePage(id)}
          />
        );
      case 'Liked Pages':
        return <LikedPagesView />;
      default:
        return (
          <MyPagesView
            loading={loading}
            userPages={userPages}
            onCreate={() => setShowCreateForm(true)}
            onOpenPage={(id) => router.push(`/dashboard/pages/${id}`)}
          />
        );
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30">
        <div className="px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showCreateForm && (
                <button
                  onClick={handleGoBack}
                  className="sm:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                {showCreateForm ? 'Create Page' : 'Pages'}
              </h1>
                {!showCreateForm && (
                  <p className="text-gray-500 text-sm mt-1">Manage and discover amazing pages</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search Button (Mobile) */}
              <button className="sm:hidden p-3 hover:bg-gray-100 rounded-xl transition-colors">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* Action Buttons */}
              {/* Removed camera and users icon buttons from mobile menu */}
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="sm:hidden p-3 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="sm:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileMenu(false)}>
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-3">
              {/* Removed camera and users icon buttons from pages dashboard */}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs - Desktop Only */}
      {!showCreateForm && (
        <nav className="hidden sm:block bg-white border-b border-gray-100">
          <div className="px-6 lg:px-8">
            <div className="flex">
              {tabs.map((tab: Tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex-shrink-0 px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
                    activeTab === tab.name
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-blue-600 hover:border-gray-200'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {renderContent()}
      </main>

      {/* Floating Action Button - Only show if not in create form */}
      {!showCreateForm && (
        <button 
          onClick={() => setShowCreateForm(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center z-20 group hover:scale-110"
        >
          <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}

      {/* Mobile Bottom Safe Area */}
      <div className="sm:hidden h-safe-area-inset-bottom"></div>
    </div>
  );
};

export default PagesInterface;
