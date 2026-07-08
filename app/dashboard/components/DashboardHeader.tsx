"use client";

export default function DashboardHeader({ userName }: { userName: string }) {
  return (
    <div className="mb-8">
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