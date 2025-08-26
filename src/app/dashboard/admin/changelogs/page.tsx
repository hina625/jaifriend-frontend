"use client";
import React from 'react';

const AdminChangelogs = () => {
  const changelogs = [
    { version: "v2.1.0", date: "2024-01-15", type: "Feature", description: "Added new admin dashboard with enhanced features" },
    { version: "v2.0.5", date: "2024-01-10", type: "Bug Fix", description: "Fixed user authentication issues" },
    { version: "v2.0.4", date: "2024-01-05", type: "Security", description: "Enhanced security measures and API protection" },
    { version: "v2.0.3", date: "2023-12-28", type: "Feature", description: "Added multi-language support" },
    { version: "v2.0.2", date: "2023-12-20", type: "Performance", description: "Improved system performance and loading times" },
    { version: "v2.0.1", date: "2023-12-15", type: "Bug Fix", description: "Resolved mobile responsiveness issues" }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Changelogs
        </h1>
        <div className="text-sm text-gray-600">
          Home {'>'} Admin {'>'} <span className="text-red-500 font-semibold">CHANGELOGS</span>
        </div>
      </div>

      {/* Changelogs List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Version History</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {changelogs.map((log, index) => (
            <div key={index} className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-800">{log.version}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    log.type === 'Feature' ? 'bg-blue-100 text-blue-800' :
                    log.type === 'Bug Fix' ? 'bg-green-100 text-green-800' :
                    log.type === 'Security' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {log.type}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{log.date}</span>
              </div>
              <p className="text-gray-600">{log.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminChangelogs; 
