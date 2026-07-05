import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const supabase = createServerClient();

  // Get session on server side
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session, redirect to login
  if (!session) {
    redirect('/login');
  }

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  ExamWarRoom Dashboard
                </h1>
              </div>
            </div>
            <div className="hidden md:flex md:items-center md:space-x-6">
              <a
                href="/dashboard"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              >
                Dashboard
              </a>
            </div>
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">
                  {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
                </span>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    redirect('/login');
                  }}
                  className="px-3 py-1 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Welcome to your dashboard
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Your personalized study space for CBSE Class 10 preparation
              </p>
            </div>
            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-indigo-50 p-4 rounded-lg text-center">
                  <h3 className="font-medium text-indigo-800 mb-2">Active Streak</h3>
                  <p className="text-3xl font-bold text-indigo-600">5 days</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg text-center">
                  <h3 className="font-medium text-indigo-800 mb-2">Subjects Mastered</h3>
                  <p className="text-3xl font-bold text-indigo-600">3/5</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg text-center">
                  <h3 className="font-medium text-indigo-800 mb-2">Doubts Solved</h3>
                  <p className="text-3xl font-bold text-indigo-600">24</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
