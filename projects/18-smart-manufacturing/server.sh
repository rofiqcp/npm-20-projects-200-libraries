#!/bin/bash

# Server Management Script - Project 18: Smart Manufacturing System (Industry 4.0)
# Tech Stack: NestJS + React + Three.js | PostgreSQL + InfluxDB + Redis | MQTT + RabbitMQ + Socket.IO

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$PROJECT_DIR/.env"

# Load .env if it exists
[ -f "$ENV_FILE" ] && source "$ENV_FILE"

# Port defaults (override via .env)
BACKEND_PORT="${BACKEND_PORT:-4000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
MQTT_PORT="${MQTT_PORT:-1883}"
INFLUXDB_PORT="${INFLUXDB_PORT:-8086}"

BACKEND_PID_FILE="$PROJECT_DIR/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend.pid"

show_menu() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║   Project 18: Smart Manufacturing System (Industry 4.0)          ║"
    echo "║   Stack: NestJS + React | PostgreSQL + InfluxDB + Redis          ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
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
        if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
            cd "$PROJECT_DIR" && docker compose up -d
        else
            docker run -d --name manufacturing-postgres -e POSTGRES_DB=manufacturing -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:14 2>/dev/null || docker start manufacturing-postgres 2>/dev/null
            docker run -d --name manufacturing-influxdb -p "${INFLUXDB_PORT}:8086" influxdb:2.0 2>/dev/null || docker start manufacturing-influxdb 2>/dev/null
            docker run -d --name manufacturing-redis -p 6379:6379 redis:alpine 2>/dev/null || docker start manufacturing-redis 2>/dev/null
            docker run -d --name manufacturing-mqtt -p "${MQTT_PORT}:1883" eclipse-mosquitto:latest 2>/dev/null || docker start manufacturing-mqtt 2>/dev/null
            docker run -d --name manufacturing-rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management 2>/dev/null || docker start manufacturing-rabbitmq 2>/dev/null
        fi
        sleep 3
        echo "✅ Databases started"
    else
        echo "⚠️  Docker not found. Please start databases manually."
    fi
}

start_backend() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    BACKEND_PORT="${BACKEND_PORT:-4000}"
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
    echo "🚀 Starting React frontend on port $FRONTEND_PORT..."
    cd "$frontend_dir"
    nohup npx vite --port "$FRONTEND_PORT" > "$PROJECT_DIR/.frontend.log" 2>&1 &
    echo $! > "$FRONTEND_PID_FILE"
    echo "✅ Frontend started (PID: $!) → http://localhost:$FRONTEND_PORT"
}

start_server() {
    start_backend; sleep 1; start_frontend; sleep 2
    echo ""; echo "�� Access:"
    echo "  Dashboard  : http://localhost:${FRONTEND_PORT:-3000}"
    echo "  API        : http://localhost:${BACKEND_PORT:-4000}/api"
    echo "  InfluxDB   : http://localhost:${INFLUXDB_PORT:-8086}"
    echo "  MQTT       : mqtt://localhost:${MQTT_PORT:-1883}"
}

stop_server() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    BACKEND_PORT="${BACKEND_PORT:-4000}"; FRONTEND_PORT="${FRONTEND_PORT:-3000}"
    echo "⏸  Stopping servers..."
    [ -f "$BACKEND_PID_FILE" ] && kill "$(cat "$BACKEND_PID_FILE")" 2>/dev/null && rm -f "$BACKEND_PID_FILE" && echo "  ✅ Backend stopped"
    [ -f "$FRONTEND_PID_FILE" ] && kill "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null && rm -f "$FRONTEND_PID_FILE" && echo "  ✅ Frontend stopped"
    fuser -k "${BACKEND_PORT}/tcp" 2>/dev/null; fuser -k "${FRONTEND_PORT}/tcp" 2>/dev/null
    echo "✅ All servers stopped"
}

show_status() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    BACKEND_PORT="${BACKEND_PORT:-4000}"; FRONTEND_PORT="${FRONTEND_PORT:-3000}"
    MQTT_PORT="${MQTT_PORT:-1883}"; INFLUXDB_PORT="${INFLUXDB_PORT:-8086}"
    echo ""; echo "📊 Server Status - Smart Manufacturing"; echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "$BACKEND_PID_FILE" ] && kill -0 "$(cat "$BACKEND_PID_FILE")" 2>/dev/null; then
        echo "  Backend    : ✅ Running (PID: $(cat "$BACKEND_PID_FILE")) → port $BACKEND_PORT"
    else
        echo "  Backend    : ❌ Not running (port $BACKEND_PORT)"
    fi
    if [ -f "$FRONTEND_PID_FILE" ] && kill -0 "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null; then
        echo "  Frontend   : ✅ Running (PID: $(cat "$FRONTEND_PID_FILE")) → port $FRONTEND_PORT"
    else
        echo "  Frontend   : ❌ Not running (port $FRONTEND_PORT)"
    fi
    if command -v docker &>/dev/null; then
        for svc in manufacturing-postgres manufacturing-influxdb manufacturing-redis manufacturing-mqtt manufacturing-rabbitmq; do
            local st; st=$(docker inspect -f '{{.State.Status}}' "$svc" 2>/dev/null || echo "not found")
            echo "  $svc: $([ "$st" = "running" ] && echo "✅ Running" || echo "❌ $st")"
        done
    fi
    echo ""; echo "🌐 Access:"; echo "  Dashboard: http://localhost:$FRONTEND_PORT"; echo "  API:       http://localhost:$BACKEND_PORT/api"; echo ""
}

edit_ports() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    BACKEND_PORT="${BACKEND_PORT:-4000}"; FRONTEND_PORT="${FRONTEND_PORT:-3000}"
    MQTT_PORT="${MQTT_PORT:-1883}"; INFLUXDB_PORT="${INFLUXDB_PORT:-8086}"

    echo ""; echo "⚙️  Edit Ports - Smart Manufacturing"; echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Press Enter to keep the current value shown in [brackets]."; echo ""

    read -r -p "  Backend   BACKEND_PORT   [$BACKEND_PORT]: " input; BACKEND_PORT="${input:-$BACKEND_PORT}"
    read -r -p "  Frontend  FRONTEND_PORT  [$FRONTEND_PORT]: " input; FRONTEND_PORT="${input:-$FRONTEND_PORT}"
    read -r -p "  MQTT      MQTT_PORT      [$MQTT_PORT]: " input; MQTT_PORT="${input:-$MQTT_PORT}"
    read -r -p "  InfluxDB  INFLUXDB_PORT  [$INFLUXDB_PORT]: " input; INFLUXDB_PORT="${input:-$INFLUXDB_PORT}"

    cat > "$ENV_FILE" <<EOF
# Smart Manufacturing - Port Configuration
BACKEND_PORT=$BACKEND_PORT
FRONTEND_PORT=$FRONTEND_PORT
MQTT_PORT=$MQTT_PORT
INFLUXDB_PORT=$INFLUXDB_PORT
EOF
    echo ""; echo "✅ Ports saved to .env"
    echo "   BACKEND=$BACKEND_PORT  FRONTEND=$FRONTEND_PORT  MQTT=$MQTT_PORT  INFLUXDB=$INFLUXDB_PORT"; echo ""
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
    start_databases; sleep 5; start_server
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
