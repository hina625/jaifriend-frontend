"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ isOpen, isCollapsed, isMobile, onClose, onToggleCollapse }) {
  const [communityOpen, setCommunityOpen] = useState(true);
  const [exploreOpen, setExploreOpen] = useState(true);
  const [meOpen, setMeOpen] = useState(true);
  const pathname = usePathname();

  const menuSections = {
    me: [
      { name: "News Feed", icon: "📰", color: "bg-orange-100", href: "/dashboard" },
      { name: "Albums", icon: "📸", color: "bg-green-100", href: "/dashboard/albums" },
      { name: "Saved Posts", icon: "🔖", color: "bg-pink-100", href: "/dashboard/saved" },
    ],
    community: [
      { name: "Watch", icon: "👁️", color: "bg-green-100", href: "/dashboard/watch" },
      { name: "Events", icon: "📅", color: "bg-red-100", href: "/dashboard/events" },
      { name: "Market", icon: "🛒", color: "bg-blue-100", href: "/dashboard/market" },
      { name: "Forum", icon: "💭", color: "bg-purple-100", href: "/dashboard/forum" },
      { name: "My Products", icon: "📦", color: "bg-cyan-100", href: "/dashboard/products" },
      { name: "My Groups", icon: "👨‍👩‍👧‍👦", color: "bg-blue-100", href: "/dashboard/groups" },
      { name: "My Pages", icon: "📄", color: "bg-orange-100", href: "/dashboard/pages" },
    ],
    explore: [
      { name: "Explore", icon: "🔍", color: "bg-purple-100", href: "/dashboard/explore" },
      { name: "Popular Posts", icon: "📈", color: "bg-yellow-100", href: "/dashboard/popular" },
      { name: "Games", icon: "🎮", color: "bg-gray-100", href: "/dashboard/games" },
      { name: "Movies", icon: "🎬", color: "bg-gray-100", href: "/dashboard/movies" },
      { name: "Jobs", icon: "💼", color: "bg-yellow-100", href: "/dashboard/jobs" },
      { name: "Offers", icon: "🎁", color: "bg-green-100", href: "/dashboard/offers" },
    ]
  };

  const renderMenuItems = (items, collapsed = false) => {
    if (collapsed) {
      return (
        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 border-2 group relative ${
                pathname === item.href 
                  ? 'bg-[#eaf0fb] border-[#022e8a] shadow scale-105' 
                  : 'hover:bg-[#eaf0fb] border-transparent'
              }`}
              title={item.name}
            >
              <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-sm shadow group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {item.name}
              </div>
            </Link>
          ))}
        </div>
      );
    }

    return (
      <div className={`grid gap-1 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {items.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={isMobile ? onClose : undefined}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 border-2 group ${
              pathname === item.href 
                ? 'bg-[#eaf0fb] border-[#022e8a] shadow scale-105 text-[#022e8a]' 
                : 'hover:bg-[#eaf0fb] border-transparent text-[#34495e]'
            }`}
          >
            <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl ${item.color} flex items-center justify-center ${isMobile ? 'text-sm' : 'text-lg'} shadow group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
            <span className="text-xs font-semibold text-center leading-tight">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    );
  };

  // Mobile Sidebar
  if (isMobile) {
    return (
      <aside className={`fixed left-0 top-16 w-80 h-[calc(100vh-4rem)] bg-[#f4f7fb] shadow-xl overflow-y-auto flex flex-col z-40 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-[#eaf0fb] flex items-center justify-between">
          <h2 className="text-[#022e8a] font-bold text-lg">Menu</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 p-3 overflow-y-auto">
          {/* ME Section */}
          <div className="mb-4">
            <button onClick={() => setMeOpen(!meOpen)} className="flex items-center justify-between w-full mb-2 focus:outline-none">
              <h3 className="text-[#022e8a] font-bold text-xs uppercase tracking-wider">ME</h3>
              <span className={`text-[#022e8a] transition-transform duration-200 ${meOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {meOpen && renderMenuItems(menuSections.me)}
          </div>

          {/* COMMUNITY Section */}
          <div className="mb-4">
            <button onClick={() => setCommunityOpen(!communityOpen)} className="flex items-center justify-between w-full mb-2 focus:outline-none">
              <h3 className="text-[#022e8a] font-bold text-xs uppercase tracking-wider">COMMUNITY</h3>
              <span className={`text-[#022e8a] transition-transform duration-200 ${communityOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {communityOpen && renderMenuItems(menuSections.community)}
          </div>

          {/* EXPLORE Section */}
          <div className="mb-4">
            <button onClick={() => setExploreOpen(!exploreOpen)} className="flex items-center justify-between w-full mb-2 focus:outline-none">
              <h3 className="text-[#022e8a] font-bold text-xs uppercase tracking-wider">EXPLORE</h3>
              <span className={`text-[#022e8a] transition-transform duration-200 ${exploreOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {exploreOpen && renderMenuItems(menuSections.explore)}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#eaf0fb]">
          <div className="text-xs text-[#34495e] mb-2">© 2025 Jaifriend</div>
          <div className="text-xs text-[#34495e]">🌐 Language</div>
        </div>
      </aside>
    );
  }

  // Desktop Sidebar
  return (
    <>
      {/* Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="fixed left-2 top-20 z-30 w-8 h-8 bg-[#022e8a] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#034bb3] transition-colors"
      >
        {isCollapsed ? '→' : '←'}
      </button>

      <aside className={`bg-[#f4f7fb] shadow-lg overflow-y-auto flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-80'
      }`}>
        
        <div className="flex-1 p-3 overflow-y-auto">
          {/* ME Section */}
          <div className="mb-4">
            {!isCollapsed && (
              <button onClick={() => setMeOpen(!meOpen)} className="flex items-center justify-between w-full mb-2 focus:outline-none">
                <h3 className="text-[#022e8a] font-bold text-xs uppercase tracking-wider">ME</h3>
                <span className={`text-[#022e8a] transition-transform duration-200 ${meOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
            )}
            {(meOpen || isCollapsed) && renderMenuItems(menuSections.me, isCollapsed)}
          </div>

          {isCollapsed && <div className="border-t border-[#eaf0fb] my-2"></div>}

          {/* COMMUNITY Section */}
          <div className="mb-4">
            {!isCollapsed && (
              <button onClick={() => setCommunityOpen(!communityOpen)} className="flex items-center justify-between w-full mb-2 focus:outline-none">
                <h3 className="text-[#022e8a] font-bold text-xs uppercase tracking-wider">COMMUNITY</h3>
                <span className={`text-[#022e8a] transition-transform duration-200 ${communityOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
            )}
            {(communityOpen || isCollapsed) && renderMenuItems(menuSections.community, isCollapsed)}
          </div>

          {isCollapsed && <div className="border-t border-[#eaf0fb] my-2"></div>}

          {/* EXPLORE Section */}
          <div className="mb-4">
            {!isCollapsed && (
              <button onClick={() => setExploreOpen(!exploreOpen)} className="flex items-center justify-between w-full mb-2 focus:outline-none">
                <h3 className="text-[#022e8a] font-bold text-xs uppercase tracking-wider">EXPLORE</h3>
                <span className={`text-[#022e8a] transition-transform duration-200 ${exploreOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
            )}
            {(exploreOpen || isCollapsed) && renderMenuItems(menuSections.explore, isCollapsed)}
          </div>
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-3 border-t border-[#eaf0fb]">
            <div className="text-xs text-[#34495e] mb-2">© 2025 Jaifriend</div>
            <div className="text-xs text-[#34495e]">🌐 Language</div>
          </div>
        )}
      </aside>
    </>
  );
}