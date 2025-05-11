<template>
  <div class="logo">
    <router-link to="/" class="logo-link">
      <img src="/Logo.png" alt="Comet Logo" width="40" height="40" class="logo-image" />
      <span v-if="showText">Comet</span>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'Logo',
  props: {
    showText: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style lang="scss" scoped>
.logo {
  .logo-link {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding-top: 8px;
    padding-bottom: 4px;
    text-decoration: none;
    transition: all 0.3s ease;
    
    .logo-image {
      transition: all 0.3s ease;
      filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.2));
      position: relative;
      top: -2px; /* Raise the logo up a bit */
    }
    
    span {
      font-size: 1.75rem;
      font-weight: 700;
      color: #6366f1;
      transition: all 0.3s ease;
    }
    
    &:hover {
      transform: scale(1.05);
      .logo-image {
        filter: drop-shadow(0 0 12px rgba(99, 102, 241, 0.4));
        filter: brightness(1.2);
      }
      span {
        color: #4f46e5;
      }
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}
</style>