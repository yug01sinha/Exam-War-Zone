import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase server client adapted from a cookie store.
 * The cookieStore must provide:
 *   get(name): string | null | undefined
 *   set(name, value, options): void
 *   delete(name, options): void
 * This matches the deprecated CookieMethodsServerDeprecated shape expected
 * by @supabase/ssr's createServerClient (which we use under the hood).
 */
export const createServerClient = (cookieStore: {
  get: (name: string) => string | null | undefined;
  set: (name: string, value: string, options: any) => void;
  delete: (name: string, options: any) => void;
}) => {
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => {
          const value = cookieStore.get(name);
          return value;
        },
        set: (name: string, value: string, options: any) => {
          cookieStore.set(name, value, options);
        },
        remove: (name: string, options: any) => {
          cookieStore.delete(name, options);
        },
      },
    }
  );
};

export const createClientComponentClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseAnonKey);
};