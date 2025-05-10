// Background script for the Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'login') {
    // Handle login action if needed
    console.log('Login requested', request.data);
    sendResponse({ success: true });
  } else if (request.action === 'signup') {
    // Handle signup action if needed
    console.log('Signup requested', request.data);
    sendResponse({ success: true });
  } else if (request.action === 'check-auth') {
    // Check if user is authenticated
    checkAuthState(sendResponse);
    return true; // Keep the message channel open for the async response
  }
  return true; // Required for async sendResponse
});

// Function to check authentication state
function checkAuthState(sendResponse) {
  try {
    // First check local storage
    chrome.storage.local.get(['isAuthenticated'], async (result) => {
      if (result.isAuthenticated) {
        // Verify with the server that the session is still valid
        try {
          const response = await fetch('http://localhost:3000/auth/user', {
            method: 'GET',
            credentials: 'include' // This sends the cookies
          });
          
          const data = await response.json();
          
          if (data.user) {
            sendResponse({ 
              authenticated: true, 
              user: data.user 
            });
          } else {
            // If the session is invalid, clear the localStorage
            chrome.storage.local.remove(['isAuthenticated']);
            sendResponse({ authenticated: false });
          }
        } catch (error) {
          console.error('Error checking auth state:', error);
          sendResponse({ 
            authenticated: false,
            error: error.message
          });
        }
      } else {
        sendResponse({ authenticated: false });
      }
    });
  } catch (error) {
    console.error('Error checking auth state:', error);
    sendResponse({ 
      authenticated: false,
      error: error.message
    });
  }
} 