#!/bin/bash

# Server Management Script - AI Chatbot (Project 13)
# Stack: React + Express.js + Node.js

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$PROJECT_DIR/.env"

# Load .env if it exists
[ -f "$ENV_FILE" ] && source "$ENV_FILE"

# Port defaults (override via .env)
BACKEND_PORT="${BACKEND_PORT:-5000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

BACKEND_PID_FILE="$PROJECT_DIR/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend.pid"

show_menu() {
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║   AI Chatbot - Server Management"
    echo "╚════════════════════════════════════════╝"
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
    [ -f "$BACKEND_PID_FILE" ] && kill -0 "$(cat "$BACKEND_PID_FILE")" 2>/dev/null && echo "⚠️  Backend already running" && return 0
    local backend_dir="$PROJECT_DIR/backend"
    if [ -d "$backend_dir" ] && [ -f "$backend_dir/package.json" ]; then
        echo "▶️  Starting backend (port $BACKEND_PORT)..."
        cd "$backend_dir"
        local start_cmd="npm start"
        grep -q '"dev"' package.json 2>/dev/null && start_cmd="npm run dev"
        PORT=$BACKEND_PORT nohup $start_cmd > "$PROJECT_DIR/.backend.log" 2>&1 &
        echo $! > "$BACKEND_PID_FILE"
        echo "✅ Backend started (PID: $!) → http://localhost:$BACKEND_PORT"
    else
        echo "⚠️  Backend directory not found."
    fi
}

start_frontend() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    FRONTEND_PORT="${FRONTEND_PORT:-3000}"
    [ -f "$FRONTEND_PID_FILE" ] && kill -0 "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null && echo "⚠️  Frontend already running" && return 0
    local frontend_dir="$PROJECT_DIR/frontend"
    if [ -d "$frontend_dir" ] && [ -f "$frontend_dir/package.json" ]; then
        echo "▶️  Starting frontend (port $FRONTEND_PORT)..."
        cd "$frontend_dir"
        nohup npx vite --port "$FRONTEND_PORT" > "$PROJECT_DIR/.frontend.log" 2>&1 &
        echo $! > "$FRONTEND_PID_FILE"
        echo "✅ Frontend started (PID: $!) → http://localhost:$FRONTEND_PORT"
    else
        echo "⚠️  Frontend directory not found."
    fi
}

start_server() {
    start_backend; sleep 1; start_frontend; sleep 2
    echo ""; echo "🌐 Access:"
    echo "  Frontend: http://localhost:${FRONTEND_PORT:-3000}"
    echo "  Backend:  http://localhost:${BACKEND_PORT:-5000}"
}

stop_server() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    BACKEND_PORT="${BACKEND_PORT:-5000}"; FRONTEND_PORT="${FRONTEND_PORT:-3000}"
    echo "⏸  Stopping servers..."
    [ -f "$BACKEND_PID_FILE" ] && kill "$(cat "$BACKEND_PID_FILE")" 2>/dev/null && rm -f "$BACKEND_PID_FILE" && echo "  ✅ Backend stopped"
    [ -f "$FRONTEND_PID_FILE" ] && kill "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null && rm -f "$FRONTEND_PID_FILE" && echo "  ✅ Frontend stopped"
    fuser -k "${BACKEND_PORT}/tcp" 2>/dev/null; fuser -k "${FRONTEND_PORT}/tcp" 2>/dev/null
    echo "✅ All servers stopped"
}

show_status() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    BACKEND_PORT="${BACKEND_PORT:-5000}"; FRONTEND_PORT="${FRONTEND_PORT:-3000}"
    echo ""; echo "📊 AI Chatbot Status:"; echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    fuser "${BACKEND_PORT}/tcp" &>/dev/null 2>&1 && echo "  ✅ Backend  (port $BACKEND_PORT): RUNNING" || echo "  ❌ Backend  (port $BACKEND_PORT): STOPPED"
    fuser "${FRONTEND_PORT}/tcp" &>/dev/null 2>&1 && echo "  ✅ Frontend (port $FRONTEND_PORT): RUNNING" || echo "  ❌ Frontend (port $FRONTEND_PORT): STOPPED"
    echo ""; echo "🌐 Access:"; echo "  Frontend: http://localhost:$FRONTEND_PORT"
    echo "  Backend:  http://localhost:$BACKEND_PORT"; echo ""
}

edit_ports() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    BACKEND_PORT="${BACKEND_PORT:-5000}"; FRONTEND_PORT="${FRONTEND_PORT:-3000}"
    echo ""; echo "⚙️  Edit Ports - AI Chatbot"; echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Press Enter to keep the current value shown in [brackets]."; echo ""
    read -r -p "  Backend  BACKEND_PORT  [$BACKEND_PORT]: " input; BACKEND_PORT="${input:-$BACKEND_PORT}"
    read -r -p "  Frontend FRONTEND_PORT [$FRONTEND_PORT]: " input; FRONTEND_PORT="${input:-$FRONTEND_PORT}"
    cat > "$ENV_FILE" <<EOF
# AI Chatbot - Port Configuration
BACKEND_PORT=$BACKEND_PORT
FRONTEND_PORT=$FRONTEND_PORT
EOF
    echo ""; echo "✅ Ports saved to .env"
    echo "   BACKEND_PORT=$BACKEND_PORT  FRONTEND_PORT=$FRONTEND_PORT"; echo ""
}

install_build_start() {
    echo "📦 Installing dependencies..."
    [ -f "$PROJECT_DIR/package.json" ] && cd "$PROJECT_DIR" && npm install
    [ -f "$PROJECT_DIR/backend/package.json" ] && echo "  → backend..." && cd "$PROJECT_DIR/backend" && npm install
    [ -f "$PROJECT_DIR/frontend/package.json" ] && echo "  → frontend..." && cd "$PROJECT_DIR/frontend" && npm install
    echo "✅ Dependencies installed"
    echo "🏗️  Building frontend..."
    [ -d "$PROJECT_DIR/frontend" ] && cd "$PROJECT_DIR/frontend" && npm run build 2>/dev/null || true
    echo "✅ Build complete"; echo ""; start_server
}

while true; do
    show_menu
    read -r -p "Choose an option: " choice
    case $choice in
        1) start_server ;; 2) stop_server ;; 3) show_status ;; 4) edit_ports ;; 5) install_build_start ;;
        0) echo "👋 Goodbye!"; exit 0 ;;
        *) echo "❌ Invalid option. Please try again." ;;
    esac
done
