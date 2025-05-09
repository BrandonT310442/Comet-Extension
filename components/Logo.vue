<template>
  <div class="logo">
    <div class="logo-icon">
      <span class="gradient-text">S</span>
    </div>
    <div class="logo-text">
      <span class="gradient-text">Supabase Auth</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Logo'
}
</script>

<style scoped>
.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 8px;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.logo-text {
  font-weight: 700;
  font-size: 1.25rem;
}

.gradient-text {
  background: var(--gradient-primary);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
</style> 