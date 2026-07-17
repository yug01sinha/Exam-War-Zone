"use client";

import { useEffect, useState } from 'react';

export default function DashboardHeader({
  userName,
  className = '',
}: {
  userName: string;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`mb-8 opacity-0 translate-y-4 ${isVisible ? 'opacity-100 translate-y-0' : ''} transition-all duration-500 ease-out ${className}`}>
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome back, {userName}!
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {new Date().toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </p>
    </div>
  );
}