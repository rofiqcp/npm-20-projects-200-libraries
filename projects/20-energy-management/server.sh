#!/bin/bash

# Server Management Script - Project 20: Energy & Resource Management System
# Tech Stack: Express.js + React + D3.js | PostgreSQL + TimescaleDB + MongoDB | Python ML + MQTT + Socket.IO

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$PROJECT_DIR/.env"

# Load .env if it exists
[ -f "$ENV_FILE" ] && source "$ENV_FILE"

# Port defaults (override via .env)
BACKEND_PORT="${BACKEND_PORT:-4000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
ML_SERVICE_PORT="${ML_SERVICE_PORT:-5001}"
MONGODB_PORT="${MONGODB_PORT:-27017}"

BACKEND_PID_FILE="$PROJECT_DIR/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend.pid"
ML_PID_FILE="$PROJECT_DIR/.ml-service.pid"

show_menu() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║   Project 20: Energy & Resource Management System                ║"
    echo "║   Stack: Express + React + D3.js | PostgreSQL + TimescaleDB      ║"
    echo "║          + MongoDB | Python ML + MQTT + Socket.IO                ║"
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
            docker run -d --name energy-timescaledb -e POSTGRES_DB=energy -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 timescale/timescaledb:latest-pg14 2>/dev/null || docker start energy-timescaledb 2>/dev/null
            docker run -d --name energy-mongo -p "${MONGODB_PORT}:27017" mongo:latest 2>/dev/null || docker start energy-mongo 2>/dev/null
            docker run -d --name energy-redis -p 6379:6379 redis:alpine 2>/dev/null || docker start energy-redis 2>/dev/null
            docker run -d --name energy-mqtt -p 1883:1883 -p 9001:9001 eclipse-mosquitto:latest 2>/dev/null || docker start energy-mqtt 2>/dev/null
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
    echo "🚀 Starting Express backend on port $BACKEND_PORT..."
    cd "$backend_dir"
    local start_cmd="npm run dev"
    grep -q '"dev"' package.json 2>/dev/null || start_cmd="npm start"
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
    echo "🚀 Starting React+D3.js frontend on port $FRONTEND_PORT..."
    cd "$frontend_dir"
    nohup npx vite --port "$FRONTEND_PORT" > "$PROJECT_DIR/.frontend.log" 2>&1 &
    echo $! > "$FRONTEND_PID_FILE"
    echo "✅ Frontend started (PID: $!) → http://localhost:$FRONTEND_PORT"
}

start_ml_service() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    ML_SERVICE_PORT="${ML_SERVICE_PORT:-5001}"
    [ -f "$ML_PID_FILE" ] && kill -0 "$(cat "$ML_PID_FILE")" 2>/dev/null && echo "⚠️  ML service already running" && return 0
    local ml_dir="$PROJECT_DIR/ml-service"
    local ml_script=""
    [ -f "$ml_dir/app.py" ] && ml_script="$ml_dir/app.py"
    [ -z "$ml_script" ] && [ -f "$ml_dir/ml_service.py" ] && ml_script="$ml_dir/ml_service.py"
    [ -z "$ml_script" ] && [ -f "$PROJECT_DIR/ml_service.py" ] && ml_script="$PROJECT_DIR/ml_service.py"

    if [ -n "$ml_script" ] && command -v python3 &>/dev/null; then
        echo "🤖 Starting Python ML service on port $ML_SERVICE_PORT..."
        cd "$(dirname "$ml_script")"
        ML_PORT=$ML_SERVICE_PORT nohup python3 "$(basename "$ml_script")" > "$PROJECT_DIR/.ml-service.log" 2>&1 &
        echo $! > "$ML_PID_FILE"
        echo "✅ ML service started (PID: $!) → http://localhost:$ML_SERVICE_PORT"
    else
        echo "ℹ️  ML service not available (optional)"
    fi
}

start_server() {
    start_backend; sleep 1; start_frontend; sleep 1; start_ml_service; sleep 1
    echo ""
    echo "🌐 Access:"
    echo "  Dashboard  : http://localhost:${FRONTEND_PORT:-3000}"
    echo "  API        : http://localhost:${BACKEND_PORT:-4000}/api"
    echo "  ML Service : http://localhost:${ML_SERVICE_PORT:-5001}/predict"
    echo "  MongoDB    : port ${MONGODB_PORT:-27017}"
}

stop_server() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    BACKEND_PORT="${BACKEND_PORT:-4000}"; FRONTEND_PORT="${FRONTEND_PORT:-3000}"
    echo "⏸  Stopping servers..."
    [ -f "$BACKEND_PID_FILE" ] && kill "$(cat "$BACKEND_PID_FILE")" 2>/dev/null && rm -f "$BACKEND_PID_FILE" && echo "  ✅ Backend stopped"
    [ -f "$FRONTEND_PID_FILE" ] && kill "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null && rm -f "$FRONTEND_PID_FILE" && echo "  ✅ Frontend stopped"
    [ -f "$ML_PID_FILE" ] && kill "$(cat "$ML_PID_FILE")" 2>/dev/null && rm -f "$ML_PID_FILE" && echo "  ✅ ML service stopped"
    fuser -k "${BACKEND_PORT}/tcp" 2>/dev/null; fuser -k "${FRONTEND_PORT}/tcp" 2>/dev/null
    echo "✅ All servers stopped"
}

show_status() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    BACKEND_PORT="${BACKEND_PORT:-4000}"; FRONTEND_PORT="${FRONTEND_PORT:-3000}"
    ML_SERVICE_PORT="${ML_SERVICE_PORT:-5001}"; MONGODB_PORT="${MONGODB_PORT:-27017}"
    echo ""; echo "📊 Server Status - Energy Management"; echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
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
    if [ -f "$ML_PID_FILE" ] && kill -0 "$(cat "$ML_PID_FILE")" 2>/dev/null; then
        echo "  ML Service : ✅ Running (PID: $(cat "$ML_PID_FILE")) → port $ML_SERVICE_PORT"
    else
        echo "  ML Service : ❌ Not running (port $ML_SERVICE_PORT, optional)"
    fi
    if command -v docker &>/dev/null; then
        for db in energy-timescaledb energy-mongo energy-redis energy-mqtt; do
            local st; st=$(docker inspect -f '{{.State.Status}}' "$db" 2>/dev/null || echo "not found")
            echo "  $db: $([ "$st" = "running" ] && echo "✅ Running" || echo "❌ $st")"
        done
    fi
    echo ""; echo "🌐 Access:"; echo "  Dashboard  : http://localhost:$FRONTEND_PORT"
    echo "  API        : http://localhost:$BACKEND_PORT/api"
    echo "  ML Service : http://localhost:$ML_SERVICE_PORT/predict"; echo ""
}

edit_ports() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    BACKEND_PORT="${BACKEND_PORT:-4000}"; FRONTEND_PORT="${FRONTEND_PORT:-3000}"
    ML_SERVICE_PORT="${ML_SERVICE_PORT:-5001}"; MONGODB_PORT="${MONGODB_PORT:-27017}"

    echo ""; echo "⚙️  Edit Ports - Energy Management"; echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Press Enter to keep the current value shown in [brackets]."; echo ""

    read -r -p "  Backend    BACKEND_PORT     [$BACKEND_PORT]: " input; BACKEND_PORT="${input:-$BACKEND_PORT}"
    read -r -p "  Frontend   FRONTEND_PORT    [$FRONTEND_PORT]: " input; FRONTEND_PORT="${input:-$FRONTEND_PORT}"
    read -r -p "  ML Service ML_SERVICE_PORT  [$ML_SERVICE_PORT]: " input; ML_SERVICE_PORT="${input:-$ML_SERVICE_PORT}"
    read -r -p "  MongoDB    MONGODB_PORT     [$MONGODB_PORT]: " input; MONGODB_PORT="${input:-$MONGODB_PORT}"

    cat > "$ENV_FILE" <<EOF
# Energy Management - Port Configuration
BACKEND_PORT=$BACKEND_PORT
FRONTEND_PORT=$FRONTEND_PORT
ML_SERVICE_PORT=$ML_SERVICE_PORT
MONGODB_PORT=$MONGODB_PORT
EOF
    echo ""; echo "✅ Ports saved to .env"
    echo "   BACKEND=$BACKEND_PORT  FRONTEND=$FRONTEND_PORT  ML=$ML_SERVICE_PORT  MONGODB=$MONGODB_PORT"; echo ""
}

install_build_start() {
    echo "📦 Installing Node.js dependencies..."
    for dir in "$PROJECT_DIR" "$PROJECT_DIR/backend" "$PROJECT_DIR/frontend"; do
        [ -f "$dir/package.json" ] && echo "  → $(basename "$dir")..." && cd "$dir" && npm install
    done
    echo "✅ Node.js dependencies installed"
    echo "🐍 Installing Python ML dependencies..."
    local ml_dir="$PROJECT_DIR/ml-service"
    if [ -d "$ml_dir" ] && [ -f "$ml_dir/requirements.txt" ] && command -v python3 &>/dev/null; then
        cd "$ml_dir" && python3 -m pip install -r requirements.txt --quiet
        echo "✅ Python ML dependencies installed"
    elif command -v pip3 &>/dev/null; then
        pip3 install pandas scikit-learn flask --quiet 2>/dev/null || true
        echo "✅ Python ML dependencies installed"
    else
        echo "ℹ️  Python3/pip3 not found. ML features will be skipped."
    fi
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
