"use client";

import { useState } from 'react';
import { Menu, XMark } from '@heroicons/react/24/solid';
import { createClientComponentClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface DashboardHeaderUserProps {
  userName: string;
  userEmail: string;
}

export default function DashboardHeaderUser({
  userName,
  userEmail
}: DashboardHeaderUserProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClientComponentClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="hidden md:flex md:items-center md:space-x-6">
      <div className="flex items-center space-x-3">
        {/* User avatar (initials) */}
        <div className="h-10 w-10 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
          {userName.split(' ')[0].charAt(0) ?? userEmail.charAt(0).toUpperCase()}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-700">
            {userName}
          </p>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:underline"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}