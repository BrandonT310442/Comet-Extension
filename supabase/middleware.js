import { createServerClient } from '@supabase/ssr'

export async function updateSession(request, response) {
  let supabaseResponse = { ...response }
  
  const cookieParser = {
    getAll() {
      return Object.fromEntries(
        request.headers.cookie?.split(';').map(c => {
          const [key, ...value] = c.trim().split('=')
          return [key, value.join('=')]
        }) || []
      )
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        // Set the cookie with appropriate options
        const cookieValue = encodeURIComponent(value)
        const cookieOptions = options || {}
        
        let cookieString = `${name}=${cookieValue}`
        
        if (cookieOptions.maxAge) {
          cookieString += `; Max-Age=${cookieOptions.maxAge}`
        }
        
        if (cookieOptions.domain) {
          cookieString += `; Domain=${cookieOptions.domain}`
        }
        
        if (cookieOptions.path) {
          cookieString += `; Path=${cookieOptions.path}`
        } else {
          cookieString += `; Path=/`
        }
        
        if (cookieOptions.httpOnly) {
          cookieString += `; HttpOnly`
        }
        
        if (cookieOptions.secure) {
          cookieString += `; Secure`
        }
        
        if (cookieOptions.sameSite) {
          cookieString += `; SameSite=${cookieOptions.sameSite}`
        }
        
        supabaseResponse.headers = supabaseResponse.headers || {}
        supabaseResponse.headers['Set-Cookie'] = 
          supabaseResponse.headers['Set-Cookie'] 
            ? `${supabaseResponse.headers['Set-Cookie']}; ${cookieString}` 
            : cookieString
      })
    }
  }
  
  const supabase = createServerClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      cookies: cookieParser
    }
  )

  // Refresh the session to get the user info, but don't modify the response
  await supabase.auth.getUser()
  
  return supabaseResponse
} 