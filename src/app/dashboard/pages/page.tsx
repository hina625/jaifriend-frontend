"use client";
import React, { useState } from 'react';
import { Plus, FileText, ArrowLeft, ThumbsUp, Camera, Users } from 'lucide-react';

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

const PagesInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('My Pages');
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
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
      const response = await fetch('http://localhost:5000/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // If you use authentication, add the token here:
          // 'Authorization': `Bearer ${token}`,
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
      // Optionally, refresh the list of pages here
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
    <div className="bg-white rounded-lg border min-h-96 flex flex-col items-center justify-center p-8">
      <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-red-500" />
      </div>
      <p className="text-gray-600 font-medium mb-6">No pages to show</p>
      <button
        onClick={() => setShowCreateForm(true)}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
      >
        Create New Page
      </button>
    </div>
  );

  // Create Page Form Component
  const CreatePageForm: React.FC = () => (
    <div className="bg-white rounded-lg border p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <Plus className="w-4 h-4 text-white" />
        </div>
        <span className="font-medium text-gray-900">Create New Page</span>
      </div>

      <div className="space-y-4">
        {/* Page Name */}
        <div>
          <input
            type="text"
            name="pageName"
            value={formData.pageName}
            onChange={handleInputChange}
            placeholder="Page name"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Page URL */}
        <div>
          <div className="text-sm text-gray-600 mb-2">Page URL</div>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
              https://jaifriend.com/
            </span>
            <input
              type="text"
              name="pageURL"
              value={formData.pageURL}
              onChange={handleInputChange}
              placeholder="Page URL"
              className="flex-1 p-3 border border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Page Description */}
        <div>
          <div className="text-sm text-gray-600 mb-2">Page description</div>
          <textarea
            name="pageDescription"
            value={formData.pageDescription}
            onChange={handleInputChange}
            rows={4}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your Page description. Between 10 and 200 characters max.
          </p>
        </div>

        {/* Page Category */}
        <div>
          <div className="text-sm text-gray-600 mb-2">Page Category</div>
          <select
            name="pageCategory"
            value={formData.pageCategory}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map((category: string) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>
        <button
          onClick={handleCreatePage}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Create
        </button>
      </div>
    </div>
  );

  // Suggested Pages Component
  const SuggestedPagesComponent: React.FC = () => (
    <div className="space-y-6">
      {/* Promoted Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Promoted</h3>
        <div className="bg-white rounded-lg border min-h-32 flex flex-col items-center justify-center p-6">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
            <FileText className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-gray-600 text-sm">No pages to show</p>
        </div>
      </div>

      {/* Suggested Pages List */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Suggested pages</h3>
        <div className="space-y-3">
          {suggestedPages.map((page: SuggestedPage) => (
            <div key={page.id} className="bg-white rounded-lg border p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${page.color} rounded-lg flex items-center justify-center`}>
                  {page.icon === '🅿️' ? (
                    <span className="text-white font-bold text-lg">P</span>
                  ) : page.icon === '🎨' ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-yellow-500"></div>
                  ) : (
                    <FileText className="w-6 h-6 text-orange-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{page.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
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
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                <ThumbsUp className="w-4 h-4" />
                Like
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Liked Pages Component
  const LikedPagesComponent: React.FC = () => (
    <div className="bg-white rounded-lg border min-h-96 flex flex-col items-center justify-center p-8">
      <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-red-500" />
      </div>
      <p className="text-gray-600 font-medium">No pages to show</p>
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
            
            <div className="flex gap-3">
              <button className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Camera className="w-5 h-5 text-gray-600" />
              </button>
              <button className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Users className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Only show if not in create form */}
      {!showCreateForm && (
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex overflow-x-auto">
              {tabs.map((tab: Tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
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
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Floating Action Button - Only show if not in create form */}
      {!showCreateForm && (
        <button 
          onClick={() => setShowCreateForm(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default PagesInterface;