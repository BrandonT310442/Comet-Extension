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
  }
  return true; // Required for async sendResponse
}); 