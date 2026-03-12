#!/bin/bash

# Server Management Script - Project 17: Microservices E-Commerce Architecture
# Tech Stack: NestJS (multi-service) + GraphQL Gateway | PostgreSQL + MongoDB + Redis + RabbitMQ
# Services: API Gateway, User, Product, Order, Payment, Notification

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$PROJECT_DIR/.env"

# Load .env if it exists
[ -f "$ENV_FILE" ] && source "$ENV_FILE"

# Port defaults (override via .env)
GATEWAY_PORT="${GATEWAY_PORT:-3000}"
USER_PORT="${USER_PORT:-3001}"
PRODUCT_PORT="${PRODUCT_PORT:-3002}"
ORDER_PORT="${ORDER_PORT:-3003}"
PAYMENT_PORT="${PAYMENT_PORT:-3004}"
NOTIFICATION_PORT="${NOTIFICATION_PORT:-3005}"

SERVICES=("api-gateway" "user-service" "product-service" "order-service" "payment-service" "notification-service")

show_menu() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║   Project 17: Microservices E-Commerce Architecture          ║"
    echo "║   Stack: NestJS × 6 services | PostgreSQL + MongoDB + Redis  ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
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
            docker run -d --name microservices-postgres -e POSTGRES_DB=microservices -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:14 2>/dev/null || docker start microservices-postgres 2>/dev/null
            docker run -d --name microservices-mongo -p 27017:27017 mongo:latest 2>/dev/null || docker start microservices-mongo 2>/dev/null
            docker run -d --name microservices-redis -p 6379:6379 redis:alpine 2>/dev/null || docker start microservices-redis 2>/dev/null
            docker run -d --name microservices-rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management 2>/dev/null || docker start microservices-rabbitmq 2>/dev/null
        fi
        sleep 3
        echo "✅ Databases started"
    else
        echo "⚠️  Docker not found. Please start databases manually."
    fi
}

start_service() {
    local svc_name=$1 svc_dir=$2 svc_port=$3
    local pid_file="$PROJECT_DIR/.$svc_name.pid"
    [ -f "$pid_file" ] && kill -0 "$(cat "$pid_file")" 2>/dev/null && echo "  ⚠️  $svc_name already running" && return 0
    [ ! -d "$svc_dir" ] && echo "  ⚠️  $svc_dir not found." && return 1
    echo "  → Starting $svc_name on port $svc_port..."
    cd "$svc_dir"
    local start_cmd="npm run start:dev"
    grep -q '"start:dev"' package.json 2>/dev/null || start_cmd="npm start"
    PORT=$svc_port nohup $start_cmd > "$PROJECT_DIR/.$svc_name.log" 2>&1 &
    echo $! > "$pid_file"
    echo "  ✅ $svc_name started (PID: $!)"
}

start_server() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    GATEWAY_PORT="${GATEWAY_PORT:-3000}"; USER_PORT="${USER_PORT:-3001}"; PRODUCT_PORT="${PRODUCT_PORT:-3002}"
    ORDER_PORT="${ORDER_PORT:-3003}"; PAYMENT_PORT="${PAYMENT_PORT:-3004}"; NOTIFICATION_PORT="${NOTIFICATION_PORT:-3005}"

    echo "🚀 Starting all microservices..."
    start_service "api-gateway"          "$PROJECT_DIR/api-gateway"                     "$GATEWAY_PORT"
    start_service "user-service"         "$PROJECT_DIR/services/user-service"           "$USER_PORT"
    start_service "product-service"      "$PROJECT_DIR/services/product-service"        "$PRODUCT_PORT"
    start_service "order-service"        "$PROJECT_DIR/services/order-service"          "$ORDER_PORT"
    start_service "payment-service"      "$PROJECT_DIR/services/payment-service"        "$PAYMENT_PORT"
    start_service "notification-service" "$PROJECT_DIR/services/notification-service"   "$NOTIFICATION_PORT"
    sleep 3
    echo ""
    echo "🌐 Access:"
    echo "  GraphQL Gateway   : http://localhost:$GATEWAY_PORT/graphql"
    echo "  RabbitMQ Admin    : http://localhost:15672 (guest/guest)"
}

stop_server() {
    echo "⏸  Stopping all microservices..."
    if [ -f "$PROJECT_DIR/docker-compose.yml" ] && command -v docker &>/dev/null; then
        cd "$PROJECT_DIR" && docker compose down
    fi
    for svc in "${SERVICES[@]}"; do
        local pid_file="$PROJECT_DIR/.$svc.pid"
        if [ -f "$pid_file" ]; then
            kill "$(cat "$pid_file")" 2>/dev/null
            rm -f "$pid_file"
            echo "  ✅ $svc stopped"
        fi
    done
    echo "✅ All services stopped"
}

show_status() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    GATEWAY_PORT="${GATEWAY_PORT:-3000}"; USER_PORT="${USER_PORT:-3001}"; PRODUCT_PORT="${PRODUCT_PORT:-3002}"
    ORDER_PORT="${ORDER_PORT:-3003}"; PAYMENT_PORT="${PAYMENT_PORT:-3004}"; NOTIFICATION_PORT="${NOTIFICATION_PORT:-3005}"

    declare -A ports
    ports["api-gateway"]=$GATEWAY_PORT; ports["user-service"]=$USER_PORT; ports["product-service"]=$PRODUCT_PORT
    ports["order-service"]=$ORDER_PORT; ports["payment-service"]=$PAYMENT_PORT; ports["notification-service"]=$NOTIFICATION_PORT

    echo ""; echo "📊 Microservices Status"; echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    for svc in "${SERVICES[@]}"; do
        local pid_file="$PROJECT_DIR/.$svc.pid"; local port="${ports[$svc]}"
        if [ -f "$pid_file" ] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
            echo "  $svc: ✅ Running (PID: $(cat "$pid_file")) → port $port"
        else
            echo "  $svc: ❌ Not running (port $port)"
        fi
    done
    if command -v docker &>/dev/null; then
        echo ""
        for db in microservices-postgres microservices-mongo microservices-redis microservices-rabbitmq; do
            local st; st=$(docker inspect -f '{{.State.Status}}' "$db" 2>/dev/null || echo "not found")
            echo "  $db: $([ "$st" = "running" ] && echo "✅ Running" || echo "❌ $st")"
        done
    fi
    echo ""; echo "🌐 GraphQL Gateway: http://localhost:$GATEWAY_PORT/graphql"; echo ""
}

edit_ports() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    GATEWAY_PORT="${GATEWAY_PORT:-3000}"; USER_PORT="${USER_PORT:-3001}"; PRODUCT_PORT="${PRODUCT_PORT:-3002}"
    ORDER_PORT="${ORDER_PORT:-3003}"; PAYMENT_PORT="${PAYMENT_PORT:-3004}"; NOTIFICATION_PORT="${NOTIFICATION_PORT:-3005}"

    echo ""; echo "⚙️  Edit Ports - Microservices"; echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Press Enter to keep the current value shown in [brackets]."; echo ""

    read -r -p "  API Gateway       GATEWAY_PORT      [$GATEWAY_PORT]: " input; GATEWAY_PORT="${input:-$GATEWAY_PORT}"
    read -r -p "  User Service      USER_PORT         [$USER_PORT]: " input; USER_PORT="${input:-$USER_PORT}"
    read -r -p "  Product Service   PRODUCT_PORT      [$PRODUCT_PORT]: " input; PRODUCT_PORT="${input:-$PRODUCT_PORT}"
    read -r -p "  Order Service     ORDER_PORT        [$ORDER_PORT]: " input; ORDER_PORT="${input:-$ORDER_PORT}"
    read -r -p "  Payment Service   PAYMENT_PORT      [$PAYMENT_PORT]: " input; PAYMENT_PORT="${input:-$PAYMENT_PORT}"
    read -r -p "  Notification Svc  NOTIFICATION_PORT [$NOTIFICATION_PORT]: " input; NOTIFICATION_PORT="${input:-$NOTIFICATION_PORT}"

    cat > "$ENV_FILE" <<EOF
# Microservices - Port Configuration
GATEWAY_PORT=$GATEWAY_PORT
USER_PORT=$USER_PORT
PRODUCT_PORT=$PRODUCT_PORT
ORDER_PORT=$ORDER_PORT
PAYMENT_PORT=$PAYMENT_PORT
NOTIFICATION_PORT=$NOTIFICATION_PORT
EOF
    echo ""; echo "✅ Ports saved to .env"
    echo "   GATEWAY=$GATEWAY_PORT  USER=$USER_PORT  PRODUCT=$PRODUCT_PORT"
    echo "   ORDER=$ORDER_PORT  PAYMENT=$PAYMENT_PORT  NOTIFICATION=$NOTIFICATION_PORT"; echo ""
}

install_build_start() {
    echo "📦 Installing dependencies for all services..."
    local dirs=("$PROJECT_DIR" "$PROJECT_DIR/api-gateway" "$PROJECT_DIR/services/user-service"
                "$PROJECT_DIR/services/product-service" "$PROJECT_DIR/services/order-service"
                "$PROJECT_DIR/services/payment-service" "$PROJECT_DIR/services/notification-service")
    for dir in "${dirs[@]}"; do
        [ -f "$dir/package.json" ] && echo "  → $(basename "$dir")..." && cd "$dir" && npm install --silent
    done
    echo "✅ All dependencies installed"
    echo "🏗️  Building services..."
    for dir in "${dirs[@]}"; do
        if [ -f "$dir/package.json" ] && grep -q '"build"' "$dir/package.json"; then
            echo "  → Building $(basename "$dir")..."
            cd "$dir" && npm run build 2>/dev/null || true
        fi
    done
    echo "✅ Build complete"
    echo ""
    start_databases
    sleep 5
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
