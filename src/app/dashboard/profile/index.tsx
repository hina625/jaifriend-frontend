"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileIndex() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/profile/users');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to user profiles...</p>
      </div>
    </div>
  );
} 