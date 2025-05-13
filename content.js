// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  if (request.action === 'insertLatexCode') {
    try {
      // Find the editor container
      const editorContainer = document.querySelector('[class*="cm-content"]');
      if (!editorContainer) {
        console.error('Editor container not found');
        sendResponse({ success: false, error: 'Editor container not found' });
        return true;
      }

      // Get the current selection
      const selection = window.getSelection();
      let targetNode = null;
      let offset = 0;

      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        targetNode = range.startContainer;
        offset = range.startOffset;

        // If we're in the editor container
        if (editorContainer.contains(targetNode)) {
          // Find the closest cm-line div
          let lineDiv = targetNode.nodeType === 1 ? targetNode : targetNode.parentNode;
          while (lineDiv && !lineDiv.classList.contains('cm-line')) {
            lineDiv = lineDiv.parentNode;
          }

          if (lineDiv) {
            // Create a new line element
            const newLine = document.createElement('div');
            newLine.className = 'cm-line';
            newLine.textContent = request.latexCode;
            
            // Insert the new line after the current line
            lineDiv.parentNode.insertBefore(newLine, lineDiv.nextSibling);
          } else {
            // Fallback: insert at the beginning of the editor
            const firstLine = editorContainer.querySelector('.cm-line');
            if (firstLine) {
              editorContainer.insertBefore(newLine, firstLine);
            } else {
              editorContainer.appendChild(newLine);
            }
          }
        }
      }
      
      console.log('Successfully inserted LaTeX code at cursor position');
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error inserting LaTeX:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  return true;
});

console.log('Overleaf content script loaded and ready');