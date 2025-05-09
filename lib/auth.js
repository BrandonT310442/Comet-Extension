import { ref, reactive } from 'vue'
import { createClient } from '../utils/supabase/client'

// Create a reactive user state
const user = ref(null)
const loading = ref(true)
const session = ref(null)

// User state management
let currentUser = null;
let authListeners = [];

// Initialize the user state from session
const initUser = async () => {
  loading.value = true
  
  try {
    // Get the current session from the server
    const response = await fetch('http://localhost:3000/auth/user', {
      credentials: 'include' // Important for cookies to be sent
    })
    
    const data = await response.json()
    
    if (data.user) {
      console.log('Initial session found:', data.user.email)
      user.value = data.user
      // Note: session is managed by the server via HttpOnly cookies
    } else {
      console.log('No initial session found')
    }
  } catch (error) {
    console.error('Error initializing auth:', error)
  } finally {
    loading.value = false
  }
  
  // Set up a periodic check for session status (optional alternative to onAuthStateChange)
  // This is only needed if you don't want to rely on API calls to validate session
  setInterval(async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/user', {
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.user) {
        if (!user.value || user.value.id !== data.user.id) {
          console.log('User state changed:', data.user.email)
          user.value = data.user
        }
      } else if (user.value) {
        console.log('User signed out')
        user.value = null
      }
    } catch (error) {
      console.error('Error checking session:', error)
    }
  }, 5 * 60 * 1000) // Check every 5 minutes
}

// Call initUser immediately
initUser()

// Check if user is authenticated
const isAuthenticated = () => {
  return !!user.value
}

// Function to refresh user data from the backend
const refreshUser = async () => {
  try {
    const response = await fetch('http://localhost:3000/auth/user', {
      method: 'GET',
      credentials: 'include' // Important for cookies to be sent
    });
    
    const data = await response.json();
    currentUser = data.user;
    
    // Notify all listeners of the updated user state
    authListeners.forEach(listener => listener(currentUser));
    
    return currentUser;
  } catch (error) {
    console.error('Error refreshing user:', error);
    return null;
  }
};

// Function to register an auth state change listener
const onAuthStateChange = (callback) => {
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }
  
  // Add callback to listeners
  authListeners.push(callback);
  
  // Call the callback with current user state
  callback(currentUser);
  
  // Return a function to unsubscribe
  return () => {
    authListeners = authListeners.filter(listener => listener !== callback);
  };
};

// Function to get the current user
const getCurrentUser = () => {
  return currentUser;
};

// Function to handle logout
const logout = async () => {
  try {
    await fetch('http://localhost:3000/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    
    currentUser = null;
    
    // Notify all listeners of the logout
    authListeners.forEach(listener => listener(null));
    
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    return false;
  }
};

// Initial user refresh
refreshUser();

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