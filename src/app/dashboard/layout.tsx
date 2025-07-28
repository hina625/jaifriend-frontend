"use client";
import React from 'react';
import AuthGuard from '../../components/AuthGuard';
import DasboardLayout from '../../components/DasboardLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={true} redirectTo="/">
      <DasboardLayout>
        {children}
      </DasboardLayout>
    </AuthGuard>
  );
}
