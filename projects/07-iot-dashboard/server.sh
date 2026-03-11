#!/bin/bash

# Server Management Script - Project 7: IoT Weather Dashboard
# Tech Stack: Express.js + React | PostgreSQL | Socket.IO + MQTT (sensor data)
# Sensors: Arduino / Raspberry Pi via MQTT → PostgreSQL time-series

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=5000
FRONTEND_PORT=3000
POSTGRES_PORT=5432
MQTT_PORT=1883
BACKEND_PID_FILE="$PROJECT_DIR/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend.pid"

show_menu() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║   Project 7: IoT Weather Dashboard                    ║"
    echo "║   Stack: Express + React | PostgreSQL | MQTT          ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo ""
    echo "1.  Install Dependencies"
    echo "2.  Start All Servers"
    echo "3.  Stop All Servers"
    echo "4.  Restart All Servers"
    echo "5.  Status"
    echo "6.  Start Databases (Docker)"
    echo "7.  Stop Databases (Docker)"
    echo "8.  Run DB Migrations"
    echo "9.  View Backend Logs"
    echo "10. View Frontend Logs"
    echo "11. Run Tests"
    echo "12. Simulate Sensor Data"
    echo "0.  Exit"
    echo ""
}

install_deps() {
    echo "📦 Installing dependencies..."
    for dir in "$PROJECT_DIR" "$PROJECT_DIR/backend" "$PROJECT_DIR/frontend"; do
        [ -f "$dir/package.json" ] && cd "$dir" && npm install && echo "  ✅ $dir"
    done
    if [ ! -f "$PROJECT_DIR/backend/package.json" ] && [ ! -f "$PROJECT_DIR/package.json" ]; then
        echo "⚠️  Initialize project:"
        echo "   Backend: npm install express cors pg dotenv socket.io mqtt"
        echo "   Frontend: npm install react axios chart.js react-chartjs-2 recharts socket.io-client"
    fi
    echo "✅ Done"
}

start_databases() {
    echo "🗄️  Starting databases (Docker)..."
    if command -v docker &>/dev/null; then
        docker run -d --name iot-dashboard-postgres \
            -e POSTGRES_DB=iot_weather \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=postgres \
            -p "$POSTGRES_PORT:5432" postgres:14 2>/dev/null || docker start iot-dashboard-postgres 2>/dev/null
        docker run -d --name iot-dashboard-mqtt \
            -p "$MQTT_PORT:1883" -p 9001:9001 \
            eclipse-mosquitto:latest 2>/dev/null || docker start iot-dashboard-mqtt 2>/dev/null
        sleep 3
        echo "✅ PostgreSQL running on port $POSTGRES_PORT"
        echo "✅ MQTT Broker running on port $MQTT_PORT"
    else
        echo "⚠️  Docker not found. Start PostgreSQL and MQTT manually."
    fi
}

stop_databases() {
    echo "⏸  Stopping databases..."
    command -v docker &>/dev/null && docker stop iot-dashboard-postgres iot-dashboard-mqtt 2>/dev/null
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
    echo "📊 Server Status - IoT Weather Dashboard"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
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
        for db in iot-dashboard-postgres iot-dashboard-mqtt; do
            local st
            st=$(docker inspect -f '{{.State.Status}}' "$db" 2>/dev/null || echo "not found")
            echo "  $db: $([ "$st" = "running" ] && echo "✅ Running" || echo "❌ $st")"
        done
    fi
    echo ""
    echo "🌐 Access:"
    echo "  Dashboard  : http://localhost:$FRONTEND_PORT"
    echo "  API        : http://localhost:$BACKEND_PORT/api/sensors"
    echo "  WebSocket  : ws://localhost:$BACKEND_PORT"
    echo "  MQTT Broker: mqtt://localhost:$MQTT_PORT"
    echo ""
}

run_migrations() {
    echo "🗄️  Running database migrations..."
    if [ -f "$PROJECT_DIR/backend/package.json" ] && grep -q '"migrate"' "$PROJECT_DIR/backend/package.json"; then
        cd "$PROJECT_DIR/backend" && npm run migrate
    else
        echo "⚠️  No migration script found."
        echo ""
        echo "   Example PostgreSQL schema:"
        echo "   CREATE TABLE sensors ("
        echo "     id SERIAL PRIMARY KEY,"
        echo "     sensor_id VARCHAR(50) NOT NULL,"
        echo "     location VARCHAR(100),"
        echo "     created_at TIMESTAMP DEFAULT NOW()"
        echo "   );"
        echo ""
        echo "   CREATE TABLE readings ("
        echo "     id SERIAL PRIMARY KEY,"
        echo "     sensor_id VARCHAR(50) REFERENCES sensors(sensor_id),"
        echo "     temperature FLOAT, humidity FLOAT, pressure FLOAT,"
        echo "     recorded_at TIMESTAMP DEFAULT NOW()"
        echo "   );"
        echo "   CREATE INDEX idx_readings_time ON readings(sensor_id, recorded_at DESC);"
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
    if [ -f "$test_dir/package.json" ] && grep -q '"test"' "$test_dir/package.json"; then
        cd "$test_dir" && npm test
    else
        echo "⚠️  No test script found."
    fi
}

simulate_sensors() {
    echo "🌡️  Simulating IoT sensor data..."
    local timestamp
    timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    if command -v mosquitto_pub &>/dev/null; then
        mosquitto_pub -h localhost -p "$MQTT_PORT" -t "iot/sensor/DHT22-01/weather" \
            -m "{\"temperature\": 28.5, \"humidity\": 72, \"sensor_id\": \"DHT22-01\", \"timestamp\": \"$timestamp\"}"
        mosquitto_pub -h localhost -p "$MQTT_PORT" -t "iot/sensor/BMP280-01/pressure" \
            -m "{\"pressure\": 1013.25, \"altitude\": 125.0, \"sensor_id\": \"BMP280-01\", \"timestamp\": \"$timestamp\"}"
        echo "✅ Sensor data published to MQTT"
    else
        echo "⚠️  mosquitto_pub not found. Install mosquitto-clients."
        echo ""
        echo "   Example MQTT payloads:"
        echo "   Topic: iot/sensor/DHT22-01/weather"
        echo "   Data : {temperature: 28.5, humidity: 72}"
        echo ""
        echo "   Topic: iot/sensor/BMP280-01/pressure"
        echo "   Data : {pressure: 1013.25, altitude: 125.0}"
    fi
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
        9)  view_backend_logs ;;
        10) view_frontend_logs ;;
        11) run_tests ;;
        12) simulate_sensors ;;
        0)  echo "👋 Goodbye!"; exit 0 ;;
        *)  echo "❌ Invalid option. Please try again." ;;
    esac
done
