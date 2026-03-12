#!/bin/bash

# Server Management Script - Project 8: Real-Time Chat Application
# Tech Stack: Express.js + Socket.IO + React | PostgreSQL + Redis | JWT Auth

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=5000
FRONTEND_PORT=3000
BACKEND_PID_FILE="$PROJECT_DIR/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend.pid"

show_menu() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║   Project 8: Real-Time Chat Application                       ║"
    echo "║   Stack: Express + Socket.IO + React | PostgreSQL + Redis     ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "1.  Install Dependencies"
    echo "2.  Start All Servers"
    echo "3.  Stop All Servers"
    echo "4.  Restart All Servers"
    echo "5.  Status"
    echo "6.  Start Databases (Docker)"
    echo "7.  Stop Databases (Docker)"
    echo "8.  Run DB Migrations"
    echo "9.  View Backend Logs"
    echo "10. View Frontend Logs"
    echo "11. Run Tests"
    echo "12. View Connected Users (Redis)"
    echo "0.  Exit"
    echo ""
}

install_deps() {
    echo "📦 Installing dependencies..."
    for dir in "$PROJECT_DIR" "$PROJECT_DIR/backend" "$PROJECT_DIR/frontend"; do
        [ -f "$dir/package.json" ] && echo "  → $dir" && cd "$dir" && npm install
    done
    if [ ! -f "$PROJECT_DIR/backend/package.json" ] && [ ! -f "$PROJECT_DIR/package.json" ]; then
        echo "⚠️  Initialize project:"
        echo "   Backend: npm install express socket.io pg redis jsonwebtoken cors bcrypt dotenv"
        echo "   Frontend: npm install react socket.io-client axios tailwindcss react-router-dom"
    fi
    echo "✅ Done"
}

start_databases() {
    echo "🗄️  Starting databases (Docker)..."
    if command -v docker &>/dev/null; then
        docker run -d --name chat-app-postgres \
            -e POSTGRES_DB=chat_app \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=postgres \
            -p 5432:5432 postgres:14 2>/dev/null || docker start chat-app-postgres 2>/dev/null
        docker run -d --name chat-app-redis \
            -p 6379:6379 redis:alpine 2>/dev/null || docker start chat-app-redis 2>/dev/null
        sleep 3
        echo "✅ PostgreSQL running on port 5432"
        echo "✅ Redis running on port 6379"
    else
        echo "⚠️  Docker not found. Start PostgreSQL and Redis manually."
    fi
}

stop_databases() {
    echo "⏸  Stopping databases..."
    command -v docker &>/dev/null && docker stop chat-app-postgres chat-app-redis 2>/dev/null
    echo "✅ Databases stopped"
}

start_backend() {
    local backend_dir="$PROJECT_DIR/backend"
    [ ! -d "$backend_dir" ] && backend_dir="$PROJECT_DIR"
    [ ! -f "$backend_dir/package.json" ] && echo "❌ Backend not found." && return
    echo "🚀 Starting Express + Socket.IO backend on port $BACKEND_PORT..."
    cd "$backend_dir"
    local cmd="node server.js"
    grep -q '"dev"' package.json && cmd="npm run dev"
    nohup $cmd > "$PROJECT_DIR/.backend.log" 2>&1 &
    echo $! > "$BACKEND_PID_FILE"
    echo "✅ Backend started (PID: $!) → http://localhost:$BACKEND_PORT"
}

start_frontend() {
    local frontend_dir="$PROJECT_DIR/frontend"
    [ ! -d "$frontend_dir" ] && echo "⚠️  Frontend not found." && return
    echo "🌐 Starting React frontend on port $FRONTEND_PORT..."
    cd "$frontend_dir"
    local cmd="npm run dev"
    grep -q '"start"' package.json 2>/dev/null && cmd="npm start"
    nohup $cmd > "$PROJECT_DIR/.frontend.log" 2>&1 &
    echo $! > "$FRONTEND_PID_FILE"
    echo "✅ Frontend started (PID: $!) → http://localhost:$FRONTEND_PORT"
}

start_servers() { start_backend; start_frontend; sleep 2; show_status; }

stop_servers() {
    echo "⏸  Stopping servers..."
    for f in "$BACKEND_PID_FILE" "$FRONTEND_PID_FILE"; do
        [ -f "$f" ] && kill "$(cat "$f")" 2>/dev/null && rm -f "$f"
    done
    pkill -f "node.*server" 2>/dev/null; pkill -f "vite\|react-scripts" 2>/dev/null
    echo "✅ All servers stopped"
}

show_status() {
    echo ""
    echo "📊 Server Status - Real-Time Chat App"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "$BACKEND_PID_FILE" ] && kill -0 "$(cat "$BACKEND_PID_FILE")" 2>/dev/null; then
        echo "  Backend  : ✅ Running → http://localhost:$BACKEND_PORT"
    else
        echo "  Backend  : ❌ Not running"
    fi
    if [ -f "$FRONTEND_PID_FILE" ] && kill -0 "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null; then
        echo "  Frontend : ✅ Running → http://localhost:$FRONTEND_PORT"
    else
        echo "  Frontend : ❌ Not running"
    fi
    if command -v docker &>/dev/null; then
        for db in chat-app-postgres chat-app-redis; do
            local st
            st=$(docker inspect -f '{{.State.Status}}' "$db" 2>/dev/null || echo "not found")
            echo "  $db: $([ "$st" = "running" ] && echo "✅ Running" || echo "❌ $st")"
        done
    fi
    echo ""
    echo "🌐 Access:"
    echo "  Chat App  : http://localhost:$FRONTEND_PORT"
    echo "  API       : http://localhost:$BACKEND_PORT/api"
    echo "  WebSocket : ws://localhost:$BACKEND_PORT"
    echo ""
    echo "📡 Socket.IO Events:"
    echo "  join_room → send_message → user_typing"
    echo ""
}

run_migrations() {
    echo "🗄️  Running PostgreSQL migrations..."
    if [ -f "$PROJECT_DIR/backend/package.json" ] && grep -q '"migrate"' "$PROJECT_DIR/backend/package.json"; then
        cd "$PROJECT_DIR/backend" && npm run migrate
    elif [ -f "$PROJECT_DIR/backend/db/schema.sql" ] && command -v psql &>/dev/null; then
        psql -h localhost -U postgres -d chat_app -f "$PROJECT_DIR/backend/db/schema.sql"
        echo "✅ Schema applied"
    else
        echo "⚠️  No migration script found."
        echo ""
        echo "   SQL Schema:"
        echo "   CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR(100) UNIQUE NOT NULL,"
        echo "     email VARCHAR(100) UNIQUE, password_hash VARCHAR(255), created_at TIMESTAMP DEFAULT NOW());"
        echo "   CREATE TABLE rooms (id SERIAL PRIMARY KEY, room_name VARCHAR(100), is_private BOOLEAN DEFAULT FALSE);"
        echo "   CREATE TABLE messages (id SERIAL PRIMARY KEY, room_id INT REFERENCES rooms(id),"
        echo "     user_id INT REFERENCES users(id), content TEXT, created_at TIMESTAMP DEFAULT NOW());"
        echo "   CREATE INDEX idx_room_messages ON messages(room_id, created_at DESC);"
    fi
}

view_backend_logs() {
    echo "📝 Backend Logs (last 30 lines):"
    [ -f "$PROJECT_DIR/.backend.log" ] && tail -30 "$PROJECT_DIR/.backend.log" || echo "No logs."
    echo ""
}

view_frontend_logs() {
    echo "🌐 Frontend Logs (last 30 lines):"
    [ -f "$PROJECT_DIR/.frontend.log" ] && tail -30 "$PROJECT_DIR/.frontend.log" || echo "No logs."
    echo ""
}

run_tests() {
    local test_dir="$PROJECT_DIR/backend"
    [ ! -d "$test_dir" ] && test_dir="$PROJECT_DIR"
    [ -f "$test_dir/package.json" ] && grep -q '"test"' "$test_dir/package.json" && cd "$test_dir" && npm test || echo "⚠️  No test script."
}

view_redis_users() {
    echo "👥 Checking online users in Redis..."
    if command -v redis-cli &>/dev/null; then
        echo "  Online users:"
        redis-cli SMEMBERS "online_users" 2>/dev/null | sed 's/^/    /' || echo "  (Redis not accessible)"
        echo "  Active rooms:"
        redis-cli KEYS "room:*" 2>/dev/null | sed 's/^/    /' || echo "  (Redis not accessible)"
    else
        echo "⚠️  redis-cli not found. Install redis-tools to inspect Redis."
    fi
}

restart_servers() { stop_servers; sleep 1; start_servers; }

while true; do
    show_menu
    read -r -p "Choose an option: " choice
    case $choice in
        1)  install_deps ;;
        2)  start_servers ;;
        3)  stop_servers ;;
        4)  restart_servers ;;
        5)  show_status ;;
        6)  start_databases ;;
        7)  stop_databases ;;
        8)  run_migrations ;;
        9)  view_backend_logs ;;
        10) view_frontend_logs ;;
        11) run_tests ;;
        12) view_redis_users ;;
        0)  echo "👋 Goodbye!"; exit 0 ;;
        *)  echo "❌ Invalid option. Please try again." ;;
    esac
done
