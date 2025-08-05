<template>
  <div class="chat-container">
    <!-- Sidebar -->
    <div :class="['sidebar', { 'collapsed': sidebarCollapsed }]">
      <div class="sidebar-header">
        <div class="logo-container" v-if="!sidebarCollapsed">
          <Logo />
        </div>
        <button class="collapse-btn" @click="toggleSidebar">
          <span v-if="!sidebarCollapsed">&#10094;</span>
          <span v-else>&#10095;</span>
        </button>
      </div>
      
      <div v-if="!sidebarCollapsed" class="new-chat-btn-container">
        <button class="new-chat-btn" @click="startNewChat">
          <span class="plus-icon">+</span>
          <span>New Chat</span>
        </button>
      </div>
      
      <div v-if="!sidebarCollapsed" class="chat-history">
        <h3 class="history-title">Chat History</h3>
        <div v-if="chatHistory.length === 0" class="no-history">
          No chat history yet
        </div>
        <div 
          v-for="(chat, index) in chatHistory" 
          :key="index" 
          class="history-item"
          :class="{ 'active': currentChatId === chat.id }"
          @click="loadChat(chat.id)"
        >
          <div class="history-item-title">{{ chat.title }}</div>
          <div class="history-item-date">{{ formatDate(chat.date) }}</div>
        </div>
      </div>
      
      <div v-if="!sidebarCollapsed" class="sidebar-footer">
        <div class="user-profile" @click="toggleUserMenu">
          <div class="user-avatar">{{ getUserInitials() }}</div>
          <div class="user-info">
            <div class="user-name">{{ userName }}</div>
            <div class="user-email">{{ userEmail }}</div>
          </div>
        </div>
        
        <div v-if="showUserMenu" class="user-menu">
          <div class="menu-item" @click="editProfile">Profile Settings</div>
          <div class="menu-item" @click="logout">Logout</div>
        </div>
      </div>
    </div>
    
    <!-- Main Chat Area -->
    <div class="main-content">
      <div class="chat-header">
        <h1>{{ currentChatTitle }}</h1>
      </div>
      
      <div class="chat-messages" ref="messagesContainer">
        <div v-if="messages.length === 0" class="empty-chat">
          <div class="welcome-container">
            <h2>Welcome to Comet</h2>
            <p>Comet helps you write, edit, and refine LaTeX documents with AI-powered assistance, making your academic writing process faster and more efficient.</p>
          </div>
        </div>
        
        <div v-for="(message, index) in messages" :key="index" class="message-container" :class="[message.role, {'typing-message': message.isTyping}]">
          <div class="message-avatar" :class="message.role">
            <template v-if="message.role === 'user'">{{ getUserInitials() }}</template>
            <img v-else src="./LogoWhite.png" alt="Comet" class="ai-logo" />
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-sender">{{ message.role === 'user' ? userName : 'Comet' }}</span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
            <div class="message-text" v-html="formatMessage(message.content)"></div>
          </div>
        </div>
        
        <div v-if="isTyping && !messages.some(m => m.isTyping)" class="message-container assistant">
          <div class="message-avatar assistant">
            <img src="./LogoWhite.png" alt="Comet" class="ai-logo" />
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-sender">Comet</span>
              <span class="message-time">Now</span>
            </div>
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="chat-input-container">
        <div class="model-selector-container">
          <div class="model-selector" @click="toggleModelDropdown">
            <div class="selected-model">Deepseek V3</div>
            <div class="dropdown-arrow" :class="{ 'open': showModelDropdown }">▼</div>
          </div>
          <div v-if="showModelDropdown" class="model-dropdown">
            <div 
              v-for="model in models" 
              :key="model.id" 
              class="model-option"
              :class="{ 'active': currentModel === model.id }"
              @click="selectModel(model.id)"
            >
              <div class="model-name">{{ model.name }}</div>
              <div class="model-description">{{ model.description }}</div>
            </div>
          </div>
        </div>
        
        <div class="input-wrapper">
          <textarea 
            class="chat-input" 
            v-model="userInput" 
            placeholder="Describe your LaTeX changes here..."
            @keydown.enter.prevent="sendMessage"
            ref="inputField"
            rows="1"
            @input="adjustTextareaHeight"
          ></textarea>
          <button 
            class="send-btn" 
            @click="sendMessage" 
            :disabled="!userInput.trim() || isTyping"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        
        <div class="input-footer">
          <span class="input-hint">Press Enter to send</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Logo from './components/Logo.vue'
import './dashboard.css'
import katex from 'katex'

export default {
  name: 'Dashboard',
  components: { 
    Logo 
  },
  data() {
    return {
      sidebarCollapsed: true,
      showUserMenu: false,
      showModelDropdown: false,
      isTyping: false,
      userInput: '',
      messages: [],
      chatHistory: [
  
      ],
      currentChatId: null,
      currentChatTitle: 'New Conversation',
      userName: 'John Doe',
      userEmail: 'john.doe@example.com',
      models: [
        { 
          id: 'deepseek-chat',
          name: 'Deepseek V3',
          description: 'Deepseek V3 Model',
        }
      ],
      currentModel: 'deepseek-chat',
      systemPrompt: '',
      typingText: '',
      fullResponseText: '',
      typingSpeed: 2, // milliseconds per character
      typingTimeout: null
    }
  },
  created() {
    // Check if user is authenticated
    this.checkAuthState();
    
    // Load system prompt
    this.loadSystemPrompt();
  },
  mounted() {
    // Listen for clicks outside dropdown
    document.addEventListener('click', this.handleOutsideClick);
    
    // Add global event listener for copy buttons
    document.addEventListener('click', this.handleCopyButtonClick);
    
    // Add global event listener for apply buttons
    document.addEventListener('click', this.handleApplyButtonClick);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
    document.removeEventListener('click', this.handleCopyButtonClick);
    document.removeEventListener('click', this.handleApplyButtonClick);
  },
  methods: {
    async checkAuthState() {
      // No authentication required - dashboard is accessible to everyone
      console.log('Dashboard is accessible without authentication');
      
      // Use default user data for non-authenticated users
      this.userName = 'Guest User';
      this.userEmail = 'guest@example.com';
    },

    handleCopyButtonClick(event) {
      // Check if the clicked element or its parent is a copy button
      const button = event.target.closest('[data-action="copy-latex"]');
      if (!button) return;
      
      console.log("Copy button clicked");
      
      // Find the closest parent latex-code-block
      const codeBlock = button.closest('.latex-code-block');
      if (!codeBlock) return;
      
      // Get the text content from the pre element
      const codeContent = codeBlock.querySelector('pre.latex-code-content').textContent;
      
      // Copy to clipboard
      navigator.clipboard.writeText(codeContent).then(() => {
        const originalInnerHTML = button.innerHTML;
        
        // Show checkmark icon
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        
        // Reset after 2 seconds
        setTimeout(() => {
          button.innerHTML = originalInnerHTML;
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    },

    handleApplyButtonClick(event) {
      console.log("test")
      // Check if the clicked element or its parent is an apply button
      const button = event.target.closest('[data-action="apply-latex"]');
      if (!button) return;
      
      // Find the closest parent latex-code-block
      const codeBlock = button.closest('.latex-code-block');
      if (!codeBlock) return;
      
      // Get the text content from the pre element
      const latexCode = codeBlock.querySelector('pre.latex-code-content').textContent;
      
      // Send message to Chrome extension
      chrome.runtime.sendMessage({
        action: 'applyLatexToOverleaf',
        latexCode: latexCode
      });
    },
    animateTyping() {
      // Clear any existing timeout
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }
      
      if (this.typingText.length < this.fullResponseText.length) {
        // Add the next character
        this.typingText = this.fullResponseText.substring(0, this.typingText.length + 1);
        
        // Update the message content
        const lastIndex = this.messages.length - 1;
        this.messages[lastIndex].content = this.typingText;
        
        // Schedule the next character
        this.typingTimeout = setTimeout(() => {
          this.animateTyping();
          
          // Scroll to bottom as text is being typed
          this.scrollToBottom();
        }, this.typingSpeed);
      } else {
        // Animation complete
        const lastIndex = this.messages.length - 1;
        this.messages[lastIndex].isTyping = false;
        this.isTyping = false;
        
        // Process math in messages if needed
        // (This would be handled by your existing code)
      }
    },
  
    logout() {
      // Make a request to logout endpoint to clear cookies
      fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        credentials: 'include'
      }).finally(() => {
        this.$router.push('/auth')
      })
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
    },
    toggleModelDropdown(event) {
      event.stopPropagation();
      this.showModelDropdown = !this.showModelDropdown;
    },
    handleOutsideClick(event) {
      // Close dropdowns when clicking outside
      const modelSelector = document.querySelector('.model-selector-container');
      const userProfile = document.querySelector('.user-profile');
      
      if (modelSelector && !modelSelector.contains(event.target)) {
        this.showModelDropdown = false;
      }
      
      if (userProfile && !userProfile.contains(event.target)) {
        this.showUserMenu = false;
      }
    },
    selectModel(modelId) {
      this.currentModel = modelId;
      this.showModelDropdown = false;
    },
    startNewChat() {
      this.messages = [];
      this.currentChatId = null;
      this.currentChatTitle = 'New Conversation';
      this.focusInput();
    },
    loadChat(chatId) {
      // In a real app, this would load messages from an API
      const chat = this.chatHistory.find(c => c.id === chatId);
      if (chat) {
        this.currentChatId = chatId;
        this.currentChatTitle = chat.title;
        this.messages = []; // Would be loaded from API
      }
    },
    // Add this new method
    async loadSystemPrompt() {
      try {
        const response = await fetch('/System Prompt.txt');
        this.systemPrompt = await response.text();
        console.log('System prompt loaded successfully');
      } catch (error) {
        console.error('Error loading system prompt:', error);
        // Fallback system prompt in case the file can't be loaded
      }
    },
    
    // Modify the sendMessage method to include the system prompt
    async sendMessage() {
      const message = this.userInput.trim();
      if (!message || this.isTyping) return;
      
      // Add user message
      this.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });
      
      // Clear input
      this.userInput = '';
      this.adjustTextareaHeight();
      
      // Set typing indicator
      this.isTyping = true;
      
      // Scroll to bottom
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      
      try {
        // Prepare conversation history for the API
        const conversationHistory = [];
        
        // Add system prompt as the first message
        if (this.systemPrompt) {
          conversationHistory.push({
            role: 'system',
            content: this.systemPrompt
          });
        }
        
        // Add conversation history
        this.messages.forEach(msg => {
          conversationHistory.push({
            role: msg.role,
            content: msg.content
          });
        });
        
        // Call DeepSeek API through Openrouter
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_KEY}`
          },
          body: JSON.stringify({
            model: this.currentModel === 'deepseek-coder' ? 'deepseek/deepseek-coder' : 'deepseek/deepseek-chat',
            messages: conversationHistory
          })
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        const responseContent = data.choices[0].message.content;
        
        // Add a placeholder message for the assistant that will be animated
        this.messages.push({
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          isTyping: true
        });
        
        // Store the full response text
        this.fullResponseText = responseContent;
        this.typingText = '';
        
        // Start the typing animation
        this.animateTyping();
        
      } catch (error) {
        console.error('Error calling DeepSeek API:', error);
        
        // Add error message
        this.messages.push({
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your request. Please try again later.',
          timestamp: new Date()
        });
        this.isTyping = false;
      } finally {
        // If this is a new conversation, add it to history
        if (!this.currentChatId) {
          const newChat = {
            id: this.chatHistory.length + 1,
            title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
            date: new Date()
          };
          
          this.chatHistory.unshift(newChat);
          this.currentChatId = newChat.id;
          this.currentChatTitle = newChat.title;
        }
        
        // Scroll to bottom
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    adjustTextareaHeight() {
      const textarea = this.$refs.inputField;
      if (!textarea) return;
      
      // Reset height to calculate correct scrollHeight
      textarea.style.height = 'auto';
      
      // Set new height based on content (with max height of 150px)
      const newHeight = Math.min(textarea.scrollHeight, 150);
      textarea.style.height = `${newHeight}px`;
    },
    focusInput() {
      this.$nextTick(() => {
        if (this.$refs.inputField) {
          this.$refs.inputField.focus();
        }
      });
    },
 
    formatMessage(message) {
      // First, extract all math expressions and replace with placeholders
      const mathExpressions = [];
      let processedMessage = message;
      
      // Extract inline math expressions
      processedMessage = processedMessage.replace(/\\\((.*?)\\\)/g, (match, p1) => {
        const placeholder = `__INLINE_MATH_${mathExpressions.length}__`;
        mathExpressions.push({
          type: 'inline',
          content: p1,
          placeholder
        });
        return placeholder;
      });
      
      // Extract block math expressions
      processedMessage = processedMessage.replace(/\\\[([\s\S]*?)\\\]/g, (match, p1) => {
        const placeholder = `__BLOCK_MATH_${mathExpressions.length}__`;
        mathExpressions.push({
          type: 'block',
          content: p1.trim(),
          placeholder
        });
        return placeholder;
      });
      
      // Split the message at "**Latex Code**" marker
      const parts = processedMessage.split('**Latex Code**');
      
      // Now escape HTML in the text (with placeholders)
      if (parts.length > 1) {
        // Escape HTML in the first part (text)
        parts[0] = parts[0]
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
        
        // Create the LaTeX code block for the part after the marker
        const latexCode = parts[1].trim();
        const blockId = 'latex-' + Math.random().toString(36).substring(2, 9);
        
        // Process any math expressions in the LaTeX code before highlighting
        let processedLatexCode = latexCode;
        for (const expr of mathExpressions) {
          // Replace any math placeholders in the LaTeX code section
          if (processedLatexCode.includes(expr.placeholder)) {
            processedLatexCode = processedLatexCode.replace(expr.placeholder, 
              expr.type === 'inline' ? `\\(${expr.content}\\)` : `\\[${expr.content}\\]`);
          }
        }
        
        const highlightedCode = this.highlightLatexSyntax(this.escapeForHtmlAttribute(processedLatexCode));
        
        // Replace the second part with a formatted code block
        // Use a data attribute to identify this as a copy button
        parts[1] = `
          <div class="latex-code-block">
            <div class="latex-code-header">
              <span>LaTeX Code</span>
              <div class="code-actions">
                <button class="apply-button" data-action="apply-latex">
                  <span>Apply</span>
                </button>
                <button class="copy-button" data-action="copy-latex">
                  <img src="copy.png" alt="Copy" width="18" height="18" style="display: block;" />
                </button>
              </div>
            </div>
            <pre class="latex-code-content">${highlightedCode}</pre>
          </div>
        `;
        
        // Rejoin the parts
        processedMessage = parts.join('');
      } else {
        // If no marker, just escape HTML in the whole message
        processedMessage = processedMessage
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }
      
      // Now render all math expressions and replace the placeholders
      for (const expr of mathExpressions) {
        try {
          const rendered = katex.renderToString(expr.content, { 
            displayMode: expr.type === 'block'
          });
          processedMessage = processedMessage.replace(expr.placeholder, rendered);
        } catch (e) {
          console.error('KaTeX error:', e);
          // If rendering fails, replace with escaped original
          const escaped = expr.type === 'inline' 
            ? `\\(${this.escapeForHtmlAttribute(expr.content)}\\)` 
            : `\\[${this.escapeForHtmlAttribute(expr.content)}\\]`;
          processedMessage = processedMessage.replace(expr.placeholder, escaped);
        }
      }
      
      // Convert line breaks to <br> tags
      return processedMessage.replace(/\n/g, '<br>');
    },
    
    // Add a separate method for HTML escaping
    escapeHtml(text) {
      // Don't escape content inside KaTeX rendered elements
      const katexElements = [];
      let index = 0;
      
      // Replace KaTeX elements with placeholders
      text = text.replace(/<span class="katex(?:[\s\S]*?)<\/span>/g, (match) => {
        const placeholder = `__KATEX_PLACEHOLDER_${index}__`;
        katexElements.push(match);
        index++;
        return placeholder;
      });
      
      // Escape HTML
      text = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      
      // Restore KaTeX elements
      for (let i = 0; i < katexElements.length; i++) {
        text = text.replace(`__KATEX_PLACEHOLDER_${i}__`, katexElements[i]);
      }
      
      return text;
    },
    
    // Keep your existing escapeForHtmlAttribute method
    escapeForHtmlAttribute(text) {
      return text
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    },
    
    // Keep your existing highlightLatexSyntax method
    highlightLatexSyntax(code) {
      // Replace LaTeX commands with highlighted versions
      return code
        // Highlight commands (starting with \)
        .replace(/\\([a-zA-Z]+)(\{[^{}]*\})?/g, '<span class="latex-command">\\$1</span>$2')
        // Highlight math delimiters
        .replace(/(\$\$|\$)(.*?)(\$\$|\$)/g, '<span class="latex-math">$1$2$3</span>')
        // Highlight environments
        .replace(/(\\begin\{)([^{}]*?)(\})/g, '<span class="latex-env">$1</span><span class="latex-env-name">$2</span><span class="latex-env">$3</span>')
        .replace(/(\\end\{)([^{}]*?)(\})/g, '<span class="latex-env">$1</span><span class="latex-env-name">$2</span><span class="latex-env">$3</span>')
        // Highlight comments
        .replace(/(%.*$)/gm, '<span class="latex-comment">$1</span>')
        // Highlight brackets
        .replace(/(\{|\})/g, '<span class="latex-bracket">$1</span>');
    },
    
    formatDate(date) {
      // Format date as "May 10" or "Yesterday" or "Today"
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      if (messageDate.getTime() === today.getTime()) {
        return 'Today';
      } else if (messageDate.getTime() === yesterday.getTime()) {
        return 'Yesterday';
      } else {
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
      }
    },
    formatTime(date) {
      return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
    },
    getUserInitials() {
      if (!this.userName) return 'U';
      return this.userName.split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    },
    editProfile() {
      // Would navigate to profile page
      console.log('Edit profile clicked');
      this.showUserMenu = false;
    },
    async logout() {
      try {
        // First, make a request to logout endpoint to clear server-side session
        await fetch('http://localhost:3000/auth/logout', {
          method: 'POST',
          credentials: 'include' // Important for cookies
        });


        // Redirect to auth page
        this.$router.push('/auth');
      } catch (error) {
        console.error('Error during logout:', error);
        // Still redirect to auth page even if there's an error
        this.$router.push('/auth');
      }
    }
  }
}
</script>

<style lang="scss" scoped>
/* CSS moved to dashboard.css */
</style>

