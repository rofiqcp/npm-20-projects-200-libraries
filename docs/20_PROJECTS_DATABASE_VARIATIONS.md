# 📚 20 Projects dengan Database Variations

**Setiap project dengan pilihan database berbeda (SQLite, MySQL, PostgreSQL, Cassandra, MongoDB) + Node.js library yang dipakai**

---

# ✅ LEVEL MUDAH

## PROJECT 1: Portfolio Website Statis
**Database:** Tidak perlu
```
Pure HTML/CSS/JavaScript
No backend needed
```

---

## PROJECT 2: Todo List App
**Database Options:**

### Option A: SQLite (Recommended for learning)
```javascript
npm install sqlite3 better-sqlite3

// better-sqlite3 (synchronous, faster)
const Database = require('better-sqlite3');
const db = new Database('todos.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY,
    title TEXT,
    completed BOOLEAN
  )
`);
```
**Best for:** Local development, learning, small projects

---

### Option B: MySQL
```javascript
npm install mysql2

const mysql = require('mysql2/promise');
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'todo_app'
});

await connection.query(`
  CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    completed BOOLEAN
  )
`);
```
**Best for:** Team projects, traditional setup

---

### Option C: PostgreSQL
```javascript
npm install pg

const { Client } = require('pg');
const client = new Client({
  host: 'localhost',
  database: 'todo_app',
  user: 'postgres'
});

await client.query(`
  CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    completed BOOLEAN
  )
`);
```
**Best for:** Production, complex queries

---

## PROJECT 3: Weather App
**Database:** Redis (Cache only, API provided)

```javascript
npm install redis axios

const redis = require('redis');
const axios = require('axios');

const client = redis.createClient();
await client.connect();

// Cache weather for 3600 seconds
await client.setEx(
  `weather:${city}`,
  3600,
  JSON.stringify(weatherData)
);
```

**Why only Redis?** Simple caching, no persistent storage needed

---

## PROJECT 4: Movie Database Search
**Database Options:**

### Option A: SQLite + Redis Cache
```javascript
npm install sqlite3 redis

// Store favorites locally
const db = new sqlite3.Database('movies.db');

// Cache API results
const redisClient = redis.createClient();
```
**Best for:** Desktop/Electron app with local storage

---

### Option B: MySQL + Redis
```javascript
npm install mysql2 redis

// Relational: users → movie_favorites
// MySQL: user accounts, favorites list
// Redis: API cache for quick search
```
**Best for:** Full-stack with user accounts

---

## PROJECT 5: Expense Tracker
**Database Options:**

### Option A: SQLite
```javascript
npm install sqlite3

// Simple local expenses
db.run(`
  CREATE TABLE expenses (
    id INTEGER PRIMARY KEY,
    amount REAL,
    category TEXT,
    date TEXT
  )
`);
```

---

### Option B: PostgreSQL
```javascript
npm install pg

// More features: recurring expenses, budgets, sharing
client.query(`
  CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    amount DECIMAL(10,2),
    category VARCHAR(50),
    date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);
```

---

## PROJECT 6: Markdown Note App
**Database:** SQLite
```javascript
npm install sqlite3

db.run(`
  CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    title TEXT,
    content TEXT,
    created_at TIMESTAMP
  )
`);
```
**Why SQLite only?** Pure local storage, instant start

---

---

# 📊 LEVEL SEDANG

## PROJECT 7: Real-Time Chat Application

### Option A: PostgreSQL + Redis
```javascript
npm install express pg redis socket.io

// PostgreSQL: Users, messages, conversation history
// Redis: Online status, message queue, sessions

const pgClient = new Client({
  host: 'localhost',
  database: 'chat_app'
});

const redisClient = redis.createClient();

db.query(`
  CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    room_id INTEGER,
    content TEXT,
    timestamp TIMESTAMP
  )
`);
```

---

### Option B: MongoDB + Redis
```javascript
npm install express mongoose redis socket.io

// MongoDB: Flexible message documents, user profiles
// Redis: Real-time state, caching

const messageSchema = new mongoose.Schema({
  userId: String,
  roomId: String,
  content: String,
  timestamp: Date
});
```

---

## PROJECT 8: E-Commerce Product Catalog

### Option A: MySQL + Redis
```javascript
npm install express mysql2 redis stripe

// MySQL: Products, orders, transactions (structured)
// Redis: Shopping cart, inventory cache

connection.query(`
  CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    price DECIMAL(10,2),
    stock INT
  );
  
  CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT,
    total DECIMAL(10,2),
    status VARCHAR(50)
  );
`);
```

---

### Option B: PostgreSQL + Redis
```javascript
npm install express pg redis stripe

// PostgreSQL: Advanced queries (JOINs for reports)
// Redis: Cart, session management

client.query(`
  CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    price DECIMAL(10,2),
    inventory INTEGER
  );
  
  CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total DECIMAL(10,2)
  );
`);
```

---

## PROJECT 9: Blog Platform CMS

### Option A: PostgreSQL + Redis
```javascript
npm install express pg redis multer

// PostgreSQL: Articles, users, comments (relational)
// Redis: Cache popular posts

client.query(`
  CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES users(id),
    title VARCHAR(255),
    content TEXT,
    published BOOLEAN,
    created_at TIMESTAMP
  );
  
  CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id),
    author_id INTEGER REFERENCES users(id),
    content TEXT
  );
`);
```

---

### Option B: MongoDB + Redis
```javascript
npm install express mongoose redis multer

// MongoDB: Flexible post/comment structure
// Redis: Recent posts cache

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: mongoose.Schema.Types.ObjectId,
  comments: [{
    author: String,
    content: String
  }],
  createdAt: Date
});
```

---

## PROJECT 10: Kanban Board

### Option A: MongoDB + Redis
```javascript
npm install express mongoose redis socket.io

// MongoDB: Flexible task structure
// Redis: Real-time board state

const taskSchema = new mongoose.Schema({
  title: String,
  status: String, // "todo", "in-progress", "done"
  assignee: String,
  dueDate: Date,
  comments: []
});
```

---

### Option B: PostgreSQL + Redis
```javascript
npm install express pg redis socket.io

client.query(`
  CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    board_id INTEGER,
    title VARCHAR(255),
    status VARCHAR(20),
    position INTEGER
  );
  
  CREATE TABLE boards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    owner_id INTEGER
  );
`);
```

---

## PROJECT 11: Social Media Feed

### GraphQL with Multiple Databases:

```javascript
npm install apollo-server express mongoose pg redis

// MongoDB: Posts, user profiles (flexible)
// PostgreSQL: Relationships (follows, likes)
// Redis: Feed cache, trending

const postSchema = new mongoose.Schema({
  author: mongoose.Schema.Types.ObjectId,
  content: String,
  likes: Number,
  comments: [{
    author: String,
    text: String
  }]
});

// PostgreSQL for relationships
pgClient.query(`
  CREATE TABLE follows (
    follower_id INTEGER,
    following_id INTEGER,
    PRIMARY KEY (follower_id, following_id)
  );
`);
```

---

## PROJECT 12: IoT Weather Dashboard

### Option A: Cassandra + Redis
```javascript
npm install express cassandra-driver redis mqtt.js

// Cassandra: Time-series sensor data (auto-partitioned)
// Redis: Current readings cache, real-time updates

const cassandra = require('cassandra-driver');
const client = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  keyspace: 'IoT'
});

await client.execute(`
  CREATE TABLE sensor_readings (
    sensor_id TEXT,
    timestamp TIMESTAMP,
    temperature FLOAT,
    humidity FLOAT,
    PRIMARY KEY ((sensor_id), timestamp)
  ) WITH CLUSTERING ORDER BY (timestamp DESC)
`);
```
**Why Cassandra?** Perfect for time-series data at scale

---

### Option B: PostgreSQL + Redis (Simpler)
```javascript
npm install express pg redis mqtt.js

// PostgreSQL satisfactory untuk IoT sensor data
// TimescaleDB extension for better time-series

client.query(`
  CREATE TABLE sensor_readings (
    id SERIAL PRIMARY KEY,
    sensor_id VARCHAR(50),
    temperature FLOAT,
    humidity FLOAT,
    timestamp TIMESTAMP
  );
  
  CREATE INDEX idx_sensor_time ON sensor_readings(sensor_id, timestamp);
`);
```

---

## PROJECT 13: Online Quiz Platform

### MySQL + Redis
```javascript
npm install express mysql2 redis

// MySQL: Quiz structure, questions, answers
// Redis: Leaderboard, session management

connection.query(`
  CREATE TABLE quizzes (
    id INT PRIMARY KEY,
    title VARCHAR(255),
    description TEXT
  );
  
  CREATE TABLE questions (
    id INT PRIMARY KEY,
    quiz_id INT,
    text VARCHAR(500),
    correct_answer VARCHAR(255)
  );
  
  CREATE TABLE attempts (
    id INT PRIMARY KEY,
    user_id INT,
    quiz_id INT,
    score INT,
    timestamp TIMESTAMP
  );
`);

// Redis untuk leaderboard yang cepat
await redisClient.zAdd(`leaderboard:${quizId}`, {
  score: userScore,
  member: userId
});
```

---

---

# 🚀 LEVEL ADVANCED

## PROJECT 14: AI Chatbot dengan LLM

### MongoDB + Redis + OpenAI
```javascript
npm install express mongoose redis langchain openai

// MongoDB: Conversation history, user profiles
// Redis: Session cache, conversation state
// OpenAI: API for responses

const conversationSchema = new mongoose.Schema({
  userId: String,
  messages: [{
    role: String, // "user" atau "assistant"
    content: String,
    timestamp: Date
  }],
  context: String,
  createdAt: Date
});
```

---

## PROJECT 15: AI Image Recognition

### PostgreSQL + Redis + Cloud Storage
```javascript
npm install express pg redis multer aws-sdk tensorflow.js

// PostgreSQL: Image metadata, recognition results
// Redis: Cache results for duplicate images
// S3/Cloud: Store images

pgClient.query(`
  CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    filename VARCHAR(255),
    s3_url VARCHAR(500),
    recognition_results JSONB,
    uploaded_at TIMESTAMP
  );
`);
```

---

## PROJECT 16: Microservices E-Commerce

```javascript
// User Service: PostgreSQL + Redis
npm install pg redis

// Product Service: MongoDB
npm install mongoose redis

// Order Service: PostgreSQL + Redis
npm install pg redis

// Payment Service: PostgreSQL (transactions)
npm install pg stripe

// Notification Service: Redis (queue)
npm install redis bull

// API Gateway: Express + GraphQL
npm install apollo-server express
```

**Architecture:**
```
┌─────────────────────────────────────────────────┐
│ API Gateway (Express + Apollo GraphQL)          │
└─────────────────────────────────────────────────┘
        ↓              ↓              ↓
   ┌────────┐    ┌─────────┐    ┌─────────┐
   │ User   │    │ Product │    │ Order   │
   │Service │    │ Service │    │ Service │
   │(PgSQL) │    │(MongoDB)│    │(PgSQL)  │
   └────────┘    └─────────┘    └─────────┘
        ↓              ↓              ↓
   ┌────────────────────────────────────┐
   │ Redis Cache Layer (All Services)   │
   └────────────────────────────────────┘
```

---

## PROJECT 17: Real-Time Analytics Dashboard

### PostgreSQL + Redis + Kafka
```javascript
npm install express pg redis kafka-node echarts

// PostgreSQL: Primary analytics data warehouse
// Redis: Real-time counters, leaderboards
// Kafka: Event streaming from multiple sources

pgClient.query(`
  CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50),
    user_id INTEGER,
    data JSONB,
    timestamp TIMESTAMP
  );
  
  CREATE TABLE aggregations (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100),
    value INTEGER,
    period VARCHAR(20), -- "hourly", "daily"
    aggregated_at TIMESTAMP
  );
`);

// Real-time update via Redis
await redisClient.incr(`metric:daily_users:${today}`);
```

---

## PROJECT 18: ML Model Training Platform

### PostgreSQL + MongoDB + MLflow
```javascript
npm install pg mongoose mlflow python fastapi

// PostgreSQL: Model metadata, training records
// MongoDB: Experiment logs, parameters
// MLflow: Model versioning, tracking

pgClient.query(`
  CREATE TABLE models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    version VARCHAR(50),
    framework VARCHAR(50), -- "tensorflow", "pytorch"
    accuracy FLOAT,
    trained_at TIMESTAMP
  );
  
  CREATE TABLE training_jobs (
    id SERIAL PRIMARY KEY,
    model_id INTEGER,
    status VARCHAR(20), -- "running", "completed", "failed"
    hyperparameters JSONB,
    start_time TIMESTAMP
  );
`);
```

---

## PROJECT 19: Smart Home System

### MongoDB + Redis + MQTT
```javascript
npm install cors mongoose redis mqtt

// MongoDB: Device configurations, automation rules
// Redis: Real-time device states, caching
// MQTT: IoT device communication

const deviceSchema = new mongoose.Schema({
  name: String,
  type: String, // "light", "temperature", "door"
  location: String,
  status: String,
  lastUpdate: Date,
  automationRules: [{
    trigger: String,
    action: String
  }]
});

// Redis untuk state real-time
await redisClient.set(`device:${deviceId}:status`, 'on');
```

---

## PROJECT 20: Collaborative Code Editor

### PostgreSQL + Redis + Socket.IO
```javascript
npm install express pg redis socket.io prettier

// PostgreSQL: Code files, user projects, collaboration logs
// Redis: Real-time cursors, active users
// Operational Transformation: Conflict resolution

pgClient.query(`
  CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER,
    name VARCHAR(255),
    created_at TIMESTAMP
  );
  
  CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    project_id INTEGER,
    filename VARCHAR(255),
    content TEXT,
    last_modified TIMESTAMP
  );
  
  CREATE TABLE collaborators (
    project_id INTEGER,
    user_id INTEGER,
    permission VARCHAR(20), -- "view", "edit"
  );
`);

// Real-time cursor sync
await redisClient.set(
  `editor:${fileId}:cursor:${userId}`,
  { line: 10, column: 5 }
);
```

---

# 📋 Quick Database Selection Guide

## Kapan Pakai SQLite?
✅ Learning
✅ Desktop apps (Electron)
✅ Mobile (React Native, Flutter)
✅ Prototypes
❌ Multi-user server apps

---

## Kapan Pakai MySQL?
✅ Traditional web apps
✅ Team projects (simple)
✅ LAMP stack
✅ Relational data
❌ Complex queries
❌ Very large scale

---

## Kapan Pakai PostgreSQL?
✅ Advanced SQL features
✅ JSON/Array types
✅ Complex queries
✅ Full-text search
✅ Geospatial queries (PostGIS)
✅ Production enterprise apps

---

## Kapan Pakai MongoDB?
✅ Flexible schemas
✅ Rapid development
✅ JSON documents
✅ Unstructured data
✅ Prototypes
✅ Content management
❌ Strict data consistency

---

## Kapan Pakai Cassandra?
✅ MASSIVE scale (Netflix)
✅ Time-series data
✅ High write throughput
✅ Global distribution
✅ No single point of failure
❌ Small projects
❌ Complex queries

---

## Kapan Pakai Redis?
✅ Cache layer (dengan database lain)
✅ Session management
✅ Real-time counters
✅ Pub/Sub messaging
✅ Rate limiting
✅ Leaderboards
❌ Persistent storage (hanya cache)

---

# 🎯 Rekomendasi by Project Complexity

| Complexity | Primary DB | Cache | Use Case |
|-----------|-----------|-------|----------|
| Prototype | SQLite | - | Learning, instant start |
| Simple | MySQL | Redis | Traditional MVP |
| Medium | PostgreSQL | Redis | Scalable web apps |
| Complex | PostgreSQL + MongoDB | Redis | Mixed data types |
| Real-time | MongoDB | Redis | Flexible, live updates |
| IoT/TimeSeries | Cassandra | Redis | Massive data streams |
| Analytics | PostgreSQL | Redis + Kafka | Big data processing |

---

# 📦 Complete Library Reference

### Database Drivers/Libraries

```javascript
// SQLite
npm install sqlite3          // async
npm install better-sqlite3   // sync (faster)

// MySQL
npm install mysql2           // native driver
npm install sequelize        // ORM

// PostgreSQL  
npm install pg               // native driver
npm install prisma           // modern ORM
npm install typeorm          // TypeScript ORM
npm install sequelize        // generic SQL ORM

// MongoDB
npm install mongodb          // native driver
npm install mongoose         // ORM

// Cassandra
npm install cassandra-driver // official driver

// Redis
npm install redis            // official client

// Generic ORMs
npm install typeorm          // All SQL databases
npm install prisma           // PostgreSQL, MySQL, SQLite
npm install sequelize        // All SQL databases
```

---

## Summary: Database + Libraries

**3 Hal Penting:**

1. ✅ **Database Engine** = Server terpisah (binary)
   - PostgreSQL, MySQL, SQLite, Cassandra, MongoDB, Redis

2. ✅ **Node.js Library** = npm package untuk connect
   - `pg`, `mysql2`, `sqlite3`, `cassandra-driver`, `mongodb`, `redis`

3. ✅ **ORM** = Abstraction layer (optional)
   - `prisma`, `sequelize`, `typeorm`, `mongoose`

---

**Last Updated:** March 12, 2026  
**Total Projects Analyzed:** 20  
**Database Options Per Project:** 2-3  
**Total Library Combinations:** 50+  

