import React from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { DarkModeProvider } from '@/components/DarkModeProvider';
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Navbar />
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-full z-10">
        <Sidebar />
      </div>
      
      {/* Main Content with left margin to account for fixed sidebar */}
      <main className="flex-1 ml-80 overflow-y-auto">
        <DarkModeProvider>
          {children}
        </DarkModeProvider>
      </main>
    </div>
  );
}