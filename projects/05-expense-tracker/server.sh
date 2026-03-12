#!/bin/bash

# Server Management Script - Project 5: Expense Tracker
# Tech Stack: Express.js + React | SQLite (better-sqlite3) | First Backend Project!
# Database: SQLite (file-based, no setup required)

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=5000
FRONTEND_PORT=3000
BACKEND_PID_FILE="$PROJECT_DIR/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend.pid"

show_menu() {
    echo ""
    echo "╔══════════════════════════════════════════════════════╗"
    echo "║   Project 5: Expense Tracker                         ║"
    echo "║   Stack: Express + React | SQLite (First Backend!)  ║"
    echo "╚══════════════════════════════════════════════════════╝"
    echo ""
    echo "1. Install Dependencies"
    echo "2. Start All Servers"
    echo "3. Stop All Servers"
    echo "4. Restart All Servers"
    echo "5. Status"
    echo "6. View Backend Logs"
    echo "7. View Frontend Logs"
    echo "8. Run Tests"
    echo "9. View Database"
    echo "0. Exit"
    echo ""
}

install_deps() {
    echo "📦 Installing dependencies..."
    if [ -f "$PROJECT_DIR/package.json" ]; then
        cd "$PROJECT_DIR" && npm install
    fi
    if [ -f "$PROJECT_DIR/backend/package.json" ]; then
        echo "  → Backend dependencies..."
        cd "$PROJECT_DIR/backend" && npm install
    fi
    if [ -f "$PROJECT_DIR/frontend/package.json" ]; then
        echo "  → Frontend dependencies..."
        cd "$PROJECT_DIR/frontend" && npm install
    fi
    if [ ! -f "$PROJECT_DIR/package.json" ] && [ ! -f "$PROJECT_DIR/backend/package.json" ]; then
        echo "⚠️  No package.json found. Create project structure:"
        echo ""
        echo "   Backend:"
        echo "   mkdir backend && cd backend"
        echo "   npm init -y"
        echo "   npm install express cors better-sqlite3 dotenv"
        echo ""
        echo "   Frontend:"
        echo "   cd .. && mkdir frontend && cd frontend"
        echo "   npm create vite@latest . -- --template react"
        echo "   npm install axios chart.js react-chartjs-2"
        echo "   npm install -D tailwindcss"
        return
    fi
    echo "✅ Dependencies installed"
}

start_backend() {
    local backend_dir="$PROJECT_DIR/backend"
    if [ ! -d "$backend_dir" ]; then
        backend_dir="$PROJECT_DIR"
    fi
    if [ ! -f "$backend_dir/package.json" ]; then
        echo "❌ Backend package.json not found."
        return
    fi
    echo "🚀 Starting Express backend on port $BACKEND_PORT..."
    cd "$backend_dir"
    local start_cmd="node server.js"
    if grep -q '"dev"' package.json; then
        start_cmd="npm run dev"
    elif grep -q '"start"' package.json; then
        start_cmd="npm start"
    fi
    nohup $start_cmd > "$PROJECT_DIR/.backend.log" 2>&1 &
    echo $! > "$BACKEND_PID_FILE"
    echo "✅ Backend started (PID: $!) → http://localhost:$BACKEND_PORT"
}

start_frontend() {
    local frontend_dir="$PROJECT_DIR/frontend"
    if [ ! -d "$frontend_dir" ]; then
        echo "⚠️  Frontend directory not found. Skipping."
        return
    fi
    echo "🌐 Starting React frontend on port $FRONTEND_PORT..."
    cd "$frontend_dir"
    local start_cmd="npm run dev"
    if grep -q '"start"' package.json 2>/dev/null; then
        start_cmd="npm start"
    fi
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
        if [ -f "$pid_file" ]; then
            kill "$(cat "$pid_file")" 2>/dev/null
            rm -f "$pid_file"
        fi
    done
    pkill -f "node.*server.js" 2>/dev/null
    pkill -f "vite\|react-scripts" 2>/dev/null
    echo "✅ All servers stopped"
}

show_status() {
    echo ""
    echo "📊 Server Status - Expense Tracker"
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
    echo ""
    # Check SQLite DB
    local db_file
    db_file=$(find "$PROJECT_DIR" -name "*.db" -o -name "*.sqlite" 2>/dev/null | head -1)
    if [ -n "$db_file" ]; then
        echo "  Database : ✅ SQLite → $db_file"
        echo "             $(du -sh "$db_file" 2>/dev/null | cut -f1) on disk"
    else
        echo "  Database : ⚠️  No .db file yet (created on first run)"
    fi
    echo ""
    echo "🌐 Access:"
    echo "  App : http://localhost:$FRONTEND_PORT"
    echo "  API : http://localhost:$BACKEND_PORT/api/expenses"
    echo ""
}

view_backend_logs() {
    echo "📝 Backend Logs (last 30 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "$PROJECT_DIR/.backend.log" ]; then
        tail -30 "$PROJECT_DIR/.backend.log"
    else
        echo "No backend logs found."
    fi
    echo ""
}

view_frontend_logs() {
    echo "🌐 Frontend Logs (last 30 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "$PROJECT_DIR/.frontend.log" ]; then
        tail -30 "$PROJECT_DIR/.frontend.log"
    else
        echo "No frontend logs found."
    fi
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

view_database() {
    echo "🗄️  SQLite Database Info:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    local db_file
    db_file=$(find "$PROJECT_DIR" -name "*.db" -o -name "*.sqlite" 2>/dev/null | head -1)
    if [ -z "$db_file" ]; then
        echo "  No database file found yet."
        echo "  SQLite DB is created automatically on first server start."
        return
    fi
    echo "  File: $db_file"
    echo "  Size: $(du -sh "$db_file" 2>/dev/null | cut -f1)"
    if command -v sqlite3 &>/dev/null; then
        echo ""
        echo "  Tables:"
        sqlite3 "$db_file" ".tables" 2>/dev/null | sed 's/^/    /'
        echo ""
        echo "  Expense count:"
        sqlite3 "$db_file" "SELECT COUNT(*) || ' expenses' FROM expenses;" 2>/dev/null | sed 's/^/    /'
        echo ""
        echo "  Recent expenses (last 5):"
        sqlite3 "$db_file" -column -header "SELECT id, amount, category, description, date FROM expenses ORDER BY created_at DESC LIMIT 5;" 2>/dev/null | sed 's/^/    /'
    else
        echo ""
        echo "  Install sqlite3 CLI to query the database:"
        echo "  sudo apt install sqlite3  (Ubuntu/Debian)"
        echo "  brew install sqlite3      (macOS)"
    fi
    echo ""
}

restart_servers() {
    stop_servers
    sleep 1
    start_servers
}

while true; do
    show_menu
    read -r -p "Choose an option: " choice

    case $choice in
        1) install_deps ;;
        2) start_servers ;;
        3) stop_servers ;;
        4) restart_servers ;;
        5) show_status ;;
        6) view_backend_logs ;;
        7) view_frontend_logs ;;
        8) run_tests ;;
        9) view_database ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
done
