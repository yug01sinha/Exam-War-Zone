import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  // Get cookie store that allows reading and setting cookies (for request and response)
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
  await supabase.auth.getUser();

  // If session changed, we may need to set cookies etc. supabase already handled via set/delete.
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon icon)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};