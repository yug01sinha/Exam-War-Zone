import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';

import OnboardingForm from './onboarding-form';

export default async function OnboardingPage() {
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

  // Check if user has completed onboarding
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
  } else if (profile && profile.onboarding_completed) {
    // Profile exists and onboarding completed -> redirect to dashboard
    return redirect('/dashboard');
  } else {
    // Either no profile exists or onboarding not completed -> show the form
    return <OnboardingForm userId={user.id} />;
  }
}