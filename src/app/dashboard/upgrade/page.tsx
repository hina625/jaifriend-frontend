"use client";
import React, { useState } from 'react';

const PricingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState('Hot');

  const plans = [
    {
      name: 'Star',
      price: 4,
      period: '/ 1 month',
      icon: '⭐',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      buttonColor: 'bg-blue-200 hover:bg-blue-300 text-blue-700',
      features: [
        'Featured member',
        'See profile visitors',
        'Show / Hide last seen',
        'Verified badge'
      ],
      details: [
        'No Posts promotion',
        '2 Pages',
        'No Discount',
        '24 MB'
      ],
      cta: 'Get started!',
      popular: false
    },
    {
      name: 'Hot',
      price: 8,
      period: '/ 1 month',
      icon: '🔥',
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonColor: 'bg-blue-200 hover:bg-blue-300 text-blue-700',
      features: [
        'Featured member',
        'See profile visitors',
        'Show / Hide last seen',
        'Verified badge'
      ],
      details: [
        '5 posts',
        '5 Pages',
        '10% Discount',
        '96 MB'
      ],
      cta: 'Get Hot! More features.',
      popular: true
    },
    {
      name: 'Ultima',
      price: 89,
      period: '/ 1 month',
      icon: '⚡',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      buttonColor: 'bg-blue-200 hover:bg-blue-300 text-blue-700',
      features: [
        'Featured member',
        'See profile visitors',
        'Show / Hide last seen',
        'Verified badge'
      ],
      details: [
        '20 posts',
        '20 Pages',
        '20% Discount',
        '256 MB'
      ],
      cta: 'Oh yeah, join the ultima!',
      popular: false
    },
    {
      name: 'VIP',
      price: 259,
      period: '/ 1 Unlimited',
      icon: '🚀',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonColor: 'bg-blue-200 hover:bg-blue-300 text-blue-700',
      features: [
        'Featured member',
        'See profile visitors',
        'Show / Hide last seen',
        'Verified badge'
      ],
      details: [
        '40 posts',
        '40 Pages',
        '60% Discount',
        '96 MB'
      ],
      cta: 'GO Limitless!',
      popular: false
    }
  ];

  const handleUpgrade = async (planName: string) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id || user.id;
    if (!userId) return alert('User not found!');
    const res = await fetch('http://localhost:5000/api/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan: planName })
    });
    const data = await res.json();
    if (res.ok) {
      alert('Upgrade successful!');
    } else {
      alert(data.error || 'Upgrade failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="bg-blue-100 rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl">👑</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Jaifriend <span className="bg-orange-500 text-white px-2 py-1 rounded text-sm">PRO</span>
                </h1>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Pro features give you complete control over your profile.</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Featured member</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Show / Hide last seen</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Posts promotion</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Verified badge</span>
                </div>
              </div>
            </div>
            
            {/* Illustration */}
            <div className="flex-shrink-0 relative">
              <div className="w-64 h-48 relative">
                {/* Rocket illustration */}
                <div className="absolute bottom-0 right-0">
                  <div className="w-32 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full relative">
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl">👨‍💼</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Clouds */}
                <div className="absolute top-4 right-8 w-12 h-6 bg-white rounded-full opacity-80"></div>
                <div className="absolute top-8 right-20 w-16 h-8 bg-white rounded-full opacity-60"></div>
                <div className="absolute top-12 right-4 w-10 h-5 bg-white rounded-full opacity-70"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Pro Members Section */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">👑</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Pro Members</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" 
                alt="Vicky" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">Vicky beda...</p>
            </div>
          </div>
        </div>

        {/* Pick your Plan Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Pick your Plan</h2>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`${plan.bgColor} rounded-2xl p-6 relative transition-all duration-300 hover:shadow-lg border-2 ${
                selectedPlan === plan.name ? 'border-blue-500 scale-105' : 'border-transparent'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className={`w-16 h-16 ${plan.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className={`text-2xl ${plan.iconColor}`}>{plan.icon}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-sm text-gray-600">$</span>
                  <span className="text-3xl font-bold text-gray-800">{plan.price}</span>
                  <span className="text-sm text-gray-600">{plan.period}</span>
                </div>
              </div>

              <button
                onClick={() => handleUpgrade(plan.name)}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 mb-6 ${plan.buttonColor}`}
              >
                Upgrade Now
              </button>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-6">
                {plan.details.map((detail, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {detail}
                  </div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">{plan.cta}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8">
          <button className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200">
            <span className="text-2xl">+</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;