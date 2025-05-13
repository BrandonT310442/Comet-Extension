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

// Listen for messages from the Vue app
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'applyLatexToOverleaf') {
    // Query for the active Overleaf tab
    console.log("made it to listener")
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      
      // Check if we're on an Overleaf page
      if (!activeTab.url.includes('overleaf.com')) {
        console.error('Not on an Overleaf page');
        sendResponse({ success: false, error: 'Not on an Overleaf page' });
        return;
      }
      
      // First inject the content script if it's not already there
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        files: ['content.js']
      }).then(() => {
        // Now send the message after ensuring content script is loaded
        console.log("Sending message to content script");
        chrome.tabs.sendMessage(activeTab.id, {
          action: 'insertLatexCode',
          latexCode: request.latexCode
        }, (response) => {
          console.log("Received response from content script:", response);
          
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else if (response && response.success) {
            console.log("LaTeX insertion successful");
            sendResponse({ success: true });
          } else {
            console.error('LaTeX insertion failed:', response?.error || 'Unknown error');
            sendResponse({ success: false, error: response?.error || 'Unknown error' });
          }
        });
      }).catch(err => {
        console.error('Error injecting content script:', err);
        sendResponse({ success: false, error: err.message });
      });
    });
    return true; // Keep the message channel open for async response
  }
  return true; // Required for async sendResponse
});