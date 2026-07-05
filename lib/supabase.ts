import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const createServerClient = (cookieStore: {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options: any) => void;
  delete: (name: string, options: any) => void;
}) => {
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return { value: cookieStore.get(name) };
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        delete(name: string, options: any) {
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