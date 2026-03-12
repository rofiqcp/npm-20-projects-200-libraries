#!/bin/bash

# Server Management Script - Social Media Feed (Project 11)
# Stack: React + Express.js + Apollo GraphQL + PostgreSQL + Socket.IO

PROJECT_NAME="Social Media Feed"
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
BACKEND_PORT=4000
FRONTEND_PORT=3000
PID_FILE="/tmp/social-feed.pids"

show_menu() {
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║  Social Media Feed - Server Management ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    echo "1. Start All Servers"
    echo "2. Stop All Servers"
    echo "3. Status"
    echo "4. View Backend Logs"
    echo "5. View Frontend Logs"
    echo "6. Restart All Servers"
    echo "7. Install Dependencies"
    echo "8. Setup Database (PostgreSQL)"
    echo "9. Check PostgreSQL"
    echo "0. Exit"
    echo ""
}

check_postgresql() {
    echo "🗄️  Checking PostgreSQL..."
    if command -v psql &>/dev/null; then
        if pg_isready &>/dev/null; then
            echo "✅ PostgreSQL is running"
        else
            echo "⚠️  PostgreSQL is not running. Starting..."
            sudo systemctl start postgresql 2>/dev/null || \
            pg_ctl start 2>/dev/null || \
            echo "⚠️  Could not start PostgreSQL. Please start it manually."
        fi
    else
        echo "⚠️  PostgreSQL not found. Please install PostgreSQL first."
    fi
}

setup_database() {
    echo "🗄️  Setting up PostgreSQL database..."
    check_postgresql
    if [ -f "$BACKEND_DIR/db/schema.sql" ]; then
        echo "📋 Running schema from $BACKEND_DIR/db/schema.sql..."
        psql -U postgres -f "$BACKEND_DIR/db/schema.sql" 2>/dev/null || \
        echo "⚠️  Could not run schema. Check database credentials in .env"
    elif [ -f "db/schema.sql" ]; then
        echo "📋 Running schema from db/schema.sql..."
        psql -U postgres -f "db/schema.sql" 2>/dev/null || \
        echo "⚠️  Could not run schema. Check database credentials in .env"
    else
        echo "ℹ️  No schema.sql found. Please create the database manually."
    fi
    echo "✅ Database setup complete"
}

install_dependencies() {
    echo "📦 Installing dependencies..."
    if [ -f "package.json" ]; then
        npm install
    fi
    if [ -d "$BACKEND_DIR" ] && [ -f "$BACKEND_DIR/package.json" ]; then
        echo "📦 Installing backend dependencies..."
        (cd "$BACKEND_DIR" && npm install)
    fi
    if [ -d "$FRONTEND_DIR" ] && [ -f "$FRONTEND_DIR/package.json" ]; then
        echo "📦 Installing frontend dependencies..."
        (cd "$FRONTEND_DIR" && npm install)
    fi
    echo "✅ Dependencies installed"
}

start_servers() {
    echo "🚀 Starting $PROJECT_NAME servers..."

    check_postgresql

    # Start backend (Express + Apollo GraphQL + Socket.IO)
    if [ -d "$BACKEND_DIR" ]; then
        echo "▶️  Starting backend with Apollo GraphQL + Socket.IO (port $BACKEND_PORT)..."
        (cd "$BACKEND_DIR" && npm start > /tmp/social-feed-backend.log 2>&1) &
        BACKEND_PID=$!
        echo "BACKEND_PID=$BACKEND_PID" > "$PID_FILE"
    elif [ -f "server.js" ]; then
        echo "▶️  Starting backend with Apollo GraphQL + Socket.IO (port $BACKEND_PORT)..."
        node server.js > /tmp/social-feed-backend.log 2>&1 &
        BACKEND_PID=$!
        echo "BACKEND_PID=$BACKEND_PID" > "$PID_FILE"
    fi

    # Start frontend
    if [ -d "$FRONTEND_DIR" ]; then
        echo "▶️  Starting frontend (port $FRONTEND_PORT)..."
        (cd "$FRONTEND_DIR" && npm start > /tmp/social-feed-frontend.log 2>&1) &
        FRONTEND_PID=$!
        echo "FRONTEND_PID=$FRONTEND_PID" >> "$PID_FILE"
    fi

    sleep 3
    echo ""
    echo "✅ Servers started!"
    echo ""
    echo "🌐 Access:"
    echo "  Frontend:   http://localhost:$FRONTEND_PORT"
    echo "  GraphQL:    http://localhost:$BACKEND_PORT/graphql"
    echo "  Apollo Playground: http://localhost:$BACKEND_PORT/graphql"
    echo "  Socket.IO:  ws://localhost:$BACKEND_PORT"
}

stop_servers() {
    echo "⏸  Stopping $PROJECT_NAME servers..."
    if [ -f "$PID_FILE" ]; then
        source "$PID_FILE"
        [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null && echo "  ✅ Backend stopped"
        [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null && echo "  ✅ Frontend stopped"
        rm -f "$PID_FILE"
    fi
    # Kill by port as fallback
    fuser -k ${BACKEND_PORT}/tcp 2>/dev/null
    fuser -k ${FRONTEND_PORT}/tcp 2>/dev/null
    echo "✅ All servers stopped"
}

show_status() {
    echo ""
    echo "📊 $PROJECT_NAME Status:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Check backend
    if fuser ${BACKEND_PORT}/tcp &>/dev/null; then
        echo "  ✅ Backend/GraphQL/Socket.IO (port $BACKEND_PORT): RUNNING"
    else
        echo "  ❌ Backend/GraphQL/Socket.IO (port $BACKEND_PORT): STOPPED"
    fi

    # Check frontend
    if fuser ${FRONTEND_PORT}/tcp &>/dev/null; then
        echo "  ✅ Frontend (port $FRONTEND_PORT): RUNNING"
    else
        echo "  ❌ Frontend (port $FRONTEND_PORT): STOPPED"
    fi

    # Check PostgreSQL
    if pg_isready &>/dev/null 2>&1; then
        echo "  ✅ PostgreSQL: RUNNING"
    else
        echo "  ❌ PostgreSQL: STOPPED"
    fi

    echo ""
    echo "🌐 Access:"
    echo "  Frontend:          http://localhost:$FRONTEND_PORT"
    echo "  GraphQL Endpoint:  http://localhost:$BACKEND_PORT/graphql"
    echo "  Socket.IO:         ws://localhost:$BACKEND_PORT"
    echo ""
}

view_backend_logs() {
    echo "📝 Backend Logs (last 30 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "/tmp/social-feed-backend.log" ]; then
        tail -30 /tmp/social-feed-backend.log
    else
        echo "  No backend logs found."
    fi
    echo ""
}

view_frontend_logs() {
    echo "📝 Frontend Logs (last 30 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "/tmp/social-feed-frontend.log" ]; then
        tail -30 /tmp/social-feed-frontend.log
    else
        echo "  No frontend logs found."
    fi
    echo ""
}

restart_servers() {
    echo "🔄 Restarting $PROJECT_NAME servers..."
    stop_servers
    sleep 2
    start_servers
    echo "✅ Servers restarted"
}

while true; do
    show_menu
    read -p "Choose an option: " choice

    case $choice in
        1) start_servers ;;
        2) stop_servers ;;
        3) show_status ;;
        4) view_backend_logs ;;
        5) view_frontend_logs ;;
        6) restart_servers ;;
        7) install_dependencies ;;
        8) setup_database ;;
        9) check_postgresql ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
done
