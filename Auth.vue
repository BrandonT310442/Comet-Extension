<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header">
          <router-link to="/" class="logo-link">
            <Logo />
          </router-link>
          <div class="auth-tabs">
            <button 
              :class="['tab-btn', { active: isLogin }]" 
              @click="isLogin = true"
            >
              Log in
            </button>
            <button 
              :class="['tab-btn', { active: !isLogin }]" 
              @click="isLogin = false"
            >
              Sign up
            </button>
          </div>
        </div>

        <div class="progress-bar" v-if="!isLogin">
          <div class="progress" :style="{ width: progress + '%' }"></div>
          <span class="progress-text">{{ progress }}% Complete</span>
        </div>

        <div v-if="errorMsg" class="error-message">
          {{ errorMsg }}
        </div>

        <div v-if="successMsg" class="success-message">
          {{ successMsg }}
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div class="form-group" v-if="!isLogin">
            <label>Full Name</label>
            <input 
              type="text" 
              v-model="form.name" 
              class="input" 
              placeholder="John Doe"
              required
            >
          </div>

          <div class="form-group">
            <label>Email</label>
            <input 
              type="email" 
              v-model="form.email" 
              class="input" 
              placeholder="your@email.com"
              required
            >
          </div>

          <div class="form-group">
            <label>Password</label>
            <input 
              type="password" 
              v-model="form.password" 
              class="input" 
              placeholder="••••••••"
              required
              minlength="6"
            >
          </div>
          
          <div class="form-group" v-if="!isLogin">
            <label>Confirm Password</label>
            <input 
              type="password" 
              v-model="form.confirmPassword" 
              class="input" 
              placeholder="••••••••"
              required
              minlength="6"
            >
            <div class="password-mismatch" v-if="passwordsMismatch">
              Passwords do not match
            </div>
          </div>

          <div class="oauth-buttons">
            <button type="button" class="btn btn-secondary oauth-btn" @click="signInWithGoogle">
              <img src="https://www.google.com/favicon.ico" alt="Google" class="oauth-icon">
              Continue with Google
            </button>
          </div>

          <button type="submit" class="btn btn-primary submit-btn" :disabled="loading || (!isLogin && passwordsMismatch)">
            {{ loading ? 'Processing...' : (isLogin ? 'Log in' : 'Create account') }}
          </button>
        </form>

        <p class="auth-footer">
          {{ isLogin ? "Don't have an account? " : "Already have an account? " }}
          <a href="#" @click.prevent="isLogin = !isLogin">
            {{ isLogin ? 'Sign up' : 'Log in' }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Logo from './components/Logo.vue'
import { createClient } from './utils/supabase/client'
import { onMounted, watch } from 'vue'
import { refreshUser } from './lib/auth'  // This should work now

export default {
  name: 'Auth',
  components: {
    Logo
  },
  data() {
    return {
      isLogin: true,
      progress: 60,
      loading: false,
      errorMsg: '',
      successMsg: '',
      form: {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      }
    }
  },
  computed: {
    passwordsMismatch() {
      return this.form.password !== this.form.confirmPassword && this.form.confirmPassword.length > 0
    }
  },
  created() {
    // Check for error or success parameters
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    const type = params.get('type')
    
    if (error) {
      this.errorMsg = error === 'callback_error' 
        ? 'Authentication failed. Please try again.' 
        : decodeURIComponent(error)
    }
    
    if (type === 'signup' && !error) {
      this.successMsg = 'Your account has been created. Please check your email to confirm your registration.'
    }
  },
  mounted() {
    // Check authentication status when component is mounted
    this.checkAuthStatus()
  },
  methods: {
    async checkAuthStatus() {
      try {
        const response = await fetch('http://localhost:3000/auth/user', {
          method: 'GET',
          credentials: 'include' // Important for cookies to be sent
        })
        
        const data = await response.json()
        
        if (data.user) {
          console.log('User already authenticated, redirecting to dashboard')
          this.$router.push('/dashboard')
        }
      } catch (error) {
        console.error('Error checking auth status:', error)
      }
    },
    
    async handleSubmit() {
      this.loading = true
      this.errorMsg = ''
      
      try {
        if (this.isLogin) {
          await this.handleLogin()
        } else {
          if (this.form.password !== this.form.confirmPassword) {
            throw new Error('Passwords do not match. Please try again.')
          }
          await this.handleSignup()
        }
      } catch (error) {
        this.errorMsg = error.message || 'An error occurred during authentication'
        console.error('Auth error:', error)
      } finally {
        this.loading = false
      }
    },
    
    async handleLogin() {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Important for cookies to be stored
        body: JSON.stringify({
          email: this.form.email,
          password: this.form.password
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to log in')
      }
      
      // Refresh the user state to make sure it's updated
      await refreshUser()
      
      // Redirect to dashboard
      this.$router.push('/dashboard')
    },
    
    async handleSignup() {
      const response = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Important for cookies to be stored
        body: JSON.stringify({
          email: this.form.email,
          password: this.form.password,
          name: this.form.name
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up')
      }
      
      if (data.user) {
        // Refresh the user state to make sure it's updated
        await refreshUser()
        
        // User is automatically signed in (email confirmation disabled)
        this.$router.push('/dashboard')
      } else {
        // Email confirmation is required
        this.successMsg = 'Please check your email to confirm your registration'
        this.form = { name: '', email: '', password: '', confirmPassword: '' } // Clear form
      }
    },
    
    async signInWithGoogle() {
      this.loading = true
      this.errorMsg = ''
      
      try {
        // For OAuth like Google, we still use the Supabase client directly
        // as it handles the OAuth flow which needs to open in the browser
        const supabase = createClient()
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent'
            }
          }
        })
        
        if (error) throw error
        
        // For OAuth, we don't redirect here as the user will be redirected by Supabase
      } catch (error) {
        this.errorMsg = 'Failed to sign in with Google'
        console.error('Google sign-in error:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.password-mismatch {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }
}

.auth-container {
  width: 100%;
  max-width: 480px;
  position: relative;
  z-index: 1;
}

.auth-card {
  padding: 2.5rem;
  position: relative;
  overflow: hidden;
  background: var(--background-primary);
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;

  .logo-link {
    text-decoration: none;
    display: inline-block;
    margin-bottom: 2rem;
  }
}

.auth-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--border-color);
  }

  .tab-btn {
    flex: 1;
    padding: 0.75rem;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--gradient-primary);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    &.active {
      color: var(--text-primary);

      &::after {
        transform: scaleX(1);
      }
    }

    &:hover {
      color: var(--text-primary);
    }
  }
}

.progress-bar {
  height: 4px;
  background: var(--bg-secondary);
  border-radius: 2px;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;

  .progress {
    height: 100%;
    background: var(--gradient-primary);
    border-radius: 2px;
    transition: width 0.3s ease;
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      animation: shimmer 2s infinite;
    }
  }

  .progress-text {
    position: absolute;
    right: 0;
    top: -1.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
}

.auth-form {
  .form-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }
  }
}

.oauth-buttons {
  margin: 2rem 0;

  .oauth-btn {
    width: 100%;
    justify-content: center;
    background: var(--background-secondary);
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;

    &:hover {
      background: var(--background-tertiary);
      transform: translateY(-2px);
    }

    .oauth-icon {
      width: 18px;
      height: 18px;
    }
  }
}

.submit-btn {
  width: 100%;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }

  &:hover::before {
    transform: translateX(100%);
  }
}

.auth-footer {
  text-align: center;
  margin-top: 2rem;
  color: var(--text-secondary);
  font-size: 0.875rem;

  a {
    color: var(--primary);
    text-decoration: none;
    position: relative;
    padding: 0.25rem 0;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background: var(--gradient-primary);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    &:hover {
      color: var(--primary-light);

      &::after {
        transform: scaleX(1);
      }
    }
  }
}

.error-message {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.success-message {
  background-color: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@media (max-width: 768px) {
  .auth-page {
    padding: 1rem;
  }

  .auth-card {
    padding: 1.5rem;
  }

  .auth-header {
    .logo-link {
      font-size: 2rem;
    }
  }
}
</style> 