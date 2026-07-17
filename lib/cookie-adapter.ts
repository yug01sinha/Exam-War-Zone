import { cookies } from 'next/headers';

export async function createCookieAdapter() {
  const cookieStore = await cookies();
  return {
    get(name: string) {
      const c = cookieStore.get(name);
      return c ? c.value : null;
    },
    set(name: string, value: string, options: any) {
      cookieStore.set({ name, value, ...options });
    },
    delete(name: string, options: any) {
      cookieStore.delete({ name, ...options });
    },
  };
}
