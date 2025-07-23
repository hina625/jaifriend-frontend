"use client";
import React, { useState } from 'react';
import { Plus, Gamepad2 } from 'lucide-react';

const GamesPage = () => {
  const [activeTab, setActiveTab] = useState('Latest games');

  const tabs = ['Latest games', 'My Games'];

  const GamepadIcon = () => (
    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
      <Gamepad2 className="w-8 h-8 text-blue-500" />
    </div>
  );

  const EmptyGamesSection = ({ title }) => (
    <div className="bg-white rounded-lg border border-gray-200 min-h-80 flex flex-col items-center justify-center p-8">
      <GamepadIcon />
      <p className="text-gray-600 text-base font-medium">{title}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Games</h1>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mb-8">
          {activeTab === 'Latest games' && (
            <EmptyGamesSection title="No games to show" />
          )}
          {activeTab === 'My Games' && (
            <EmptyGamesSection title="No games to show" />
          )}
        </div>

        {/* Popular Games Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-blue-600 mb-6">Popular Games</h2>
          <EmptyGamesSection title="No games to show" />
        </div>

      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-50">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default GamesPage;
