function fixHeight() {
    document.documentElement.style.minHeight = '600px';
    document.documentElement.style.height = '600px';
  }
  
  // Execute immediately
  fixHeight();
  
  // Execute when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    document.body.style.minHeight = '600px';
    document.body.style.height = '600px';
  });