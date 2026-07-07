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
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .single();

  // If profile exists and onboarding is completed, redirect to dashboard
  if (profile && profile.onboarding_completed) {
    return redirect('/dashboard');
  }

  // Otherwise, show the onboarding form
  return <OnboardingForm userId={user.id} />;
}