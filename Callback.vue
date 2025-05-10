<template>
  <div class="callback-page">
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Finishing authentication, please wait...</p>
    </div>
  </div>
</template>

<script>
import { createClient } from './utils/supabase/client'
import { onMounted } from 'vue'
import { refreshUser } from './lib/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'Callback',
  setup() {
    const router = useRouter()
    
    onMounted(async () => {
      try {
        const supabase = createClient()
        
        // Process the OAuth callback using Supabase's built-in handling
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          router.push('/auth')
          return
        }
        
        if (data.session) {
          console.log('Session established successfully')
          
          // Call the server to create a server-side session
          try {
            const response = await fetch('http://localhost:3000/auth/oauth-callback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                user: data.user
              })
            })
            
            if (!response.ok) {
              throw new Error('Failed to create server session')
            }
            
            console.log('Server session created successfully')
          } catch (serverError) {
            console.error('Error creating server session:', serverError)
            // Continue anyway as we might still have a valid session
          }
          
          // Refresh the user state in our application
          await refreshUser()
          
          // Redirect to dashboard
          router.push('/dashboard')
          return
        }
        
        // If we don't have a session yet, try to exchange the code for a session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href)
        
        if (exchangeError) {
          console.error('Error exchanging code for session:', exchangeError)
          router.push('/auth')
          return
        }
        
        // Get the session after code exchange
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !sessionData?.session) {
          console.error('Error getting session after code exchange:', sessionError)
          router.push('/auth')
          return
        }
        
        // Call the server to create a server-side session
        try {
          const response = await fetch('http://localhost:3000/auth/oauth-callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              access_token: sessionData.session.access_token,
              refresh_token: sessionData.session.refresh_token,
              user: sessionData.user
            })
          })
          
          if (!response.ok) {
            throw new Error('Failed to create server session')
          }
          
          console.log('Server session created successfully')
        } catch (serverError) {
          console.error('Error creating server session:', serverError)
          // Continue anyway as we might still have a valid session
        }
        
        // Refresh the user state
        await refreshUser()
        
        // Redirect to dashboard
        router.push('/dashboard')
      } catch (error) {
        console.error('Error in callback handling:', error)
        router.push('/auth')
      }
    })
    
    return {}
  }
}
</script>

<style scoped>
.callback-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg-primary);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(99, 102, 241, 0.3);
  border-radius: 50%;
  border-top-color: rgb(99, 102, 241);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 