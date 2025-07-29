"use client";
import React, { useState } from 'react';
import { Plus, FileText, ArrowLeft, ThumbsUp, Camera, Users, Menu, X, Search } from 'lucide-react';

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

interface SuggestedPage {
  id: number;
  name: string;
  likes: number;
  category: string;
  icon: string;
  color: string;
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const PagesInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('My Pages');
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreatePage = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/api/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.pageName,
          url: formData.pageURL,
          description: formData.pageDescription,
          category: formData.pageCategory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert('Error: ' + (errorData.error || 'Failed to create page'));
        return;
      }

      const data = await response.json();
      alert('Page created successfully!');
      setShowCreateForm(false);
      setFormData({
        pageName: '',
        pageURL: '',
        pageDescription: '',
        pageCategory: 'Cars and Vehicles'
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert('Error: ' + error.message);
      } else {
        alert('An unknown error occurred');
      }
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
  const MyPagesComponent: React.FC = () => (
    <div className="bg-white rounded-lg border min-h-64 sm:min-h-96 flex flex-col items-center justify-center p-6 sm:p-8">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
      </div>
      <p className="text-gray-600 font-medium mb-4 sm:mb-6 text-sm sm:text-base">No pages to show</p>
      <button
        onClick={() => setShowCreateForm(true)}
        className="bg-blue-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm sm:text-base"
      >
        Create New Page
      </button>
    </div>
  );

  // Create Page Form Component
  const CreatePageForm: React.FC = () => (
    <div className="bg-white rounded-lg border p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Form Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <span className="font-medium text-gray-900 text-sm sm:text-base">Create New Page</span>
        </div>
        <button
          onClick={handleGoBack}
          className="sm:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {/* Page Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 sm:hidden">
            Page Name
          </label>
          <input
            type="text"
            name="pageName"
            value={formData.pageName}
            onChange={handleInputChange}
            placeholder="Page name"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* Page URL */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Page URL</div>
          <div className="flex flex-col sm:flex-row">
            <span className="inline-flex items-center px-3 py-3 sm:py-0 rounded-t-lg sm:rounded-l-lg sm:rounded-t-lg border border-b-0 sm:border-b sm:border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-xs sm:text-sm">
              https://jaifriend.com/
            </span>
            <input
              type="text"
              name="pageURL"
              value={formData.pageURL}
              onChange={handleInputChange}
              placeholder="Page URL"
              className="flex-1 p-3 border border-gray-200 rounded-b-lg sm:rounded-r-lg sm:rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Page Description */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Page description</div>
          <textarea
            name="pageDescription"
            value={formData.pageDescription}
            onChange={handleInputChange}
            rows={4}
            placeholder="Describe your page..."
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your Page description. Between 10 and 200 characters max.
          </p>
        </div>

        {/* Page Category */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Page Category</div>
          <select
            name="pageCategory"
            value={formData.pageCategory}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          >
            {categories.map((category: string) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 mt-6 pt-4 border-t">
        <button
          onClick={handleGoBack}
          className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>
        <button
          onClick={handleCreatePage}
          className="w-full sm:w-auto bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm sm:text-base"
        >
          Create Page
        </button>
      </div>
    </div>
  );

  // Suggested Pages Component
  const SuggestedPagesComponent: React.FC = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Promoted Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3 sm:mb-4">Promoted</h3>
        <div className="bg-white rounded-lg border min-h-24 sm:min-h-32 flex flex-col items-center justify-center p-4 sm:p-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center mb-2 sm:mb-3">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
          </div>
          <p className="text-gray-600 text-xs sm:text-sm">No pages to show</p>
        </div>
      </div>

      {/* Suggested Pages List */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3 sm:mb-4">Suggested pages</h3>
        <div className="space-y-2 sm:space-y-3">
          {suggestedPages.map((page: SuggestedPage) => (
            <div key={page.id} className="bg-white rounded-lg border p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${page.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    {page.icon === '🅿️' ? (
                      <span className="text-white font-bold text-sm sm:text-lg">P</span>
                    ) : page.icon === '🎨' ? (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-yellow-500"></div>
                    ) : (
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{page.name}</h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {page.likes} people like this
                      </span>
                      <span className="text-blue-600">{page.category}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleLikePage(page.id)}
                  className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-700 transition-colors ml-2 flex-shrink-0"
                >
                  <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
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
    <div className="bg-white rounded-lg border min-h-64 sm:min-h-96 flex flex-col items-center justify-center p-6 sm:p-8">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
      </div>
      <p className="text-gray-600 font-medium text-sm sm:text-base">No pages to show</p>
    </div>
  );

  const renderContent = (): React.ReactElement => {
    if (showCreateForm) {
      return <CreatePageForm />;
    }

    switch (activeTab) {
      case 'My Pages':
        return <MyPagesComponent />;
      case 'Suggested pages':
        return <SuggestedPagesComponent />;
      case 'Liked Pages':
        return <LikedPagesComponent />;
      default:
        return <MyPagesComponent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showCreateForm && (
                <button
                  onClick={handleGoBack}
                  className="sm:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {showCreateForm ? 'Create Page' : 'Pages'}
              </h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Button (Mobile) */}
              <button className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* Action Buttons */}
              <button className="p-2 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              <button className="p-2 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              {tabs.map((tab: Tab) => (
                <button
                  key={tab.name}
                  onClick={() => {
                    setActiveTab(tab.name);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeTab === tab.name
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs - Desktop Only */}
      {!showCreateForm && (
        <nav className="hidden sm:block bg-white border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto">
              {tabs.map((tab: Tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.name
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-blue-600'
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
      <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
        {renderContent()}
      </main>

      {/* Floating Action Button - Only show if not in create form */}
      {!showCreateForm && (
        <button 
          onClick={() => setShowCreateForm(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all flex items-center justify-center z-20 group"
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform" />
        </button>
      )}

      {/* Mobile Bottom Safe Area */}
      <div className="sm:hidden h-safe-area-inset-bottom"></div>
    </div>
  );
};

export default PagesInterface;