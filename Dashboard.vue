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
            <h2>Welcome to Eclipse</h2>
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
            {{ message.role === 'user' ? getUserInitials() : 'AI' }}
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-sender">{{ message.role === 'user' ? userName : currentModel.name }}</span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
            <div class="message-text" v-html="formatMessage(message.content)"></div>
          </div>
        </div>
        
        <div v-if="isTyping" class="message-container assistant">
          <div class="message-avatar assistant">AI</div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-sender">{{ currentModel.name }}</span>
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
            <div class="selected-model">
              <div class="model-icon">{{ currentModel.icon }}</div>
              <div class="model-name">{{ currentModel.name }}</div>
            </div>
            <div class="dropdown-arrow" :class="{ 'open': showModelDropdown }">▼</div>
          </div>
          <div v-if="showModelDropdown" class="model-dropdown">
            <div 
              v-for="model in availableModels" 
              :key="model.id" 
              class="model-option"
              :class="{ 'selected': currentModel.id === model.id }"
              @click="selectModel(model)"
            >
              <div class="model-icon">{{ model.icon }}</div>
              <div>
                <div class="model-option-name">{{ model.name }}</div>
                <div class="model-option-desc">{{ model.description }}</div>
              </div>
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

export default {
  name: 'ChatPage',
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
        // Sample data - would be loaded from an API in a real app
        { id: 1, title: 'Matrix multiplication proof', date: new Date('2025-05-08T14:30:00') },
        { id: 2, title: 'Quantum mechanics equations', date: new Date('2025-05-07T09:45:00') },
        { id: 3, title: 'Linear algebra theorem', date: new Date('2025-05-05T16:20:00') }
      ],
      currentChatId: null,
      currentChatTitle: 'New Conversation',
      userName: 'John Doe',
      userEmail: 'john.doe@example.com',
      availableModels: [
        { 
          id: 'gpt-4',
          name: 'GPT-4',
          icon: '🧠',
          description: 'Most powerful model for complex tasks'
        },
        { 
          id: 'gpt-3.5',
          name: 'GPT-3.5',
          icon: '⚡',
          description: 'Fast and reliable for most tasks'
        },
        { 
          id: 'claude-3',
          name: 'Claude 3',
          icon: '🔍',
          description: 'Great for detailed analysis and explanations'
        },
        { 
          id: 'latex-expert',
          name: 'LaTeX Expert',
          icon: '📝',
          description: 'Specialized for LaTeX documents'
        }
      ],
      currentModel: null
    }
  },
  created() {
    // Set default model
    this.currentModel = this.availableModels[3]; // LaTeX Expert by default
    
    // Check if user is authenticated
    this.checkAuthState();
  },
  mounted() {
    // Listen for clicks outside dropdown
    document.addEventListener('click', this.handleOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
  },
  methods: {
    async checkAuthState() {
      try {
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        
        if (isAuthenticated !== 'true') {
          // Redirect to auth page if not authenticated
          this.$router.push('/auth');
        } else {
          // Try to get user info from localStorage or server
          const storedUserName = localStorage.getItem('userName');
          const storedUserEmail = localStorage.getItem('userEmail');
          
          if (storedUserName) {
            this.userName = storedUserName;
          }
          
          if (storedUserEmail) {
            this.userEmail = storedUserEmail;
          }
          
          // If we're in a Chrome extension context, try to get user data from chrome.storage
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.storage) {
            chrome.storage.local.get(['userName', 'userEmail'], (result) => {
              if (result.userName) {
                this.userName = result.userName;
              }
              if (result.userEmail) {
                this.userEmail = result.userEmail;
              }
            });
          }
          
          // As a fallback, try to fetch user data from the server
          try {
            const response = await fetch('http://localhost:3000/auth/user', {
              method: 'GET',
              credentials: 'include' // This sends the cookies
            });
            
            const data = await response.json();
            
            if (data.user) {
              this.userName = data.user.name || data.user.displayName || this.userName;
              this.userEmail = data.user.email || this.userEmail;
              
              // Store for future use
              localStorage.setItem('userName', this.userName);
              localStorage.setItem('userEmail', this.userEmail);
              
              if (typeof chrome !== 'undefined' && chrome.runtime && chrome.storage) {
                chrome.storage.local.set({
                  'userName': this.userName,
                  'userEmail': this.userEmail
                });
              }
            }
          } catch (serverError) {
            console.error('Error fetching user data from server:', serverError);
            // Continue with locally stored data if available
          }
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        this.$router.push('/auth');
      }
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
    selectModel(model) {
      this.currentModel = model;
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
        
        // Sample messages for demo purposes
        if (chatId === 1) {
          this.messages = [
            {
              role: 'user',
              content: 'Can you help me with my matrix multiplication proof in section 2.3?',
              timestamp: new Date('2025-05-08T14:30:00')
            },
            {
              role: 'assistant',
              content: 'Of course! I can help you with your matrix multiplication proof. Could you share the specific part in section 2.3 that you\'re working on?',
              timestamp: new Date('2025-05-08T14:30:30')
            }
          ];
        }
      }
    },
    sendMessage() {
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
      
      // Simulate AI typing
      this.isTyping = true;
      
      // Scroll to bottom
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      
      // Simulate AI response after a delay
      setTimeout(() => {
        this.receiveResponse(message);
      }, 1500);
    },
    receiveResponse(userMessage) {
      // In a real app, this would be replaced with an actual API call
      let response = "I'll help you edit your LaTeX document based on your request. Could you please provide more details about what you'd like to change?";
      
      if (userMessage.toLowerCase().includes('add equation')) {
        response = "I've added the equation to your document. The syntax is: \\begin{equation}\n  E = mc^2\n\\end{equation}";
      } else if (userMessage.toLowerCase().includes('matrix')) {
        response = "For matrices in LaTeX, use the following syntax:\n\\begin{bmatrix}\n  a & b \\\\\n  c & d\n\\end{bmatrix}";
      }
      
      // Add assistant message
      this.messages.push({
        role: 'assistant',
        content: response,
        timestamp: new Date()
      });
      
      this.isTyping = false;
      
      // If this is a new conversation, add it to history
      if (!this.currentChatId) {
        const newChat = {
          id: this.chatHistory.length + 1,
          title: userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : ''),
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
      // Simple formatting - in a real app you would use markdown or other rich formatting
      return message.replace(/\n/g, '<br>');
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
    logout() {
      // Remove authentication data
      localStorage.removeItem('isAuthenticated');
      
      // Redirect to auth page
      this.$router.push('/auth');
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-container {
  display: flex;
  height: 100vh;
  width: 100%;
  background: #f8fafc;
}

/* Sidebar Styles */
.sidebar {
  width: 300px;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
  
  &.collapsed {
    width: 60px;
  }
}

.sidebar-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
}

.logo-container {
  cursor: default;
  pointer-events: none; /* Prevents the logo from being clickable */
}

.collapse-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  z-index: 10;
  
  &:hover {
    background: #f1f5fe;
    color: #6366f1;
  }
  
  /* Make the expand button more visible when sidebar is collapsed */
  .sidebar.collapsed & {
    position: absolute;
    left: 15px;
    top: 15px;
    background: #f1f5fe;
    color: #6366f1;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    
    &:hover {
      background: #e1e5fe;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }
}

.new-chat-btn-container {
  padding: 1rem;
}

.new-chat-btn {
  width: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #4f46e5 100%);
  color: #fff;
  border: none;
  border-radius: 0.75rem;
  padding: 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
  transition: background 0.2s, box-shadow 0.2s;
  
  &:hover {
    background: linear-gradient(90deg, #818cf8 0%, #6366f1 100%);
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.12);
  }
}

.plus-icon {
  font-size: 1.2em;
  line-height: 1;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.history-title {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.no-history {
  text-align: center;
  color: #9ca3af;
  font-size: 0.9rem;
  margin-top: 2rem;
}

.history-item {
  padding: 0.75rem;
  border-radius: 0.75rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f1f5fe;
  }
  
  &.active {
    background: #f1f5fe;
  }
}

.history-item-title {
  font-size: 0.95rem;
  color: #374151;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-item-date {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  position: relative;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.75rem;
  
  &:hover {
    background: #f1f5fe;
  }
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.8rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu {
  position: absolute;
  bottom: 100%;
  left: 1rem;
  right: 1rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 0.5rem;
  border: 1px solid #e5e7eb;
  z-index: 10;
}

.menu-item {
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  color: #374151;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f1f5fe;
    color: #4f46e5;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #e5e7eb;
  }
}

/* Main Content Styles */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  
  h1 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
}

.empty-chat {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.welcome-container {
  text-align: center;
  max-width: 600px;
  
  h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #3730a3;
    margin-bottom: 0.75rem;
  }
  
  p {
    font-size: 1.1rem;
    color: #4b5563;
    margin-bottom: 2rem;
  }
}

.stats-container {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #6366f1;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: #6b7280;
}

.message-container {
  display: flex;
  padding: 1.5rem;
  gap: 1rem;
  
  &.user {
    background: #fff;
  }
  
  &.assistant {
    background: #f8fafc;
  }
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
  
  &.user {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: white;
  }
  
  &.assistant {
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    color: white;
  }
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.message-sender {
  font-weight: 600;
  color: #374151;
  font-size: 1rem;
}

.message-time {
  font-size: 0.8rem;
  color: #6b7280;
}

.message-text {
  color: #374151;
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.typing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  
  span {
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: #6366f1;
    border-radius: 50%;
    animation: typing 1s infinite ease-in-out;
    
    &:nth-child(1) {
      animation-delay: 0s;
    }
    
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

.chat-input-container {
  padding: 1rem 1.5rem;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.model-selector-container {
  position: relative;
  margin-bottom: 0.75rem;
}

.model-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f1f5fe;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: border-color 0.2s;
  max-width: 250px;
  
  &:hover {
    border-color: #d1d5db;
  }
}

.selected-model {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.model-icon {
  font-size: 1.2rem;
}

.model-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}

.dropdown-arrow {
  font-size: 0.7rem;
  color: #6b7280;
  transition: transform 0.2s;
  
  &.open {
    transform: rotate(180deg);
  }
}

.model-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 300px;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  margin-top: 0.5rem;
  z-index: 10;
  max-height: 300px;
  overflow-y: auto;
}

.model-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f1f5fe;
  }
  
  &.selected {
    background: #f1f5fe;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #e5e7eb;
  }
}

.model-option-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}

.model-option-desc {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  resize: none;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 0.85rem 1.1rem;
  padding-right: 3rem;
  font-size: 1rem;
  background: #f8fafc;
  color: #111827;
  transition: border 0.2s, background 0.2s;
  min-height: 56px;
  max-height: 150px;
  line-height: 1.5;
  
  &:focus {
    border-color: #6366f1;
    outline: none;
    background: #fff;
  }
}

.send-btn {
  position: absolute;
  right: 0.75rem;
  bottom: 0.75rem;
  background: #6366f1;
  color: white;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  
  &:hover:not(:disabled) {
    background: #4f46e5;
    transform: scale(1.05);
  }
  
  &:disabled {
    background: #c7d2fe;
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
    transform: translateX(1px);
  }
}

.input-footer {
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem 0.25rem;
}

.input-hint {
  font-size: 0.8rem;
  color: #9ca3af;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .sidebar:not(.collapsed) {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 50;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.06);
  }
  
  .chat-header h1 {
    font-size: 1.1rem;
  }
  
  .message-container {
    padding: 1rem;
  }
  
  .stats-container {
    gap: 1.5rem;
  }
  
  .stat-value {
    font-size: 2rem;
  }
}
</style>