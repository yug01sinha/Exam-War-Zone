import { createServerClient } from '@/lib/supabase';
import { createCookieAdapter } from '@/lib/cookie-adapter';

export async function requireAdmin() {
  const cookieAdapter = await createCookieAdapter();
  const supabase = createServerClient(cookieAdapter);

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { authorized: false, error: 'Unauthorized', status: 401 } as const;
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .maybeSingle<{ is_admin: boolean }>();

  if (profileError || !profile || !profile.is_admin) {
    return { authorized: false, error: 'Forbidden', status: 403 } as const;
  }

  return { authorized: true, supabase, user } as const;
}
