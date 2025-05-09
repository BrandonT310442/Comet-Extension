import { createServerClient } from '@supabase/ssr'

export async function createClient(cookies) {
  return createServerClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookies.get(name)
        },
        set(name, value, options) {
          cookies.set(name, value, options)
        },
        remove(name, options) {
          cookies.set(name, '', { ...options, maxAge: 0 })
        }
      }
    }
  )
} 