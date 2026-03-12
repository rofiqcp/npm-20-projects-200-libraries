#!/bin/bash

# Server Management Script - Project 15: E-Commerce Full-Stack
# Tech Stack: Express.js + React | PostgreSQL + Redis | Stripe

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=5000
FRONTEND_PORT=3000
BACKEND_PID_FILE="$PROJECT_DIR/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend.pid"

show_menu() {
    echo ""
    echo "╔══════════════════════════════════════════════════╗"
    echo "║   Project 15: E-Commerce Full-Stack              ║"
    echo "║   Stack: Express + React | PostgreSQL + Redis    ║"
    echo "╚══════════════════════════════════════════════════╝"
    echo ""
    echo "1.  Install Dependencies"
    echo "2.  Start All Servers"
    echo "3.  Stop All Servers"
    echo "4.  Restart All Servers"
    echo "5.  Status"
    echo "6.  Start Databases (Docker)"
    echo "7.  Stop Databases (Docker)"
    echo "8.  View Backend Logs"
    echo "9.  View Frontend Logs"
    echo "10. Run Database Migrations"
    echo "11. Run Tests"
    echo "0.  Exit"
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
    echo "✅ Dependencies installed"
}

start_databases() {
    echo "🗄️  Starting databases (Docker)..."
    if command -v docker &>/dev/null; then
        docker run -d --name ecommerce-postgres \
            -e POSTGRES_DB=ecommerce \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=postgres \
            -p 5432:5432 \
            postgres:14 2>/dev/null || docker start ecommerce-postgres 2>/dev/null
        docker run -d --name ecommerce-redis \
            -p 6379:6379 \
            redis:alpine 2>/dev/null || docker start ecommerce-redis 2>/dev/null
        sleep 3
        echo "✅ PostgreSQL running on port 5432"
        echo "✅ Redis running on port 6379"
    else
        echo "⚠️  Docker not found. Please start PostgreSQL and Redis manually."
        echo "   PostgreSQL: port 5432 | Redis: port 6379"
    fi
}

stop_databases() {
    echo "⏸  Stopping databases..."
    if command -v docker &>/dev/null; then
        docker stop ecommerce-postgres ecommerce-redis 2>/dev/null
        echo "✅ Databases stopped"
    else
        echo "⚠️  Docker not found."
    fi
}

start_backend() {
    echo "🚀 Starting backend (Express.js on port $BACKEND_PORT)..."
    local backend_dir="$PROJECT_DIR/backend"
    if [ ! -d "$backend_dir" ]; then
        backend_dir="$PROJECT_DIR"
    fi
    cd "$backend_dir"
    local start_cmd="node server.js"
    if [ -f "package.json" ] && grep -q '"start"' package.json; then
        start_cmd="npm start"
    elif [ -f "package.json" ] && grep -q '"dev"' package.json; then
        start_cmd="npm run dev"
    fi
    nohup $start_cmd > "$PROJECT_DIR/.backend.log" 2>&1 &
    echo $! > "$BACKEND_PID_FILE"
    echo "✅ Backend started (PID: $!)"
}

start_frontend() {
    echo "🌐 Starting frontend (React on port $FRONTEND_PORT)..."
    local frontend_dir="$PROJECT_DIR/frontend"
    if [ ! -d "$frontend_dir" ]; then
        echo "⚠️  Frontend directory not found. Skipping."
        return
    fi
    cd "$frontend_dir"
    nohup npm start > "$PROJECT_DIR/.frontend.log" 2>&1 &
    echo $! > "$FRONTEND_PID_FILE"
    echo "✅ Frontend started (PID: $!)"
}

start_servers() {
    echo "🚀 Starting all servers..."
    start_backend
    start_frontend
    sleep 3
    show_status
}

stop_servers() {
    echo "⏸  Stopping servers..."
    if [ -f "$BACKEND_PID_FILE" ]; then
        kill "$(cat "$BACKEND_PID_FILE")" 2>/dev/null
        rm -f "$BACKEND_PID_FILE"
        echo "✅ Backend stopped"
    fi
    if [ -f "$FRONTEND_PID_FILE" ]; then
        kill "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null
        rm -f "$FRONTEND_PID_FILE"
        echo "✅ Frontend stopped"
    fi
    pkill -f "node.*server.js" 2>/dev/null
    pkill -f "react-scripts start" 2>/dev/null
    echo "✅ All servers stopped"
}

show_status() {
    echo ""
    echo "📊 Server Status - E-Commerce Full-Stack"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    # Backend
    if [ -f "$BACKEND_PID_FILE" ] && kill -0 "$(cat "$BACKEND_PID_FILE")" 2>/dev/null; then
        echo "  Backend  : ✅ Running (PID: $(cat "$BACKEND_PID_FILE")) → http://localhost:$BACKEND_PORT"
    else
        echo "  Backend  : ❌ Not running"
    fi
    # Frontend
    if [ -f "$FRONTEND_PID_FILE" ] && kill -0 "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null; then
        echo "  Frontend : ✅ Running (PID: $(cat "$FRONTEND_PID_FILE")) → http://localhost:$FRONTEND_PORT"
    else
        echo "  Frontend : ❌ Not running"
    fi
    # Databases (Docker)
    if command -v docker &>/dev/null; then
        local pg_status
        pg_status=$(docker inspect -f '{{.State.Status}}' ecommerce-postgres 2>/dev/null || echo "not found")
        local redis_status
        redis_status=$(docker inspect -f '{{.State.Status}}' ecommerce-redis 2>/dev/null || echo "not found")
        echo "  PostgreSQL: $([ "$pg_status" = "running" ] && echo "✅ Running (port 5432)" || echo "❌ $pg_status")"
        echo "  Redis     : $([ "$redis_status" = "running" ] && echo "✅ Running (port 6379)" || echo "❌ $redis_status")"
    fi
    echo ""
    echo "🌐 Access:"
    echo "  Frontend : http://localhost:$FRONTEND_PORT"
    echo "  API      : http://localhost:$BACKEND_PORT/api"
    echo "  Admin    : http://localhost:$FRONTEND_PORT/admin"
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

run_migrations() {
    echo "🗄️  Running database migrations..."
    if [ -f "$PROJECT_DIR/backend/package.json" ] && grep -q '"migrate"' "$PROJECT_DIR/backend/package.json"; then
        cd "$PROJECT_DIR/backend" && npm run migrate
    elif [ -f "$PROJECT_DIR/package.json" ] && grep -q '"migrate"' "$PROJECT_DIR/package.json"; then
        cd "$PROJECT_DIR" && npm run migrate
    else
        echo "⚠️  No migration script found in package.json."
        echo "   Add a 'migrate' script to your package.json."
    fi
}

run_tests() {
    echo "🧪 Running tests..."
    if [ -f "$PROJECT_DIR/backend/package.json" ] && grep -q '"test"' "$PROJECT_DIR/backend/package.json"; then
        cd "$PROJECT_DIR/backend" && npm test
    elif [ -f "$PROJECT_DIR/package.json" ] && grep -q '"test"' "$PROJECT_DIR/package.json"; then
        cd "$PROJECT_DIR" && npm test
    else
        echo "⚠️  No test script found in package.json."
    fi
}

restart_servers() {
    echo "🔄 Restarting all servers..."
    stop_servers
    sleep 2
    start_servers
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
        6)  start_databases ;;
        7)  stop_databases ;;
        8)  view_backend_logs ;;
        9)  view_frontend_logs ;;
        10) run_migrations ;;
        11) run_tests ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
done
