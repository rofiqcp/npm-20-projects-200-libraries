/**
 * LLM Service - Supports real OpenAI API and intelligent mock fallback.
 * When OPENAI_API_KEY is not set, uses keyword-based mock responses
 * with simulated streaming word-by-word via callback.
 */

const mockResponses = {
  greeting: [
    "Hello! I'm your AI assistant. I'm here to help you with any questions or tasks you have. What can I assist you with today?",
    "Hi there! Great to meet you. I'm ready to help with anything from coding questions to general knowledge. What's on your mind?",
    "Hey! Welcome. I'm an AI assistant powered by advanced language models. Feel free to ask me anything!",
  ],

  programming: {
    javascript: `JavaScript is a versatile, high-level programming language primarily used for web development. Here are some key concepts:

**Core Features:**
- **Dynamic typing** - variables can hold any type
- **First-class functions** - functions are values
- **Prototypal inheritance** - objects inherit from other objects
- **Async/await** - modern way to handle asynchronous operations

**Example:**
\`\`\`javascript
// Modern async function
async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
\`\`\`

JavaScript runs in browsers and on servers (via Node.js), making it one of the most widely used languages in the world.`,

    python: `Python is an elegant, readable programming language known for its simplicity. Here's what makes it special:

**Key Strengths:**
- **Readable syntax** - code reads almost like English
- **Vast ecosystem** - NumPy, Pandas, TensorFlow, Django, Flask
- **Versatile** - web development, data science, AI/ML, automation

**Example:**
\`\`\`python
# List comprehension - Pythonic way
squares = [x**2 for x in range(10)]

# Decorator pattern
def log_calls(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@log_calls
def greet(name):
    return f"Hello, {name}!"
\`\`\`

Python is consistently ranked as one of the top programming languages for beginners and professionals alike.`,

    react: `React is a JavaScript library for building user interfaces, developed by Meta. Here's a comprehensive overview:

**Core Concepts:**
- **Components** - reusable UI building blocks
- **JSX** - HTML-like syntax in JavaScript
- **State & Props** - data management
- **Hooks** - stateful logic in functional components

**Example with Hooks:**
\`\`\`jsx
import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

React's virtual DOM and component model make it efficient for building complex, interactive UIs.`,

    nodejs: `Node.js is a JavaScript runtime built on Chrome's V8 engine that lets you run JavaScript on the server side.

**Key Features:**
- **Non-blocking I/O** - handles many connections simultaneously
- **NPM ecosystem** - 2M+ packages available
- **Event-driven** - perfect for real-time applications
- **Single language** - JavaScript on both frontend and backend

**Example Express Server:**
\`\`\`javascript
const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
\`\`\`

Node.js is excellent for APIs, real-time apps (chat, gaming), microservices, and CLI tools.`,

    css: `CSS (Cascading Style Sheets) controls the visual presentation of web pages. Modern CSS is incredibly powerful:

**Modern CSS Features:**
- **Flexbox** - one-dimensional layouts
- **CSS Grid** - two-dimensional layouts  
- **Custom Properties** - CSS variables
- **Animations** - smooth transitions

**Example:**
\`\`\`css
/* CSS Grid Layout */
.dashboard {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr;
  height: 100vh;
}

/* CSS Custom Properties */
:root {
  --primary: #6366f1;
  --bg-dark: #1e1e2e;
}

/* Smooth animation */
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.3);
}
\`\`\``,
  },

  ai: `Artificial Intelligence (AI) is a broad field of computer science focused on creating systems that can perform tasks that typically require human intelligence.

**Main Branches:**
- **Machine Learning** - systems that learn from data
- **Deep Learning** - neural networks with many layers
- **NLP** - understanding and generating human language
- **Computer Vision** - interpreting visual information

**Large Language Models (LLMs):**
LLMs like GPT-4, Claude, and Gemini are trained on vast amounts of text data using transformer architecture. They can:
- Generate human-like text
- Answer questions
- Write and debug code
- Translate languages
- Summarize documents

**How Transformers Work:**
The transformer architecture uses **attention mechanisms** to understand context and relationships between words, enabling much better language understanding than previous approaches.

The field is advancing rapidly, with new capabilities emerging constantly in areas like reasoning, multimodal understanding, and autonomous agents.`,

  database: `Databases are organized collections of structured data. Here are the main types:

**Relational Databases (SQL):**
- PostgreSQL, MySQL, SQLite
- Data organized in tables with relationships
- Use SQL for queries
- ACID compliance ensures data integrity

**NoSQL Databases:**
- **Document stores** (MongoDB) - JSON-like documents
- **Key-Value** (Redis) - fast caching and sessions
- **Column-family** (Cassandra) - massive scale
- **Graph** (Neo4j) - relationship-heavy data

**When to Use What:**
- SQL: Financial data, user accounts, complex relationships
- MongoDB: Content management, catalogs, user profiles
- Redis: Caching, sessions, real-time leaderboards

**SQL Example:**
\`\`\`sql
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name
HAVING order_count > 5
ORDER BY order_count DESC;
\`\`\``,

  security: `Web security is critical for protecting applications and user data. Key areas to focus on:

**OWASP Top 10 Threats:**
1. **Injection** (SQL, NoSQL, Command)
2. **Broken Authentication**
3. **Sensitive Data Exposure**
4. **XML External Entities (XXE)**
5. **Broken Access Control**
6. **Security Misconfiguration**
7. **XSS** (Cross-Site Scripting)
8. **Insecure Deserialization**
9. **Known Vulnerabilities**
10. **Insufficient Logging**

**Best Practices:**
\`\`\`javascript
// Always hash passwords
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 12);

// Use parameterized queries
const user = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email] // Never concatenate user input!
);

// Set security headers
app.use(helmet()); // Express middleware
\`\`\`

**JWT Best Practices:**
- Use short expiration times
- Rotate refresh tokens
- Store tokens securely (httpOnly cookies)
- Validate on every request`,

  git: `Git is a distributed version control system that tracks changes in your code over time.

**Essential Commands:**
\`\`\`bash
# Initialize a repository
git init

# Stage and commit changes
git add .
git commit -m "feat: add user authentication"

# Branching workflow
git checkout -b feature/new-feature
git merge feature/new-feature

# Remote operations
git remote add origin https://github.com/user/repo.git
git push origin main
git pull origin main

# Useful shortcuts
git log --oneline --graph --all
git stash push -m "work in progress"
git cherry-pick abc1234
\`\`\`

**Conventional Commits:**
- \`feat:\` - new feature
- \`fix:\` - bug fix
- \`docs:\` - documentation
- \`refactor:\` - code restructuring
- \`test:\` - adding tests

Good commit messages make collaboration and code history much more maintainable!`,

  docker: `Docker is a platform for developing, shipping, and running applications in containers.

**Key Concepts:**
- **Image** - blueprint for a container (like a class)
- **Container** - running instance of an image (like an object)
- **Dockerfile** - instructions to build an image
- **Docker Compose** - multi-container applications

**Example Dockerfile:**
\`\`\`dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
USER node

CMD ["node", "server.js"]
\`\`\`

**Docker Compose:**
\`\`\`yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mongo
  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
volumes:
  mongo_data:
\`\`\`

Containers ensure your app runs the same everywhere - "works on my machine" becomes "works everywhere"!`,

  general: [
    "That's a great question! I'd be happy to help you explore that topic. Could you give me a bit more context about what specific aspect you're most interested in? I can provide detailed information on a wide range of subjects including technology, science, history, arts, and more.",
    "Interesting topic! I have knowledge about a wide variety of subjects. To give you the most helpful response, could you elaborate a bit more on what you're looking for?",
    "I appreciate your question! I'm designed to assist with a broad range of topics. Let me know if you'd like me to dive deeper into any particular aspect of this subject.",
  ],

  fallback: [
    `I understand you're asking about that topic. While I'm running in demo mode without a live AI connection, I can share some general thoughts:

This appears to be an interesting subject worth exploring. In a full AI integration, I would analyze your question in depth and provide a comprehensive, personalized response.

**What I can help with in demo mode:**
- Programming and software development questions
- JavaScript, Python, React, Node.js
- Databases (SQL and NoSQL)
- AI and machine learning concepts
- Web security best practices
- Git and version control
- Docker and containerization

Feel free to ask about any of these topics for detailed responses! Or if you set up an OpenAI API key in the .env file, I'll connect to GPT for full AI capabilities.`,
    `That's a thoughtful question! In demo mode, I'm working with pre-programmed responses, but I can engage with many technical topics.

Try asking me about:
- "How does JavaScript work?"
- "Explain React hooks"
- "What is machine learning?"
- "How do I use Docker?"
- "Explain database indexing"

I'll give you detailed, helpful responses on these topics. For full conversational AI capabilities, configure your OpenAI API key!`,
  ],
};

function getMockResponse(messages) {
  const lastMessage = messages[messages.length - 1];
  const text = lastMessage.content.toLowerCase();

  // Greetings
  if (/^(hi|hello|hey|howdy|greetings|good\s*(morning|afternoon|evening))/.test(text)) {
    const responses = mockResponses.greeting;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Programming topics
  if (text.includes('javascript') || text.includes('js ') || text.includes('node.js') || text.includes('nodejs')) {
    if (text.includes('node') || text.includes('server') || text.includes('backend')) {
      return mockResponses.programming.nodejs;
    }
    return mockResponses.programming.javascript;
  }

  if (text.includes('python') || text.includes('django') || text.includes('flask')) {
    return mockResponses.programming.python;
  }

  if (text.includes('react') || text.includes('jsx') || text.includes('hooks') || text.includes('component')) {
    return mockResponses.programming.react;
  }

  if (text.includes('css') || text.includes('tailwind') || text.includes('flexbox') || text.includes('grid')) {
    return mockResponses.programming.css;
  }

  if (text.includes('node') || text.includes('express') || text.includes('backend')) {
    return mockResponses.programming.nodejs;
  }

  // AI/ML topics
  if (
    text.includes('artificial intelligence') ||
    text.includes(' ai ') ||
    text.includes(' llm') ||
    text.includes('machine learning') ||
    text.includes('deep learning') ||
    text.includes('neural') ||
    text.includes('gpt') ||
    text.includes('chatgpt') ||
    text.includes('openai')
  ) {
    return mockResponses.ai;
  }

  // Database topics
  if (
    text.includes('database') ||
    text.includes('mongodb') ||
    text.includes('postgres') ||
    text.includes('mysql') ||
    text.includes('redis') ||
    text.includes('sql')
  ) {
    return mockResponses.database;
  }

  // Security topics
  if (
    text.includes('security') ||
    text.includes('authentication') ||
    text.includes('jwt') ||
    text.includes('oauth') ||
    text.includes('xss') ||
    text.includes('csrf') ||
    text.includes('password')
  ) {
    return mockResponses.security;
  }

  // Git topics
  if (
    text.includes('git') ||
    text.includes('github') ||
    text.includes('version control') ||
    text.includes('commit') ||
    text.includes('branch')
  ) {
    return mockResponses.git;
  }

  // Docker/DevOps topics
  if (
    text.includes('docker') ||
    text.includes('container') ||
    text.includes('kubernetes') ||
    text.includes('devops') ||
    text.includes('ci/cd')
  ) {
    return mockResponses.docker;
  }

  // General programming
  if (
    text.includes('code') ||
    text.includes('program') ||
    text.includes('develop') ||
    text.includes('software') ||
    text.includes('function') ||
    text.includes('algorithm')
  ) {
    const responses = mockResponses.general;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Fallback
  const fallbacks = mockResponses.fallback;
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

async function streamMockResponse(messages, onToken, onComplete) {
  const fullResponse = getMockResponse(messages);
  const words = fullResponse.split(' ');

  let tokenCount = 0;
  let buffer = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    buffer += (i === 0 ? '' : ' ') + word;

    // Emit every 1-2 words for natural streaming feel
    if (i % 2 === 1 || i === words.length - 1) {
      onToken(buffer);
      buffer = '';
      tokenCount++;
      // Simulate variable typing speed
      await new Promise((resolve) => setTimeout(resolve, 30 + Math.random() * 40));
    }
  }

  // Flush any remaining buffer
  if (buffer) {
    onToken(buffer);
  }

  const mockUsage = {
    prompt_tokens: messages.reduce((acc, m) => acc + Math.ceil(m.content.length / 4), 0),
    completion_tokens: Math.ceil(fullResponse.length / 4),
    total_tokens: 0,
  };
  mockUsage.total_tokens = mockUsage.prompt_tokens + mockUsage.completion_tokens;

  onComplete(fullResponse, mockUsage);
}

async function streamOpenAIResponse(messages, systemPrompt, model, onToken, onComplete) {
  const OpenAI = require('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const stream = await client.chat.completions.create({
    model: model || 'gpt-3.5-turbo',
    messages: formattedMessages,
    stream: true,
    max_tokens: 2048,
    temperature: 0.7,
  });

  let fullResponse = '';
  let usage = null;

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || '';
    if (delta) {
      fullResponse += delta;
      onToken(delta);
    }
    if (chunk.usage) {
      usage = chunk.usage;
    }
  }

  if (!usage) {
    usage = {
      prompt_tokens: formattedMessages.reduce((acc, m) => acc + Math.ceil(m.content.length / 4), 0),
      completion_tokens: Math.ceil(fullResponse.length / 4),
      total_tokens: 0,
    };
    usage.total_tokens = usage.prompt_tokens + usage.completion_tokens;
  }

  onComplete(fullResponse, usage);
}

async function streamLLMResponse({ messages, systemPrompt, model, onToken, onComplete, onError }) {
  try {
    const hasApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';

    if (hasApiKey) {
      await streamOpenAIResponse(messages, systemPrompt, model, onToken, onComplete);
    } else {
      await streamMockResponse(messages, onToken, onComplete);
    }
  } catch (error) {
    if (onError) {
      onError(error);
    } else {
      throw error;
    }
  }
}

module.exports = { streamLLMResponse, getMockResponse };
