"use client";

import { useState, useEffect } from 'react';
import { Calendar, BookOpen, FileText, List } from '@heroicons/react/24/solid';

interface DashboardSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function DashboardSidebar({
  sidebarOpen,
  setSidebarOpen
}: DashboardSidebarProps) {
  // Handle sidebar state on resize
  useEffect(() => {
    const checkSidebarOpen = () => {
      setSidebarOpen(window.innerWidth >= 768); // md breakpoint
    };
    checkSidebarOpen();
    window.addEventListener('resize', checkSidebarOpen);
    return () => window.removeEventListener('resize', checkSidebarOpen);
  }, [setSidebarOpen]);

  return (
    <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r z-20 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:left-0 md:top-0 md:bottom-0 md:w-64 md:border-r-0`}>
      <div className="flex flex-col h-full p-4 space-y-6">
        <nav className="mt-2 space-y-2">
          <a
            href="/dashboard"
            className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${sidebarOpen ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Calendar className="h-4 w-4 mr-3" />
            Dashboard
          </a>
          <div className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-active">
            <BookOpen className="h-4 w-4 mr-3" />
            Learn
          </div>
          <div className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-active">
            <FileText className="h-4 w-4 mr-3" />
            Test
          </div>
          <div className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-active">
            <List className="h-4 w-4 mr-3" />
            Revise
          </div>
        </nav>
      </div>
    </aside>
  );
}