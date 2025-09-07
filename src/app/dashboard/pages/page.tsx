"use client";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, ArrowLeft, ArrowRight, ThumbsUp, Camera, Users, Menu, X, Search, Heart, MessageCircle, Share2, Globe, Calendar, Users2, Star } from 'lucide-react';

// Helper function to get proper image URL
const getImageUrl = (url: string) => {
  if (!url) return '/default-avatar.svg';
  if (url.startsWith('http')) return url;
  
  // Handle localhost URLs that might be stored incorrectly
  if (url.includes('localhost:3000')) {
    return url.replace('http://localhost:3000', API_URL);
  }
  
  // Handle hardcoded placeholder avatars that don't exist
  if (url.includes('/avatars/') || url.includes('/covers/')) {
    return '/default-avatar.svg';
  }
  
  return `${API_URL}/${url}`;
};

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
                    <span className="font-medium">{page.likes?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users2 className="w-4 h-4 text-blue-400" />
                    <span className="font-medium">{page.followers?.length || 0}</span>
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

const SuggestedPagesView: React.FC<{ 
  promotedPages: Page[], 
  otherPages: Page[], 
  onLike: (pageId: string) => void, 
  onJoin: (pageId: string) => void,
  loading: boolean 
}> = ({ promotedPages, otherPages, onLike, onJoin, loading }) => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  const isLiked = (page: Page) => {
    return page.likes && Array.isArray(page.likes) && 
           (page.likes.includes(currentUser._id) || page.likes.includes(currentUser.id));
  };
  
  const isJoined = (page: Page) => {
    return page.followers && Array.isArray(page.followers) && 
           (page.followers.includes(currentUser._id) || page.followers.includes(currentUser.id));
  };

  return (
    <div className="space-y-8">
      {/* Promoted Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Promoted Pages</h3>
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 min-h-32 flex flex-col items-center justify-center p-8">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg font-medium">Loading promoted pages...</p>
          </div>
        ) : promotedPages.length > 0 ? (
          <div className="space-y-4">
            {promotedPages.map((page: Page) => (
              <div 
                key={page._id}
                onClick={() => {
                  // Navigate to page details or open page
                  window.open(`https://jaifriend.com/${page.url}`, '_blank');
                }}
                className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-orange-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {page.createdBy?.avatar ? (
                        <img
                          src={getImageUrl(page.createdBy.avatar)}
                          alt={page.createdBy.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/default-avatar.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                          <FileText className="w-7 h-7 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 text-lg truncate">{page.name}</h4>
                        {page.isVerified && <Star className="w-5 h-5 text-blue-500" />}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-2">
                          <ThumbsUp className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{page.likes?.length || 0} people like this</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{page.followers?.length || 0} followers</span>
                        </span>
                        <span className="text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-lg">{page.category}</span>
                      </div>
                      <p className="text-gray-500 text-sm mt-2 truncate">{page.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLike(page._id);
                      }}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                        isLiked(page) 
                          ? 'bg-blue-500 text-white border-blue-500' 
                          : 'bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-700 border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="hidden sm:inline">{isLiked(page) ? 'Liked' : 'Like'}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onJoin(page._id);
                      }}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                        isJoined(page) 
                          ? 'bg-green-500 text-white border-green-500' 
                          : 'bg-gray-50 hover:bg-green-50 hover:text-green-600 text-gray-700 border-gray-200 hover:border-green-200'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span className="hidden sm:inline">{isJoined(page) ? 'Joined' : 'Join'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 min-h-32 flex flex-col items-center justify-center p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No promoted pages available</p>
          </div>
        )}
      </div>

      {/* Suggested Pages List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Suggested Pages</h3>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
        <p className="text-gray-500 mb-4">Discover pages created by other users</p>
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 min-h-32 flex flex-col items-center justify-center p-8">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg font-medium">Loading suggested pages...</p>
          </div>
        ) : otherPages.length > 0 ? (
          <div className="space-y-4">
            {otherPages.map((page: Page) => (
              <div 
                key={page._id}
                onClick={() => {
                  // Navigate to page details or open page
                  window.open(`https://jaifriend.com/${page.url}`, '_blank');
                }}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {page.createdBy?.avatar ? (
                        <img
                          src={getImageUrl(page.createdBy.avatar)}
                          alt={page.createdBy.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/default-avatar.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <FileText className="w-7 h-7 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 text-lg truncate">{page.name}</h4>
                        {page.isVerified && <Star className="w-5 h-5 text-blue-500" />}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-2">
                          <ThumbsUp className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{page.likes?.length || 0} people like this</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{page.followers?.length || 0} followers</span>
                        </span>
                        <span className="text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-lg">{page.category}</span>
                      </div>
                      <p className="text-gray-500 text-sm mt-2 truncate">{page.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        <span>Created by {page.createdBy.name || page.createdBy.username}</span>
                        <span>•</span>
                        <span>{new Date(page.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLike(page._id);
                      }}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                        isLiked(page) 
                          ? 'bg-blue-500 text-white border-blue-500' 
                          : 'bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-700 border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="hidden sm:inline">{isLiked(page) ? 'Liked' : 'Like'}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onJoin(page._id);
                      }}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                        isJoined(page) 
                          ? 'bg-green-500 text-white border-green-500' 
                          : 'bg-gray-50 hover:bg-green-50 hover:text-green-600 text-gray-700 border-gray-200 hover:border-green-200'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span className="hidden sm:inline">{isJoined(page) ? 'Joined' : 'Join'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 min-h-32 flex flex-col items-center justify-center p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No suggested pages available</p>
          </div>
        )}
      </div>
    </div>
  );
};

const LikedPagesView: React.FC<{ likedPages: Page[], loading: boolean }> = ({ likedPages, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 min-h-80 flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-lg font-medium">Loading liked pages...</p>
      </div>
    );
  }

  if (likedPages.length === 0) {
    return (
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
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Liked Pages</h3>
        <p className="text-gray-500">{likedPages.length} page{likedPages.length !== 1 ? 's' : ''} you've liked</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {likedPages.map((page: Page) => (
          <div 
            key={page._id}
            onClick={() => {
              window.open(`https://jaifriend.com/${page.url}`, '_blank');
            }}
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-red-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {page.createdBy?.avatar ? (
                  <img
                    src={getImageUrl(page.createdBy.avatar)}
                    alt={page.createdBy.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/default-avatar.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-gray-900 text-lg truncate">{page.name}</h4>
                  {page.isVerified && <Star className="w-4 h-4 text-blue-500" />}
                </div>
                <p className="text-gray-500 text-sm truncate">{page.description}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4 text-blue-500" />
                  <span>{page.likes?.length || 0}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-green-500" />
                  <span>{page.followers?.length || 0}</span>
                </span>
              </div>
              <span className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-lg text-xs">{page.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PagesInterface: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('My Pages');
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [userPages, setUserPages] = useState<Page[]>([]);
  const [otherPages, setOtherPages] = useState<Page[]>([]);
  const [promotedPages, setPromotedPages] = useState<Page[]>([]);
  const [likedPages, setLikedPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOtherPages, setLoadingOtherPages] = useState(false);
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


  // Fetch pages from backend
  const fetchPages = async () => {
    try {
      setLoading(true);
      console.log('Fetching pages...');
      
      const [allPagesResponse, userPagesResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/pages`),
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
        
        // Filter other users' pages - show all pages except current user's own pages
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('Current user:', currentUser);
        console.log('All pages data:', allPagesData);
        
        const otherUsersPages = allPagesData.filter((page: Page) => {
          // Check if page has createdBy object and it's not null/undefined
          if (!page.createdBy || !page.createdBy._id) {
            console.log(`Page ${page.name} - createdBy is missing or invalid, skipping`);
            return false;
          }
          
          const isNotOwnPage = page.createdBy._id !== currentUser._id && 
                              page.createdBy._id !== currentUser.id;
          console.log(`Page ${page.name} - createdBy: ${page.createdBy._id}, currentUser: ${currentUser._id}, isNotOwnPage: ${isNotOwnPage}`);
          return isNotOwnPage;
        });
        
        console.log('Other users pages:', otherUsersPages.length);
        
        // If no other users' pages found, show all pages as fallback
        if (otherUsersPages.length === 0 && allPagesData.length > 0) {
          console.log('No other users pages found, showing all pages as fallback');
          setOtherPages(allPagesData);
        } else {
          setOtherPages(otherUsersPages);
        }
        
        // Filter promoted pages (pages with high likes or special flag)
        const finalOtherPages = otherUsersPages.length > 0 ? otherUsersPages : allPagesData;
        const promoted = finalOtherPages.filter((page: Page) => 
          (page.likes && Array.isArray(page.likes) && page.likes.length > 10) || page.isVerified
        );
        setPromotedPages(promoted);
        
        // Filter liked pages
        const liked = finalOtherPages.filter((page: Page) => 
          page.likes && Array.isArray(page.likes) && 
          (page.likes.includes(currentUser._id) || page.likes.includes(currentUser.id))
        );
        setLikedPages(liked);
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

  // Refetch pages when switching to suggested pages tab
  useEffect(() => {
    if (activeTab === 'Suggested pages' && otherPages.length === 0) {
      fetchPages();
    }
  }, [activeTab]);

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/pages`, { 
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

  const handleLikePage = async (pageId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/pages/${pageId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update the page in the otherPages list
        setOtherPages(prev => 
          prev.map(page => 
            page._id === pageId 
              ? { ...page, likes: [...(page.likes || []), JSON.parse(localStorage.getItem('user') || '{}')._id] }
              : page
          )
        );
        
        // Update promoted pages if this page is promoted
        setPromotedPages(prev => 
          prev.map(page => 
            page._id === pageId 
              ? { ...page, likes: [...(page.likes || []), JSON.parse(localStorage.getItem('user') || '{}')._id] }
              : page
          )
        );
        
        // Add to liked pages if not already there
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const likedPage = otherPages.find(page => page._id === pageId);
        if (likedPage && !likedPages.some(page => page._id === pageId)) {
          setLikedPages(prev => [...prev, likedPage]);
        }
      }
    } catch (error) {
      console.error('Error liking page:', error);
    }
  };

  const handleJoinPage = async (pageId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/pages/${pageId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update the page in the otherPages list
        setOtherPages(prev => 
          prev.map(page => 
            page._id === pageId 
              ? { ...page, followers: [...(page.followers || []), JSON.parse(localStorage.getItem('user') || '{}')._id] }
              : page
          )
        );
        
        // Update promoted pages if this page is promoted
        setPromotedPages(prev => 
          prev.map(page => 
            page._id === pageId 
              ? { ...page, followers: [...(page.followers || []), JSON.parse(localStorage.getItem('user') || '{}')._id] }
              : page
          )
        );
      }
    } catch (error) {
      console.error('Error joining page:', error);
    }
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
                      <span className="font-medium">{page.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users2 className="w-4 h-4 text-blue-400" />
                      <span className="font-medium">{page.followers?.length || 0}</span>
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
            promotedPages={promotedPages}
            otherPages={otherPages}
            onLike={handleLikePage}
            onJoin={handleJoinPage}
            loading={loadingOtherPages}
          />
        );
      case 'Liked Pages':
        return <LikedPagesView likedPages={likedPages} loading={loading} />;
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
