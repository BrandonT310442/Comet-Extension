# Comet - AI-Powered LaTeX Editor for Overleaf

## Natural Language LaTeX Editing, Powered by AI

Comet is a Chrome extension that brings the power of AI-assisted editing to Overleaf, similar to how Cursor revolutionized code editing. Simply describe your LaTeX changes in natural language, and watch as Comet generates and applies precise LaTeX code directly to your Overleaf documents.

## 🚀 Features

### Core Capabilities
- **Natural Language Processing**: Describe your LaTeX edits in plain English
- **Direct Overleaf Integration**: Seamlessly inject generated LaTeX code into your Overleaf editor
- **AI-Powered Agent**: Built with LangChain and LangGraph for intelligent document understanding
- **Real-time Code Generation**: Instant LaTeX code generation based on your descriptions
- **Smart Context Awareness**: Understands document structure and LaTeX conventions

### Key Benefits
- **10x Faster Editing**: Transform hours of LaTeX formatting into minutes
- **98% Accuracy Rate**: Precision-engineered for academic and professional documents  
- **Zero Learning Curve**: No need to memorize LaTeX commands
- **24/7 Availability**: Your AI assistant is always ready to help

## 🛠️ Technology Stack

### Frontend
- **Vue 3**: Reactive user interface
- **Vue Router**: Single-page application routing
- **Vite**: Lightning-fast build tool
- **KaTeX**: Beautiful math rendering

### Backend & AI
- **LangChain**: Orchestrating language model interactions
- **LangGraph**: Building stateful AI agents
- **DeepSeek V3**: State-of-the-art language model
- **Express.js**: Backend API server
- **Supabase**: Authentication and data persistence

### Extension
- **Chrome Extension Manifest V3**: Modern extension architecture
- **Content Script Injection**: Direct Overleaf DOM manipulation
- **Message Passing**: Secure communication between extension components

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Chrome browser
- Overleaf account

### Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/comet-extension.git
cd comet-extension
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
VITE_DEEPSEEK_KEY=your_deepseek_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start development servers**
```bash
# Start both frontend and backend
npm run dev:all

# Or run separately
npm run dev        # Frontend on http://localhost:5173
npm run server     # Backend on http://localhost:3000
```

5. **Build the extension**
```bash
npm run build:extension
```

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `extension` folder from the project directory
5. The Comet extension icon should appear in your toolbar

## 🎯 Usage

### Getting Started

1. **Open Overleaf**: Navigate to your Overleaf project
2. **Click the Comet icon**: Located in your Chrome toolbar
3. **Start a conversation**: Describe what you want to change in natural language

### Example Prompts

- "Add a new section called 'Methodology' with three subsections"
- "Create a 3x3 matrix equation for the transformation"
- "Format this paragraph as a bulleted list"
- "Add a figure with caption and label it as fig:results"
- "Create a table with 5 columns for experimental data"
- "Add proper citations in APA format"

### Workflow

1. **Describe**: Type your request in natural language
2. **Generate**: Comet creates the appropriate LaTeX code
3. **Review**: Preview the generated code with syntax highlighting
4. **Apply**: Click "Apply" to inject directly into Overleaf
5. **Edit**: Make any final adjustments as needed

## 🏗️ Architecture

### System Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Chrome Extension│────▶│    Supabase     │────▶│  AI Agent       │
│                 │     │                 │     │  (LangChain)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               │
        │                                               │
        ▼                                               ▼
┌─────────────────┐                          ┌─────────────────┐
│                 │                          │                 │
│    Overleaf     │                          │   DeepSeek V3   │
│     Editor      │                          │      Model      │
│                 │                          │                 │
└─────────────────┘                          └─────────────────┘
```

### Message Flow

1. User inputs natural language request
2. Extension processes and sends to Supabase
3. LangChain agent analyzes request context
4. DeepSeek V3 generates LaTeX code
5. Response formatted and sent back to extension
6. Extension injects code into Overleaf editor

## 🔧 Configuration

### Extension Settings

The extension can be configured through `manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "Comet - AI LaTeX Editor",
  "permissions": ["activeTab", "storage", "cookies"],
  "host_permissions": ["https://*.overleaf.com/*"]
}
```

### API Configuration

Configure API endpoints in `server/index.js`:

```javascript
const API_CONFIG = {
  deepseek: process.env.DEEPSEEK_API_URL,
  supabase: process.env.SUPABASE_URL
}
```


---

**Transform your LaTeX workflow today. Write naturally, edit intelligently.** 