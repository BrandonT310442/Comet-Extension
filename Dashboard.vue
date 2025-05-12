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
            <p>The AI Editor for Overleaf — Edit your LaTeX documents effortlessly</p>
            <div class="stats-container">
              <div class="stat-item">
                <div class="stat-value">10</div>
                <div class="stat-label">Faster Edits</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">98</div>
                <div class="stat-label">Accuracy Rate</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">24/7</div>
                <div class="stat-label">Availability</div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-for="(message, index) in messages" :key="index" class="message-container" :class="message.role">
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
        
        <div v-if="isTyping" class="message-container assistant">
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
      systemPrompt: '' 
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
    
    // Load MathJax
    this.loadMathJax();
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
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
        
        if (!data.user) {
          // Redirect to auth page if not authenticated
          this.$router.push('/auth')
          return
        }
        
        // Set user data from server response
        this.userName = data.user.name || data.user.displayName || 'User'
        this.userEmail = data.user.email || ''
        
        // If in Chrome extension context, update chrome.storage
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.storage) {
          chrome.storage.local.set({
            'userName': this.userName,
            'userEmail': this.userEmail
          })
        }
      } catch (error) {
        console.error('Error checking auth state:', error)
        this.$router.push('/auth')
      }
    },
    loadMathJax() {
      // Create a script element for MathJax
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      
      // Configure MathJax
      window.MathJax = {
        tex: {
          inlineMath: [['\\(', '\\)']],
          displayMath: [['\\[', '\\]']]
        },
        startup: {
          pageReady: () => {
            console.log('MathJax is ready');
          }
        }
      };
      
      // Append the script to the document
      document.head.appendChild(script);
    },
    
    // Add a method to process math after a message is added
    processMathInMessages() {
      // If MathJax is loaded, typeset the math
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise()
          .catch((err) => console.error('MathJax typesetting failed: ', err));
      }
    },
    
    logout() {
      // Make a request to logout endpoint to clear cookies
      fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        credentials: 'include'
      }).finally(() => {
        // If in Chrome extension context, clear chrome.storage
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.storage) {
          chrome.storage.local.remove(['userName', 'userEmail'])
        }
        
        // Redirect to auth page
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
        this.systemPrompt = `You are Comet, a powerful AI assistant for LaTeX and Overleaf, designed to help users write, edit, and debug documents with precision.`;
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
        
        // Add assistant message from API response
        this.messages.push({
          role: 'assistant',
          content: data.choices[0].message.content,
          timestamp: new Date()
        });
        
        // Process math in messages
        this.$nextTick(() => {
          this.processMathInMessages();
        });
      } catch (error) {
        console.error('Error calling DeepSeek API:', error);
        
        // Add error message
        this.messages.push({
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your request. Please try again later.',
          timestamp: new Date()
        });
      } finally {
        this.isTyping = false;
        
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
      // First, escape HTML to prevent XSS
      let escapedMessage = message
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      
      // Split the message at "**Latex Code**" marker
      const parts = escapedMessage.split('**Latex Code**');
      
      // Process math expressions only in the part before the marker
      if (parts.length > 1) {
        // Process math in the text part (before the marker)
        parts[0] = parts[0]
          .replace(/\\\((.*?)\\\)/g, '<span class="math-inline">\\($1\\)</span>')
          .replace(/\\\[(.*?)\\\]/g, '<span class="math-display">\\[$1\\]</span>');
        
        // Create the LaTeX code block for the part after the marker
        const latexCode = parts[1].trim();
        const blockId = 'latex-' + Math.random().toString(36).substring(2, 9);
        const highlightedCode = this.highlightLatexSyntax(latexCode);
        
        // Replace the second part with a formatted code block
        parts[1] = `
          <div class="latex-code-block">
            <div class="latex-code-header">
              <span>LaTeX Code</span>
              <button class="copy-button" data-code="${this.escapeForHtmlAttribute(latexCode)}" onclick="
                const codeText = this.getAttribute('data-code');
                navigator.clipboard.writeText(codeText)
                  .then(() => {
                    this.textContent = 'Copied!';
                    setTimeout(() => { this.textContent = 'Copy'; }, 2000);
                  })
                  .catch(err => {
                    console.error('Could not copy text: ', err);
                    this.textContent = 'Error!';
                    setTimeout(() => { this.textContent = 'Copy'; }, 2000);
                  });
              ">Copy</button>
            </div>
            <pre class="latex-code-content">${highlightedCode}</pre>
          </div>
        `;
        
        // Rejoin the parts
        escapedMessage = parts.join('');
      } else {
        // If no marker, process all math expressions
        escapedMessage = escapedMessage
          .replace(/\\\((.*?)\\\)/g, '<span class="math-inline">\\($1\\)</span>')
          .replace(/\\\[(.*?)\\\]/g, '<span class="math-display">\\[$1\\]</span>');
      }
      
      // Convert line breaks to <br> tags
      return escapedMessage.replace(/\n/g, '<br>');
    },
    
    // Add this helper method to escape code for HTML attributes
    escapeForHtmlAttribute(text) {
      return text
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    },
    
    // Add this new method for LaTeX syntax highlighting
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

        // Remove all authentication data from localStorage
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        
        // If in Chrome extension context, also clear chrome.storage
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.storage) {
          chrome.storage.local.remove(['isAuthenticated', 'userName', 'userEmail'], () => {
            console.log('Chrome storage cleared');
          });
        }

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

// Create a script element for MathJax
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
script.async = true;

// Configure MathJax
window.MathJax = {
  tex: {
    inlineMath: [['\\(', '\\)']],
    displayMath: [['\\[', '\\]']]
  },
  startup: {
    pageReady: () => {
      console.log('MathJax is ready');
    }
  }
};

// Append the script to the document
document.head.appendChild(script);

// Add a method to process math after a message is added
processMathInMessages() {
  // If MathJax is loaded, typeset the math
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise()
      .catch((err) => console.error('MathJax typesetting failed: ', err));
  }
}
