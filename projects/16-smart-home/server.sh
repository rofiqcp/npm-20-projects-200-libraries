#!/bin/bash

# Server Management Script - Project 16: IoT Smart Home System
# Tech Stack: NestJS + React | MongoDB + Cassandra + Redis | MQTT + Socket.IO

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$PROJECT_DIR/.env"

# Load .env if it exists
[ -f "$ENV_FILE" ] && source "$ENV_FILE"

# Port defaults (override via .env)
BACKEND_PORT="${BACKEND_PORT:-3001}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
MQTT_PORT="${MQTT_PORT:-1883}"

BACKEND_PID_FILE="$PROJECT_DIR/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend.pid"

show_menu() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║   Project 16: IoT Smart Home System                       ║"
    echo "║   Stack: NestJS + React | MongoDB + Cassandra + Redis     ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    echo "1. Start"
    echo "2. Stop"
    echo "3. Status"
    echo "4. Edit Ports (.env)"
    echo "5. Install, Build & Start"
    echo "0. Exit"
    echo ""
}

start_databases() {
    echo "🗄️  Starting databases (Docker)..."
    if command -v docker &>/dev/null; then
        docker run -d --name smarthome-mongo -p 27017:27017 mongo:latest 2>/dev/null || docker start smarthome-mongo 2>/dev/null
        docker run -d --name smarthome-cassandra -p 9042:9042 cassandra:latest 2>/dev/null || docker start smarthome-cassandra 2>/dev/null
        docker run -d --name smarthome-redis -p 6379:6379 redis:alpine 2>/dev/null || docker start smarthome-redis 2>/dev/null
        docker run -d --name smarthome-mqtt -p "${MQTT_PORT}:1883" -p 9001:9001 eclipse-mosquitto:latest 2>/dev/null || docker start smarthome-mqtt 2>/dev/null
        sleep 3
        echo "✅ Databases started"
    else
        echo "⚠️  Docker not found. Please start databases manually."
    fi
}

start_backend() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    BACKEND_PORT="${BACKEND_PORT:-3001}"
    [ -f "$BACKEND_PID_FILE" ] && kill -0 "$(cat "$BACKEND_PID_FILE")" 2>/dev/null && echo "⚠️  Backend already running" && return 0
    local backend_dir="$PROJECT_DIR/backend"
    [ ! -d "$backend_dir" ] && backend_dir="$PROJECT_DIR"
    echo "🚀 Starting NestJS backend on port $BACKEND_PORT..."
    cd "$backend_dir"
    local start_cmd="npm run start:dev"
    grep -q '"start:dev"' package.json 2>/dev/null || start_cmd="npm start"
    PORT=$BACKEND_PORT nohup $start_cmd > "$PROJECT_DIR/.backend.log" 2>&1 &
    echo $! > "$BACKEND_PID_FILE"
    echo "✅ Backend started (PID: $!) → http://localhost:$BACKEND_PORT"
}

start_frontend() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    FRONTEND_PORT="${FRONTEND_PORT:-3000}"
    [ -f "$FRONTEND_PID_FILE" ] && kill -0 "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null && echo "⚠️  Frontend already running" && return 0
    local frontend_dir="$PROJECT_DIR/frontend"
    [ ! -d "$frontend_dir" ] && echo "⚠️  Frontend directory not found." && return 0
    echo "🌐 Starting React frontend on port $FRONTEND_PORT..."
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
    echo "  Dashboard  : http://localhost:${FRONTEND_PORT:-3000}"
    echo "  API        : http://localhost:${BACKEND_PORT:-3001}/api"
    echo "  MQTT Broker: mqtt://localhost:${MQTT_PORT:-1883}"
}

stop_server() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    BACKEND_PORT="${BACKEND_PORT:-3001}"; FRONTEND_PORT="${FRONTEND_PORT:-3000}"
    echo "⏸  Stopping servers..."
    [ -f "$BACKEND_PID_FILE" ] && kill "$(cat "$BACKEND_PID_FILE")" 2>/dev/null && rm -f "$BACKEND_PID_FILE" && echo "  ✅ Backend stopped"
    [ -f "$FRONTEND_PID_FILE" ] && kill "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null && rm -f "$FRONTEND_PID_FILE" && echo "  ✅ Frontend stopped"
    fuser -k "${BACKEND_PORT}/tcp" 2>/dev/null; fuser -k "${FRONTEND_PORT}/tcp" 2>/dev/null
    echo "✅ All servers stopped"
}

show_status() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    BACKEND_PORT="${BACKEND_PORT:-3001}"; FRONTEND_PORT="${FRONTEND_PORT:-3000}"; MQTT_PORT="${MQTT_PORT:-1883}"
    echo ""
    echo "📊 Server Status - IoT Smart Home System"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
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
    if command -v docker &>/dev/null; then
        for svc in smarthome-mongo smarthome-cassandra smarthome-redis smarthome-mqtt; do
            local st; st=$(docker inspect -f '{{.State.Status}}' "$svc" 2>/dev/null || echo "not found")
            echo "  $svc: $([ "$st" = "running" ] && echo "✅ Running" || echo "❌ $st")"
        done
    fi
    echo ""
    echo "🌐 Access:"
    echo "  Dashboard  : http://localhost:$FRONTEND_PORT"
    echo "  API        : http://localhost:$BACKEND_PORT/api"
    echo "  MQTT Broker: mqtt://localhost:$MQTT_PORT"
    echo ""
}

edit_ports() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    BACKEND_PORT="${BACKEND_PORT:-3001}"; FRONTEND_PORT="${FRONTEND_PORT:-3000}"; MQTT_PORT="${MQTT_PORT:-1883}"

    echo ""
    echo "⚙️  Edit Ports - IoT Smart Home System"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Press Enter to keep the current value shown in [brackets]."
    echo ""

    read -r -p "  Backend  BACKEND_PORT  [$BACKEND_PORT]: " input; BACKEND_PORT="${input:-$BACKEND_PORT}"
    read -r -p "  Frontend FRONTEND_PORT [$FRONTEND_PORT]: " input; FRONTEND_PORT="${input:-$FRONTEND_PORT}"
    read -r -p "  MQTT     MQTT_PORT     [$MQTT_PORT]: " input; MQTT_PORT="${input:-$MQTT_PORT}"

    cat > "$ENV_FILE" <<EOF
# IoT Smart Home - Port Configuration
BACKEND_PORT=$BACKEND_PORT
FRONTEND_PORT=$FRONTEND_PORT
MQTT_PORT=$MQTT_PORT
EOF
    echo ""
    echo "✅ Ports saved to .env"
    echo "   BACKEND_PORT=$BACKEND_PORT  FRONTEND_PORT=$FRONTEND_PORT  MQTT_PORT=$MQTT_PORT"
    echo ""
}

install_build_start() {
    echo "📦 Installing dependencies..."
    for dir in "$PROJECT_DIR" "$PROJECT_DIR/backend" "$PROJECT_DIR/frontend"; do
        [ -f "$dir/package.json" ] && echo "  → $(basename "$dir")..." && cd "$dir" && npm install
    done
    echo "✅ Dependencies installed"
    echo "🏗️  Building frontend..."
    [ -d "$PROJECT_DIR/frontend" ] && cd "$PROJECT_DIR/frontend" && npm run build 2>/dev/null || true
    echo "✅ Build complete"
    echo ""
    start_databases
    sleep 3
    start_server
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
