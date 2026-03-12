#!/bin/bash

# Server Management Script - Project 19: Supply Chain & Logistics Management
# Tech Stack: NestJS + GraphQL + React + Mapbox | PostgreSQL + PostGIS + Elasticsearch + Redis | Socket.IO + RabbitMQ

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=4000
FRONTEND_PORT=3000
ELASTICSEARCH_PORT=9200
BACKEND_PID_FILE="$PROJECT_DIR/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend.pid"

show_menu() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║   Project 19: Supply Chain & Logistics Management                 ║"
    echo "║   Stack: NestJS + GraphQL | PostgreSQL + PostGIS + Elasticsearch  ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
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
    echo "12. Simulate Shipment Tracking"
    echo "13. Check Elasticsearch Index"
    echo "0.  Exit"
    echo ""
}

install_deps() {
    echo "📦 Installing dependencies..."
    if [ -f "$PROJECT_DIR/package.json" ]; then
        cd "$PROJECT_DIR" && npm install
    fi
    if [ -f "$PROJECT_DIR/backend/package.json" ]; then
        echo "  → Backend (NestJS + GraphQL) dependencies..."
        cd "$PROJECT_DIR/backend" && npm install
    fi
    if [ -f "$PROJECT_DIR/frontend/package.json" ]; then
        echo "  → Frontend (React + Mapbox) dependencies..."
        cd "$PROJECT_DIR/frontend" && npm install
    fi
    echo "✅ Dependencies installed"
}

start_databases() {
    echo "🗄️  Starting databases (Docker)..."
    if command -v docker &>/dev/null; then
        # PostgreSQL with PostGIS (geospatial queries)
        docker run -d --name supplychain-postgres \
            -e POSTGRES_DB=supplychain \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=postgres \
            -p 5432:5432 postgis/postgis:14-3.3 2>/dev/null || docker start supplychain-postgres 2>/dev/null
        # Elasticsearch (shipment search)
        docker run -d --name supplychain-elasticsearch \
            -e "discovery.type=single-node" \
            -e "xpack.security.enabled=false" \
            -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
            -p "$ELASTICSEARCH_PORT:9200" -p 9300:9300 \
            elasticsearch:8.10.0 2>/dev/null || docker start supplychain-elasticsearch 2>/dev/null
        # Redis (tracking state, ETA predictions)
        docker run -d --name supplychain-redis \
            -p 6379:6379 redis:alpine 2>/dev/null || docker start supplychain-redis 2>/dev/null
        # RabbitMQ (shipment events)
        docker run -d --name supplychain-rabbitmq \
            -p 5672:5672 -p 15672:15672 \
            rabbitmq:management 2>/dev/null || docker start supplychain-rabbitmq 2>/dev/null
        sleep 10
        echo "✅ PostgreSQL + PostGIS running on port 5432"
        echo "✅ Elasticsearch running on port $ELASTICSEARCH_PORT (may take ~30s)"
        echo "✅ Redis running on port 6379"
        echo "✅ RabbitMQ running on port 5672 (management: 15672)"
        echo ""
        echo "📋 PostGIS setup (run after PostgreSQL starts):"
        echo "   CREATE EXTENSION IF NOT EXISTS postgis;"
        echo "   CREATE EXTENSION IF NOT EXISTS postgis_topology;"
    elif [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
        cd "$PROJECT_DIR" && docker compose up -d
        echo "✅ Databases started via docker-compose"
    else
        echo "⚠️  Docker not found. Please start databases manually."
        echo "   PostgreSQL+PostGIS: port 5432 | Elasticsearch: port $ELASTICSEARCH_PORT"
        echo "   Redis: port 6379 | RabbitMQ: port 5672"
    fi
}

stop_databases() {
    echo "⏸  Stopping databases..."
    if command -v docker &>/dev/null; then
        if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
            cd "$PROJECT_DIR" && docker compose down
        else
            docker stop supplychain-postgres supplychain-elasticsearch \
                supplychain-redis supplychain-rabbitmq 2>/dev/null
        fi
        echo "✅ Databases stopped"
    else
        echo "⚠️  Docker not found."
    fi
}

start_backend() {
    echo "🚀 Starting backend (NestJS + GraphQL on port $BACKEND_PORT)..."
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
    echo "🌐 Starting frontend (React + Mapbox on port $FRONTEND_PORT)..."
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
    echo "📊 Server Status - Supply Chain & Logistics"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
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
        for db in supplychain-postgres supplychain-elasticsearch supplychain-redis supplychain-rabbitmq; do
            local st
            st=$(docker inspect -f '{{.State.Status}}' "$db" 2>/dev/null || echo "not found")
            echo "  $db: $([ "$st" = "running" ] && echo "✅ Running" || echo "❌ $st")"
        done
    fi
    echo ""
    echo "🌐 Access:"
    echo "  Dashboard     : http://localhost:$FRONTEND_PORT"
    echo "  GraphQL API   : http://localhost:$BACKEND_PORT/graphql"
    echo "  Elasticsearch : http://localhost:$ELASTICSEARCH_PORT"
    echo "  RabbitMQ UI   : http://localhost:15672 (guest/guest)"
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
        echo ""
        echo "   Manual PostGIS setup:"
        echo "   psql -h localhost -U postgres -d supplychain -c 'CREATE EXTENSION IF NOT EXISTS postgis;'"
        echo "   psql -h localhost -U postgres -d supplychain -c 'CREATE EXTENSION IF NOT EXISTS postgis_topology;'"
        echo ""
        echo "   Example geospatial schema:"
        echo "   CREATE TABLE warehouses ("
        echo "     id SERIAL PRIMARY KEY,"
        echo "     name VARCHAR(100),"
        echo "     location GEOGRAPHY(POINT, 4326)  -- longitude, latitude"
        echo "   );"
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

simulate_tracking() {
    echo "🚚 Simulating shipment GPS tracking updates..."
    echo ""
    # Sample shipment locations (Jakarta → Surabaya route)
    declare -a lats=("-6.2088" "-6.9175" "-7.2575" "-7.5361")
    declare -a lons=("106.8456" "107.6191" "108.4833" "112.2384")
    declare -a cities=("Jakarta" "Bandung" "Purwokerto" "Surabaya")
    local timestamp
    timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)

    echo "   Shipment SHP-2024-001 (Jakarta → Surabaya):"
    for i in 0 1 2 3; do
        echo "   📍 ${cities[$i]}: lat=${lats[$i]}, lon=${lons[$i]}"
    done
    echo ""
    echo "   Current position (simulated):"
    echo "   📍 Location: ${cities[1]}, lat=${lats[1]}, lon=${lons[1]}"
    echo "   🕐 Timestamp: $timestamp"
    echo "   📦 Status: IN_TRANSIT"
    echo "   🚛 ETA: $(date -u -d '+4 hours' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo ""
    echo "   To send real GPS update via Socket.IO:"
    echo "   socket.emit('tracking:update', {"
    echo "     shipmentId: 'SHP-2024-001',"
    echo "     lat: ${lats[1]}, lng: ${lons[1]},"
    echo "     status: 'IN_TRANSIT'"
    echo "   });"
    echo ""
}

check_elasticsearch() {
    echo "🔍 Checking Elasticsearch status..."
    if command -v curl &>/dev/null; then
        echo ""
        # Check cluster health
        local health
        health=$(curl -s "http://localhost:$ELASTICSEARCH_PORT/_cluster/health" 2>/dev/null)
        if [ -n "$health" ]; then
            echo "✅ Elasticsearch is responding:"
            echo "$health" | python3 -m json.tool 2>/dev/null || echo "$health"
        else
            echo "❌ Elasticsearch is not responding at port $ELASTICSEARCH_PORT"
            echo "   Make sure Elasticsearch container is running."
        fi
        echo ""
        # Check shipments index
        local index_status
        index_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$ELASTICSEARCH_PORT/shipments" 2>/dev/null)
        if [ "$index_status" = "200" ]; then
            echo "✅ Shipments index exists"
        else
            echo "⚠️  Shipments index not found (will be created on first data insert)"
        fi
    else
        echo "⚠️  curl not found. Cannot check Elasticsearch."
        echo "   Access manually at: http://localhost:$ELASTICSEARCH_PORT"
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
        12) simulate_tracking ;;
        13) check_elasticsearch ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
done
