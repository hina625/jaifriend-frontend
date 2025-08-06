"use client";

import { useState } from 'react';

export default function AdvertisementSettings() {
  const [adsSystemEnabled, setAdsSystemEnabled] = useState<boolean>(true);
  const [costByView, setCostByView] = useState<number>(0.01);
  const [costByClick, setCostByClick] = useState<number>(0.05);
  const [walletAmount, setWalletAmount] = useState<number>(10741);
  const [topUpAmount, setTopUpAmount] = useState<string>('');

  const handleTopUp = () => {
    const amount = parseFloat(topUpAmount);
    if (topUpAmount && !isNaN(amount) && amount > 0) {
      setWalletAmount(prev => prev + amount);
      setTopUpAmount('');
      alert('Wallet topped up successfully!');
    } else {
      alert('Please enter a valid amount');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L8 5.414V17a1 1 0 102 0V5.414l6.293 6.293a1 1 0 001.414-1.414l-9-9z"/>
                  </svg>
                  <a href="#" className="ml-2 text-sm font-medium text-orange-500 hover:text-orange-700">
                    Home
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                  <a href="#" className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                    Advertisements
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="ml-2 text-sm font-medium text-red-500">
                    Advertisements System Settings
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Advertisements System Settings
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Advertisement Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Advertisements Settings
              </h2>

              {/* Advertisements System Toggle */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Advertisements System
                    </h3>
                    <p className="text-sm text-gray-600">
                      Allow users to create ads.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => setAdsSystemEnabled(!adsSystemEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                        adsSystemEnabled ? 'bg-teal-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          adsSystemEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    {adsSystemEnabled && (
                      <svg className="ml-2 w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Cost By View */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-900 mb-2">
                  Cost By View
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={costByView}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setCostByView(isNaN(value) ? 0 : value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Set a price for ads impressions.
                </p>
              </div>

              {/* Cost By Click */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-900 mb-2">
                  Cost By Click
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={costByClick}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setCostByClick(isNaN(value) ? 0 : value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Set a price for ads clicks.
                </p>
              </div>
            </div>

            {/* Wallet Top Up */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Top Up Vicky bedardi yadav's Wallet
              </h2>

              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-900 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <p className="text-sm text-gray-600 mt-2">
                  You can top your own wallet from here, set any number.
                </p>
              </div>

              <button
                onClick={handleTopUp}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Top Up
              </button>

              {/* Current Wallet Balance */}
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Current Balance:
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    ₹{walletAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Changes Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => alert('Settings saved successfully!')}
              className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
  );
}