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
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single();

      // If profile exists and onboarding is completed, go to dashboard
      // Otherwise, go to onboarding
      if (profile && profile.onboarding_completed) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    }
  }

  // If no code or error, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}