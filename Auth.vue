<template>
  <div class="auth-bg">
    <div class="auth-card">
      <div class="auth-header">
        <Logo />
      </div>
      <div class="auth-tabs">
        <button :class="['tab-btn', { active: isLogin }]" @click="isLogin = true">Log in</button>
        <button :class="['tab-btn', { active: !isLogin }]" @click="isLogin = false">Sign up</button>
      </div>
      
      <!-- Verification Success Message -->
      <div v-if="verificationSuccess" class="message-box success">
        <div class="message-icon">✓</div>
        <div class="message-content">
          <h3>Email Verified!</h3>
          <p>Your email has been successfully verified. You can now log in.</p>
        </div>
        <button class="close-btn" @click="verificationSuccess = false">&times;</button>
      </div>
      
      <!-- Verification Error Message -->
      <div v-if="verificationError" class="message-box error">
        <div class="message-icon">!</div>
        <div class="message-content">
          <h3>Verification Failed</h3>
          <p>There was a problem verifying your email. Please try again.</p>
        </div>
        <button class="close-btn" @click="verificationError = false">&times;</button>
      </div>
      
      <!-- Error Message -->
      <div v-if="errorMsg" class="message-box error">
        <div class="message-icon">!</div>
        <div class="message-content">
          <h3>Error</h3>
          <p>{{ errorMsg }}</p>
        </div>
        <button class="close-btn" @click="errorMsg = ''">&times;</button>
      </div>
      
      <!-- Email Verification Dialog -->
      <div v-if="showVerificationDialog" class="verification-dialog">
        <div class="verification-content">
          <div class="verification-icon">✉️</div>
          <h2>Verify Your Email</h2>
          <p>We've sent a verification email to <strong>{{ form.email }}</strong>.</p>
          <p>Please check your inbox and click the verification link to complete your registration.</p>
          <p class="verification-note">If you don't see the email, check your spam folder.</p>
        </div>
      </div>
      
      <form @submit.prevent="handleSubmit" class="auth-form" v-if="!showVerificationDialog">
        <div v-if="!isLogin" class="form-group">
          <label>Full Name</label>
          <input type="text" v-model="form.name" class="input" placeholder="John Doe" required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="form.email" class="input" placeholder="your@email.com" required />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" v-model="form.password" class="input" placeholder="••••••••" required minlength="6" />
        </div>
        <div v-if="!isLogin" class="form-group">
          <label>Confirm Password</label>
          <input type="password" v-model="form.confirmPassword" class="input" placeholder="••••••••" required minlength="6" />
          <div class="password-mismatch" v-if="passwordsMismatch">Passwords do not match</div>
        </div>
        <button type="submit" class="btn primary-btn" :disabled="loading || (!isLogin && passwordsMismatch)">
          {{ loading ? 'Processing...' : (isLogin ? 'Log in' : 'Sign up') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import Logo from './components/Logo.vue'
import { createClient } from './utils/supabase/client'
import { onMounted, watch } from 'vue'
import { refreshUser } from './lib/auth'

export default {
  name: 'Auth',
  components: { Logo },
  data() {
    return {
      isLogin: true,
      loading: false,
      errorMsg: '',
      successMsg: '',
      showVerificationDialog: false,
      verificationSuccess: false,
      verificationError: false,
      user: null, // Store user data in memory
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
  mounted() {
    // Check URL parameters for verification status
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    
    if (error === 'verification_failed') {
      this.verificationError = true
      // Clean up the URL
      history.replaceState({}, document.title, window.location.pathname)
    }
    
    // Check if user is already logged in via cookies
    this.checkAuthState()
  },
  methods: {
    async checkAuthState() {
      try {
        // Only verify with the server using cookies
        const response = await fetch('http://localhost:3000/auth/user', {
          method: 'GET',
          credentials: 'include' // This sends the cookies
        })
        
        const data = await response.json()
        
        if (data.user) {
          // Only store minimal non-sensitive data in memory
          this.user = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name || ''
          }
          
          // Redirect to dashboard
          this.$router.push('/')
        }
      } catch (error) {
        console.error('Error checking auth state:', error)
      }
    },
    async handleLogin() {
      try {
        const response = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            email: this.form.email,
            password: this.form.password
          })
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to log in')
        }
          
        console.log('Login successful, redirecting to dashboard')
        
        // Store minimal non-sensitive data in memory
        this.user = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name || ''
        }
        
        // Redirect to dashboard
        this.$router.push('/')
      } catch (error) {
        console.error('Login error:', error)
        this.errorMsg = error.message
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
      } finally {
        this.loading = false
      }
    },
    async handleSignup() {
      try {
        // Send message to background script if in Chrome extension context
        if (typeof chrome !== 'undefined' && chrome.runtime) {
          chrome.runtime.sendMessage({
            action: 'signup',
            data: {
              email: this.form.email,
              password: this.form.password,
              name: this.form.name
            }
          })
        }
        
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
          console.log('Signup successful, redirecting to dashboard');
          
          // Set a flag in localStorage to indicate the user is authenticated
          localStorage.setItem('isAuthenticated', 'true')
          
      
          
          // Store minimal non-sensitive data in memory
          this.user = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name || ''
          }
  
          
          // Redirect to dashboard - use a slight delay to ensure storage is set
          setTimeout(() => {
            this.$router.push('/');
          }, 100);
        } else if (data.requiresEmailConfirmation) {
          // Show verification dialog
          this.showVerificationDialog = true
          // Clear form
          this.form = { name: '', email: this.form.email, password: '', confirmPassword: '' }
        } else {
          // Generic success message
          this.successMsg = 'Account created successfully'
          this.form = { name: '', email: '', password: '', confirmPassword: '' } // Clear form
        }
      } catch (error) {
        console.error('Signup error:', error)
        throw error
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.auth-bg {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 0%, #f1f5fe 0%, #f8fafc 100%);
}
.auth-card {
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.08), 0 1.5px 6px rgba(0,0,0,0.03);
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  width: 480px;
  max-width: 98vw;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
}
.auth-header {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}
.auth-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
  .tab-btn {
    flex: 1;
    background: none;
    border: none;
    font-size: 1.1rem;
    font-weight: 500;
    color: #6b7280;
    padding: 0.75rem 0;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: color 0.2s, border-color 0.2s;
    &.active {
      color: #3730a3;
      border-bottom: 2px solid #6366f1;
    }
  }
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  label {
    font-size: 1rem;
    color: #374151;
    font-weight: 500;
  }
  .input {
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 0.85rem 1.1rem;
    font-size: 1rem;
    background: #f8fafc;
    color: #111827;
    transition: border 0.2s;
    &:focus {
      border-color: #6366f1;
      outline: none;
      background: #fff;
    }
  }
}
.oauth-buttons {
  margin: 1.5rem 0 0.5rem 0;
  .oauth-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 0.85rem 0;
    font-size: 1rem;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    transition: background 0.2s, border 0.2s;
    &:hover {
      background: #f1f5fe;
      border-color: #6366f1;
    }
    .oauth-icon {
      width: 20px;
      height: 20px;
    }
  }
}
.primary-btn {
  width: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #4f46e5 100%);
  color: #fff;
  border: none;
  border-radius: 0.75rem;
  padding: 0.95rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 0.5rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
  transition: background 0.2s, box-shadow 0.2s;
  &:hover {
    background: linear-gradient(90deg, #818cf8 0%, #6366f1 100%);
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.12);
  }
}
.password-mismatch {
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

/* Verification Dialog */
.verification-dialog {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  z-index: 10;
}

.verification-content {
  text-align: center;
  max-width: 90%;
}

.verification-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.verification-content h2 {
  color: #3730a3;
  margin-bottom: 1rem;
}

.verification-content p {
  color: #4b5563;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.verification-note {
  font-size: 0.9rem;
  color: #6b7280;
  font-style: italic;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
}

/* Message boxes */
.message-box {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
}

.message-box.success {
  background-color: #f0fdf4;
  border: 1px solid #86efac;
}

.message-box.error {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
}

.message-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.message-box.success .message-icon {
  background-color: #22c55e;
  color: white;
}

.message-box.error .message-icon {
  background-color: #ef4444;
  color: white;
}

.message-content {
  flex: 1;
}

.message-content h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.message-content p {
  font-size: 0.9rem;
  color: #4b5563;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  margin-left: 0.5rem;
}
</style>