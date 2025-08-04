'use client';
import React from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import { Moon, Sun } from 'lucide-react';

interface DarkModeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button' | 'switch';
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'icon' 
}) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (variant === 'switch') {
    return (
      <button
        onClick={toggleDarkMode}
        className={`relative inline-flex items-center justify-center ${sizeClasses[size]} rounded-full transition-all duration-200 ${className} ${
          isDarkMode 
            ? 'bg-dark-700 text-yellow-400 hover:bg-dark-600' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? (
          <Sun className={iconSizes[size]} />
        ) : (
          <Moon className={iconSizes[size]} />
        )}
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={toggleDarkMode}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${className} ${
          isDarkMode 
            ? 'bg-dark-700 text-white hover:bg-dark-600' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? (
          <>
            <Sun className={iconSizes[size]} />
            <span className="text-sm font-medium">Light</span>
          </>
        ) : (
          <>
            <Moon className={iconSizes[size]} />
            <span className="text-sm font-medium">Dark</span>
          </>
        )}
      </button>
    );
  }

  // Default icon variant
  return (
    <button
      onClick={toggleDarkMode}
      className={`flex items-center justify-center ${sizeClasses[size]} rounded-full transition-all duration-200 ${className} ${
        isDarkMode 
          ? 'bg-dark-700 text-yellow-400 hover:bg-dark-600' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun className={iconSizes[size]} />
      ) : (
        <Moon className={iconSizes[size]} />
      )}
    </button>
  );
};

export default DarkModeToggle; 