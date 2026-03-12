#!/bin/bash

# Server Management Script - Project 17: Microservices E-Commerce Architecture
# Tech Stack: NestJS (multi-service) + GraphQL Gateway | PostgreSQL + MongoDB + Redis + RabbitMQ
# Services: API Gateway (3000), User (3001), Product (3002), Order (3003), Payment (3004), Notification (3005)

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GATEWAY_PORT=3000
USER_PORT=3001
PRODUCT_PORT=3002
ORDER_PORT=3003
PAYMENT_PORT=3004
NOTIFICATION_PORT=3005

declare -A SERVICE_PIDS
SERVICES=("api-gateway" "user-service" "product-service" "order-service" "payment-service" "notification-service")

show_menu() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║   Project 17: Microservices E-Commerce Architecture          ║"
    echo "║   Stack: NestJS × 6 services | PostgreSQL + MongoDB + Redis  ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "1.  Install All Dependencies"
    echo "2.  Start All (Docker Compose)"
    echo "3.  Stop All (Docker Compose)"
    echo "4.  Restart All (Docker Compose)"
    echo "5.  Status"
    echo "6.  Start Databases Only (Docker)"
    echo "7.  Stop Databases Only (Docker)"
    echo "8.  Start Individual Service"
    echo "9.  Stop Individual Service"
    echo "10. View Service Logs"
    echo "11. Run Tests"
    echo "12. View Architecture"
    echo "0.  Exit"
    echo ""
}

install_deps() {
    echo "📦 Installing dependencies for all services..."
    local dirs=("$PROJECT_DIR" "$PROJECT_DIR/api-gateway" "$PROJECT_DIR/services/user-service"
                "$PROJECT_DIR/services/product-service" "$PROJECT_DIR/services/order-service"
                "$PROJECT_DIR/services/payment-service" "$PROJECT_DIR/services/notification-service")
    for dir in "${dirs[@]}"; do
        if [ -f "$dir/package.json" ]; then
            echo "  → Installing in $dir..."
            cd "$dir" && npm install --silent
        fi
    done
    echo "✅ All dependencies installed"
}

start_all_docker() {
    echo "🚀 Starting all services via Docker Compose..."
    if command -v docker &>/dev/null; then
        if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
            cd "$PROJECT_DIR" && docker compose up -d
            sleep 5
            show_status
        else
            echo "⚠️  docker-compose.yml not found. Starting databases individually..."
            start_databases
        fi
    else
        echo "⚠️  Docker not found. Please install Docker to use this option."
    fi
}

stop_all_docker() {
    echo "⏸  Stopping all services..."
    if command -v docker &>/dev/null; then
        if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
            cd "$PROJECT_DIR" && docker compose down
        else
            stop_databases
            for svc in "${SERVICES[@]}"; do
                local pid_file="$PROJECT_DIR/.$svc.pid"
                if [ -f "$pid_file" ]; then
                    kill "$(cat "$pid_file")" 2>/dev/null
                    rm -f "$pid_file"
                fi
            done
        fi
        echo "✅ All services stopped"
    fi
}

start_databases() {
    echo "🗄️  Starting databases (Docker)..."
    if command -v docker &>/dev/null; then
        docker run -d --name microservices-postgres \
            -e POSTGRES_DB=microservices \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=postgres \
            -p 5432:5432 postgres:14 2>/dev/null || docker start microservices-postgres 2>/dev/null
        docker run -d --name microservices-mongo \
            -p 27017:27017 mongo:latest 2>/dev/null || docker start microservices-mongo 2>/dev/null
        docker run -d --name microservices-redis \
            -p 6379:6379 redis:alpine 2>/dev/null || docker start microservices-redis 2>/dev/null
        docker run -d --name microservices-rabbitmq \
            -p 5672:5672 -p 15672:15672 \
            rabbitmq:management 2>/dev/null || docker start microservices-rabbitmq 2>/dev/null
        sleep 5
        echo "✅ PostgreSQL running on port 5432"
        echo "✅ MongoDB running on port 27017"
        echo "✅ Redis running on port 6379"
        echo "✅ RabbitMQ running on port 5672 (management: 15672)"
    else
        echo "⚠️  Docker not found. Please start databases manually."
    fi
}

stop_databases() {
    echo "⏸  Stopping databases..."
    if command -v docker &>/dev/null; then
        docker stop microservices-postgres microservices-mongo microservices-redis microservices-rabbitmq 2>/dev/null
        echo "✅ Databases stopped"
    fi
}

start_service() {
    echo ""
    echo "Select service to start:"
    echo "  1. API Gateway   (port $GATEWAY_PORT)"
    echo "  2. User Service  (port $USER_PORT)"
    echo "  3. Product Service (port $PRODUCT_PORT)"
    echo "  4. Order Service (port $ORDER_PORT)"
    echo "  5. Payment Service (port $PAYMENT_PORT)"
    echo "  6. Notification Service (port $NOTIFICATION_PORT)"
    read -r -p "Choose: " svc_choice

    local svc_name="" svc_dir="" svc_port=0
    case $svc_choice in
        1) svc_name="api-gateway";        svc_dir="$PROJECT_DIR/api-gateway";                    svc_port=$GATEWAY_PORT ;;
        2) svc_name="user-service";       svc_dir="$PROJECT_DIR/services/user-service";          svc_port=$USER_PORT ;;
        3) svc_name="product-service";    svc_dir="$PROJECT_DIR/services/product-service";       svc_port=$PRODUCT_PORT ;;
        4) svc_name="order-service";      svc_dir="$PROJECT_DIR/services/order-service";         svc_port=$ORDER_PORT ;;
        5) svc_name="payment-service";    svc_dir="$PROJECT_DIR/services/payment-service";       svc_port=$PAYMENT_PORT ;;
        6) svc_name="notification-service"; svc_dir="$PROJECT_DIR/services/notification-service"; svc_port=$NOTIFICATION_PORT ;;
        *) echo "❌ Invalid option."; return ;;
    esac

    if [ ! -d "$svc_dir" ]; then
        echo "⚠️  Directory $svc_dir not found."
        return
    fi

    local pid_file="$PROJECT_DIR/.$svc_name.pid"
    cd "$svc_dir"
    local start_cmd="npm run start:dev"
    if ! grep -q '"start:dev"' package.json 2>/dev/null; then
        start_cmd="npm start"
    fi
    nohup $start_cmd > "$PROJECT_DIR/.$svc_name.log" 2>&1 &
    echo $! > "$pid_file"
    echo "✅ $svc_name started (PID: $!) → http://localhost:$svc_port"
}

stop_service() {
    echo ""
    echo "Select service to stop:"
    echo "  1. API Gateway"
    echo "  2. User Service"
    echo "  3. Product Service"
    echo "  4. Order Service"
    echo "  5. Payment Service"
    echo "  6. Notification Service"
    read -r -p "Choose: " svc_choice

    local svc_name=""
    case $svc_choice in
        1) svc_name="api-gateway" ;;
        2) svc_name="user-service" ;;
        3) svc_name="product-service" ;;
        4) svc_name="order-service" ;;
        5) svc_name="payment-service" ;;
        6) svc_name="notification-service" ;;
        *) echo "❌ Invalid option."; return ;;
    esac

    local pid_file="$PROJECT_DIR/.$svc_name.pid"
    if [ -f "$pid_file" ]; then
        kill "$(cat "$pid_file")" 2>/dev/null
        rm -f "$pid_file"
        echo "✅ $svc_name stopped"
    else
        echo "⚠️  $svc_name is not running (no PID file found)."
    fi
}

view_logs() {
    echo ""
    echo "Select service logs to view:"
    echo "  1. API Gateway"
    echo "  2. User Service"
    echo "  3. Product Service"
    echo "  4. Order Service"
    echo "  5. Payment Service"
    echo "  6. Notification Service"
    read -r -p "Choose: " svc_choice

    local svc_name=""
    case $svc_choice in
        1) svc_name="api-gateway" ;;
        2) svc_name="user-service" ;;
        3) svc_name="product-service" ;;
        4) svc_name="order-service" ;;
        5) svc_name="payment-service" ;;
        6) svc_name="notification-service" ;;
        *) echo "❌ Invalid option."; return ;;
    esac

    local log_file="$PROJECT_DIR/.$svc_name.log"
    echo "📝 $svc_name Logs (last 30 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "$log_file" ]; then
        tail -30 "$log_file"
    else
        echo "No logs found for $svc_name."
    fi
    echo ""
}

show_status() {
    echo ""
    echo "📊 Service Status - Microservices E-Commerce"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    # Check each service
    local -A ports
    ports["api-gateway"]=$GATEWAY_PORT
    ports["user-service"]=$USER_PORT
    ports["product-service"]=$PRODUCT_PORT
    ports["order-service"]=$ORDER_PORT
    ports["payment-service"]=$PAYMENT_PORT
    ports["notification-service"]=$NOTIFICATION_PORT

    for svc in "${SERVICES[@]}"; do
        local pid_file="$PROJECT_DIR/.$svc.pid"
        local port="${ports[$svc]}"
        if [ -f "$pid_file" ] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
            echo "  $svc: ✅ Running (PID: $(cat "$pid_file")) → port $port"
        else
            echo "  $svc: ❌ Not running"
        fi
    done
    echo ""
    # Docker databases
    if command -v docker &>/dev/null; then
        for db in microservices-postgres microservices-mongo microservices-redis microservices-rabbitmq; do
            local st
            st=$(docker inspect -f '{{.State.Status}}' "$db" 2>/dev/null || echo "not found")
            echo "  $db: $([ "$st" = "running" ] && echo "✅ Running" || echo "❌ $st")"
        done
    fi
    echo ""
    echo "🌐 Access:"
    echo "  GraphQL Gateway : http://localhost:$GATEWAY_PORT/graphql"
    echo "  RabbitMQ Admin  : http://localhost:15672 (guest/guest)"
    echo ""
}

run_tests() {
    echo "🧪 Running tests for all services..."
    local dirs=("$PROJECT_DIR/api-gateway" "$PROJECT_DIR/services/user-service"
                "$PROJECT_DIR/services/product-service" "$PROJECT_DIR/services/order-service"
                "$PROJECT_DIR/services/payment-service" "$PROJECT_DIR/services/notification-service")
    for dir in "${dirs[@]}"; do
        if [ -f "$dir/package.json" ] && grep -q '"test"' "$dir/package.json"; then
            echo "  → Testing $(basename "$dir")..."
            cd "$dir" && npm test -- --passWithNoTests 2>/dev/null
        fi
    done
    echo "✅ Tests completed"
}

view_architecture() {
    echo ""
    echo "🏗️  Microservices Architecture"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  ┌────────────────────────────────┐"
    echo "  │   API Gateway (GraphQL)        │ :$GATEWAY_PORT"
    echo "  └──────────────┬─────────────────┘"
    echo "        ↓        ↓        ↓        ↓"
    echo "  ┌──────┬────────┬──────────┬──────────┬──────────────┐"
    echo "  │ User │Product │  Order   │ Payment  │Notification  │"
    echo "  │:$USER_PORT  │ :$PRODUCT_PORT   │  :$ORDER_PORT     │  :$PAYMENT_PORT    │    :$NOTIFICATION_PORT        │"
    echo "  └──────┴────────┴──────────┴──────────┴──────────────┘"
    echo "     │      │        │          │             │"
    echo "   PgSQL  Mongo    PgSQL       PgSQL        Redis"
    echo ""
    echo "  📨 Message Bus: RabbitMQ (port 5672)"
    echo ""
}

restart_all() {
    echo "🔄 Restarting all services..."
    stop_all_docker
    sleep 3
    start_all_docker
}

while true; do
    show_menu
    read -r -p "Choose an option: " choice

    case $choice in
        1)  install_deps ;;
        2)  start_all_docker ;;
        3)  stop_all_docker ;;
        4)  restart_all ;;
        5)  show_status ;;
        6)  start_databases ;;
        7)  stop_databases ;;
        8)  start_service ;;
        9)  stop_service ;;
        10) view_logs ;;
        11) run_tests ;;
        12) view_architecture ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
done
