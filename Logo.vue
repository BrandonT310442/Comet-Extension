<template>
  <div class="logo">
    <router-link to="/" class="logo-link">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Comet/meteor design -->
        <path
          d="M28 12L10 30M28 12L24 8M28 12L32 16M10 30L6 26M10 30L14 34"
          stroke="#6366f1"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="comet-trail"
        />
        <path
          d="M24 16C24 16 21 19 18 22C15 25 12 28 12 28"
          stroke="#6366f1"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="comet-body"
          fill="url(#cometGradient)"
        />
        <circle cx="26" cy="14" r="4" fill="url(#cometGradient)" class="comet-head" />
        <defs>
          <linearGradient id="cometGradient" x1="12" y1="28" x2="26" y2="14" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#6366f1"/>
          </linearGradient>
        </defs>
      </svg>
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
    
    svg {
      transition: all 0.3s ease;
      filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.2));
      
      .comet-head, .comet-body, .comet-trail {
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
        
        .comet-head, .comet-body, .comet-trail {
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