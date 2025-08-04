"use client";
import React from 'react';

const AdminPayments = () => {
  const paymentsItems = [
    { name: "Payment Configuration", icon: "⚙️", description: "Configure payment gateways and settings" },
    { name: "Advertisement Settings", icon: "📢", description: "Manage advertisement display settings" },
    { name: "Manage Currencies", icon: "💱", description: "Add and manage supported currencies" },
    { name: "Manage Site Advertisements", icon: "🏢", description: "Control site-wide advertisements" },
    { name: "Manage User Advertisements", icon: "👤", description: "Manage user-created advertisements" },
    { name: "Manage Bank Receipts", icon: "🏦", description: "Review and manage payment receipts" }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Payments & Advertisement Management
        </h1>
        <div className="text-sm text-gray-600">
          Home {'>'} Admin {'>'} <span className="text-red-500 font-semibold">PAYMENTS & ADS</span>
        </div>
      </div>

      {/* Payments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paymentsItems.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPayments; 