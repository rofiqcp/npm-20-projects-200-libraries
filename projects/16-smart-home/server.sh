#!/bin/bash

# Server Management Script - Project 16: IoT Smart Home System
# Tech Stack: NestJS + React | MongoDB + Cassandra + Redis | MQTT + Socket.IO

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=3001
FRONTEND_PORT=3000
MQTT_PORT=1883
BACKEND_PID_FILE="$PROJECT_DIR/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend.pid"

show_menu() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║   Project 16: IoT Smart Home System                       ║"
    echo "║   Stack: NestJS + React | MongoDB + Cassandra + Redis     ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
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
    echo "10. Run Migrations / DB Init"
    echo "11. Run Tests"
    echo "12. Simulate IoT Sensor Data"
    echo "0.  Exit"
    echo ""
}

install_deps() {
    echo "📦 Installing dependencies..."
    if [ -f "$PROJECT_DIR/package.json" ]; then
        cd "$PROJECT_DIR" && npm install
    fi
    if [ -f "$PROJECT_DIR/backend/package.json" ]; then
        echo "  → Backend (NestJS) dependencies..."
        cd "$PROJECT_DIR/backend" && npm install
    fi
    if [ -f "$PROJECT_DIR/frontend/package.json" ]; then
        echo "  → Frontend (React) dependencies..."
        cd "$PROJECT_DIR/frontend" && npm install
    fi
    echo "✅ Dependencies installed"
}

start_databases() {
    echo "🗄️  Starting databases (Docker)..."
    if command -v docker &>/dev/null; then
        # MongoDB
        docker run -d --name smarthome-mongo \
            -p 27017:27017 \
            mongo:latest 2>/dev/null || docker start smarthome-mongo 2>/dev/null
        # Cassandra
        docker run -d --name smarthome-cassandra \
            -p 9042:9042 \
            cassandra:latest 2>/dev/null || docker start smarthome-cassandra 2>/dev/null
        # Redis
        docker run -d --name smarthome-redis \
            -p 6379:6379 \
            redis:alpine 2>/dev/null || docker start smarthome-redis 2>/dev/null
        # MQTT Broker (Mosquitto)
        docker run -d --name smarthome-mqtt \
            -p "$MQTT_PORT:1883" -p 9001:9001 \
            eclipse-mosquitto:latest 2>/dev/null || docker start smarthome-mqtt 2>/dev/null
        sleep 5
        echo "✅ MongoDB running on port 27017"
        echo "✅ Cassandra running on port 9042 (may take ~30s to fully start)"
        echo "✅ Redis running on port 6379"
        echo "✅ MQTT Broker (Mosquitto) running on port $MQTT_PORT"
    elif [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
        cd "$PROJECT_DIR" && docker compose up -d
        echo "✅ Databases started via docker-compose"
    else
        echo "⚠️  Docker not found. Please start databases manually."
        echo "   MongoDB  : port 27017"
        echo "   Cassandra: port 9042"
        echo "   Redis    : port 6379"
        echo "   MQTT     : port $MQTT_PORT"
    fi
}

stop_databases() {
    echo "⏸  Stopping databases..."
    if command -v docker &>/dev/null; then
        if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
            cd "$PROJECT_DIR" && docker compose down
        else
            docker stop smarthome-mongo smarthome-cassandra smarthome-redis smarthome-mqtt 2>/dev/null
        fi
        echo "✅ Databases stopped"
    else
        echo "⚠️  Docker not found."
    fi
}

start_backend() {
    echo "🚀 Starting backend (NestJS on port $BACKEND_PORT)..."
    local backend_dir="$PROJECT_DIR/backend"
    if [ ! -d "$backend_dir" ]; then
        backend_dir="$PROJECT_DIR"
    fi
    cd "$backend_dir"
    local start_cmd="npm run start:dev"
    if [ ! -f "package.json" ] || ! grep -q '"start:dev"' package.json; then
        start_cmd="npm start"
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
    pkill -f "nest.*start" 2>/dev/null
    pkill -f "react-scripts start" 2>/dev/null
    echo "✅ All servers stopped"
}

show_status() {
    echo ""
    echo "📊 Server Status - IoT Smart Home System"
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
    # Docker databases
    if command -v docker &>/dev/null; then
        for svc in smarthome-mongo smarthome-cassandra smarthome-redis smarthome-mqtt; do
            local st
            st=$(docker inspect -f '{{.State.Status}}' "$svc" 2>/dev/null || echo "not found")
            local label
            case $svc in
                smarthome-mongo)     label="MongoDB   " ;;
                smarthome-cassandra) label="Cassandra " ;;
                smarthome-redis)     label="Redis     " ;;
                smarthome-mqtt)      label="MQTT      " ;;
            esac
            echo "  $label: $([ "$st" = "running" ] && echo "✅ Running" || echo "❌ $st")"
        done
    fi
    echo ""
    echo "🌐 Access:"
    echo "  Dashboard  : http://localhost:$FRONTEND_PORT"
    echo "  API        : http://localhost:$BACKEND_PORT/api"
    echo "  WebSocket  : ws://localhost:$BACKEND_PORT"
    echo "  MQTT Broker: mqtt://localhost:$MQTT_PORT"
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
    echo "🗄️  Initializing databases..."
    if [ -f "$PROJECT_DIR/backend/package.json" ] && grep -q '"db:init"' "$PROJECT_DIR/backend/package.json"; then
        cd "$PROJECT_DIR/backend" && npm run db:init
    elif [ -f "$PROJECT_DIR/backend/package.json" ] && grep -q '"migrate"' "$PROJECT_DIR/backend/package.json"; then
        cd "$PROJECT_DIR/backend" && npm run migrate
    else
        echo "⚠️  No db:init or migrate script found."
        echo "   Cassandra schema and MongoDB collections will be created on first run."
    fi
}

run_tests() {
    echo "🧪 Running tests..."
    local test_dir="$PROJECT_DIR/backend"
    if [ ! -d "$test_dir" ]; then
        test_dir="$PROJECT_DIR"
    fi
    if [ -f "$test_dir/package.json" ] && grep -q '"test"' "$test_dir/package.json"; then
        cd "$test_dir" && npm test
    else
        echo "⚠️  No test script found in package.json."
    fi
}

simulate_iot() {
    echo "📡 Simulating IoT sensor data..."
    echo "   Sending MQTT messages to broker at localhost:$MQTT_PORT..."
    if command -v mosquitto_pub &>/dev/null; then
        mosquitto_pub -h localhost -p "$MQTT_PORT" -t "home/living-room/temperature" -m '{"value": 23.5, "unit": "C", "timestamp": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'
        mosquitto_pub -h localhost -p "$MQTT_PORT" -t "home/living-room/humidity" -m '{"value": 65, "unit": "%", "timestamp": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'
        mosquitto_pub -h localhost -p "$MQTT_PORT" -t "home/kitchen/power" -m '{"value": 250, "unit": "W", "timestamp": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'
        echo "✅ Sensor data sent"
    else
        echo "⚠️  mosquitto_pub not found. Install mosquitto-clients to simulate IoT data."
        echo "   Example messages:"
        echo "   Topic: home/living-room/temperature → {value: 23.5, unit: 'C'}"
        echo "   Topic: home/living-room/humidity    → {value: 65, unit: '%'}"
        echo "   Topic: home/kitchen/power           → {value: 250, unit: 'W'}"
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
        12) simulate_iot ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
done
