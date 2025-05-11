import { ref, reactive } from 'vue'

// Create a reactive user state
const user = ref(null)
const loading = ref(true)
const session = ref(null)

// User state management
let currentUser = null;
let authListeners = [];

// Check if we're in a Chrome extension context
const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

// Initialize the user state from session
const initUser = async () => {
  loading.value = true
  
  try {
    if (isExtension) {
      // In Chrome extension, use messaging to check auth state with background script
      chrome.runtime.sendMessage({ action: 'check-auth' }, (response) => {
        if (response && response.authenticated && response.user) {
          console.log('Initial session found in extension:', response.user.email)
          user.value = response.user
          currentUser = response.user
          
          // Notify all listeners
          authListeners.forEach(listener => listener(currentUser))
        } else {
          console.log('No initial session found in extension')
          user.value = null
          currentUser = null
        }
        
        loading.value = false
      })
    } else {
      // In web app, check with server directly
      const response = await fetch('http://localhost:3000/auth/user', {
        credentials: 'include' // Important for cookies to be sent
      })
      
      const data = await response.json()
      
      if (data.user) {
        console.log('Initial session found:', data.user.email)
        user.value = data.user
        currentUser = data.user
        
        // Notify all listeners
        authListeners.forEach(listener => listener(currentUser))
      } else {
        console.log('No initial session found')
        user.value = null
        currentUser = null
      }
      
      loading.value = false
    }
  } catch (error) {
    console.error('Error initializing auth:', error)
    loading.value = false
  }
  
  // Set up a periodic check for session status (every 5 minutes)
  setInterval(async () => {
    await refreshUser();
  }, 5 * 60 * 1000)
}

// Call initUser immediately
initUser()

// Check if user is authenticated by checking the current user state
const isAuthenticated = () => {
  return !!user.value
}

// Function to refresh user data from the backend
const refreshUser = async () => {
  try {
    if (isExtension) {
      // In Chrome extension, use messaging
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'check-auth' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error checking auth state:', chrome.runtime.lastError)
            resolve(null)
            return
          }
          
          if (response && response.authenticated && response.user) {
            console.log('User found in extension:', response.user.email)
            
            // Update user state
            user.value = response.user
            currentUser = response.user
            
            // Notify all listeners
            authListeners.forEach(listener => listener(currentUser))
            
            resolve(currentUser)
          } else {
            console.log('No user found in extension')
            user.value = null
            currentUser = null
            
            // Notify all listeners
            authListeners.forEach(listener => listener(null))
            
            resolve(null)
          }
        })
      })
    } else {
      // Web app flow - check with server
      const response = await fetch('http://localhost:3000/auth/user', {
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.user) {
        user.value = data.user
        currentUser = data.user
        
        // Notify all listeners
        authListeners.forEach(listener => listener(currentUser))
        
        return currentUser
      } else {
        user.value = null
        currentUser = null
        
        // Notify all listeners
        authListeners.forEach(listener => listener(null))
        
        return null
      }
    }
  } catch (error) {
    console.error('Error refreshing user:', error)
    return null
  }
}

// Function to register an auth state change listener
const onAuthStateChange = (callback) => {
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function')
  }
  
  // Add callback to listeners
  authListeners.push(callback)
  
  // Call the callback with current user state
  callback(currentUser)
  
  // Return a function to unsubscribe
  return () => {
    authListeners = authListeners.filter(listener => listener !== callback)
  }
}

// Function to get the current user
const getCurrentUser = () => {
  return currentUser
}

// Function to handle logout
const logout = async () => {
  try {
    // Make server request to logout
    const response = await fetch('http://localhost:3000/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    // Clear local state
    user.value = null;
    currentUser = null;

    // Clear all auth-related cookies
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Notify all listeners
    authListeners.forEach(listener => listener(null));

    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
}

// Get the current user
const getUser = () => user.value

// Export everything in one place
export {
  user,
  loading,
  isAuthenticated,
  logout,
  getUser,
  refreshUser,
  onAuthStateChange,
  getCurrentUser
}