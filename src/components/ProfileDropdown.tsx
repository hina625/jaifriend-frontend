import React from 'react';

interface ProfileDropdownProps {
  profile: {
    avatar?: string;
    fullName?: string;
  };
}

export default function ProfileDropdown({ profile }: ProfileDropdownProps) {
  return (
    <div className="absolute right-0 top-12 w-80 bg-white dark:bg-dark-800 rounded-2xl shadow-2xl z-50 p-4 flex flex-col gap-2 border border-gray-100 dark:border-dark-700">
      {/* Profile Section */}
      <div className="flex items-center gap-3 mb-2">
        <img
          src={profile.avatar ? (profile.avatar.startsWith('http') ? profile.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}${profile.avatar}`) : "/avatars/1.png.png"}
          alt="avatar"
          className="w-12 h-12 rounded-full border border-gray-200 dark:border-dark-600 object-cover"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-base text-gray-900 dark:text-white">{profile.fullName || 'My Profile'}</span>
          <div className="flex gap-2 mt-1">
            <span className="flex items-center gap-1 bg-gray-100 dark:bg-dark-700 px-2 py-0.5 rounded text-xs font-medium text-gray-700 dark:text-gray-300">
              <span role="img" aria-label="wallet">💳</span> $0.00
            </span>
            <span className="flex items-center gap-1 bg-gray-100 dark:bg-dark-700 px-2 py-0.5 rounded text-xs font-medium text-gray-700 dark:text-gray-300">
              <span role="img" aria-label="pokes">👍</span> Pokes
            </span>
          </div>
        </div>
      </div>
      {/* Menu Items */}
      <div className="flex flex-col gap-1 divide-y divide-gray-100 dark:divide-dark-700">
        <button className="flex items-center gap-3 py-2 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg px-2 text-left text-gray-700 dark:text-gray-300">
          <span className="bg-gray-100 dark:bg-dark-700 p-2 rounded-full text-lg">🔄</span>
          <span className="font-medium">Switch Account</span>
        </button>
        <div className="py-1" />
        <button className="flex items-center gap-3 py-2 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg px-2 text-left text-gray-700 dark:text-gray-300">
          <span className="bg-gray-100 dark:bg-dark-700 p-2 rounded-full text-lg">🛠️</span>
          <span className="font-medium">Upgrade To Pro</span>
        </button>
        <button className="flex items-center gap-3 py-2 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg px-2 text-left text-gray-700 dark:text-gray-300">
          <span className="bg-gray-100 dark:bg-dark-700 p-2 rounded-full text-lg">📢</span>
          <span className="font-medium">Advertising</span>
        </button>
        <button className="flex items-center gap-3 py-2 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg px-2 text-left text-gray-700 dark:text-gray-300">
          <span className="bg-gray-100 dark:bg-dark-700 p-2 rounded-full text-lg">💳</span>
          <span className="font-medium">Subscriptions</span>
        </button>
        <div className="py-1" />
        <button className="flex items-center gap-3 py-2 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg px-2 text-left text-gray-700 dark:text-gray-300">
          <span className="bg-gray-100 dark:bg-dark-700 p-2 rounded-full text-lg">✔️</span>
          <span className="font-medium">Privacy Setting</span>
        </button>
        <button className="flex items-center gap-3 py-2 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg px-2 text-left text-gray-700 dark:text-gray-300">
          <span className="bg-gray-100 dark:bg-dark-700 p-2 rounded-full text-lg">⚙️</span>
          <span className="font-medium">General Setting</span>
        </button>
        <button className="flex items-center gap-3 py-2 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg px-2 text-left text-gray-700 dark:text-gray-300">
          <span className="bg-gray-100 dark:bg-dark-700 p-2 rounded-full text-lg">✉️</span>
          <span className="font-medium">Invite Your Friends</span>
        </button>
        <div className="py-1" />
        <div className="flex items-center gap-3 py-2 px-2 text-gray-700 dark:text-gray-300">
          <span className="bg-gray-100 dark:bg-dark-700 p-2 rounded-full text-lg">🌙</span>
          <span className="font-medium flex-1">Night mode</span>
          <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
        </div>
        <button className="flex items-center gap-3 py-2 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg px-2 text-left text-gray-700 dark:text-gray-300">
          <span className="bg-gray-100 dark:bg-dark-700 p-2 rounded-full text-lg">🚪</span>
          <span className="font-medium">Log Out</span>
        </button>
      </div>
      {/* Footer */}
      <div className="text-xs text-gray-400 dark:text-gray-500 mt-3 flex flex-col items-center gap-1">
        <div>© 2025 Jaifriend <span className="mx-1">•</span> <span className="underline cursor-pointer">Language</span></div>
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="underline cursor-pointer">About</span>
          <span className="underline cursor-pointer">Directory</span>
          <span className="underline cursor-pointer">Contact Us</span>
          <span className="underline cursor-pointer">Developers</span>
          <span className="underline cursor-pointer">Privacy Policy</span>
          <span className="underline cursor-pointer">Terms of Use</span>
          <span className="underline cursor-pointer">Refund</span>
        </div>
      </div>
    </div>
  );
} 
