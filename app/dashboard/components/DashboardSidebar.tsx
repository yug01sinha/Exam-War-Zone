"use client";

import { useState, useEffect } from 'react';
import {
  CalendarIcon,
  BookOpenIcon,
  DocumentTextIcon,
  ListBulletIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Determine if we're on mobile (width < 768px)
  useEffect(() => {
    const updateSidebar = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      // On desktop (>= md), force sidebar open
      // On mobile (< md), allow toggling (default closed)
      if (width >= 768) {
        setSidebarOpen(true);
      } else {
        // Only set to false if we're coming from desktop to mobile
        // Otherwise, preserve the user's toggle state
        if (!isMobile) {
          setSidebarOpen(false);
        }
      }
    };

    // Initialize
    updateSidebar();
    window.addEventListener('resize', updateSidebar);
    return () => window.removeEventListener('resize', updateSidebar);
  }, [isMobile]);

  const handleToggle = () => {
    // Only allow toggling on mobile
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const isActive = pathname === '/dashboard';
  const isSidebarVisible = !isMobile || sidebarOpen;

  return (
    <>
      {/* Mobile toggle button (only visible on mobile) */}
      {isMobile && (
        <button
          onClick={handleToggle}
          className="fixed top-4 left-4 z-50 p-2 rounded-md hover:bg-gray-100"
        >
          <Bars3Icon className="h-5 w-5 text-gray-600 hover:text-gray-900" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-white border-r z-20 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:left-0 md:top-0 md:bottom-0 md:w-64 md:border-r-0`}
      >
        <div className="flex flex-col h-full p-4 space-y-6">
          <nav className="mt-2 space-y-2">
            {/* Dashboard link (active) */}
            <a
              href="/dashboard"
              onClick={(e) => {
                e.preventDefault();
                router.push('/dashboard');
              }}
              className={`
                flex items-center px-2 py-2 text-sm font-medium rounded-md
                ${isActive && isSidebarVisible
                  ? 'bg-indigo-50 text-indigo-600'
                  : !isActive && isSidebarVisible
                  ? 'text-gray-500 hover:bg-gray-50'
                  : 'text-invisible'}
                border-l-4
                ${isActive && isSidebarVisible ? 'border-indigo-600' : 'border-transparent'}
                ${!isActive && isSidebarVisible ? 'hover:bg-gray-50' : ''}
              `}
            >
              <CalendarIcon className="h-4 w-4 mr-3" />
              Dashboard
            </a>

            {/* Learn link (disabled) */}
            <div
              title="Coming soon"
              className={`
                flex items-center px-2 py-2 text-sm font-medium rounded-md
                ${isSidebarVisible ? 'text-gray-400 hover:bg-gray-50' : 'text-invisible'}
                cursor-not-allowed
              `}
            >
              <BookOpenIcon className="h-4 w-4 mr-3" />
              Learn
            </div>

            {/* Test link (disabled) */}
            <div
              title="Coming soon"
              className={`
                flex items-center px-2 py-2 text-sm font-medium rounded-md
                ${isSidebarVisible ? 'text-gray-400 hover:bg-gray-50' : 'text-invisible'}
                cursor-not-allowed
              `}
            >
              <DocumentTextIcon className="h-4 w-4 mr-3" />
              Test
            </div>

            {/* Revise link (disabled) */}
            <div
              title="Coming soon"
              className={`
                flex items-center px-2 py-2 text-sm font-medium rounded-md
                ${isSidebarVisible ? 'text-gray-400 hover:bg-gray-50' : 'text-invisible'}
                cursor-not-allowed
              `}
            >
              <ListBulletIcon className="h-4 w-4 mr-3" />
              Revise
            </div>
          </nav>

          {/* Mobile close button (X icon) - only show when sidebar is open on mobile */}
          {isMobile && sidebarOpen && (
            <button
              onClick={handleToggle}
              className="mt-auto p-2"
            >
              <XMarkIcon className="h-5 w-5 text-gray-600 hover:text-gray-900" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}