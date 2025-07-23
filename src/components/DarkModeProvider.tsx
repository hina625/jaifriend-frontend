'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

interface DarkModeProviderProps {
  children: React.ReactNode;
}

export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('nightMode') === 'true';
    setIsDarkMode(savedDarkMode);
    setMounted(true);
    
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (mounted) {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('nightMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('nightMode', 'false');
      }
    }
  }, [isDarkMode, mounted]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="min-h-screen bg-white dark:bg-gray-900">{children}</div>;
  }

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-900 text-white' 
          : 'bg-gray-50 text-gray-900'
      }`}>
        {children}
      </div>
    </DarkModeContext.Provider>
  );
};

// CSS classes for different components in dark mode
export const darkModeClasses = {
  // Main containers
  page: 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen transition-colors duration-300',
  container: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300',
  
  // Cards and panels
  card: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm dark:shadow-gray-800/50 transition-colors duration-300',
  panel: 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-300',
  
  // Text elements
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-300',
    tertiary: 'text-gray-500 dark:text-gray-400',
    muted: 'text-gray-400 dark:text-gray-500',
  },
  
  // Inputs and forms
  input: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300',
  select: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white transition-colors duration-300',
  
  // Buttons
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-colors duration-300',
    secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors duration-300',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300',
  },
  
  // Navigation
  nav: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 transition-colors duration-300',
  sidebar: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300',
  
  // Dropdowns and modals
  dropdown: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-gray-900/50 transition-colors duration-300',
  modal: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-300',
  overlay: 'bg-black/50 dark:bg-black/70',
  
  // Interactive elements
  hover: 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300',
  active: 'bg-gray-100 dark:bg-gray-700',
  focus: 'focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-opacity-50',
  
  // Borders and dividers
  border: 'border-gray-200 dark:border-gray-700',
  divider: 'border-gray-200 dark:border-gray-700',
  
  // Status and alerts
  success: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
  error: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
};

// Utility function to combine classes
export const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};