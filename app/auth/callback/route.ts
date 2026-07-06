import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

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
  }

  // Redirect to the desired page (default to home)
  const url = requestUrl.origin + next;
  return NextResponse.redirect(url);
}