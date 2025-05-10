import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a custom storage object that uses cookies
const cookieStorage = {
  getItem: (key) => {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.startsWith(key + '=')) {
        return cookie.substring(key.length + 1)
      }
    }
    return null
  },
  setItem: (key, value) => {
    // Store in a secure, http-only cookie (only accessible by the server)
    // We'll rely on our server-side auth instead
    document.cookie = `${key}=${value}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    return true
  },
  removeItem: (key) => {
    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    return true
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase_auth_token',
    storage: cookieStorage,
    flowType: 'pkce',
    // Use cookies for auth
    cookieOptions: {
      name: 'supabase_auth_token',
      lifetime: 60 * 60 * 24 * 7, // 7 days
      domain: window.location.hostname,
      path: '/',
      sameSite: 'lax'
    }
  }
}) 