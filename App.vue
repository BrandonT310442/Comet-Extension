<template>
  <div class="app">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
  // Core colors
  --primary-color: #6366f1;
  --primary-light: #818cf8;
  --primary-dark: #4f46e5;
  
  // Background colors
  --background-primary: #ffffff;
  --background-secondary: #f8fafc;
  --background-tertiary: #f1f5f9;
  --background-hover: rgba(0, 0, 0, 0.05);
  
  // Text colors
  --text-primary: #0f172a;
  --text-secondary: rgba(15, 23, 42, 0.7);
  --text-muted: rgba(15, 23, 42, 0.45);
  --text-on-primary: #ffffff;
  
  // Accent colors
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  
  // UI elements
  --border-color: rgba(0, 0, 0, 0.1);
  
  // Gradients
  --gradient-primary: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  --gradient-text: linear-gradient(to right, var(--text-primary), var(--primary-light));
  --gradient-card: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(255, 255, 255, 0.8) 100%);
  --gradient-dark: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  --gradient-animated: linear-gradient(-45deg, #6366f1, #4f46e5, #818cf8, #4338ca);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

html, body {
  height: 100%;
  background: var(--background-primary);
  color: var(--text-primary);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
}

.app {
  min-height: 100vh;
  background: var(--gradient-dark);
  position: relative;
  overflow-x: hidden;
}

// Dynamic stars background effect
.app::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 25% 15%, rgba(15, 23, 42, 0.1) 1px, transparent 1px),
    radial-gradient(circle at 75% 35%, rgba(15, 23, 42, 0.1) 1px, transparent 1px),
    radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.05) 1px, transparent 1px),
    radial-gradient(circle at 35% 85%, rgba(15, 23, 42, 0.1) 1px, transparent 1px),
    radial-gradient(circle at 85% 72%, rgba(15, 23, 42, 0.1) 1px, transparent 1px);
  background-size: 50px 50px, 100px 100px, 70px 70px, 120px 120px, 80px 80px;
  background-position: 0 0;
  pointer-events: none;
  z-index: -1;
}

.app::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, transparent 30%, var(--background-primary) 100%);
  pointer-events: none;
  z-index: -1;
}

/* Animation keyframes */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

// Common Components Styling
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, transparent, rgba(99, 102, 241, 0.1), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }

  &:hover::before {
    transform: translateX(100%);
  }

  &-primary {
    background: var(--gradient-primary);
    color: var(--text-on-primary);
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
    }
  }

  &-secondary {
    background: var(--background-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: translateY(-2px);
      border-color: var(--primary-light);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
  }
}

.card {
  background: var(--gradient-card);
  border: 1px solid var(--border-color);
  border-radius: 1.25rem;
  padding: 1.5rem;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    border-color: rgba(99, 102, 241, 0.3);
  }
}

.input {
  background: var(--background-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 0.875rem 1.25rem;
  color: var(--text-primary);
  width: 100%;
  transition: all 0.3s ease;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    background: var(--background-tertiary);
  }

  &::placeholder {
    color: var(--text-muted);
  }
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

// Typography
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.2;
  color: var(--text-primary);
}

h1 {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

h2 {
  font-size: 2.25rem;
  margin-bottom: 1.25rem;
  letter-spacing: -0.01em;
}

h3 {
  font-size: 1.75rem;
  margin-bottom: 1rem;
}

p {
  color: var(--text-secondary);
}

// Utility classes
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-4 {
  gap: 1rem;
}

.animate-fadeInUp {
  animation: fadeInUp 0.8s ease forwards;
}

.animate-delay-100 {
  animation-delay: 0.1s;
}

.animate-delay-200 {
  animation-delay: 0.2s;
}

.animate-delay-300 {
  animation-delay: 0.3s;
}

.animate-delay-400 {
  animation-delay: 0.4s;
}

.animate-delay-500 {
  animation-delay: 0.5s;
}

// Responsive
@media (max-width: 768px) {
  html {
    font-size: 14px;
  }

  .container {
    padding: 0 1rem;
  }

  h1 {
    font-size: 2.5rem;
  }

  h2 {
    font-size: 2rem;
  }

  h3 {
    font-size: 1.5rem;
  }
}
</style> 