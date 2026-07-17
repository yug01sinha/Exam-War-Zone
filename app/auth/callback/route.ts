import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
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
    await supabase.auth.exchangeCodeForSession(code);

    // After successful sign in, check if user has completed onboarding
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      type Profile = { onboarding_completed: boolean };
      let profile: Profile | null = null;
      let profileError = null;
      try {
        const { data: profileData, error: profileErr } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle<Profile>();

        profile = profileData as Profile || null;
        profileError = profileErr;
      } catch (err: any) {
        profileError = err;
      }

      if (profileError) {
        // Log the error (in a real app, you might want to log to an error monitoring service)
        console.error('Failed to check profile in callback:', profileError);
        // In case of error, we'll treat as if onboarding is not completed and redirect to onboarding
        return NextResponse.redirect(new URL('/onboarding', request.url));
      } else if (!profile) {
        // No profile exists yet (new user)
        return NextResponse.redirect(new URL('/onboarding', request.url));
      } else if (!profile.onboarding_completed) {
        // Profile exists but onboarding not completed
        return NextResponse.redirect(new URL('/onboarding', request.url));
      } else {
        // Profile exists and onboarding completed
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  // If no code or error, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}