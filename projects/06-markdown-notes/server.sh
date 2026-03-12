#!/bin/bash

# Server Management Script - Project 6: Markdown Note App
# Tech Stack: Express.js + React | MySQL | Marked.js + highlight.js

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=5000
FRONTEND_PORT=3000
MYSQL_PORT=3306
BACKEND_PID_FILE="$PROJECT_DIR/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend.pid"

show_menu() {
    echo ""
    echo "╔══════════════════════════════════════════════════╗"
    echo "║   Project 6: Markdown Note App                   ║"
    echo "║   Stack: Express + React | MySQL | Marked.js     ║"
    echo "╚══════════════════════════════════════════════════╝"
    echo ""
    echo "1.  Install Dependencies"
    echo "2.  Start All Servers"
    echo "3.  Stop All Servers"
    echo "4.  Restart All Servers"
    echo "5.  Status"
    echo "6.  Start MySQL (Docker)"
    echo "7.  Stop MySQL (Docker)"
    echo "8.  Run DB Migrations"
    echo "9.  View Backend Logs"
    echo "10. View Frontend Logs"
    echo "11. Run Tests"
    echo "0.  Exit"
    echo ""
}

install_deps() {
    echo "📦 Installing dependencies..."
    if [ -f "$PROJECT_DIR/backend/package.json" ]; then
        echo "  → Backend dependencies..."
        cd "$PROJECT_DIR/backend" && npm install
    fi
    if [ -f "$PROJECT_DIR/frontend/package.json" ]; then
        echo "  → Frontend dependencies..."
        cd "$PROJECT_DIR/frontend" && npm install
    fi
    if [ -f "$PROJECT_DIR/package.json" ]; then
        cd "$PROJECT_DIR" && npm install
    fi
    if [ ! -f "$PROJECT_DIR/backend/package.json" ] && [ ! -f "$PROJECT_DIR/package.json" ]; then
        echo "⚠️  No package.json found. Initialize project:"
        echo ""
        echo "   Backend:"
        echo "   mkdir backend && cd backend && npm init -y"
        echo "   npm install express cors mysql2 dotenv"
        echo ""
        echo "   Frontend:"
        echo "   cd .. && mkdir frontend && cd frontend"
        echo "   npm create vite@latest . -- --template react"
        echo "   npm install axios marked react-markdown highlight.js"
        echo "   npm install -D tailwindcss"
    fi
    echo "✅ Dependencies installed"
}

start_mysql() {
    echo "🗄️  Starting MySQL (Docker)..."
    if command -v docker &>/dev/null; then
        docker run -d --name markdown-notes-mysql \
            -e MYSQL_ROOT_PASSWORD=root \
            -e MYSQL_DATABASE=markdown_notes \
            -e MYSQL_USER=notes_user \
            -e MYSQL_PASSWORD=notes_pass \
            -p "$MYSQL_PORT:3306" \
            mysql:8.0 2>/dev/null || docker start markdown-notes-mysql 2>/dev/null
        echo "✅ MySQL running on port $MYSQL_PORT"
        echo "   DB: markdown_notes | User: notes_user | Pass: notes_pass"
    else
        echo "⚠️  Docker not found. Start MySQL manually:"
        echo "   sudo systemctl start mysql"
        echo "   mysql -u root -e \"CREATE DATABASE IF NOT EXISTS markdown_notes;\""
    fi
}

stop_mysql() {
    echo "⏸  Stopping MySQL..."
    if command -v docker &>/dev/null; then
        docker stop markdown-notes-mysql 2>/dev/null
        echo "✅ MySQL stopped"
    fi
}

start_backend() {
    local backend_dir="$PROJECT_DIR/backend"
    [ ! -d "$backend_dir" ] && backend_dir="$PROJECT_DIR"
    [ ! -f "$backend_dir/package.json" ] && echo "❌ Backend not found." && return
    echo "🚀 Starting Express backend on port $BACKEND_PORT..."
    cd "$backend_dir"
    local start_cmd="node server.js"
    grep -q '"dev"' package.json && start_cmd="npm run dev"
    grep -q '"start"' package.json && start_cmd="npm start"
    nohup $start_cmd > "$PROJECT_DIR/.backend.log" 2>&1 &
    echo $! > "$BACKEND_PID_FILE"
    echo "✅ Backend started (PID: $!) → http://localhost:$BACKEND_PORT"
}

start_frontend() {
    local frontend_dir="$PROJECT_DIR/frontend"
    [ ! -d "$frontend_dir" ] && echo "⚠️  Frontend directory not found." && return
    echo "🌐 Starting React frontend on port $FRONTEND_PORT..."
    cd "$frontend_dir"
    local start_cmd="npm run dev"
    grep -q '"start"' package.json 2>/dev/null && start_cmd="npm start"
    nohup $start_cmd > "$PROJECT_DIR/.frontend.log" 2>&1 &
    echo $! > "$FRONTEND_PID_FILE"
    echo "✅ Frontend started (PID: $!) → http://localhost:$FRONTEND_PORT"
}

start_servers() {
    start_backend
    start_frontend
    sleep 2
    show_status
}

stop_servers() {
    echo "⏸  Stopping servers..."
    for pid_file in "$BACKEND_PID_FILE" "$FRONTEND_PID_FILE"; do
        [ -f "$pid_file" ] && kill "$(cat "$pid_file")" 2>/dev/null && rm -f "$pid_file"
    done
    pkill -f "node.*server.js" 2>/dev/null
    pkill -f "vite\|react-scripts" 2>/dev/null
    echo "✅ All servers stopped"
}

show_status() {
    echo ""
    echo "📊 Server Status - Markdown Note App"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "$BACKEND_PID_FILE" ] && kill -0 "$(cat "$BACKEND_PID_FILE")" 2>/dev/null; then
        echo "  Backend  : ✅ Running (PID: $(cat "$BACKEND_PID_FILE")) → http://localhost:$BACKEND_PORT"
    else
        echo "  Backend  : ❌ Not running"
    fi
    if [ -f "$FRONTEND_PID_FILE" ] && kill -0 "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null; then
        echo "  Frontend : ✅ Running (PID: $(cat "$FRONTEND_PID_FILE")) → http://localhost:$FRONTEND_PORT"
    else
        echo "  Frontend : ❌ Not running"
    fi
    if command -v docker &>/dev/null; then
        local mysql_st
        mysql_st=$(docker inspect -f '{{.State.Status}}' markdown-notes-mysql 2>/dev/null || echo "not found")
        echo "  MySQL    : $([ "$mysql_st" = "running" ] && echo "✅ Running (port $MYSQL_PORT)" || echo "❌ $mysql_st")"
    fi
    echo ""
    echo "🌐 Access:"
    echo "  App : http://localhost:$FRONTEND_PORT"
    echo "  API : http://localhost:$BACKEND_PORT/api/notes"
    echo ""
}

run_migrations() {
    echo "🗄️  Running MySQL migrations..."
    if [ -f "$PROJECT_DIR/backend/package.json" ] && grep -q '"migrate"' "$PROJECT_DIR/backend/package.json"; then
        cd "$PROJECT_DIR/backend" && npm run migrate
    elif command -v mysql &>/dev/null && [ -f "$PROJECT_DIR/backend/db/schema.sql" ]; then
        mysql -h 127.0.0.1 -P "$MYSQL_PORT" -u notes_user -pnotes_pass markdown_notes < "$PROJECT_DIR/backend/db/schema.sql"
        echo "✅ Schema applied"
    else
        echo "⚠️  No migration script found."
        echo ""
        echo "   Manual MySQL setup:"
        echo "   mysql -h 127.0.0.1 -P $MYSQL_PORT -u notes_user -pnotes_pass"
        echo ""
        echo "   CREATE TABLE IF NOT EXISTS notes ("
        echo "     id INT AUTO_INCREMENT PRIMARY KEY,"
        echo "     title VARCHAR(255) NOT NULL,"
        echo "     content LONGTEXT,"
        echo "     category VARCHAR(50),"
        echo "     tags JSON,"
        echo "     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
        echo "     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        echo "   );"
    fi
}

view_backend_logs() {
    echo "📝 Backend Logs (last 30 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    [ -f "$PROJECT_DIR/.backend.log" ] && tail -30 "$PROJECT_DIR/.backend.log" || echo "No logs found."
    echo ""
}

view_frontend_logs() {
    echo "🌐 Frontend Logs (last 30 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    [ -f "$PROJECT_DIR/.frontend.log" ] && tail -30 "$PROJECT_DIR/.frontend.log" || echo "No logs found."
    echo ""
}

run_tests() {
    echo "🧪 Running tests..."
    local test_dir="$PROJECT_DIR/backend"
    [ ! -d "$test_dir" ] && test_dir="$PROJECT_DIR"
    if [ -f "$test_dir/package.json" ] && grep -q '"test"' "$test_dir/package.json"; then
        cd "$test_dir" && npm test
    else
        echo "⚠️  No test script found."
    fi
}

restart_servers() {
    stop_servers; sleep 1; start_servers
}

while true; do
    show_menu
    read -r -p "Choose an option: " choice
    case $choice in
        1)  install_deps ;;
        2)  start_servers ;;
        3)  stop_servers ;;
        4)  restart_servers ;;
        5)  show_status ;;
        6)  start_mysql ;;
        7)  stop_mysql ;;
        8)  run_migrations ;;
        9)  view_backend_logs ;;
        10) view_frontend_logs ;;
        11) run_tests ;;
        0)  echo "👋 Goodbye!"; exit 0 ;;
        *)  echo "❌ Invalid option. Please try again." ;;
    esac
done
