"use client";

export const dynamic = 'force-dynamic';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase';

// Component to check for error in URL using Suspense
function UrlErrorChecker() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');

  if (urlError === 'invalid_token') {
    return (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
        Invalid or expired password reset link. Please request a new one.
      </div>
    );
  }

  return null;
}

export default function Login() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [formState, setFormState] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { email, password } = formState;

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else if (signInError.message.includes('email not confirmed')) {
          setError('Please confirm your email before signing in');
        } else {
          setError(signInError.message);
        }
      } else {
        // Check if onboarding is completed
        type Profile = { onboarding_completed: boolean };
        let profile: Profile | null = null;
        let profileError = null;
        try {
          const { data: profileData, error: profileErr } = await supabase
            .from('user_profiles')
            .select('onboarding_completed')
            .eq('user_id', data.user.id)
            .maybeSingle();

          profile = profileData as Profile || null;
          profileError = profileErr;
        } catch (err: any) {
          profileError = err;
        }

        if (profileError) {
          // Unexpected error, show it
          setError('Failed to check profile: ' + (profileError.message || String(profileError)));
        } else if (!profile) {
          // No profile exists yet (new user)
          router.push('/onboarding');
        } else if (!profile.onboarding_completed) {
          // Profile exists but onboarding not completed
          router.push('/onboarding');
        } else {
          // Profile exists and onboarding completed
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    // signInWithOAuth will redirect the user to Google and back automatically
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-blue-50">
      <div className="w-full max-w-md space-y-6 p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Sign In to Your Account
        </h2>
        <Suspense fallback={<div></div>}>
          <UrlErrorChecker />
        </Suspense>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formState.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formState.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="mr-2">Signing in...</span>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              </>
            ) : (
              'Sign In'
            )}
          </button>
          <div className="flex items-center justify-center mt-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Sign in with Google
            </button>
          </div>
          <div className="text-sm text-center">
            <a href="/forgot-password" className="text-indigo-600 hover:underline">
              Forgot password?
            </a>
          </div>
          <p className="text-sm text-center text-gray-500">
            Don't have an account?{' '}
            <a href="/signup" className="font-medium text-indigo-600 hover:underline">
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}