// Background script for the Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'login') {
    // Just pass through login requests to the web app
    console.log('Login requested', request.data);
    sendResponse({ success: true });
  } else if (request.action === 'signup') {
    // Just pass through signup requests to the web app
    console.log('Signup requested', request.data);
    sendResponse({ success: true });
  } else if (request.action === 'check-auth') {
    // Check if user is authenticated using cookies only
    checkAuthState(sendResponse);
    return true; // Keep the message channel open for the async response
  }
  return true; // Required for async sendResponse
});

// Function to check authentication state using only cookies
function checkAuthState(sendResponse) {
  try {
    // Verify with the server that the session is valid using cookies
    fetch('http://localhost:3000/auth/user', {
      method: 'GET',
      credentials: 'include' // This sends the cookies
    })
    .then(response => response.json())
    .then(data => {
      if (data.user) {
        sendResponse({ 
          authenticated: true, 
          user: data.user 
        });
      } else {
        sendResponse({ authenticated: false });
      }
    })
    .catch(error => {
      console.error('Error checking auth state:', error);
      sendResponse({ 
        authenticated: false,
        error: error.message
      });
    });
  } catch (error) {
    console.error('Error checking auth state:', error);
    sendResponse({ 
      authenticated: false,
      error: error.message
    });
  }
}