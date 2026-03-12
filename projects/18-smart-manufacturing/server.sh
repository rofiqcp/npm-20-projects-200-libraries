#!/bin/bash

# Server Management Script - Project 18: Smart Manufacturing System (Industry 4.0)
# Tech Stack: NestJS + React + Three.js | PostgreSQL + InfluxDB + Redis | MQTT + RabbitMQ + Socket.IO

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=4000
FRONTEND_PORT=3000
MQTT_PORT=1883
INFLUXDB_PORT=8086
BACKEND_PID_FILE="$PROJECT_DIR/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend.pid"

show_menu() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║   Project 18: Smart Manufacturing System (Industry 4.0)          ║"
    echo "║   Stack: NestJS + React | PostgreSQL + InfluxDB + Redis          ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
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
    echo "10. Run DB Migrations"
    echo "11. Run Tests"
    echo "12. Simulate Machine Sensor Data"
    echo "13. View OEE Dashboard Info"
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
        echo "  → Frontend (React + Three.js) dependencies..."
        cd "$PROJECT_DIR/frontend" && npm install
    fi
    echo "✅ Dependencies installed"
}

start_databases() {
    echo "🗄️  Starting databases (Docker)..."
    if command -v docker &>/dev/null; then
        # PostgreSQL (production orders, equipment, workers)
        docker run -d --name manufacturing-postgres \
            -e POSTGRES_DB=manufacturing \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=postgres \
            -p 5432:5432 postgres:14 2>/dev/null || docker start manufacturing-postgres 2>/dev/null
        # InfluxDB (machine time-series: temperature, vibration, power)
        docker run -d --name manufacturing-influxdb \
            -e DOCKER_INFLUXDB_INIT_MODE=setup \
            -e DOCKER_INFLUXDB_INIT_USERNAME=admin \
            -e DOCKER_INFLUXDB_INIT_PASSWORD=adminpass \
            -e DOCKER_INFLUXDB_INIT_ORG=manufacturing \
            -e DOCKER_INFLUXDB_INIT_BUCKET=machine-metrics \
            -p "$INFLUXDB_PORT:8086" influxdb:latest 2>/dev/null || docker start manufacturing-influxdb 2>/dev/null
        # Redis (production state, real-time metrics)
        docker run -d --name manufacturing-redis \
            -p 6379:6379 redis:alpine 2>/dev/null || docker start manufacturing-redis 2>/dev/null
        # RabbitMQ (order processing queue)
        docker run -d --name manufacturing-rabbitmq \
            -p 5672:5672 -p 15672:15672 \
            rabbitmq:management 2>/dev/null || docker start manufacturing-rabbitmq 2>/dev/null
        # MQTT Broker (machine/sensor communication)
        docker run -d --name manufacturing-mqtt \
            -p "$MQTT_PORT:1883" -p 9001:9001 \
            eclipse-mosquitto:latest 2>/dev/null || docker start manufacturing-mqtt 2>/dev/null
        sleep 5
        echo "✅ PostgreSQL running on port 5432"
        echo "✅ InfluxDB running on port $INFLUXDB_PORT"
        echo "✅ Redis running on port 6379"
        echo "✅ RabbitMQ running on port 5672 (management: 15672)"
        echo "✅ MQTT Broker running on port $MQTT_PORT"
    elif [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
        cd "$PROJECT_DIR" && docker compose up -d
        echo "✅ Databases started via docker-compose"
    else
        echo "⚠️  Docker not found. Please start databases manually."
        echo "   PostgreSQL: port 5432 | InfluxDB: port $INFLUXDB_PORT"
        echo "   Redis: port 6379 | RabbitMQ: port 5672 | MQTT: port $MQTT_PORT"
    fi
}

stop_databases() {
    echo "⏸  Stopping databases..."
    if command -v docker &>/dev/null; then
        if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
            cd "$PROJECT_DIR" && docker compose down
        else
            docker stop manufacturing-postgres manufacturing-influxdb manufacturing-redis \
                manufacturing-rabbitmq manufacturing-mqtt 2>/dev/null
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
    if ! grep -q '"start:dev"' package.json 2>/dev/null; then
        start_cmd="npm start"
    fi
    nohup $start_cmd > "$PROJECT_DIR/.backend.log" 2>&1 &
    echo $! > "$BACKEND_PID_FILE"
    echo "✅ Backend started (PID: $!)"
}

start_frontend() {
    echo "🌐 Starting frontend (React + Three.js on port $FRONTEND_PORT)..."
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
    echo "📊 Server Status - Smart Manufacturing System"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
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
        for db in manufacturing-postgres manufacturing-influxdb manufacturing-redis manufacturing-rabbitmq manufacturing-mqtt; do
            local st
            st=$(docker inspect -f '{{.State.Status}}' "$db" 2>/dev/null || echo "not found")
            echo "  $db: $([ "$st" = "running" ] && echo "✅ Running" || echo "❌ $st")"
        done
    fi
    echo ""
    echo "🌐 Access:"
    echo "  Dashboard   : http://localhost:$FRONTEND_PORT"
    echo "  API         : http://localhost:$BACKEND_PORT/api"
    echo "  InfluxDB UI : http://localhost:$INFLUXDB_PORT"
    echo "  RabbitMQ    : http://localhost:15672 (guest/guest)"
    echo "  MQTT Broker : mqtt://localhost:$MQTT_PORT"
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
        echo "⚠️  No migration script found."
        echo "   Please run SQL scripts in backend/migrations/ against PostgreSQL."
        echo "   InfluxDB bucket 'machine-metrics' is auto-created via Docker env vars."
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
        echo "⚠️  No test script found."
    fi
}

simulate_machine_data() {
    echo "🏭 Simulating machine sensor data..."
    local timestamp
    timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)

    # Simulate MQTT sensor messages
    if command -v mosquitto_pub &>/dev/null; then
        # Machine CNC-001 metrics
        mosquitto_pub -h localhost -p "$MQTT_PORT" -t "factory/machine/CNC-001/temperature" \
            -m "{\"value\": 72.3, \"unit\": \"C\", \"machine\": \"CNC-001\", \"timestamp\": \"$timestamp\"}"
        mosquitto_pub -h localhost -p "$MQTT_PORT" -t "factory/machine/CNC-001/vibration" \
            -m "{\"value\": 0.82, \"unit\": \"mm/s\", \"machine\": \"CNC-001\", \"timestamp\": \"$timestamp\"}"
        mosquitto_pub -h localhost -p "$MQTT_PORT" -t "factory/machine/CNC-001/power" \
            -m "{\"value\": 15400, \"unit\": \"W\", \"machine\": \"CNC-001\", \"timestamp\": \"$timestamp\"}"
        # Machine PRESS-002 metrics
        mosquitto_pub -h localhost -p "$MQTT_PORT" -t "factory/machine/PRESS-002/temperature" \
            -m "{\"value\": 85.1, \"unit\": \"C\", \"machine\": \"PRESS-002\", \"timestamp\": \"$timestamp\"}"
        mosquitto_pub -h localhost -p "$MQTT_PORT" -t "factory/machine/PRESS-002/pressure" \
            -m "{\"value\": 120, \"unit\": \"bar\", \"machine\": \"PRESS-002\", \"timestamp\": \"$timestamp\"}"
        echo "✅ Machine sensor data sent via MQTT"
    else
        echo "⚠️  mosquitto_pub not found. Install mosquitto-clients to simulate."
        echo ""
        echo "   Example sensor payloads:"
        echo "   Topic: factory/machine/CNC-001/temperature"
        echo "   Data : {value: 72.3, unit: 'C', machine: 'CNC-001'}"
        echo ""
        echo "   Topic: factory/machine/CNC-001/vibration"
        echo "   Data : {value: 0.82, unit: 'mm/s', machine: 'CNC-001'}"
        echo ""
        echo "   Topic: factory/machine/PRESS-002/pressure"
        echo "   Data : {value: 120, unit: 'bar', machine: 'PRESS-002'}"
    fi
}

view_oee_info() {
    echo ""
    echo "📊 OEE (Overall Equipment Effectiveness)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  OEE = Availability × Performance × Quality"
    echo ""
    echo "  📐 Formula:"
    echo "     Availability = (Run Time) / (Planned Production Time)"
    echo "     Performance  = (Ideal Cycle Time × Total Count) / Run Time"
    echo "     Quality      = (Good Count) / (Total Count)"
    echo ""
    echo "  🎯 World-class OEE = 85%+"
    echo "     Typical OEE     = 60%"
    echo ""
    echo "  📡 Metrics tracked in InfluxDB:"
    echo "     - machine.temperature  (°C)"
    echo "     - machine.vibration    (mm/s)"
    echo "     - machine.power        (W)"
    echo "     - machine.cycle_time   (s)"
    echo "     - production.count     (units)"
    echo "     - production.defects   (units)"
    echo ""
    echo "  🌐 InfluxDB UI: http://localhost:$INFLUXDB_PORT"
    echo "     Org: manufacturing | Bucket: machine-metrics"
    echo ""
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
        12) simulate_machine_data ;;
        13) view_oee_info ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
done
