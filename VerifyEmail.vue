<template>
  <div class="verify-email-page">
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Verifying your email, please wait...</p>
    </div>
  </div>
</template>

<script>
import { createClient } from './utils/supabase/client'
import { onMounted } from 'vue'
import { refreshUser } from './lib/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'VerifyEmail',
  setup() {
    const router = useRouter()
    
    onMounted(async () => {
      try {
        const supabase = createClient()
        
        // Get the URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        const type = urlParams.get('type')
        
        if (!token || (type !== 'email_confirmation' && type !== 'signup' && type !== 'recovery')) {
          console.error('Invalid verification parameters', { token, type })
          router.push('/auth')
          return
        }
        
        console.log('Verifying email with token and type:', { token, type })
        
        // Verify the email
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email',
        })
        
        if (error) {
          console.error('Error verifying email:', error)
          router.push('/auth?error=verification_failed')
          return
        }
        
        console.log('Email verified successfully, session:', data?.session)
        
        // If we have a session, set it
        if (data?.session) {
          console.log('Got session from verification, creating server session')
          
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
        }
        
        // Email verified successfully, refresh user state
        await refreshUser()
        
        // Redirect to dashboard
        router.push('/dashboard')
      } catch (error) {
        console.error('Error in email verification:', error)
        router.push('/auth?error=verification_failed')
      }
    })
    
    return {}
  }
}
</script>

<style scoped>
.verify-email-page {
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