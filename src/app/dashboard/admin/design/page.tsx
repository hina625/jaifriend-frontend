"use client";
import React from 'react';

const AdminDesign = () => {
  const designItems = [
    { name: "Themes", icon: "🎭", description: "Manage and customize site themes" },
    { name: "Change Site Design", icon: "🎨", description: "Modify overall site appearance and layout" },
    { name: "Custom JS / CSS", icon: "💻", description: "Add custom JavaScript and CSS code" }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Design Management
        </h1>
        <div className="text-sm text-gray-600">
          Home {'>'} Admin {'>'} <span className="text-red-500 font-semibold">DESIGN</span>
        </div>
      </div>

      {/* Design Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {designItems.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center text-2xl">
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDesign; 
