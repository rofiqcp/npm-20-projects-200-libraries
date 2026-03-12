#!/bin/bash

# Server Management Script - Project 6: Markdown Note App
# Tech Stack: Express.js + React | MySQL | Marked.js + highlight.js

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$PROJECT_DIR/.env"

# Load .env if it exists
[ -f "$ENV_FILE" ] && source "$ENV_FILE"

# Port defaults (override via .env)
BACKEND_PORT="${BACKEND_PORT:-5000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
MYSQL_PORT="${MYSQL_PORT:-3306}"

BACKEND_PID_FILE="$PROJECT_DIR/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend.pid"

show_menu() {
    echo ""
    echo "╔══════════════════════════════════════════════════╗"
    echo "║   Project 6: Markdown Note App                   ║"
    echo "║   Stack: Express + React | MySQL | Marked.js     ║"
    echo "╚══════════════════════════════════════════════════╝"
    echo ""
    echo "1. Start"
    echo "2. Stop"
    echo "3. Status"
    echo "4. Edit Ports (.env)"
    echo "5. Install, Build & Start"
    echo "0. Exit"
    echo ""
}

start_backend() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    BACKEND_PORT="${BACKEND_PORT:-5000}"

    local backend_dir="$PROJECT_DIR/backend"
    [ ! -d "$backend_dir" ] && backend_dir="$PROJECT_DIR"
    [ ! -f "$backend_dir/package.json" ] && echo "❌ Backend package.json not found." && return 1
    [ -f "$BACKEND_PID_FILE" ] && kill -0 "$(cat "$BACKEND_PID_FILE")" 2>/dev/null && echo "⚠️  Backend already running" && return 0

    echo "🚀 Starting Express backend on port $BACKEND_PORT..."
    cd "$backend_dir"
    local start_cmd="node server.js"
    grep -q '"dev"' package.json 2>/dev/null && start_cmd="npm run dev"
    grep -q '"start"' package.json 2>/dev/null && start_cmd="npm start"
    PORT=$BACKEND_PORT nohup $start_cmd > "$PROJECT_DIR/.backend.log" 2>&1 &
    echo $! > "$BACKEND_PID_FILE"
    echo "✅ Backend started (PID: $!) → http://localhost:$BACKEND_PORT"
}

start_frontend() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    FRONTEND_PORT="${FRONTEND_PORT:-3000}"

    local frontend_dir="$PROJECT_DIR/frontend"
    [ ! -d "$frontend_dir" ] && frontend_dir="$PROJECT_DIR"
    [ ! -f "$frontend_dir/package.json" ] && echo "❌ Frontend package.json not found." && return 1
    [ -f "$FRONTEND_PID_FILE" ] && kill -0 "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null && echo "⚠️  Frontend already running" && return 0

    echo "🚀 Starting React frontend on port $FRONTEND_PORT..."
    cd "$frontend_dir"
    nohup npx vite --port "$FRONTEND_PORT" > "$PROJECT_DIR/.frontend.log" 2>&1 &
    echo $! > "$FRONTEND_PID_FILE"
    echo "✅ Frontend started (PID: $!) → http://localhost:$FRONTEND_PORT"
}

start_server() {
    start_backend
    sleep 1
    start_frontend
    sleep 2
    echo ""
    echo "🌐 Access:"
    echo "  Frontend : http://localhost:${FRONTEND_PORT:-3000}"
    echo "  Backend  : http://localhost:${BACKEND_PORT:-5000}"
    echo "  MySQL    : port ${MYSQL_PORT:-3306}"
}

stop_server() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    BACKEND_PORT="${BACKEND_PORT:-5000}"
    FRONTEND_PORT="${FRONTEND_PORT:-3000}"
    echo "⏸  Stopping servers..."
    [ -f "$BACKEND_PID_FILE" ] && kill "$(cat "$BACKEND_PID_FILE")" 2>/dev/null && rm -f "$BACKEND_PID_FILE"
    [ -f "$FRONTEND_PID_FILE" ] && kill "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null && rm -f "$FRONTEND_PID_FILE"
    fuser -k "${BACKEND_PORT}/tcp" 2>/dev/null
    fuser -k "${FRONTEND_PORT}/tcp" 2>/dev/null
    echo "✅ All servers stopped"
}

show_status() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    BACKEND_PORT="${BACKEND_PORT:-5000}"
    FRONTEND_PORT="${FRONTEND_PORT:-3000}"
    MYSQL_PORT="${MYSQL_PORT:-3306}"
    echo ""
    echo "📊 Server Status - Markdown Note App"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "$BACKEND_PID_FILE" ] && kill -0 "$(cat "$BACKEND_PID_FILE")" 2>/dev/null; then
        echo "  Backend  : ✅ Running (PID: $(cat "$BACKEND_PID_FILE")) → port $BACKEND_PORT"
    else
        echo "  Backend  : ❌ Not running (port $BACKEND_PORT)"
    fi
    if [ -f "$FRONTEND_PID_FILE" ] && kill -0 "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null; then
        echo "  Frontend : ✅ Running (PID: $(cat "$FRONTEND_PID_FILE")) → port $FRONTEND_PORT"
    else
        echo "  Frontend : ❌ Not running (port $FRONTEND_PORT)"
    fi
    if fuser "${MYSQL_PORT}/tcp" &>/dev/null 2>&1; then
        echo "  MySQL    : ✅ Running (port $MYSQL_PORT)"
    else
        echo "  MySQL    : ❌ Not running (port $MYSQL_PORT)"
    fi
    echo ""
}

edit_ports() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    BACKEND_PORT="${BACKEND_PORT:-5000}"
    FRONTEND_PORT="${FRONTEND_PORT:-3000}"
    MYSQL_PORT="${MYSQL_PORT:-3306}"

    echo ""
    echo "⚙️  Edit Ports - Markdown Note App"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Press Enter to keep the current value shown in [brackets]."
    echo ""

    read -r -p "  Backend  BACKEND_PORT  [$BACKEND_PORT]: " input; BACKEND_PORT="${input:-$BACKEND_PORT}"
    read -r -p "  Frontend FRONTEND_PORT [$FRONTEND_PORT]: " input; FRONTEND_PORT="${input:-$FRONTEND_PORT}"
    read -r -p "  MySQL    MYSQL_PORT    [$MYSQL_PORT]: " input; MYSQL_PORT="${input:-$MYSQL_PORT}"

    cat > "$ENV_FILE" <<EOF
# Markdown Note App - Port Configuration
BACKEND_PORT=$BACKEND_PORT
FRONTEND_PORT=$FRONTEND_PORT
MYSQL_PORT=$MYSQL_PORT
EOF
    echo ""
    echo "✅ Ports saved to .env"
    echo "   BACKEND_PORT=$BACKEND_PORT  FRONTEND_PORT=$FRONTEND_PORT  MYSQL_PORT=$MYSQL_PORT"
    echo ""
}

install_build_start() {
    echo "📦 Installing dependencies..."
    for dir in "$PROJECT_DIR" "$PROJECT_DIR/backend" "$PROJECT_DIR/frontend"; do
        [ -f "$dir/package.json" ] && echo "  → $(basename "$dir")..." && cd "$dir" && npm install
    done
    echo "✅ Dependencies installed"
    echo "🏗️  Building frontend..."
    local fd="$PROJECT_DIR/frontend"
    [ -d "$fd" ] && cd "$fd" && npm run build 2>/dev/null || true
    echo "✅ Build complete"
    echo ""
    start_server
}

while true; do
    show_menu
    read -r -p "Choose an option: " choice
    case $choice in
        1) start_server ;;
        2) stop_server ;;
        3) show_status ;;
        4) edit_ports ;;
        5) install_build_start ;;
        0) echo "👋 Goodbye!"; exit 0 ;;
        *) echo "❌ Invalid option. Please try again." ;;
    esac
done
