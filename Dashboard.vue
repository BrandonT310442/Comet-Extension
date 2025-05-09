<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div class="brand">
        <Logo />
      </div>
      <button class="btn btn-secondary logout-btn" @click="handleLogout">
        Logout
      </button>
    </div>
    
    <div class="dashboard-content">
      <div class="welcome-card card">
        <h1>Welcome to your Dashboard</h1>
        <p v-if="user">You are logged in as {{ user.email }}</p>
        <p v-else>Loading user information...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Logo from './components/Logo.vue';
import { refreshUser, logout } from './lib/auth';

export default {
  name: 'Dashboard',
  components: {
    Logo
  },
  setup() {
    const user = ref(null);
    
    onMounted(async () => {
      const currentUser = await refreshUser();
      user.value = currentUser;
      
      // Redirect to login if not authenticated
      if (!currentUser) {
        window.location.href = '/';
      }
    });
    
    const handleLogout = async () => {
      await logout();
      window.location.href = '/';
    };
    
    return {
      user,
      handleLogout
    };
  }
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: var(--background-primary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.dashboard-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  padding: 2rem;
  text-align: center;
  background: var(--background-primary);
}

.welcome-card h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  background: var(--gradient-primary);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.logout-btn {
  padding: 0.5rem 1rem;
}
</style> 