#!/bin/bash

# Server Management Script - Project 12: Online Quiz Platform
# Tech Stack: Express.js + React | MySQL + Redis | JWT + Socket.IO (live leaderboard)

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=5000
FRONTEND_PORT=3000
MYSQL_PORT=3306
REDIS_PORT=6379
BACKEND_PID_FILE="$PROJECT_DIR/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend.pid"

show_menu() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║   Project 12: Online Quiz Platform                            ║"
    echo "║   Stack: Express + React | MySQL + Redis | Live Leaderboard   ║"
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
    echo "9.  Seed Quiz Data"
    echo "10. View Backend Logs"
    echo "11. View Frontend Logs"
    echo "12. Run Tests"
    echo "13. View Leaderboard (Redis)"
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
        echo "   Backend: npm install express mysql2 redis socket.io jsonwebtoken bcrypt cors dotenv"
        echo "   Frontend: npm install react axios socket.io-client react-router-dom tailwindcss"
    fi
    echo "✅ Done"
}

start_databases() {
    echo "🗄️  Starting databases (Docker)..."
    if command -v docker &>/dev/null; then
        docker run -d --name quiz-platform-mysql \
            -e MYSQL_ROOT_PASSWORD=root \
            -e MYSQL_DATABASE=quiz_platform \
            -e MYSQL_USER=quiz_user \
            -e MYSQL_PASSWORD=quiz_pass \
            -p "$MYSQL_PORT:3306" mysql:8.0 2>/dev/null || docker start quiz-platform-mysql 2>/dev/null
        docker run -d --name quiz-platform-redis \
            -p "$REDIS_PORT:6379" redis:alpine 2>/dev/null || docker start quiz-platform-redis 2>/dev/null
        sleep 5
        echo "✅ MySQL running on port $MYSQL_PORT"
        echo "✅ Redis running on port $REDIS_PORT"
    else
        echo "⚠️  Docker not found. Start MySQL and Redis manually."
    fi
}

stop_databases() {
    echo "⏸  Stopping databases..."
    command -v docker &>/dev/null && docker stop quiz-platform-mysql quiz-platform-redis 2>/dev/null
    echo "✅ Databases stopped"
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
    echo "📊 Server Status - Online Quiz Platform"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
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
        for db in quiz-platform-mysql quiz-platform-redis; do
            local st
            st=$(docker inspect -f '{{.State.Status}}' "$db" 2>/dev/null || echo "not found")
            echo "  $db: $([ "$st" = "running" ] && echo "✅ Running" || echo "❌ $st")"
        done
    fi
    echo ""
    echo "🌐 Access:"
    echo "  Quiz App    : http://localhost:$FRONTEND_PORT"
    echo "  Admin Panel : http://localhost:$FRONTEND_PORT/admin"
    echo "  Leaderboard : http://localhost:$FRONTEND_PORT/leaderboard"
    echo "  API         : http://localhost:$BACKEND_PORT/api"
    echo ""
}

run_migrations() {
    echo "🗄️  Running MySQL migrations..."
    if [ -f "$PROJECT_DIR/backend/package.json" ] && grep -q '"migrate"' "$PROJECT_DIR/backend/package.json"; then
        cd "$PROJECT_DIR/backend" && npm run migrate
    else
        echo "⚠️  No migration script found."
        echo ""
        echo "   Example schema:"
        echo "   CREATE TABLE quizzes (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), category VARCHAR(50), time_limit INT DEFAULT 30);"
        echo "   CREATE TABLE questions (id INT AUTO_INCREMENT PRIMARY KEY, quiz_id INT, question TEXT, correct_answer VARCHAR(255));"
        echo "   CREATE TABLE options (id INT AUTO_INCREMENT PRIMARY KEY, question_id INT, option_text VARCHAR(255));"
        echo "   CREATE TABLE results (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, quiz_id INT, score INT, completed_at TIMESTAMP DEFAULT NOW());"
    fi
}

seed_quiz_data() {
    echo "🌱 Seeding quiz data..."
    if [ -f "$PROJECT_DIR/backend/seed.js" ]; then
        cd "$PROJECT_DIR/backend" && node seed.js
    elif [ -f "$PROJECT_DIR/backend/package.json" ] && grep -q '"seed"' "$PROJECT_DIR/backend/package.json"; then
        cd "$PROJECT_DIR/backend" && npm run seed
    else
        echo "⚠️  No seed script. Create backend/seed.js with sample quizzes."
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

view_leaderboard() {
    echo "🏆 Live Leaderboard (Redis):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if command -v redis-cli &>/dev/null; then
        echo "  Top 10 players:"
        redis-cli -p "$REDIS_PORT" ZREVRANGE "quiz:leaderboard:global" 0 9 WITHSCORES 2>/dev/null | \
            awk 'NR%2==1{name=$0} NR%2==0{printf "    %s — %s pts\n", name, $0}' || \
            echo "  (Redis not accessible or no data yet)"
    else
        echo "⚠️  redis-cli not found. Install redis-tools to view leaderboard."
    fi
    echo ""
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
        9)  seed_quiz_data ;;
        10) view_backend_logs ;;
        11) view_frontend_logs ;;
        12) run_tests ;;
        13) view_leaderboard ;;
        0)  echo "👋 Goodbye!"; exit 0 ;;
        *)  echo "❌ Invalid option. Please try again." ;;
    esac
done
