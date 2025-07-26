"use client";
import React from 'react';
import DasboardLayout from '@/components/DasboardLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DasboardLayout>
      {children}
    </DasboardLayout>
  );
}
