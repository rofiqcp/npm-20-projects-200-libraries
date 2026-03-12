# 🎓 20 Development Project Ideas dengan Tech Stack

**Dari 200 Popular Libraries | Tingkat Mudah → Advanced | Real-World Scenarios**

---

# 📌 LEVEL MUDAH (Beginner-Friendly) — 6 Projects

## Project 1: Portfolio Website Statis

**Tujuan:** Memahami HTML/CSS/JavaScript dasar + file management
**Estimasi:** 1-2 minggu

### Deskripsi

Website portfolio pribadi dengan multiple pages (home, about, projects, contact). Menampilkan project showcase, experience timeline, dan contact form.

### Tech Stack

**Frontend:**

- HTML5 / CSS3
- JavaScript (Vanilla)
- **Tailwind CSS** - Styling cepat
- **Feather Icons** - Icon library
- **Framer Motion** - Smooth animations

**Backend:**

- Tidak ada (Static files)
- atau **Express.js** - untuk serve & email

**Deployment:**

- GitHub Pages (Free)
- atau sirobo.codes + Cloudflare Tunnel

### Features

- ✅ Responsive design
- ✅ Smooth scroll animations
- ✅ Contact form validation
- ✅ Dark mode toggle

---

## Project 2: Todo List App (Browser Local)

**Tujuan:** localStorage, DOM manipulation, event handling
**Estimasi:** 1 minggu

### Deskripsi

Simple todo list yang menyimpan data di localStorage browser. Bisa add, edit, delete, mark as done. Data survive setelah refresh browser.

### Tech Stack

**Frontend:**

- HTML5 / CSS3
- JavaScript (Vanilla)
- **localStorage API** - Browser storage
- **Tailwind CSS** - Styling

**No Backend Needed**

### Features

- ✅ Add/Edit/Delete todos
- ✅ Mark as completed
- ✅ Filter (All/Active/Completed)
- ✅ Persistent storage
- ✅ Empty state handling

---

## Project 3: Weather App (API Integration)

**Tujuan:** External API calls, async/await, data formatting
**Estimasi:** 1-2 minggu

### Deskripsi

Aplikasi cuaca real-time menggunakan free weather API. Tampilkan suhu, kondisi, forecast 5 hari. Bisa search kota.

### Tech Stack

**Frontend:**

- React (Hooks)
- **Axios** - API calls
- **React Query (TanStack Query)** - Data fetching & caching
- **Tailwind CSS** - UI styling
- **Chart.js** - Temperature graph

**Backend:**

- Tidak perlu (langsung call API)
- atau **Express.js** - proxy layer

**External API:**

- **OpenWeatherMap API** (Free tier)

### Features

- ✅ Current weather display
- ✅ 5-day forecast
- ✅ City search
- ✅ Temperature unit toggle (C/F)
- ✅ Caching untuk performance

---

## Project 4: Movie Database Search

**Tujuan:** API integration, search/filter, pagination
**Estimasi:** 1-2 minggu

### Deskripsi

Website pencari film dengan infinite scroll/pagination. Tampilkan poster, rating, description. Bisa filter by genre, year, rating.

### Tech Stack

**Frontend:**

- React + React Hooks
- **Axios** - API calls
- **React Query** - Server state management
- **Tailwind CSS** - UI
- **Recharts** - Rating visualization

**Backend:**

- Tidak perlu (call API langsung)

**External API:**

- **TMDB API** atau **OMDB API** (Free)

### Features

- ✅ Movie search
- ✅ Genre filter
- ✅ Pagination/Infinite scroll
- ✅ Movie detail modal
- ✅ Watchlist (localStorage)

---

## Project 5: Simple Expense Tracker

**Tujuan:** State management, form handling, data visualization
**Estimasi:** 1-2 minggu

### Deskripsi

Aplikasi tracking pengeluaran harian. Input expense dengan kategori, date, amount. Tampilkan summary by category dengan pie chart.

### Tech Stack

**Frontend:**

- React + Hooks
- **React Hook Form** - Form handling
- **Zustand** - Lightweight state management
- **Chart.js** - Expense pie chart
- **Tailwind CSS** - UI

**Backend:**

- Tidak perlu (localStorage)

### Features

- ✅ Add/Edit/Delete expense
- ✅ Categorize expenses
- ✅ Monthly summary
- ✅ Category breakdown chart
- ✅ Export CSV

---

## Project 6: Markdown Note App

**Tujuan:** Markdown parsing, text editing, file operations
**Estimasi:** 1-2 minggu

### Deskripsi

Aplikasi notes dengan markdown support. Write notes di left panel, preview di right panel. Simpan/load dari localStorage.

### Tech Stack

**Frontend:**

- React + Hooks
- **React Markdown** - Markdown rendering
- **Prism.js** - Code syntax highlighting
- **Tailwind CSS** - UI styling

**No Backend Needed**

### Features

- ✅ Live markdown preview
- ✅ Code syntax highlighting
- ✅ Save/load notes
- ✅ Multiple notes management
- ✅ Export as HTML/PDF

---

# 📊 LEVEL SEDANG (Intermediate) — 7 Projects

## Project 7: Real-Time Chat Application

**Tujuan:** WebSocket, real-time communication, authentication
**Estimasi:** 2-3 minggu

### Deskripsi

Chat app dengan real-time messaging. Multiple users bisa join room, send/receive messages instantly. Tampilkan online status, typing indicator.

### Tech Stack

**Backend:**

- **Express.js** / **Fastify** - Web server
- **Socket.IO** - Real-time communication
- **JWT (jsonwebtoken)** - Authentication
- **Redis** - Session/message queue
- **Mongoose** - User data storage (MongoDB)

**Frontend:**

- React + Hooks
- **Socket.IO-client** - WebSocket client
- **React Router** - Navigation
- **Tailwind CSS** - UI
- **React Query** - Message caching

**Database:**

- MongoDB (Mongoose)
- Redis (cache/sessions)

### Features

- ✅ Real-time messaging
- ✅ Multiple chat rooms
- ✅ User authentication (JWT)
- ✅ Online status
- ✅ Typing indicator
- ✅ Message history

---

## Project 8: E-Commerce Product Catalog

**Tujuan:** Database design, REST API, filtering/sorting
**Estimasi:** 2-4 minggu

### Deskripsi

E-commerce website dengan product listing, detail page, shopping cart, wishlist. Admin panel untuk manage products.

### Tech Stack

**Backend:**

- **Express.js** / **NestJS** - REST API
- **Mongoose** - MongoDB ODM
- **Passport.js** / **Auth0** - User authentication
- **Stripe** - Payment processing
- **Multer** - Image upload

**Frontend:**

- React + React Hooks
- **React Query** - Server state
- **Redux** / **Zustand** - Cart state
- **React Router** - Navigation
- **Tailwind CSS** - UI
- **Recharts** - Sales visualization

**Database:**

- MongoDB

### Features

- ✅ Product listing with filters/sort
- ✅ Product detail page
- ✅ Shopping cart
- ✅ Wishlist
- ✅ User authentication
- ✅ Payment integration (Stripe)
- ✅ Admin product management
- ✅ Order history

---

## Project 9: Blog Platform dengan CMS

**Tujuan:** Content management, rich text editor, SEO, pagination
**Estimasi:** 2-3 minggu

### Descripsi

Blog platform dengan multiple authors. Authors bisa create/edit/publish posts. Readers bisa view posts, comment, like. Responsive design, SEO-friendly.

### Tech Stack

**Backend:**

- **Express.js** / **Fastify** - Web server
- **Mongoose** - MongoDB ODM
- **Passport.js** - Authentication
- **Multer** - Image upload
- **Helmet** - Security headers
- **Joi** / **Yup** - Validation

**Frontend:**

- React + Hooks
- **React Router** - Navigation
- **React Markdown** - Markdown editor
- **Framer Motion** - Page animations
- **Tailwind CSS** - UI
- **React Query** - Data fetching

**Database:**

- MongoDB

### Features

- ✅ Create/Edit/Delete posts
- ✅ Author authentication
- ✅ Comments system
- ✅ Like/Rating posts
- ✅ Search & filter
- ✅ Categories/tags
- ✅ Responsive design
- ✅ SEO meta tags

---

## Project 10: Task Management / Kanban Board

**Tujuto:** Drag-drop, real-time sync, collaborative editing
**Estimasi:** 2-3 minggu

### Deskripsi

Kanban board untuk project management. Drag tasks between columns (Todo, In Progress, Done). Real-time updates jika multiple users.

### Tech Stack

**Backend:**

- **Express.js** / **NestJS** - API server
- **Socket.IO** - Real-time updates
- **Mongoose** - MongoDB
- **Passport.js** - Auth
- **Redis** - Caching

**Frontend:**

- React + Hooks
- **React Beautiful DnD** / **react-dnd** - Drag & drop
- **Socket.IO-client** - Real-time sync
- **React Query** - Server state
- **Zustand** - Local state
- **Tailwind CSS** - UI

**Database:**

- MongoDB

### Features

- ✅ Drag-drop tasks
- ✅ Create/Edit/Delete tasks
- ✅ Multiple columns
- ✅ Real-time collaboration
- ✅ User assignments
- ✅ Due dates & reminders
- ✅ Comments on tasks
- ✅ Activity log

---

## Project 11: Social Media Feed (Twitter-like)

**Tujuan:** Feed system, follow/unfollow, notifications
**Estimasi:** 3-4 minggu

### Deskripsi

Social media platform dengan posts, likes, comments, follows. Real-time feed updates, user profiles, notifications.

### Tech Stack

**Backend:**

- **NestJS** / **Express** - Web framework
- **GraphQL** / **REST API** - Query language
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time notifications
- **JWT** - Authentication
- **Redis** - Cache & sessions
- **Stripe** - Premium features (optional)

**Frontend:**

- React + Hooks
- **Apollo Client** / **React Query** - Data fetching
- **Socket.IO-client** - Notifications
- **Redux** / **Zustand** - State management
- **React Router** - Navigation
- **Tailwind CSS** - UI
- **Framer Motion** - Animations

**Database:**

- MongoDB
- Redis

### Features

- ✅ Create/Edit/Delete posts
- ✅ Like & comment posts
- ✅ Follow/Unfollow users
- ✅ Real-time feed updates
- ✅ Notifications
- ✅ User profiles
- ✅ Search users/hashtags
- ✅ Trending topics

---

## Project 12: weather Dashboard dengan IoT Integration

**Tujuan:** IoT data collection, real-time visualization, alerts
**Estimasi:** 2-3 minggu

### Deskripsi

Dashboard menampilkan data sensor real-time (temp, humidity, pressure). Data dikirim dari Raspberry Pi/Arduino. Tampilkan historical graph, set alerts.

### Tech Stack

**Backend:**

- **Express.js** / **Fastify** - Web server
- **MQTT.js** - IoT protocol
- **Johnny-Five** (optional) - Hardware control
- **Mongoose** - Time-series data
- **Socket.IO** - Real-time updates
- **Node-Cron** - Scheduled alerts

**Frontend:**

- React + Hooks
- **Socket.IO-client** - Live data
- **Recharts** / **Echarts** - Charts
- **React Query** - Data fetching
- **Tailwind CSS** - UI

**Database:**

- MongoDB (InfluxDB better for time-series)

**Hardware:**

- Raspberry Pi / Arduino + sensors

### Features

- ✅ Real-time sensor data
- ✅ Temperature/Humidity graphs
- ✅ Historical data visualization
- ✅ Alert thresholds
- ✅ Email notifications
- ✅ Data export

---

## Project 13: Online Quiz/Assessment Platform

**Tujuan:** Quiz engine, score calculation, analytics
**Estimasi:** 2-3 minggu

### Deskripsi

Platform untuk membuat dan mengikuti quiz. Instructor bisa create questions, students ambil quiz, automatic scoring, leaderboard, analytics.

### Tech Stack

**Backend:**

- **Express.js** / **NestJS** - API server
- **Mongoose** - MongoDB
- **JWT** - Authentication
- **Joi** / **Zod** - Validation
- **Node-Cron** - Scheduled tasks
- **Winston** - Logging

**Frontend:**

- React + Hooks
- **React Router** - Navigation
- **React Query** - Data fetching
- **Recharts** - Performance analytics
- **Tailwind CSS** - UI

**Database:**

- MongoDB

### Features

- ✅ Create/Edit quizzes
- ✅ MCQ, True/False, Essay questions
- ✅ Time-based questions
- ✅ Auto-scoring
- ✅ Leaderboard
- ✅ Performance analytics
- ✅ Attempt history
- ✅ Certificates

---

# 🚀 LEVEL ADVANCED (Expert-Level) — 7 Projects

## Project 14: AI Chatbot dengan LLM Integration

**Tujuan:** LLM API integration, streaming responses, context management
**Estimasi:** 3-4 minggu

### Deskripsi

Chatbot menggunakan OpenAI/Claude API. Support multiple conversations, context-aware responses, memory persistence, custom instructions.

### Tech Stack

**Backend:**

- **Express.js** / **Fastify** - Web server
- **LangChain.js** - LLM orchestration
- **OpenAI API** / **Anthropic Claude** - LLM provider
- **Redis** - Conversation cache
- **Mongoose** - Conversation history
- **Stripe** - Usage billing

**Frontend:**

- React + Hooks
- **Vercel AI SDK** - Streaming responses
- **Socket.IO-client** - Real-time chat
- **React Query** - Data management
- **Tailwind CSS** - UI
- **Framer Motion** - Animations
- **React Markdown** - Response formatting

**Database:**

- MongoDB
- Redis

### Libraries Used

`express`, `langchain`, `openai`, `redis`, `mongoose`, `stripe`, `react`, `vercel-ai-sdk`, `react-query`, `tailwind`, `socket.io`

### Features

- ✅ Real-time streaming responses
- ✅ Conversation history
- ✅ Multiple AI providers
- ✅ Custom system prompts
- ✅ Token usage tracking
- ✅ Rate limiting
- ✅ Conversation export
- ✅ Voice input support

---

## Project 15: Full-Stack AI Image Recognition App

**Tujuan:** Computer vision, model inference, image processing
**Estimasi:** 3-4 minggu

### Deskripsi

Aplikasi upload image untuk recognition (objects, faces, text). Tampilkan results, confidence scores, historical analysis.

### Tech Stack

**Backend:**

- **Express.js** / **NestJS** - API
- **TensorFlow.js** - ML model inference
- **OpenCV.js** - Image processing
- **Tesseract.js** - OCR (text extraction)
- **MediaPipe** - Pose/hand detection
- **Multer** - Image upload
- **Sharp** - Image optimization
- **MongoDB** - Results storage

**Frontend:**

- React + Hooks
- **TensorFlow.js** - Client-side ML
- **MediaPipe** - Real-time detection
- **React Query** - API calls
- **Canvas API** - Image drawing
- **Tailwind CSS** - UI
- **Recharts** - Analytics

**Database:**

- MongoDB

### Libraries Used

`express`, `tensorflow.js`, `opencv.js`, `tesseract.js`, `mediapipe`, `multer`, `sharp`, `mongoose`, `react`, `react-query`, `tailwind`

### Features

- ✅ Image upload & recognition
- ✅ Multiple model types (objects, faces, text)
- ✅ Confidence scores
- ✅ Batch processing
- ✅ Historical analysis
- ✅ Export results
- ✅ Real-time webcam detection

---

## Project 16: Microservices Architecture - E-Commerce Platform

**Tujuan:** Microservices, Docker, API Gateway, service communication
**Estimasi:** 4-6 minggu

### Deskripsi

Large-scale e-commerce dengan multiple microservices (User, Product, Order, Payment, Notification). Bisa scale independently.

### Tech Stack

**Backend Microservices:**

- **NestJS** - Each service framework
- **Express.js** - API Gateway
- **GraphQL** - API composition
- **PostgreSQL** / **MongoDB** - Databases per service
- **RabbitMQ** / **Redis** - Message queue
- **JWT** - Cross-service auth
- **Docker** - Containerization
- **Kubernetes** - Orchestration (optional)

**Frontend:**

- **Next.js** - React framework
- **Apollo Client** - GraphQL client
- **Redux** - State management
- **React Query** - Server state
- **Tailwind CSS** - UI
- **Chakra UI** - Component library

**Infrastructure:**

- Docker
- Docker Compose
- Kubernetes (optional)
- CI/CD Pipeline

### Libraries Used

`nestjs`, `express`, `graphql`, `apollo`, `postgres`, `mongodb`, `rabbitmq`, `redis`, `docker`, `kubernetes`, `jwt`, `next.js`, `redux`, `react-query`

### Feature Services

- ✅ User Service (Auth, Profiles)
- ✅ Product Service (Catalog, Search)
- ✅ Order Service (Order Management)
- ✅ Payment Service (Transactions, Billing)
- ✅ Notification Service (Email, SMS, Push)
- ✅ Analytics Service (Usage, Reports)

---

## Project 17: Real-Time Data Analytics Dashboard

**Tujuan:** Big data visualization, real-time streaming, multiple data sources
**Estimasi:** 4-5 minggu

### Deskripsi

Enterprise dashboard menampilkan real-time metrics dari multiple data sources. Live KPI counters, interactive charts, alerts, custom reports.

### Tech Stack

**Backend:**

- **NestJS** / **Fastify** - Web framework
- **GraphQL** - Query language
- **Apollo Server** - GraphQL server
- **Socket.IO** - Real-time updates
- **Kafka** / **Redis Streams** - Data streaming
- **PostgreSQL** - Data warehouse
- **InfluxDB** - Time-series data
- **Bull** - Job queue for processing

**Frontend:**

- **React** - UI framework
- **D3.js** / **Echarts** - Advanced visualization
- **Recharts** - Simple charts
- **WebGL** - 3D visualization (optional)
- **Tailwind CSS** - UI
- **Cypress** - E2E testing

**Data Processing:**

- **Node-Cron** - Scheduled aggregation
- **Winston** - Logging

### Libraries Used

`nestjs`, `graphql`, `apollo-server`, `socket.io`, `kafka`, `redis`, `postgres`, `influxdb`, `bull`, `react`, `d3.js`, `echarts`, `tailwind`

### Features

- ✅ Real-time KPI metrics
- ✅ Multi-source data integration
- ✅ Custom dashboards
- ✅ Drill-down analytics
- ✅ Scheduled reports
- ✅ Alert system
- ✅ Data export (PDF, CSV)
- ✅ Collaborative dashboards

---

## Project 18: Machine Learning Model Training Platform

**Tujuan:** ML model development, training, deployment, monitoring
**Estimasi:** 5-7 minggu

### Deskripsi

Platform untuk train, manage, dan deploy ML models. Support multiple frameworks, version control, A/B testing, performance monitoring.

### Tech Stack

**Backend:**

- **NestJS** - API framework
- **Python** (FastAPI) - ML backend
- **TensorFlow** / **PyTorch** - ML frameworks
- **MLflow** - Model tracking
- **Docker** - Model containerization
- **Kubernetes** - Model serving
- **PostgreSQL** - Metadata store
- **MinIO** - Model artifact storage

**Frontend:**

- **React** - Web UI
- **D3.js** / **Plotly** - Visualization
- **TensorFlow.js Visualizer** - Model architecture view
- **React Query** - Data fetching
- **Tailwind CSS** - UI
- **Monaco Editor** - Code editing

### Libraries Used

`nestjs`, `python`, `fastapi`, `tensorflow`, `pytorch`, `mlflow`, `docker`, `kubernetes`, `postgres`, `minio`, `react`, `plotly`, `tailwind`

### Features

- ✅ Model training pipeline
- ✅ Version control
- ✅ Hyperparameter tuning
- ✅ Performance metrics
- ✅ Model deployment
- ✅ A/B testing
- ✅ Monitoring & alerts
- ✅ Automated retraining

---

## Project 19: IoT Smart Home System

**Tujuan:** IoT device management, automation rules, real-time control
**Estimasi:** 5-7 minggu

### Deskripsi

Smart home system untuk control lights, temperature, security. Rules engine untuk automation (turn on lights based on schedule/sensor).

### Tech Stack

**Backend:**

- **NestJS** / **Express** - Web server
- **MQTT.js** - IoT protocol
- **Johnny-Five** - Device control
- **Node-Cron** - Scheduling
- **Redis** - State cache
- **Mongoose** - Devices/Rules storage
- **Socket.IO** - Real-time updates
- **Python** - Device drivers (optional)

**Frontend:**

- **React** - Dashboard
- **React Router** - Navigation
- **Socket.IO-client** - Live updates
- **React Query** - Device state
- **Tailwind CSS** - UI
- **Framer Motion** - Smooth control

**Hardware:**

- Raspberry Pi / Arduino
- Smart devices (Philips Hue, LIFX, etc.)

### Libraries Used

`nest.js`, `mqtt.js`, `johnny-five`, `node-cron`, `redis`, `mongoose`, `socket.io`, `react`, `react-query`, `tailwind`

### Features

- ✅ Device discovery & pairing
- ✅ Real-time control
- ✅ Automation rules
- ✅ Scheduling
- ✅ Scene management
- ✅ Mobile app (React Native)
- ✅ Voice control (optional)
- ✅ Energy monitoring

---

## Project 20: Collaborative Code Editor (Like VS Code Online)

**Tujuan:** Real-time collaboration, code execution, WebSocket sync
**Estimasi:** 5-6 minggu

### Deskripsi

Online code editor dengan real-time collaboration. Multiple users bisa edit same file simultaneously, see changes live, execute code, chat.

### Tech Stack

**Backend:**

- **Express.js** / **Fastify** - Web server
- **Socket.IO** - Real-time sync
- **Operational Transformation** - Conflict resolution
- **Redis** - Session management
- **Docker** - Code execution sandbox
- **Judge0 API** - Code compilation
- **Mongoose** - File storage
- **JWT** - Authentication

**Frontend:**

- **React** - UI framework
- **Monaco Editor** - Code editor
- **Socket.IO-client** - Collaboration
- **Terminal.js** - Terminal emulator
- **Zustand** - State management
- **Tailwind CSS** - UI

**Infrastructure:**

- Docker (sandbox execution)
- Judge0 (code compilation/execution)

### Libraries Used

`express`, `socket.io`, `redis`, `docker`, `judge0`, `mongoose`, `react`, `monaco-editor`, `zustand`, `tailwind`, `xterm.js`

### Features

- ✅ Real-time code editing
- ✅ Multiple cursors
- ✅ Syntax highlighting
- ✅ Code execution (15+ languages)
- ✅ File management
- ✅ Built-in terminal
- ✅ Chat/Comments
- ✅ Version history
- ✅ Share sessions

---

# 📊 Summary Table

| #  | Project             | Level    | Duration | Backend           | Frontend    | Database     | Complexity |
| -- | ------------------- | -------- | -------- | ----------------- | ----------- | ------------ | ---------- |
| 1  | Portfolio Website   | Easy     | 1-2w     | -                 | HTML/CSS/JS | -            | ⭐         |
| 2  | Todo List           | Easy     | 1w       | -                 | React       | localStorage | ⭐         |
| 3  | Weather App         | Easy     | 1-2w     | -                 | React       | API          | ⭐⭐       |
| 4  | Movie DB            | Easy     | 1-2w     | -                 | React       | API          | ⭐⭐       |
| 5  | Expense Tracker     | Easy     | 1-2w     | -                 | React       | localStorage | ⭐⭐       |
| 6  | Markdown Notes      | Easy     | 1-2w     | -                 | React       | localStorage | ⭐⭐       |
| 7  | Chat App            | Medium   | 2-3w     | Express/Socket.IO | React       | MongoDB      | ⭐⭐⭐     |
| 8  | E-Commerce          | Medium   | 2-4w     | NestJS/Stripe     | React       | MongoDB      | ⭐⭐⭐     |
| 9  | Blog CMS            | Medium   | 2-3w     | Express           | React       | MongoDB      | ⭐⭐⭐     |
| 10 | Kanban Board        | Medium   | 2-3w     | Express/Socket.IO | React DnD   | MongoDB      | ⭐⭐⭐     |
| 11 | Social Feed         | Medium   | 3-4w     | NestJS/GraphQL    | React       | MongoDB      | ⭐⭐⭐⭐   |
| 12 | IoT Dashboard       | Medium   | 2-3w     | Express/MQTT      | React       | MongoDB      | ⭐⭐⭐     |
| 13 | Quiz Platform       | Medium   | 2-3w     | Express           | React       | MongoDB      | ⭐⭐⭐     |
| 14 | AI Chatbot          | Advanced | 3-4w     | Express/LangChain | React       | MongoDB      | ⭐⭐⭐⭐   |
| 15 | Image Recognition   | Advanced | 3-4w     | Express/TF.js     | React       | MongoDB      | ⭐⭐⭐⭐   |
| 16 | Microservices       | Advanced | 4-6w     | NestJS            | Next.js     | Multi-DB     | ⭐⭐⭐⭐⭐ |
| 17 | Analytics Dashboard | Advanced | 4-5w     | NestJS/GraphQL    | React/D3    | PostgreSQL   | ⭐⭐⭐⭐⭐ |
| 18 | ML Platform         | Advanced | 5-7w     | NestJS/Python     | React       | PostgreSQL   | ⭐⭐⭐⭐⭐ |
| 19 | Smart Home          | Advanced | 5-7w     | NestJS/MQTT       | React       | MongoDB      | ⭐⭐⭐⭐⭐ |
| 20 | Code Editor         | Advanced | 5-6w     | Express/Socket.IO | React       | MongoDB      | ⭐⭐⭐⭐⭐ |

---

# 🎯 Recommended Learning Path

## Minggu 1-2: Easy Projects (Pick 2)

- Start dengan Portfolio Website atau Todo List
- Pahami DOM, events, state management basics
- Deploy to sirobo.codes

## Minggu 3-4: Easy → Medium Transition

- Build Weather App atau Movie Database
- Learn API integration, React hooks
- External API calls

## Minggu 5-8: Medium Projects (Pick 2)

- Chat App atau E-Commerce
- Learn real-time communication, databases
- Authentication patterns

## Minggu 9-12: Medium Advanced

- Blog CMS atau Kanban Board
- Learn complex state management
- Multiple features integration

## Minggu 13+: Advanced Projects (Pick 1)

- AI Chatbot atau Image Recognition
- Multiple technologies integration
- Production-ready code

---

# 💡 Technology Stack Minimum Requirements

## Untuk Level Easy

- JavaScript (ES6+)
- React basics
- HTML5/CSS3
- Browser APIs

## Untuk Level Medium

- Node.js/Express
- MongoDB/SQL basics
- Authentication (JWT)
- Real-time concepts
- REST API design

## Untuk Level Advanceddata

- Docker/Kubernetes
- Microservices architecture
- GraphQL
- WebSocket/Socket.IO
- ML/AI libraries
- DevOps basics
- System design patterns

---

# 📚 Resources Per Project

### Documentation Links

- Express: https://expressjs.com
- NestJS: https://docs.nestjs.com
- React: https://react.dev
- MongoDB: https://docs.mongodb.com
- Socket.IO: https://socket.io/docs
- GraphQL: https://graphql.org/learn
- LangChain: https://js.langchain.com
- TensorFlow.js: https://www.tensorflow.org/js

### Learning Paths

- freeCodeCamp (YouTube - Free)
- Udemy (Paid but deep)
- Official Documentation (Best)
- Dev.to articles (Community)

---

## Kesimpulan

Dari **200 libraries**, kami sudah membuat **20 project ideas** yang:

- ✅ Progresif dari mudah → advanced
- ✅ Real-world scenarios yang relevant
- ✅ Spec jelas untuk tech stack
- ✅ Estimasi waktu realistis
- ✅ Learning outcomes terukur

**Rekomendasi:** Pilih 1 project per level untuk build, jangan semuanya sekaligus! Fokus quality over quantity.

---

**Last Updated:** March 12, 2026
**Total Projects:** 20
**Level Coverage:** Beginner → Intermediate → Advanced
**Estimated Full Learning Path:** 3-6 months
