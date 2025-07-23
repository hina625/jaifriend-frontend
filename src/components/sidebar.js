"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
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
      { name: "Find Friends", icon: "❤️", color: "bg-red-100", href: "/dashboard/find-friends" },
      { name: "Common Things", icon: "⭐", color: "bg-pink-100", href: "/dashboard/common" },
      { name: "Funding", icon: "📞", color: "bg-red-100", href: "/dashboard/funding" },
    ]
  };

  return (
    <aside className="w-80 bg-[#f4f7fb] shadow-lg overflow-y-auto flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] scrollbar-hide">

      <div className="flex-1 p-3 overflow-y-auto scrollbar-hide">
        {/* ME Section */}
        <div className="mb-4">
          <button onClick={() => setMeOpen(!meOpen)} className="flex items-center justify-between w-full mb-2 focus:outline-none">
            <h3 className="text-[#022e8a] font-bold text-xs uppercase tracking-wider">ME</h3>
            <span className={`text-[#022e8a] transition-transform duration-200 ${meOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {meOpen && (
            <div className="grid grid-cols-3 gap-1">
              {menuSections.me.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 border-2 ${pathname === item.href ? 'bg-[#eaf0fb] border-[#022e8a] shadow scale-105 text-[#022e8a]' : 'hover:bg-[#eaf0fb] border-transparent text-[#34495e]'} group`}
                >
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center text-lg shadow group-hover:scale-110 transition-transform duration-200`}>
                    {item.icon}
                  </div>
                  <span className={`text-xs font-semibold text-center leading-tight ${pathname === item.href ? 'text-[#022e8a]' : 'text-[#34495e]'}`}>{item.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* COMMUNITY Section */}
        <div className="mb-4">
          <button onClick={() => setCommunityOpen(!communityOpen)} className="flex items-center justify-between w-full mb-2 focus:outline-none">
            <h3 className="text-[#022e8a] font-bold text-xs uppercase tracking-wider">COMMUNITY</h3>
            <span className={`text-[#022e8a] transition-transform duration-200 ${communityOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {communityOpen && (
            <div className="grid grid-cols-3 gap-1">
              {menuSections.community.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 border-2 ${pathname === item.href ? 'bg-[#eaf0fb] border-[#022e8a] shadow scale-105' : 'hover:bg-[#eaf0fb] border-transparent'} group`}
                >
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center text-lg shadow group-hover:scale-110 transition-transform duration-200 ${pathname === item.href ? 'text-[#022e8a]' : 'text-[#34495e]'}`}>
                    {item.icon}
                  </div>
                  <span className={`text-xs font-semibold text-center leading-tight ${pathname === item.href ? 'text-[#022e8a]' : 'text-[#34495e]'}`}>{item.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* EXPLORE Section */}
        <div className="mb-4">
          <button onClick={() => setExploreOpen(!exploreOpen)} className="flex items-center justify-between w-full mb-2 focus:outline-none">
            <h3 className="text-[#022e8a] font-bold text-xs uppercase tracking-wider">EXPLORE</h3>
            <span className={`text-[#022e8a] transition-transform duration-200 ${exploreOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {exploreOpen && (
            <div className="grid grid-cols-3 gap-1">
              {menuSections.explore.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 border-2 ${pathname === item.href ? 'bg-[#eaf0fb] border-[#022e8a] shadow scale-105' : 'hover:bg-[#eaf0fb] border-transparent'} group`}
                >
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center text-lg shadow group-hover:scale-110 transition-transform duration-200 ${pathname === item.href ? 'text-[#022e8a]' : 'text-[#34495e]'}`}>
                    {item.icon}
                  </div>
                  <span className={`text-xs font-semibold text-center leading-tight ${pathname === item.href ? 'text-[#022e8a]' : 'text-[#34495e]'}`}>{item.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#eaf0fb] flex-shrink-0">
        <div className="text-xs text-[#34495e] mb-2">© 2025 Jaifriend</div>
        <div className="flex flex-wrap gap-2 text-xs text-[#34495e] mb-2">
          <span>🌐 Language</span>
        </div>
        <div className="flex flex-wrap gap-1 text-xs text-[#34495e] leading-relaxed">
          <span>About</span> • <span>Directory</span> • <span>Contact Us</span> • <span>Developers</span> • <span>Privacy Policy</span> • <span>Terms of Use</span> • <span>Refund</span> • <span>Online Users</span>
        </div>
      </div>

      <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;  /* Internet Explorer 10+ */
            scrollbar-width: none;  /* Firefox */
          }
          .scrollbar-hide::-webkit-scrollbar { 
            display: none;  /* Safari and Chrome */
          }
        `}</style>
    </aside>
  );
};
  
export default Sidebar;