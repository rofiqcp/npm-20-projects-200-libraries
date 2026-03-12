# Project 13: AI Chatbot with LLM Integration

**Complexity:** ⭐⭐⭐⭐⭐  
**Duration:** 3-4 weeks  
**Database:** MongoDB + Redis  
**Level:** Advanced

## Overview
Build an AI-powered chatbot using LangChain and OpenAI API. Learn LLM integration, conversation memory, and streaming responses.

## Tech Stack
- **Frontend:** React
- **Backend:** Express.js + LangChain.js
- **Database:** MongoDB (conversation history)
- **Cache:** Redis (session storage)
- **LLM:** OpenAI API / Claude
- **Real-time:** Socket.IO (streaming)
- **Styling:** Tailwind CSS

## Key Features
- ✅ Real-time streaming responses
- ✅ Multiple conversations
- ✅ Conversation history
- ✅ Custom system prompts
- ✅ Token usage tracking
- ✅ Rate limiting
- ✅ Export conversations
- ✅ Conversation threading

## Tech Dependencies
```bash
# Backend
npm install express mongoose redis langchain openai socket.io

# Frontend
npm install react axios socket.io-client tailwindcss react-markdown
```

## Database Schema
```javascript
// MongoDB - Store conversation history
const conversationSchema = new mongoose.Schema({
  userId: String,
  title: String,
  systemPrompt: String,
  messages: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: String,
    tokens: Number,
    createdAt: { type: Date, default: Date.now }
  }],
  totalTokens: Number,
  createdAt: { type: Date, default: Date.now }
});
```

## Learning Outcomes
- LLM API integration
- LangChain usage
- Streaming text responses
- Conversation memory management
- Token counting
- Session management
- Real-time Socket.IO updates

## Project Structure
```
ai-chatbot/
├── backend/
│   ├── models/
│   │   └── Conversation.js
│   ├── services/
│   │   ├── llmService.js
│   │   └── conversationService.js
│   ├── routes/
│   │   └── chat.js
│   ├── socket/
│   │   └── handlers.js
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── ConversationList.jsx
│   │   │   ├── Message.jsx
│   │   │   └── PromptSettings.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
└── package.json
```

## Getting Started
```bash
npm install

# .env
OPENAI_API_KEY=your_key
MONGODB_URI=mongodb://localhost/chatbot
REDIS_URL=redis://localhost:6379

npm run server
npm run client
```

## Features to Add
- Function calling (AI can execute code)
- RAG (Retrieval Augmented Generation)
- Fine-tuned models
- Cost optimization
- Multi-model support
- Voice input/output
- Image analysis
- Integration with external APIs

## Resources
- LangChain documentation
- OpenAI API documentation
- Socket.IO streaming guide
