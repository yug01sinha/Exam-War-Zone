"use client";

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { Menu } from '@heroicons/react/24/solid';

import DashboardHeader from '@/app/dashboard/components/DashboardHeader';
import DashboardSidebar from '@/app/dashboard/components/DashboardSidebar';
import DashboardHeaderUser from '@/app/dashboard/components/DashboardHeaderUser';
import StatsCards from '@/app/dashboard/components/StatsCards';
import TodaysTasks from '@/app/dashboard/components/TodaysTasks';
import FocusAreas from '@/app/dashboard/components/FocusAreas';

export default async function Dashboard() {
  const cookieStore = await cookies();
  const adaptedCookieStore = {
    get(name: string) {
      const cookie = cookieStore.get(name);
      return cookie ? cookie.value : null;
    },
    set(name: string, value: string, options: any) {
      cookieStore.set({ name, value, ...options });
    },
    delete(name: string, options: any) {
      cookieStore.delete({ name, ...options });
    },
  };
  const supabase = createServerClient(adaptedCookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session, redirect to login
  if (!session) {
    return redirect('/login');
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // Fetch user profile to check onboarding status
  type Profile = { onboarding_completed: boolean };
  let profile: Profile | null = null;
  let profileError = null;
  try {
    const { data: profileData, error: profileErr } = await supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .maybeSingle<Profile>();

    profile = profileData;
    profileError = profileErr;
  } catch (err: any) {
    profileError = err;
  }

  if (profileError) {
    // Unexpected error, redirect to onboarding (safe fallback)
    return redirect('/onboarding');
  } else if (!profile) {
    // No profile exists yet (new user)
    return redirect('/onboarding');
  } else if (!profile.onboarding_completed) {
    // Profile exists but onboarding not completed
    return redirect('/onboarding');
  }

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkSidebarOpen = () => {
      setSidebarOpen(window.innerWidth >= 768); // md breakpoint
    };
    checkSidebarOpen();
    window.addEventListener('resize', checkSidebarOpen);
    return () => window.removeEventListener('resize', checkSidebarOpen);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    return redirect('/login');
  };

  // Extract user name from metadata or email
  const userName =
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Student';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              {/* Mobile sidebar toggle button */}
              <button
                className="md:hidden p-2 rounded-md hover:bg-gray-100"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5 text-gray-600 hover:text-gray-900" />
              </button>
              {/* Logo and wordmark */}
              <div className="flex-shrink-0 flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-indigo-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                    EWR
                  </div>
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-semibold text-gray-900">
                    ExamWarRoom
                  </h1>
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
                    CBSE Class 10
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex md:items-center md:space-x-6">
              <div className="flex items-center space-x-3">
                {/* User avatar (initials) */}
                <div className="h-10 w-10 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {userName.split(' ')[0].charAt(0) ?? user.email.charAt(0).toUpperCase()}
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
          </div>
        </div>
      </header>

      {/* Sidebar (fixed drawer on mobile, static on desktop) */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r z-20 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:left-0 md:top-0 md:bottom-0 md:w-64 md:border-r-0`}>
        <div className="flex flex-col h-full p-4 space-y-6">
          <nav className="mt-2 space-y-2">
            <a
              href="/dashboard"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${sidebarOpen ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Dashboard
            </a>
            <div className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed">
              Learn
            </div>
            <div className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed">
              Test
            </div>
            <div className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed">
              Revise
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-6 ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'} transition-margin duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <DashboardHeader userName={userName} />

          {/* Stats Cards */}
          <StatsCards />

          {/* Today's Tasks */}
          <div className="mt-8">
            <TodaysTasks />
          </div>

          {/* Focus Areas */}
          <div className="mt-8">
            <FocusAreas />
          </div>
        </div>
      </main>
    </div>
  );
}