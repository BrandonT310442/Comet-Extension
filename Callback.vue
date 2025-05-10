<template>
  <div class="callback-page">
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Redirecting to login...</p>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Callback',
  setup() {
    const router = useRouter()
    
    onMounted(() => {
      // Since we've removed OAuth, just redirect to auth page
      router.push('/auth')
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