#!/bin/bash

# Server Management Script - Project 20: Energy & Resource Management System
# Tech Stack: Express.js + React + D3.js | PostgreSQL + TimescaleDB + MongoDB | Python ML + MQTT + Socket.IO

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=4000
FRONTEND_PORT=3000
ML_SERVICE_PORT=5001
MONGODB_PORT=27017
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
    echo "1.  Install Dependencies (Node.js + Python)"
    echo "2.  Start All Servers"
    echo "3.  Stop All Servers"
    echo "4.  Restart All Servers"
    echo "5.  Status"
    echo "6.  Start Databases (Docker)"
    echo "7.  Stop Databases (Docker)"
    echo "8.  View Backend Logs"
    echo "9.  View Frontend Logs"
    echo "10. View ML Service Logs"
    echo "11. Run DB Migrations"
    echo "12. Run Tests"
    echo "13. Simulate Energy Sensor Data"
    echo "14. Generate ML Forecast"
    echo "15. View Sustainability Report"
    echo "0.  Exit"
    echo ""
}

install_deps() {
    echo "📦 Installing Node.js dependencies..."
    if [ -f "$PROJECT_DIR/package.json" ]; then
        cd "$PROJECT_DIR" && npm install
    fi
    if [ -f "$PROJECT_DIR/backend/package.json" ]; then
        echo "  → Backend (Express.js) dependencies..."
        cd "$PROJECT_DIR/backend" && npm install
    fi
    if [ -f "$PROJECT_DIR/frontend/package.json" ]; then
        echo "  → Frontend (React + D3.js) dependencies..."
        cd "$PROJECT_DIR/frontend" && npm install
    fi
    echo ""
    echo "🐍 Installing Python ML dependencies..."
    local ml_dir="$PROJECT_DIR/ml-service"
    if [ -d "$ml_dir" ] && [ -f "$ml_dir/requirements.txt" ]; then
        cd "$ml_dir"
        if command -v python3 &>/dev/null; then
            python3 -m pip install -r requirements.txt --quiet
            echo "✅ Python ML dependencies installed"
        else
            echo "⚠️  Python3 not found. Install Python 3.8+ to use ML features."
        fi
    elif command -v pip3 &>/dev/null; then
        echo "  → Installing ML packages (pandas, scikit-learn, flask)..."
        pip3 install pandas scikit-learn flask tensorflow --quiet 2>/dev/null || \
        pip3 install pandas scikit-learn flask --quiet
        echo "✅ Python ML dependencies installed"
    else
        echo "⚠️  pip3 not found. Install Python 3 + pip to use ML features."
    fi
    echo ""
    echo "✅ All dependencies installed"
}

start_databases() {
    echo "🗄️  Starting databases (Docker)..."
    if command -v docker &>/dev/null; then
        # PostgreSQL with TimescaleDB (time-series energy data)
        docker run -d --name energy-timescaledb \
            -e POSTGRES_DB=energy \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=postgres \
            -p 5432:5432 timescale/timescaledb:latest-pg14 2>/dev/null || docker start energy-timescaledb 2>/dev/null
        # MongoDB (raw sensor data lake)
        docker run -d --name energy-mongo \
            -p "$MONGODB_PORT:27017" mongo:latest 2>/dev/null || docker start energy-mongo 2>/dev/null
        # Redis (real-time aggregates, predictions cache)
        docker run -d --name energy-redis \
            -p 6379:6379 redis:alpine 2>/dev/null || docker start energy-redis 2>/dev/null
        # MQTT Broker (IoT sensor communication)
        docker run -d --name energy-mqtt \
            -p 1883:1883 -p 9001:9001 \
            eclipse-mosquitto:latest 2>/dev/null || docker start energy-mqtt 2>/dev/null
        sleep 5
        echo "✅ PostgreSQL + TimescaleDB running on port 5432"
        echo "✅ MongoDB running on port $MONGODB_PORT"
        echo "✅ Redis running on port 6379"
        echo "✅ MQTT Broker running on port 1883"
    elif [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
        cd "$PROJECT_DIR" && docker compose up -d
        echo "✅ Databases started via docker-compose"
    else
        echo "⚠️  Docker not found. Please start databases manually."
        echo "   TimescaleDB: port 5432 | MongoDB: port $MONGODB_PORT"
        echo "   Redis: port 6379 | MQTT: port 1883"
    fi
}

stop_databases() {
    echo "⏸  Stopping databases..."
    if command -v docker &>/dev/null; then
        if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
            cd "$PROJECT_DIR" && docker compose down
        else
            docker stop energy-timescaledb energy-mongo energy-redis energy-mqtt 2>/dev/null
        fi
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
    local start_cmd="npm run dev"
    if ! grep -q '"dev"' package.json 2>/dev/null; then
        start_cmd="npm start"
    fi
    nohup $start_cmd > "$PROJECT_DIR/.backend.log" 2>&1 &
    echo $! > "$BACKEND_PID_FILE"
    echo "✅ Backend started (PID: $!)"
}

start_frontend() {
    echo "🌐 Starting frontend (React + D3.js on port $FRONTEND_PORT)..."
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

start_ml_service() {
    echo "🤖 Starting Python ML service on port $ML_SERVICE_PORT..."
    local ml_dir="$PROJECT_DIR/ml-service"
    local ml_script=""

    if [ -f "$ml_dir/app.py" ]; then
        ml_script="$ml_dir/app.py"
    elif [ -f "$ml_dir/ml_service.py" ]; then
        ml_script="$ml_dir/ml_service.py"
    elif [ -f "$PROJECT_DIR/ml_service.py" ]; then
        ml_script="$PROJECT_DIR/ml_service.py"
    fi

    if [ -n "$ml_script" ] && command -v python3 &>/dev/null; then
        cd "$(dirname "$ml_script")"
        nohup python3 "$(basename "$ml_script")" > "$PROJECT_DIR/.ml-service.log" 2>&1 &
        echo $! > "$ML_PID_FILE"
        echo "✅ ML service started (PID: $!)"
    else
        echo "⚠️  ML service script not found or Python3 not available."
        echo "   Expected: $ml_dir/app.py or ml_service.py"
    fi
}

start_servers() {
    echo "🚀 Starting all servers..."
    start_backend
    start_frontend
    start_ml_service
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
    if [ -f "$ML_PID_FILE" ]; then
        kill "$(cat "$ML_PID_FILE")" 2>/dev/null
        rm -f "$ML_PID_FILE"
        echo "✅ ML service stopped"
    fi
    pkill -f "node.*server" 2>/dev/null
    pkill -f "react-scripts start" 2>/dev/null
    pkill -f "python.*ml_service" 2>/dev/null
    echo "✅ All servers stopped"
}

show_status() {
    echo ""
    echo "📊 Server Status - Energy Management System"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "$BACKEND_PID_FILE" ] && kill -0 "$(cat "$BACKEND_PID_FILE")" 2>/dev/null; then
        echo "  Backend    : ✅ Running (PID: $(cat "$BACKEND_PID_FILE")) → http://localhost:$BACKEND_PORT"
    else
        echo "  Backend    : ❌ Not running"
    fi
    if [ -f "$FRONTEND_PID_FILE" ] && kill -0 "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null; then
        echo "  Frontend   : ✅ Running (PID: $(cat "$FRONTEND_PID_FILE")) → http://localhost:$FRONTEND_PORT"
    else
        echo "  Frontend   : ❌ Not running"
    fi
    if [ -f "$ML_PID_FILE" ] && kill -0 "$(cat "$ML_PID_FILE")" 2>/dev/null; then
        echo "  ML Service : ✅ Running (PID: $(cat "$ML_PID_FILE")) → http://localhost:$ML_SERVICE_PORT"
    else
        echo "  ML Service : ❌ Not running (optional)"
    fi
    if command -v docker &>/dev/null; then
        for db in energy-timescaledb energy-mongo energy-redis energy-mqtt; do
            local st
            st=$(docker inspect -f '{{.State.Status}}' "$db" 2>/dev/null || echo "not found")
            echo "  $db: $([ "$st" = "running" ] && echo "✅ Running" || echo "❌ $st")"
        done
    fi
    echo ""
    echo "🌐 Access:"
    echo "  Dashboard   : http://localhost:$FRONTEND_PORT"
    echo "  API         : http://localhost:$BACKEND_PORT/api"
    echo "  ML Service  : http://localhost:$ML_SERVICE_PORT/predict"
    echo "  MQTT Broker : mqtt://localhost:1883"
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

view_ml_logs() {
    echo "🤖 ML Service Logs (last 30 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "$PROJECT_DIR/.ml-service.log" ]; then
        tail -30 "$PROJECT_DIR/.ml-service.log"
    else
        echo "No ML service logs found."
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
        echo ""
        echo "   Manual TimescaleDB setup:"
        echo "   psql -h localhost -U postgres -d energy -c \"CREATE EXTENSION IF NOT EXISTS timescaledb;\""
        echo ""
        echo "   Create hypertable for time-series energy data:"
        echo "   CREATE TABLE energy_consumption ("
        echo "     time        TIMESTAMPTZ NOT NULL,"
        echo "     building_id INT,"
        echo "     sensor_id   VARCHAR(50),"
        echo "     kwh         FLOAT,"
        echo "     cost        FLOAT"
        echo "   );"
        echo "   SELECT create_hypertable('energy_consumption', 'time');"
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
    # Python tests
    if command -v python3 &>/dev/null && [ -f "$PROJECT_DIR/ml-service/test_model.py" ]; then
        echo "🐍 Running Python ML tests..."
        cd "$PROJECT_DIR/ml-service" && python3 -m pytest test_model.py -v 2>/dev/null || \
            python3 test_model.py
    fi
}

simulate_energy_data() {
    echo "⚡ Simulating energy sensor data..."
    local timestamp
    timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)

    if command -v mosquitto_pub &>/dev/null; then
        # Building A - Main consumption
        mosquitto_pub -h localhost -p 1883 -t "energy/building-A/meter-main" \
            -m "{\"kwh\": 125.4, \"power_kw\": 45.2, \"voltage\": 220, \"building\": \"A\", \"timestamp\": \"$timestamp\"}"
        # Building B - HVAC
        mosquitto_pub -h localhost -p 1883 -t "energy/building-B/hvac" \
            -m "{\"kwh\": 78.9, \"power_kw\": 28.1, \"temperature_set\": 22, \"building\": \"B\", \"timestamp\": \"$timestamp\"}"
        # Solar panel generation
        mosquitto_pub -h localhost -p 1883 -t "energy/solar/panel-1" \
            -m "{\"kwh_generated\": 12.3, \"efficiency\": 0.87, \"irradiance\": 850, \"timestamp\": \"$timestamp\"}"
        echo "✅ Energy sensor data sent via MQTT"
    else
        echo "⚠️  mosquitto_pub not found. Install mosquitto-clients to simulate."
        echo ""
        echo "   Example payloads:"
        echo "   Topic: energy/building-A/meter-main"
        echo "   Data : {kwh: 125.4, power_kw: 45.2, voltage: 220}"
        echo ""
        echo "   Topic: energy/solar/panel-1"
        echo "   Data : {kwh_generated: 12.3, efficiency: 0.87}"
    fi
}

generate_forecast() {
    echo "🤖 Generating energy consumption forecast..."
    if command -v curl &>/dev/null; then
        local response
        response=$(curl -s -X POST "http://localhost:$ML_SERVICE_PORT/predict" \
            -H "Content-Type: application/json" \
            -d '{"building_id": 1, "hours_ahead": 24}' 2>/dev/null)
        if [ -n "$response" ]; then
            echo "✅ Forecast generated:"
            echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
        else
            echo "⚠️  ML service not responding at port $ML_SERVICE_PORT"
            echo "   Make sure the Python ML service is running (option 2 starts it)."
            echo ""
            echo "   Example forecast request:"
            echo "   POST http://localhost:$ML_SERVICE_PORT/predict"
            echo "   Body: {\"building_id\": 1, \"hours_ahead\": 24}"
        fi
    else
        echo "⚠️  curl not found."
        echo "   Access ML service at: http://localhost:$ML_SERVICE_PORT/predict"
    fi
}

view_sustainability_report() {
    echo ""
    echo "🌱 Sustainability Report"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  📊 Metrics tracked:"
    echo "     - Total energy consumed (kWh)"
    echo "     - Energy cost (IDR/USD)"
    echo "     - Carbon footprint (kg CO₂)"
    echo "     - Renewable energy percentage (%)"
    echo "     - Energy efficiency index"
    echo ""
    echo "  ♻️  Renewable sources:"
    echo "     - Solar panels"
    echo "     - Wind turbines"
    echo "     - Hydro power"
    echo ""
    echo "  📐 Carbon footprint formula:"
    echo "     CO₂ (kg) = Energy (kWh) × Emission Factor (0.87 kg/kWh for Indonesia)"
    echo ""
    echo "  🎯 Sustainability targets:"
    echo "     - Reduce consumption by 15% vs baseline"
    echo "     - Achieve 30% renewable energy mix"
    echo "     - Carbon neutral by 2030"
    echo ""
    echo "  📡 TimescaleDB query example (last 7 days):"
    echo "     SELECT time_bucket('1 day', time) AS day,"
    echo "            SUM(kwh) AS total_kwh,"
    echo "            SUM(kwh * 0.87) AS co2_kg"
    echo "     FROM energy_consumption"
    echo "     WHERE time > NOW() - INTERVAL '7 days'"
    echo "     GROUP BY day ORDER BY day DESC;"
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
        10) view_ml_logs ;;
        11) run_migrations ;;
        12) run_tests ;;
        13) simulate_energy_data ;;
        14) generate_forecast ;;
        15) view_sustainability_report ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
done
