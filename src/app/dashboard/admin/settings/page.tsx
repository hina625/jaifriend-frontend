"use client";
import React from 'react';

const AdminSettings = () => {
  const settingsItems = [
    { name: "Website Mode", icon: "🌐", description: "Configure website mode settings" },
    { name: "General Configuration", icon: "⚙️", description: "Manage general system configuration" },
    { name: "Website Information", icon: "ℹ️", description: "Update website information and details" },
    { name: "File Upload Configuration", icon: "📁", description: "Configure file upload settings" },
    { name: "E-mail & SMS Setup", icon: "📧", description: "Setup email and SMS configurations" },
    { name: "Chat & Video/Audio", icon: "💬", description: "Manage chat and media settings" },
    { name: "Social Login Settings", icon: "🔗", description: "Configure social login providers" },
    { name: "NodeJS Settings", icon: "🟢", description: "Manage NodeJS server settings" },
    { name: "CronJob Settings", icon: "⏰", description: "Configure automated tasks" },
    { name: "AI Settings", icon: "🤖", description: "Manage AI integration settings" }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Settings Management
        </h1>
        <div className="text-sm text-gray-600">
          Home {'>'} Admin {'>'} <span className="text-red-500 font-semibold">SETTINGS</span>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsItems.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings; 