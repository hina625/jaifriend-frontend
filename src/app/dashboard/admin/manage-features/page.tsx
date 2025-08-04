"use client";
import React from 'react';

const AdminManageFeatures = () => {
  const featuresItems = [
    { name: "Enable / Disable Features", icon: "🔧", description: "Control which features are active on the platform" },
    { name: "Applications", icon: "📱", description: "Manage mobile and web applications" },
    { name: "Pages", icon: "📄", description: "Configure page settings and permissions" },
    { name: "Groups", icon: "👥", description: "Manage group features and settings" },
    { name: "Posts", icon: "📝", description: "Configure post creation and sharing features" },
    { name: "Fundings", icon: "💰", description: "Manage funding and donation features" },
    { name: "Jobs", icon: "💼", description: "Configure job posting and application features" },
    { name: "Offers", icon: "🎁", description: "Manage promotional offers and deals" },
    { name: "Articles (Blog)", icon: "📰", description: "Configure blog and article features" },
    { name: "Events", icon: "📅", description: "Manage event creation and management" },
    { name: "Content Monetization", icon: "💳", description: "Configure content monetization features" }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Feature Management
        </h1>
        <div className="text-sm text-gray-600">
          Home {'>'} Admin {'>'} <span className="text-red-500 font-semibold">MANAGE FEATURES</span>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuresItems.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminManageFeatures; 