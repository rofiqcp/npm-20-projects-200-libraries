# 🎯 20 Development Projects - RECOMMENDED STACK
**Progressive Learning Path | Database Progression Simple → Complex | No Options - Just Recommendations**

---

# 🟢 LEVEL MUDAH (Beginner) — 4 Projects
**Database:** TIDAK PERLU - Gunakan Browser localStorage atau hardcoded data
**Estimasi Total:** 3-4 minggu

---

## Project 1: Portfolio Website Statis
**Durasi:** 1-2 minggu | **Complexity:** ⭐

### Tech Stack
```
Frontend: HTML5 + CSS3 + JavaScript
Styling: Tailwind CSS
Animation: Framer Motion
Icons: Feather Icons
Storage: Hardcoded data (no database)
Deployment: GitHub Pages + sirobo.codes
```

### Libraries
```javascript
npm install --save-dev tailwindcss
npm install framer-motion
npm install feather-icons
```

### Features
- ✅ Multi-page portfolio (Home, About, Projects, Contact)
- ✅ Responsive design (mobile-first)
- ✅ Smooth animations
- ✅ Dark mode toggle
- ✅ Contact form with validation
- ✅ Project showcase grid

### Database Strategy
**TIDAK ADA** - Everything is static HTML + CSS + JS in browser

---

## Project 2: Todo List App (Browser Local)
**Durasi:** 1 minggu | **Complexity:** ⭐⭐

### Tech Stack
```
Frontend: React + Hooks
State: useState for local state
Storage: Browser localStorage
Styling: Tailwind CSS
Validation: Simple form validation
```

### Libraries
```javascript
npm install react react-dom
npm install tailwindcss
```

### Features
- ✅ Add/Edit/Delete todos
- ✅ Mark as completed
- ✅ Filter (All/Active/Completed)
- ✅ Data persist di localStorage
- ✅ Export todos as JSON
- ✅ Empty state handling

### Database Strategy
**TIDAK ADA** - Semua data tersimpan di `localStorage` browser
```javascript
// Todo disimpan di browser, bukan server
localStorage.setItem('todos', JSON.stringify(todosArray));
const saved = JSON.parse(localStorage.getItem('todos'));
```

---

## Project 3: Weather App (API Integration)
**Durasi:** 1-2 minggu | **Complexity:** ⭐⭐

### Tech Stack
```
Frontend: React + Hooks
API Calls: Axios
State Management: useState + useEffect
Caching: Browser sessionStorage
Styling: Tailwind CSS
Charts: Chart.js for temperatures
External API: OpenWeatherMap (free)
```

### Libraries
```javascript
npm install react axios chart.js react-chartjs-2
npm install tailwindcss
```

### Features
- ✅ Current weather display dari API
- ✅ 5-day forecast
- ✅ City search
- ✅ Temperature unit toggle (C/F)
- ✅ Temperature trend chart
- ✅ Cache API results di sessionStorage

### Database Strategy
**TIDAK ADA** - API calls go direct ke OpenWeatherMap
```javascript
const fetchWeather = async (city) => {
  const res = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}`
  );
  // Save to sessionStorage for caching
  sessionStorage.setItem(`weather:${city}`, JSON.stringify(res.data));
  return res.data;
};
```

---

## Project 4: Movie Database Search
**Durasi:** 1-2 minggu | **Complexity:** ⭐⭐

### Tech Stack
```
Frontend: React + Hooks
API Calls: Axios
State: useState + useEffect
Caching: Browser cache
Styling: Tailwind CSS
Pagination: Manual (client-side)
External API: TMDB API (free tier)
```

### Libraries
```javascript
npm install react axios react-paginate
npm install tailwindcss
```

### Features
- ✅ Movie search dari TMDB API
- ✅ Genre & year filter (client-side)
- ✅ Pagination (10 results per page)
- ✅ Movie detail modal
- ✅ Favorite movies (simpan di localStorage)
- ✅ Movie ratings display

### Database Strategy
**TIDAK ADA** - Semuanya dari TMDB API + localStorage
```javascript
// Favorites list simpan di localStorage
const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
```

---

---

# 🟡 LEVEL SEDANG (Intermediate) — 8 Projects
**Database Mulai Digunakan** | **Progression: SQLite → MySQL → PostgreSQL → MongoDB**
**Estimasi Total:** 8-12 minggu

---

## Project 5: Expense Tracker
**Durasi:** 1-2 minggu | **Complexity:** ⭐⭐⭐ | **First Database!**

### Tech Stack
```
Frontend: React + Hooks
Backend: Express.js (simple)
Database: SQLite (paling mudah untuk mulai)
State: useState + useEffect
Styling: Tailwind CSS
Charts: Chart.js
Validation: Form validation
Authentication: Tidak perlu
```

### Libraries
```javascript
// Backend
npm install express sqlite3 better-sqlite3 cors

// Frontend
npm install react axios chart.js react-chartjs-2 tailwindcss
```

### Database Setup
```javascript
// SQLite - Paling simple! File-based, langsung jalan
const Database = require('better-sqlite3');
const db = new Database('expenses.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY,
    amount REAL,
    category TEXT,
    description TEXT,
    date TEXT
  )
`);
```

### Features
- ✅ Add/Edit/Delete expense
- ✅ Categorize (Food, Transport, Entertainment, dll)
- ✅ Monthly summary + totals
- ✅ Pie chart by category
- ✅ Export as CSV

### Why SQLite?
**Alasan pilih SQLite untuk Project 5:**
- Paling mudah untuk mulai (file-based, tanpa server)
- Single file database
- Pas untuk learning, baru introduce backend-database concept
- Cepat setup, langsung bisa code

---

## Project 6: Markdown Note App
**Durasi:** 1-2 minggu | **Complexity:** ⭐⭐⭐

### Tech Stack
```
Frontend: React + Hooks
Backend: Express.js
Database: MySQL (introduce relational DB)
State: useState + useEffect
Styling: Tailwind CSS
Markdown: React Markdown
Code Highlighting: Prism.js
Authentication: Basic JWT
```

### Libraries
```javascript
// Backend
npm install express mysql2 cors jsonwebtoken dotenv

// Frontend
npm install react axios react-markdown prism.js tailwindcss
```

### Database Setup
```javascript
// MySQL - Introduce relational database concept
const mysql = require('mysql2/promise');

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'notes_app'
});

await connection.query(`
  CREATE TABLE IF NOT EXISTS notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    content LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`);
```

### Features
- ✅ Create/Edit/Delete notes
- ✅ Live markdown preview
- ✅ Code syntax highlighting
- ✅ Search notes
- ✅ Export as HTML/PDF

### Why MySQL?
**Alasan pilih MySQL untuk Project 6:**
- Introduce relational database (lebih advanced dari SQLite)
- Multiple tables for users & notes
- Simple relationships
- Traditional relational model
- Traditional, battle-tested setup

---

## Project 7: Weather Dashboard dengan IoT Integration
**Durasi:** 2-3 minggu | **Complexity:** ⭐⭐⭐

### Tech Stack
```
Frontend: React + Hooks
Backend: Express.js + MQTT.js
Database: PostgreSQL (untuk complex queries)
Real-time: Socket.IO
Charts: Recharts
Styling: Tailwind CSS
IoT Protocol: MQTT
Data Sync: Socket.IO events
```

### Libraries
```javascript
// Backend
npm install express pg socket.io mqtt.js node-cron dotenv

// Frontend
npm install react socket.io-client recharts axios tailwindcss
```

### Database Setup
```javascript
// PostgreSQL - Complex queries + JSON support
const { Client } = require('pg');
const client = new Client({
  host: 'localhost',
  database: 'iot_dashboard',
  user: 'postgres'
});

await client.query(`
  CREATE TABLE sensors (
    id SERIAL PRIMARY KEY,
    sensor_name VARCHAR(100),
    location VARCHAR(100),
    sensor_type VARCHAR(50)
  );
  
  CREATE TABLE readings (
    id SERIAL PRIMARY KEY,
    sensor_id INTEGER REFERENCES sensors(id),
    temperature FLOAT,
    humidity FLOAT,
    timestamp TIMESTAMP DEFAULT NOW()
  );
  
  CREATE INDEX idx_sensor_time ON readings(sensor_id, timestamp);
`);
```

### Features
- ✅ Real-time sensor data dari Raspberry Pi/Arduino
- ✅ Temperature + humidity graphs
- ✅ Historical data visualization
- ✅ Alert thresholds
- ✅ Email notifications

### Why PostgreSQL?
**Alasan pilih PostgreSQL untuk Project 7:**
- Complex queries dengan JOINs
- Better indexing untuk time-series data
- JSON support untuk sensor metadata
- Production-ready

---

## Project 8: Real-Time Chat Application
**Durasi:** 2-3 minggu | **Complexity:** ⭐⭐⭐⭐

### Tech Stack
```
Frontend: React + Hooks
Backend: Express.js + Socket.IO
Database: PostgreSQL + Redis (cache)
Real-time: Socket.IO
Authentication: JWT
Styling: Tailwind CSS
Message Queue: Redis Pub/Sub
User Sessions: Redis
```

### Libraries
```javascript
// Backend
npm install express socket.io pg redis jsonwebtoken cors

// Frontend
npm install react socket.io-client axios tailwindcss
```

### Database Setup
```javascript
// PostgreSQL for persistent data
const { Client } = require('pg');
const client = new Client({...});

await client.query(`
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    email VARCHAR(100),
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
  );
  
  CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    room_name VARCHAR(100),
    created_by INTEGER REFERENCES users(id)
  );
  
  CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    room_id INTEGER REFERENCES rooms(id),
    content TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
  );
`);

// Redis for real-time state + caching
const redis = require('redis');
const redisClient = redis.createClient();
// Online status, typing indicator stored in Redis
```

### Features
- ✅ Real-time messaging via Socket.IO
- ✅ Multiple chat rooms
- ✅ User authentication (JWT)
- ✅ Online status
- ✅ Typing indicator
- ✅ Message history

### Why PostgreSQL + Redis?
**Alasan:**
- PostgreSQL untuk persistent storage (messages, users, rooms)
- Redis untuk real-time state (online users, sessions)
- Kombinasi sempurna untuk real-time apps

---

## Project 9: Blog Platform CMS
**Durasi:** 2-3 minggu | **Complexity:** ⭐⭐⭐⭐

### Tech Stack
```
Frontend: React
Backend: Express.js
Database: MongoDB (flexible schema untuk content)
Rich Editor: TipTap atau Draft.js
Authentication: JWT
File Upload: Multer (images)
Styling: Tailwind CSS
Rate Limiting: express-rate-limit
```

### Libraries
```javascript
// Backend
npm install express mongoose multer jsonwebtoken cors dotenv

// Frontend
npm install react axios react-router-dom tailwindcss tiptap
```

### Database Setup
```javascript
// MongoDB - Flexible schema untuk blog posts
const mongoose = require('mongoose');
await mongoose.connect('mongodb://localhost/blog_platform');

const postSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  excerpt: String,
  author: mongoose.Schema.Types.ObjectId,
  tags: [String],
  category: String,
  featured_image: String,
  published: Boolean,
  views: Number,
  comments: [{
    author: String,
    content: String,
    createdAt: Date
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### Features
- ✅ Create/Edit/Delete blog posts
- ✅ Rich text editor
- ✅ Categories & tags
- ✅ Comments system
- ✅ Like/Rating posts
- ✅ Search functionality

### Why MongoDB?
**Alasan pilih MongoDB untuk Project 9:**
- Flexible schema (posts bisa berbeda struktur)
- Natural for content management
- Embeds comments dalam post document
- Perfect untuk CMS use case
- Mudah scalable

---

## Project 10: Kanban Board (Drag-Drop)
**Durasi:** 2-3 minggu | **Complexity:** ⭐⭐⭐⭐

### Tech Stack
```
Frontend: React + React Beautiful DnD
Backend: Express.js + Socket.IO
Database: MongoDB (flexible task structure)
Real-time: Socket.IO
Authentication: JWT
Styling: Tailwind CSS
Drag-Drop: React Beautiful DnD
```

### Libraries
```javascript
// Backend
npm install express mongoose socket.io jsonwebtoken cors

// Frontend
npm install react react-beautiful-dnd socket.io-client tailwindcss
```

### Database Setup
```javascript
// MongoDB - Perfect untuk nested task structure
const taskSchema = new mongoose.Schema({
  boardId: mongoose.Schema.Types.ObjectId,
  title: String,
  description: String,
  status: { type: String, enum: ['todo', 'in-progress', 'done'] },
  assignee: String,
  priority: String,
  dueDate: Date,
  comments: [{
    author: String,
    content: String
  }],
  position: Number,
  createdAt: { type: Date, default: Date.now }
});

const boardSchema = new mongoose.Schema({
  name: String,
  owner: mongoose.Schema.Types.ObjectId,
  columns: [String],
  tasks: [taskSchema],
  createdAt: { type: Date, default: Date.now }
});
```

### Features
- ✅ Drag-drop tasks between columns
- ✅ Create/Edit/Delete tasks
- ✅ Real-time sync (multiple users)
- ✅ User assignments
- ✅ Due dates & priority
- ✅ Comments on tasks

### Why MongoDB?
**Alasan:**
- Nested tasks structure cocok dengan document model
- Flexible untuk berbagai task properties
- Real-time updates simple dengan Socket.IO
- Natural JSON structure

---

## Project 11: Social Media Feed (Twitter-like)
**Durasi:** 3-4 minggu | **Complexity:** ⭐⭐⭐⭐

### Tech Stack
```
Frontend: React
Backend: Express.js + GraphQL (intro GraphQL)
Database: PostgreSQL (relational for users/follows/posts)
API: GraphQL (replace REST)
Real-time: Socket.IO
Authentication: JWT
Styling: Tailwind CSS
Caching: Redis
```

### Libraries
```javascript
// Backend
npm install express graphql apollo-server-express pg redis socket.io

// Frontend
npm install react @apollo/client graphql socket.io-client tailwindcss
```

### Database Setup
```javascript
// PostgreSQL - Complex relationships
const { Client } = require('pg');
const client = new Client({...});

await client.query(`
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    name VARCHAR(100),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP
  );
  
  CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    content TEXT,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP
  );
  
  CREATE TABLE follows (
    follower_id INTEGER REFERENCES users(id),
    following_id INTEGER REFERENCES users(id),
    PRIMARY KEY (follower_id, following_id)
  );
  
  CREATE TABLE likes (
    user_id INTEGER REFERENCES users(id),
    post_id INTEGER REFERENCES posts(id),
    PRIMARY KEY (user_id, post_id)
  );
  
  CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    post_id INTEGER REFERENCES posts(id),
    content TEXT,
    created_at TIMESTAMP
  );
`);
```

### Features
- ✅ Create/Delete posts
- ✅ Like & comment posts
- ✅ Follow/Unfollow users
- ✅ Feed timeline
- ✅ User profiles
- ✅ Search users/hashtags
- ✅ Real-time notifications

### Why PostgreSQL + GraphQL?
**Alasan:**
- PostgreSQL untuk complex relational queries (follows, likes, comments)
- GraphQL untuk flexible queries (clients ambil exactly yang mereka butuh)
- Introduce industry-standard API pattern
- Better performance dengan deep nesting

---

## Project 12: Online Quiz Platform
**Durasi:** 2-3 minggu | **Complexity:** ⭐⭐⭐⭐

### Tech Stack
```
Frontend: React
Backend: Express.js
Database: MySQL (traditional, relational structure)
Authentication: JWT
Real-time Updates: Redis Pub/Sub untuk leaderboard
Styling: Tailwind CSS
Charts: Recharts untuk analytics
```

### Libraries
```javascript
// Backend
npm install express mysql2 redis jsonwebtoken cors

// Frontend
npm install react axios recharts react-router-dom tailwindcss
```

### Database Setup
```javascript
// MySQL - Traditional structure for quiz questions
const mysql = require('mysql2/promise');
const connection = await mysql.createConnection({...});

await connection.query(`
  CREATE TABLE quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    created_by INT,
    created_at TIMESTAMP
  );
  
  CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT REFERENCES quizzes(id),
    question TEXT,
    question_type ENUM('mcq', 'true-false', 'short-answer'),
    options JSON,
    correct_answer VARCHAR(255),
    points INT
  );
  
  CREATE TABLE attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    quiz_id INT REFERENCES quizzes(id),
    score INT,
    total_points INT,
    attempted_at TIMESTAMP
  );
  
  CREATE TABLE responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT,
    question_id INT,
    user_answer VARCHAR(255),
    is_correct BOOLEAN
  );
`);
```

### Features
- ✅ Create quizzes with multiple question types
- ✅ Time-based questions
- ✅ Auto-scoring
- ✅ Leaderboard (real-time via Redis)
- ✅ Performance analytics
- ✅ Attempt history
- ✅ Certificate download

### Why MySQL?
**Alasan:**
- Traditional relational structure cocok untuk quiz data
- Clear relationships: quizzes → questions → attempts
- Familiar pattern untuk team
- Good for structured educational data

---

---

# 🔴 LEVEL ADVANCED (Expert) — 8 Projects
**Multiple Database + Complex Architecture** | **Progression: Kombinasi → Microservices → Distributed**
**Estimasi Total:** 12-16 minggu

---

## Project 13: AI Chatbot dengan LLM Integration
**Durasi:** 3-4 minggu | **Complexity:** ⭐⭐⭐⭐⭐

### Tech Stack
```
Frontend: React
Backend: Express.js + LangChain.js
Database: MongoDB (conversation history)
Caching: Redis (session + response cache)
LLM: OpenAI API / Claude
Real-time: Socket.IO (streaming responses)
Authentication: JWT
Styling: Tailwind CSS
```

### Libraries
```javascript
// Backend
npm install express mongoose redis langchain openai socket.io

// Frontend
npm install react axios socket.io-client tailwindcss react-markdown
```

### Database Setup
```javascript
// MongoDB - Store conversation history, user context
const conversationSchema = new mongoose.Schema({
  userId: String,
  messages: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: String,
    timestamp: Date
  }],
  model: String,
  systemPrompt: String,
  temperature: Number,
  createdAt: { type: Date, default: Date.now }
});

// Redis untuk session state
const redis = require('redis');
const client = redis.createClient();
// Store active conversation state untuk faster access
```

### Features
- ✅ Real-time streaming responses
- ✅ Multiple conversations
- ✅ Conversation history
- ✅ Custom system prompts
- ✅ Token usage tracking
- ✅ Rate limiting
- ✅ Export conversations

### API Integration
```javascript
const { ChatOpenAI } = require('langchain/chat_models/openai');
const { ConversationChain } = require('langchain/chains');

const chat = new ChatOpenAI({
  temperature: 0.7,
  modelName: 'gpt-4'
});
```

---

## Project 14: AI Image Recognition App
**Durasi:** 3-4 minggu | **Complexity:** ⭐⭐⭐⭐⭐

### Tech Stack
```
Frontend: React + Canvas API
Backend: Express.js
Database: PostgreSQL (image metadata + results)
ML Models: TensorFlow.js + MediaPipe + Tesseract.js
File Storage: Cloud Storage (AWS S3 / Google Cloud)
Image Processing: Sharp
Authentication: JWT
Styling: Tailwind CSS
```

### Libraries
```javascript
// Backend
npm install express pg tensorflow.js tesseract.js mediapipe sharp multer aws-sdk

// Frontend
npm install react tensorflow.js mediapipe canvas-style tailwindcss
```

### Database Setup
```javascript
// PostgreSQL - Store metadata + recognition results
const { Client } = require('pg');
const client = new Client({...});

await client.query(`
  CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    filename VARCHAR(255),
    s3_url VARCHAR(500),
    upload_date TIMESTAMP,
    image_size INTEGER
  );
  
  CREATE TABLE recognition_results (
    id SERIAL PRIMARY KEY,
    image_id INTEGER REFERENCES images(id),
    recognition_type VARCHAR(50), -- 'object', 'face', 'text', 'pose'
    results JSONB,
    confidence FLOAT,
    created_at TIMESTAMP
  );
  
  CREATE TABLE detected_objects (
    id SERIAL PRIMARY KEY,
    result_id INTEGER REFERENCES recognition_results(id),
    object_name VARCHAR(100),
    confidence FLOAT,
    bounding_box JSONB
  );
`);
```

### Features
- ✅ Upload & process images
- ✅ Object detection
- ✅ Face recognition
- ✅ Text extraction (OCR)
- ✅ Pose detection
- ✅ Batch processing
- ✅ Historical analysis
- ✅ Result visualization

---

## Project 15: E-Commerce Full-Stack
**Durasi:** 4-5 minggu | **Complexity:** ⭐⭐⭐⭐⭐

### Tech Stack
```
Frontend: React + Redux
Backend: Express.js
Database: PostgreSQL (relational core) + Redis (cache)
Payment: Stripe integration
Authentication: JWT + OAuth
File Upload: Multer + Cloud Storage
Search: Elasticsearch (optional)
Analytics: Analytics database
Styling: Tailwind CSS
Admin: Separate admin dashboard
```

### Libraries
```javascript
// Backend
npm install express pg redis stripe jsonwebtoken cors multer rate-limiter-flexible

// Frontend
npm install react redux axios react-router-dom tailwindcss stripe-react
```

### Database Setup
```javascript
// PostgreSQL - Complete e-commerce schema
const { Client } = require('pg');
const client = new Client({...});

await client.query(`
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(255),
    created_at TIMESTAMP
  );
  
  CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    price DECIMAL(10,2),
    inventory INT,
    sku VARCHAR(100),
    category_id INTEGER,
    image_url VARCHAR(500),
    created_at TIMESTAMP
  );
  
  CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    slug VARCHAR(100)
  );
  
  CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(10,2),
    status VARCHAR(50),
    payment_status VARCHAR(50),
    created_at TIMESTAMP
  );
  
  CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INT,
    unit_price DECIMAL(10,2)
  );
  
  CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    stripe_payment_id VARCHAR(255),
    amount DECIMAL(10,2),
    status VARCHAR(50),
    created_at TIMESTAMP
  );
  
  CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    user_id INTEGER REFERENCES users(id),
    rating INT,
    comment TEXT,
    created_at TIMESTAMP
  );
`);
```

### Features
- ✅ Product catalog with search/filter
- ✅ Shopping cart persistence
- ✅ Stripe payment integration
- ✅ Order management
- ✅ User reviews & ratings
- ✅ Admin dashboard
- ✅ Email notifications
- ✅ Wishlist

---

## Project 16: IoT Smart Home System
**Durasi:** 4-5 minggu | **Complexity:** ⭐⭐⭐⭐⭐

### Tech Stack
```
Frontend: React + Material-UI
Backend: NestJS (more scalable)
Database Utama: MongoDB (flexible device configs)
Time-Series DB: Cassandra (sensor readings at scale)
Real-time: Socket.IO + MQTT
Caching: Redis
Authentication: JWT
IoT Protocol: MQTT.js
Visualization: Recharts
```

### Libraries
```javascript
// Backend
npm install @nestjs/common mqtt.js mongoose cassandra-driver redis socket.io

// Frontend
npm install react socket.io-client recharts material-ui mqtt tailwindcss
```

### Database Architecture
```javascript
// MongoDB - Device configuration, automation rules
const mongoose = require('mongoose');

const deviceSchema = mongoose.Schema({
  name: String,
  type: { type: String, enum: ['light', 'thermostat', 'door', 'camera'] },
  location: String,
  mqtt_topic: String,
  status: String,
  automationRules: [{
    trigger: String,
    condition: Object,
    action: String
  }]
});

// Cassandra - Time-series sensor data
const cassandra = require('cassandra-driver');
const client = new cassandra.Client({...});

await client.execute(`
  CREATE TABLE sensor_readings (
    sensor_id TEXT,
    timestamp TIMESTAMP,
    temperature FLOAT,
    humidity FLOAT,
    PRIMARY KEY ((sensor_id), timestamp)
  ) WITH CLUSTERING ORDER BY (timestamp DESC)
`);

// Redis - Real-time state
const redis = require('redis');
const redisClient = redis.createClient();
// Store device status for instant access
await redisClient.set(`device:${deviceId}:status`, 'on');
```

### Features
- ✅ Device discovery & pairing
- ✅ Real-time control
- ✅ Automation rules
- ✅ Scheduling
- ✅ Scene management
- ✅ Energy monitoring
- ✅ Historical data graphs
- ✅ Mobile app support

### Why 3 Databases?
- **MongoDB** → Flexible device configs
- **Cassandra** → Massive time-series scale
- **Redis** → Real-time state access

---

## Project 17: Microservices E-Commerce Architecture
**Durasi:** 5-6 minggu | **Complexity:** ⭐⭐⭐⭐⭐⭐

### Tech Stack
```
Architecture: Microservices + API Gateway
API Gateway: Express.js + GraphQL
Service Framework: NestJS per service
Databases: Multiple specialized databases
Communication: REST + GraphQL
Message Queue: RabbitMQ or Kafka
Containerization: Docker
Orchestration: Docker Compose (dev), optional Kubernetes
```

### Microservices

**1. User Service**
```
Database: PostgreSQL
Languages: TypeScript + NestJS
```

**2. Product Service**
```
Database: MongoDB (flexible catalog)
Languages: TypeScript + NestJS
Search: Elasticsearch
```

**3. Order Service**
```
Database: PostgreSQL (transactions)
Languages: TypeScript + NestJS
```

**4. Payment Service**
```
Database: PostgreSQL (audit trail)
Languages: TypeScript + NestJS
Integration: Stripe SDK
```

**5. Notification Service**
```
Database: Redis (queue)
Languages: TypeScript + NestJS
Queue: RabbitMQ
```

### Libraries
```javascript
// All services
npm install @nestjs/common @nestjs/core typeorm passport

// Depending on service:
npm install pg mongodb stripe redis bull amqplib

// API Gateway
npm install apollo-server-express express graphql
```

### Docker Setup
```yaml
# docker-compose.yml
version: '3.9'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_PASSWORD: password
      
  mongodb:
    image: mongo:latest
    
  redis:
    image: redis:latest
    
  rabbitmq:
    image: rabbitmq:latest
    
  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - mongodb
      - redis
      - rabbitmq
      
  user-service:
    build: ./services/user-service
    depends_on:
      - postgres
      
  product-service:
    build: ./services/product-service
    depends_on:
      - mongodb
```

### Features
- ✅ Each service independently scalable
- ✅ Service discovery
- ✅ Inter-service communication
- ✅ Event-driven architecture
- ✅ Distributed transactions
- ✅ API Gateway composition

---

## Project 18: Real-Time Analytics Dashboard
**Durasi:** 4-5 minggu | **Complexity:** ⭐⭐⭐⭐⭐⭐

### Tech Stack
```
Frontend: React + D3.js + Recharts
Backend: NestJS
Primary Database: PostgreSQL (warehouse)
Time-Series: InfluxDB atau TimescaleDB extension
Real-time: Kafka + Socket.IO
Caching: Redis
Visualization: D3.js, Echarts, WebGL
Data Processing: Node streams
```

### Libraries
```javascript
// Backend
npm install @nestjs/common pg influxdb-client kafka-node socket.io

// Frontend
npm install react d3 recharts echarts socket.io-client

// Data processing
npm install kafka-node stream bull
```

### Database Architecture
```javascript
// PostgreSQL - Main analytics warehouse
const { Client } = require('pg');
const client = new Client({...});

await client.query(`
  CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50),
    user_id INTEGER,
    session_id VARCHAR(100),
    data JSONB,
    timestamp TIMESTAMP,
    source VARCHAR(50)
  );
  
  CREATE TABLE aggregations (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100),
    value INTEGER,
    period VARCHAR(20),
    aggregated_at TIMESTAMP
  );
  
  CREATE INDEX idx_event_timestamp ON events(timestamp);
  CREATE INDEX idx_metric_period ON aggregations(metric_name, period);
`);

// TimescaleDB for time-series optimization (PostgreSQL extension)
// Or InfluxDB for better time-series performance
```

### Features
- ✅ Real-time KPI dashboard
- ✅ Multi-source data ingestion
- ✅ Custom metric creation
- ✅ Drill-down analytics
- ✅ Scheduled reports
- ✅ Alert system
- ✅ Heatmaps & advanced viz
- ✅ Data export

---

## Project 19: Real-Time Collaborative Code Editor (VS Code Online)
**Durasi:** 5-6 minggu | **Complexity:** ⭐⭐⭐⭐⭐⭐

### Tech Stack
```
Frontend: React + Monaco Editor
Backend: Express.js + Socket.IO
Database: PostgreSQL (files + history)
Real-time Sync: Operational Transformation
Code Execution: Docker sandboxes
Terminal: Xterm.js
Authentication: JWT
Collaboration: Presence awareness
```

### Libraries
```javascript
// Backend
npm install express socket.io pg dotenv

// Frontend
npm install react monaco-editor socket.io-client xterm tailwindcss

// Collaboration
npm install ot.js yjs

// Code execution
npm install docker-sdk
```

### Database Setup
```javascript
// PostgreSQL - Project + file storage
const { Client } = require('pg');
const client = new Client({...});

await client.query(`
  CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER,
    name VARCHAR(255),
    created_at TIMESTAMP
  );
  
  CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    filename VARCHAR(255),
    content TEXT,
    language VARCHAR(50),
    last_modified TIMESTAMP
  );
  
  CREATE TABLE collaborators (
    id SERIAL PRIMARY KEY,
    project_id INTEGER,
    user_id INTEGER,
    permission VARCHAR(20), -- 'view', 'edit'
    joined_at TIMESTAMP
  );
  
  CREATE TABLE edit_history (
    id SERIAL PRIMARY KEY,
    file_id INTEGER REFERENCES files(id),
    user_id INTEGER,
    change TEXT,
    timestamp TIMESTAMP
  );
`);
```

### Features
- ✅ Real-time collaborative editing
- ✅ Multiple cursors
- ✅ Syntax highlighting (100+ languages)
- ✅ Built-in terminal
- ✅ Code execution (Node.js, Python, Java, dll)
- ✅ File tree explorer
- ✅ Chat/comments
- ✅ Version control
- ✅ Presence awareness

---

## Project 20: Machine Learning Model Training Platform
**Durasi:** 6-8 minggu | **Complexity:** ⭐⭐⭐⭐⭐⭐⭐

### Tech Stack
```
Frontend: React + TensorFlow.js Visualizer
Backend: NestJS
Database: PostgreSQL (metadata)
ML Framework: TensorFlow + PyTorch (Python)
Model Tracking: MLflow
Model Storage: MinIO (S3-compatible)
Task Queue: Bull or Celery
Compute: Docker containers
Monitoring: Prometheus + Grafana
```

### Libraries
```javascript
// Backend
npm install @nestjs/common pg mlflow python docker-sdk bull

// Frontend
npm install react @tensorflow/tfjs-vis plotly.js tailwindcss

// ML (Python)
pip install tensorflow pytorch mlflow fastapi
```

### Architecture
```
┌─────────────────────────────────────┐
│ Frontend - Model Management UI      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ NestJS Backend API                  │
└─────────────────────────────────────┘
        ↓          ↓           ↓
    ┌────────┬─────────┬──────────┐
    ↓        ↓         ↓          ↓
  PostgreSQL MLflow   MinIO     Bull Queue
    (DB)   (tracking)(storage) (tasks)
    
    ↓ Task Distribution
┌─────────────────────────────────────┐
│ Python Workers (Training Jobs)      │
├─────────────────────────────────────┤
│ TensorFlow/PyTorch instances        │
└─────────────────────────────────────┘
```

### Database Setup
```javascript
// PostgreSQL - Model metadata & experiments
const { Client } = require('pg');
const client = new Client({...});

await client.query(`
  CREATE TABLE models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    framework VARCHAR(50), -- 'tensorflow', 'pytorch'
    version VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP
  );
  
  CREATE TABLE experiments (
    id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES models(id),
    name VARCHAR(255),
    hyperparameters JSONB,
    status VARCHAR(20), -- 'running', 'completed', 'failed'
    accuracy FLOAT,
    training_time INTEGER,
    created_at TIMESTAMP
  );
  
  CREATE TABLE datasets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    size_mb INTEGER,
    s3_path VARCHAR(255),
    train_split FLOAT,
    test_split FLOAT
  );
`);
```

### Features
- ✅ Model training pipeline
- ✅ Hyperparameter tuning
- ✅ Version control (MLflow)
- ✅ Performance metrics tracking
- ✅ Model deployment
- ✅ A/B testing
- ✅ Monitoring & alerts
- ✅ Automated retraining
- ✅ Model comparison

---

---

# 📊 Summary Table: Progression Database Complexity

| Project | Level | Database | Complexity | Why This DB? |
|---------|-------|----------|-----------|-------------|
| 1-4 | Easy | None | ⭐ | Client-side only |
| 5 | Sedang | SQLite | ⭐⭐⭐ | First database - file-based |
| 6 | Sedang | MySQL | ⭐⭐⭐ | Relational, simple |
| 7 | Sedang | PostgreSQL | ⭐⭐⭐ | Complex queries, time-series |
| 8 | Sedang | PostgreSQL + Redis | ⭐⭐⭐⭐ | Real-time + persistence |
| 9 | Sedang | MongoDB | ⭐⭐⭐⭐ | Flexible CMS content |
| 10 | Sedang | MongoDB | ⭐⭐⭐⭐ | Nested structures |
| 11 | Sedang | PostgreSQL + GraphQL | ⭐⭐⭐⭐ | Complex relationships |
| 12 | Sedang | MySQL | ⭐⭐⭐⭐ | Traditional structure |
| 13 | Advanced | MongoDB + Redis | ⭐⭐⭐⭐⭐ | Conversation history + sessions |
| 14 | Advanced | PostgreSQL | ⭐⭐⭐⭐⭐ | Metadata + audit trail |
| 15 | Advanced | PostgreSQL + Redis | ⭐⭐⭐⭐⭐ | E-commerce complexity |
| 16 | Advanced | MongoDB + Cassandra + Redis | ⭐⭐⭐⭐⭐⭐ | 3 specialized databases |
| 17 | Advanced | Multi-DB Microservices | ⭐⭐⭐⭐⭐⭐ | Each service optimized |
| 18 | Advanced | PostgreSQL + InfluxDB | ⭐⭐⭐⭐⭐⭐ | Analytics warehouse |
| 19 | Advanced | PostgreSQL | ⭐⭐⭐⭐⭐⭐ | Collaboration + versioning |
| 20 | Advanced | PostgreSQL + MLflow | ⭐⭐⭐⭐⭐⭐⭐ | ML model tracking |

---

# 🎯 Database Learning Progression

```
LEVEL MUDAH
├─ No database (localStorage)
│  └ Learn: Frontend fundamentals, API calls, state management

LEVEL SEDANG (Introduce Databases)
├─ SQLite (Project 5)
│  └ Learn: File-based database, basic SQL, backend setup
│
├─ MySQL (Project 6)
│  └ Learn: Relational database, multiple tables, JOINs
│
├─ PostgreSQL (Project 7)
│  └ Learn: Advanced SQL, indexing, performance
│
├─ MongoDB (Project 9)
│  └ Learn: NoSQL, flexible schema, document model
│
└─ Combinations (Project 8, 10-12)
   └ Learn: Real-time + caching, multiple databases

LEVEL ADVANCED
├─ PostgreSQL + Redis (Project 15)
│  └ Learn: Caching layer, cache invalidation
│
├─ Cassandra (Project 16)
│  └ Learn: Distributed databases, time-series, scale
│
├─ Multi-Database (Project 17)
│  └ Learn: Database selection per use-case, polyglot persistence
│
└─ Complex Architectures (Project 18-20)
   └ Learn: Data warehouses, ML platforms, collaboration
```

---

# 🚀 Recommendation untuk Memulai

## Langkah 1: Mudah dulu (Project 1-4)
- Pahami HTML/CSS/JavaScript
- Belajar React untuk Project 2-4
- Tidak perlu database
- **Durasi:** 3-4 minggu

## Langkah 2: Introduce Database (Project 5)
- Mulai dengan SQLite (paling mudah!)
- Learn basic backend dengan Express
- Simple CRUD operations
- **Durasi:** 1-2 minggu

## Langkah 3: Relational DB (Project 6-7)
- MySQL kemudian PostgreSQL
- Learn relationships, JOINs, migrations
- More complex queries
- **Durasi:** 2-3 minggu per project

## Langkah 4: NoSQL + Real-time (Project 8-12)
- MongoDB untuk flexibility
- Redis untuk caching
- Socket.IO untuk real-time
- **Durasi:** 8-10 minggu

## Langkah 5: Advanced Architectures (Project 13-20)
- Kombinasi multiple databases
- Microservices mindset
- System design patterns
- **Durasi:** 12-16 minggu

---

## Total Estimated Learning Path
**All 20 Projects:** 3-6 months full-time
- MUDAH (4 projects): 1 month
- SEDANG (8 projects): 1-2 months
- ADVANCED (8 projects): 1-3 months

---

**Last Updated:** March 12, 2026  
**Total Projects:** 20  
**No Options - Only Recommendations**  
**Database Progression:** Simple → Complex  
**Total File:** Database decisions already made ✅

