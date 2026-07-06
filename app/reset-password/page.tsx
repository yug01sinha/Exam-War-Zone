"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase';

// Component to check for token in URL using Suspense
function TokenChecker({ children }: { children: (token: string | null) => React.ReactNode }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('access_token') ?? searchParams.get('accessToken');
  return children(token);
}

export default function ResetPassword() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check for token in URL on mount
  useEffect(() => {
    // We'll get the token from the Suspense wrapper
  }, []); // Empty deps since we're getting it from props/context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!accessToken) {
      setError('Invalid session. Please try again.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const supabase = createClientComponentClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    }
    setLoading(false);
  };

  if (!accessToken) {
    // Show loading state while checking for token
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="mt-2 text-gray-600">Processing...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <h2 className="text-center text-2xl font-bold text-gray-800">Reset Your Password</h2>
          <p className="text-center text-gray-600">
            Enter a new password for your account.
          </p>
          <TokenChecker>
            {(token) => {
              // Set the token from the URL if we haven't already
              if (token && !accessToken) {
                setAccessToken(token);
              }

              if (!accessToken) {
                // No token found, redirect to login with error
                // We can't do redirects during render, so we'll show a message
                // and use an effect to redirect
                return (
                  <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="p-8 text-center">
                      <p className="text-red-600">Invalid or expired token. Redirecting to login...</p>
                    </div>
                  </div>
                );
              }

              return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-center text-2xl font-bold text-gray-800">Reset Your Password</h2>
                    <p className="text-center text-gray-600">
                      Enter a new password for your account.
                    </p>
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                        {success}
                      </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                          minLength={6}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <span className="mr-2">Updating...</span>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                          </>
                        ) : (
                          'Reset Password'
                        )}
                      </button>
                      <p className="text-center text-sm text-gray-500">
                        Remember your password?{' '}
                        <a href="/login" className="font-medium text-indigo-600 hover:underline">
                          Sign In
                        </a>
                      </p>
                    </form>
                  </div>
                </div>
              );
            }}
          </TokenChecker>
        </div>
      </div>
    </Suspense>
  );
}