import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (code) {
    // Added 'await' here to resolve the Next.js async cookies Promise
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to the desired page (default to home)
  const url = requestUrl.origin + next;
  return NextResponse.redirect(url);
}
