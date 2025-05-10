<template>
  <div class="logo">
    <router-link to="/" class="logo-link">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M17 17C17 13.6863 19.2386 10.9543 22.3755 9.71663C22.2425 9.71301 22.1099 9.71117 21.9769 9.71117C16.7228 9.71117 12.3547 14.0793 12.3547 19.3334C12.3547 24.5874 16.7228 28.9556 21.9769 28.9556C26.2021 28.9556 29.8217 26.1832 30.9175 22.3547C28.8656 23.4735 26.5543 24 24.1231 24C20.2645 24 17.0001 20.7355 17 17Z"
          fill="url(#moonGradient)"
          class="moon"
        />
        <defs>
          <linearGradient id="moonGradient" x1="12.3547" y1="9.71117" x2="30.9175" y2="28.9556" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#6366f1"/>
            <stop offset="100%" stop-color="#4f46e5"/>
          </linearGradient>
        </defs>
      </svg>
      <span v-if="showText">Eclipse</span>
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
    
    svg {
      transition: all 0.3s ease;
      filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.2));
      
      .moon {
        animation: float 3s ease-in-out infinite;
        transition: filter 0.3s ease;
      }
    }
    
    span {
      font-size: 1.75rem;
      font-weight: 700;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      color: transparent;
      transition: all 0.3s ease;
    }
    
    &:hover {
      transform: scale(1.05);
      
      svg {
        filter: drop-shadow(0 0 12px rgba(99, 102, 241, 0.4));
        
        .moon {
          filter: brightness(1.2);
        }
      }
      
      span {
        background: linear-gradient(to right, #818cf8, #6366f1);
        -webkit-background-clip: text;
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