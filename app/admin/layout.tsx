import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import { createCookieAdapter } from '@/lib/cookie-adapter';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieAdapter = await createCookieAdapter();
  const supabase = createServerClient(cookieAdapter);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .maybeSingle<{ is_admin: boolean }>();

  if (!profile?.is_admin) return redirect('/');

  return (
    <div className="min-h-screen bg-[var(--tint)]">
      <header className="bg-white border-b border-[var(--border)] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/videos" className="font-bold text-lg text-[var(--ink)]">
            ExamWarZone CMS
          </Link>
          <nav className="flex gap-3 text-sm">
            <Link href="/admin/videos" className="text-[var(--muted)] hover:text-[var(--ink)]">
              Videos
            </Link>
          </nav>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-[var(--muted)] hover:text-[var(--ink)]"
        >
          ← Back to Dashboard
        </Link>
      </header>
      <main className="p-6 max-w-[1400px] mx-auto">
        {children}
      </main>
    </div>
  );
}
