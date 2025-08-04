"use client";
import React from 'react';

const AdminDashboard = () => {
  const stats = [
    {
      title: "TOTAL USERS",
      value: "5,339",
      icon: "👥",
      color: "bg-blue-500",
      textColor: "text-blue-600"
    },
    {
      title: "TOTAL POSTS",
      value: "14,648",
      icon: "📝",
      color: "bg-sky-500",
      textColor: "text-sky-600"
    },
    {
      title: "TOTAL PAGES",
      value: "14",
      icon: "🏷️",
      color: "bg-yellow-500",
      textColor: "text-yellow-600"
    },
    {
      title: "TOTAL GROUPS",
      value: "0",
      icon: "👨‍👩‍👧‍👦",
      color: "bg-pink-500",
      textColor: "text-pink-600"
    },
    {
      title: "ONLINE USERS",
      value: "2",
      icon: "🟢",
      color: "bg-green-500",
      textColor: "text-green-600"
    },
    {
      title: "TOTAL COMMENTS",
      value: "9",
      icon: "💬",
      color: "bg-purple-500",
      textColor: "text-purple-600"
    },
    {
      title: "TOTAL GAMES",
      value: "0",
      icon: "🎮",
      color: "bg-sky-500",
      textColor: "text-sky-600"
    },
    {
      title: "TOTAL MESSAGES",
      value: "42",
      icon: "💬",
      color: "bg-yellow-500",
      textColor: "text-yellow-600"
    }
  ];

  return (
    <div className="p-6">
      {/* Welcome Message */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, Vicky bedardi yadav
        </h1>
        <div className="text-sm text-gray-600">
          Home {'>'} <span className="text-red-500 font-semibold">DASHBOARD</span>
        </div>
      </div>

      {/* System Alert */}
      <div className="bg-pink-100 border border-pink-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-red-500 text-lg">⚠️</span>
          <span className="text-red-700 font-medium">
            Important! There are some errors found on your system, please review System Status.
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                {stat.icon}
              </div>
              <div className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
              </div>
            </div>
            <h3 className="text-gray-600 font-medium text-sm">
              {stat.title}
            </h3>
          </div>
        ))}
      </div>

      {/* Statistics Chart Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">STATISTICS</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">This Year</span>
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
          </div>
        </div>
        
        {/* Chart */}
        <div className="h-64 bg-gray-50 rounded-lg p-4">
          {/* Y-axis labels */}
          <div className="flex h-full">
            <div className="flex flex-col justify-between text-xs text-gray-500 mr-2 w-8">
              <span>5000</span>
              <span>4000</span>
              <span>3000</span>
              <span>2000</span>
              <span>1000</span>
              <span>0</span>
            </div>
            
            {/* Chart bars */}
            <div className="flex-1 flex items-end justify-between gap-1">
              {/* January */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 bg-gray-200 rounded-t" style={{height: '0px'}}></div>
                <div className="w-8 bg-gray-200 rounded-t" style={{height: '0px'}}></div>
                <span className="text-xs text-gray-600">Jan</span>
              </div>
              
              {/* February */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 bg-gray-200 rounded-t" style={{height: '0px'}}></div>
                <div className="w-8 bg-gray-200 rounded-t" style={{height: '0px'}}></div>
                <span className="text-xs text-gray-600">Feb</span>
              </div>
              
              {/* March */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 bg-green-500 rounded-t" style={{height: '10px'}}></div>
                <div className="w-8 bg-red-500 rounded-t" style={{height: '50px'}}></div>
                <span className="text-xs text-gray-600">Mar</span>
              </div>
              
              {/* April */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 bg-green-500 rounded-t" style={{height: '50px'}}></div>
                <div className="w-8 bg-red-500 rounded-t" style={{height: '240px'}}></div>
                <span className="text-xs text-gray-600">Apr</span>
              </div>
              
              {/* May */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 bg-green-500 rounded-t" style={{height: '120px'}}></div>
                <div className="w-8 bg-red-500 rounded-t" style={{height: '480px'}}></div>
                <span className="text-xs text-gray-600">May</span>
              </div>
              
              {/* June */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 bg-green-500 rounded-t" style={{height: '140px'}}></div>
                <div className="w-8 bg-red-500 rounded-t" style={{height: '450px'}}></div>
                <span className="text-xs text-gray-600">Jun</span>
              </div>
              
              {/* July */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 bg-green-500 rounded-t" style={{height: '130px'}}></div>
                <div className="w-8 bg-red-500 rounded-t" style={{height: '200px'}}></div>
                <span className="text-xs text-gray-600">Jul</span>
              </div>
              
              {/* August */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 bg-green-500 rounded-t" style={{height: '5px'}}></div>
                <div className="w-8 bg-red-500 rounded-t" style={{height: '5px'}}></div>
                <span className="text-xs text-gray-600">Aug</span>
              </div>
              
              {/* September */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 bg-gray-200 rounded-t" style={{height: '0px'}}></div>
                <div className="w-8 bg-gray-200 rounded-t" style={{height: '0px'}}></div>
                <span className="text-xs text-gray-600">Sep</span>
              </div>
              
              {/* October */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 bg-gray-200 rounded-t" style={{height: '0px'}}></div>
                <div className="w-8 bg-gray-200 rounded-t" style={{height: '0px'}}></div>
                <span className="text-xs text-gray-600">Oct</span>
              </div>
              
              {/* November */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 bg-gray-200 rounded-t" style={{height: '0px'}}></div>
                <div className="w-8 bg-gray-200 rounded-t" style={{height: '0px'}}></div>
                <span className="text-xs text-gray-600">Nov</span>
              </div>
              
              {/* December */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 bg-gray-200 rounded-t" style={{height: '0px'}}></div>
                <div className="w-8 bg-red-500 rounded-t" style={{height: '0px'}}></div>
                <span className="text-xs text-gray-600">Dec</span>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600">Posts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-600">Pages</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-pink-500 rounded"></div>
              <span className="text-gray-600">Groups</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 