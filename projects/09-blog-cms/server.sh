#!/bin/bash

# Server Management Script - Project 9: Blog Platform CMS
# Tech Stack: Express.js + React | MongoDB (Mongoose) | Multer + JWT

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=5000
FRONTEND_PORT=3000
MONGO_PORT=27017
BACKEND_PID_FILE="$PROJECT_DIR/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend.pid"

show_menu() {
    echo ""
    echo "╔══════════════════════════════════════════════════╗"
    echo "║   Project 9: Blog Platform CMS                   ║"
    echo "║   Stack: Express + React | MongoDB | Multer      ║"
    echo "╚══════════════════════════════════════════════════╝"
    echo ""
    echo "1.  Install Dependencies"
    echo "2.  Start All Servers"
    echo "3.  Stop All Servers"
    echo "4.  Restart All Servers"
    echo "5.  Status"
    echo "6.  Start MongoDB (Docker)"
    echo "7.  Stop MongoDB (Docker)"
    echo "8.  Seed Database"
    echo "9.  View Backend Logs"
    echo "10. View Frontend Logs"
    echo "11. Run Tests"
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
        echo "   Backend: npm install express mongoose cors multer jwt-simple bcrypt dotenv"
        echo "   Frontend: npm install react axios react-markdown highlight.js react-quill tailwindcss"
    fi
    echo "✅ Done"
}

start_mongodb() {
    echo "🗄️  Starting MongoDB (Docker)..."
    if command -v docker &>/dev/null; then
        docker run -d --name blog-cms-mongo \
            -p "$MONGO_PORT:27017" mongo:latest 2>/dev/null || docker start blog-cms-mongo 2>/dev/null
        sleep 3
        echo "✅ MongoDB running on port $MONGO_PORT"
    else
        echo "⚠️  Docker not found. Start MongoDB manually: sudo systemctl start mongod"
    fi
}

stop_mongodb() {
    echo "⏸  Stopping MongoDB..."
    command -v docker &>/dev/null && docker stop blog-cms-mongo 2>/dev/null
    echo "✅ MongoDB stopped"
}

start_backend() {
    local backend_dir="$PROJECT_DIR/backend"
    [ ! -d "$backend_dir" ] && backend_dir="$PROJECT_DIR"
    [ ! -f "$backend_dir/package.json" ] && echo "❌ Backend not found." && return
    echo "🚀 Starting Express backend on port $BACKEND_PORT..."
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
    echo "📊 Server Status - Blog Platform CMS"
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
        local st
        st=$(docker inspect -f '{{.State.Status}}' blog-cms-mongo 2>/dev/null || echo "not found")
        echo "  MongoDB  : $([ "$st" = "running" ] && echo "✅ Running (port $MONGO_PORT)" || echo "❌ $st")"
    fi
    echo ""
    echo "🌐 Access:"
    echo "  Blog     : http://localhost:$FRONTEND_PORT"
    echo "  Admin    : http://localhost:$FRONTEND_PORT/admin"
    echo "  API      : http://localhost:$BACKEND_PORT/api"
    echo "  API Docs : http://localhost:$BACKEND_PORT/api/posts  (GET)"
    echo ""
}

seed_database() {
    echo "🌱 Seeding database..."
    if [ -f "$PROJECT_DIR/backend/package.json" ] && grep -q '"seed"' "$PROJECT_DIR/backend/package.json"; then
        cd "$PROJECT_DIR/backend" && npm run seed
    elif [ -f "$PROJECT_DIR/backend/seed.js" ]; then
        cd "$PROJECT_DIR/backend" && node seed.js
    else
        echo "⚠️  No seed script found."
        echo "   Create backend/seed.js with sample posts:"
        echo ""
        echo "   const mongoose = require('mongoose');"
        echo "   // Connect and insert sample posts, categories, tags..."
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
        6)  start_mongodb ;;
        7)  stop_mongodb ;;
        8)  seed_database ;;
        9)  view_backend_logs ;;
        10) view_frontend_logs ;;
        11) run_tests ;;
        0)  echo "👋 Goodbye!"; exit 0 ;;
        *)  echo "❌ Invalid option. Please try again." ;;
    esac
done
