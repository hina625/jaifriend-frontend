"use client";
import React, { useState, useEffect } from 'react';

interface InvitationStats {
  availableLinks: number;
  generatedLinks: number;
  usedLinks: number;
}

const InvitationLinksPage = () => {
  const [stats, setStats] = useState<InvitationStats>({
    availableLinks: 10,
    generatedLinks: 0,
    usedLinks: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load invitation statistics from API or localStorage
    const loadStats = () => {
      const savedStats = localStorage.getItem('invitationStats');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    };
    
    loadStats();
  }, []);

  const handleGenerateLinks = async () => {
    setLoading(true);
    try {
      // Simulate API call to generate links
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update stats - move from available to generated
      const newStats = {
        ...stats,
        availableLinks: Math.max(0, stats.availableLinks - 1),
        generatedLinks: stats.generatedLinks + 1
      };
      
      setStats(newStats);
      localStorage.setItem('invitationStats', JSON.stringify(newStats));
      
      console.log('Invitation link generated successfully');
      alert('Invitation link generated successfully!');
    } catch (error) {
      console.error('Error generating invitation link:', error);
      alert('Failed to generate invitation link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    {
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      bgColor: 'bg-green-100',
      count: stats.availableLinks,
      label: 'Available Links'
    },
    {
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      bgColor: 'bg-blue-100',
      count: stats.generatedLinks,
      label: 'Generated Links'
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      bgColor: 'bg-orange-100',
      count: stats.usedLinks,
      label: 'Used Links'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Invitation Links</h1>
        
        {/* Statistics */}
        <div className="space-y-6 mb-12">
          {statItems.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                {item.icon}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold text-gray-900">{item.count}</span>
                <span className="text-gray-700 font-medium">{item.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerateLinks}
            disabled={loading || stats.availableLinks === 0}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-8 py-3 rounded-md font-medium transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate links'}
          </button>
        </div>

        {stats.availableLinks === 0 && (
          <p className="text-center text-gray-500 text-sm mt-4">
            No available links remaining
          </p>
        )}
      </div>
    </div>
  );
};

export default InvitationLinksPage;