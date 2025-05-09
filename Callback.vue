<template>
  <div class="callback-page">
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Finishing authentication, please wait...</p>
    </div>
  </div>
</template>

<script>
import { createClient } from '@/utils/supabase/client'
import { onMounted } from 'vue'
import { refreshUser } from '@/lib/auth'  // Import the refreshUser method
import { useRouter } from 'vue-router'

export default {
  name: 'Callback',
  setup() {
    const router = useRouter()
    
    onMounted(async () => {
      try {
        const supabase = createClient()
        
        // Exchange code for session
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.search
        )
        
        if (error) {
          console.error('Error exchanging code for session:', error)
          // Redirect to auth page with error message
          router.push(`/auth?error=${encodeURIComponent(error.message)}`)
          return
        }
        
        // Refresh the user state to make sure it's updated
        await refreshUser()
        
        // Redirect to dashboard on success
        router.push('/dashboard')
      } catch (error) {
        console.error('Error in callback handling:', error)
        router.push(`/auth?error=${encodeURIComponent('Authentication failed')}`)
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