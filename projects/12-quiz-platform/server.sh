#!/bin/bash

# Server Management Script - Quiz Platform (Project 12)
# Stack: React + Express.js + MySQL + Redis

PROJECT_NAME="Quiz Platform"
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
BACKEND_PORT=5000
FRONTEND_PORT=3000
PID_FILE="/tmp/quiz-platform.pids"

show_menu() {
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║   Quiz Platform - Server Management    ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    echo "1. Start All Servers"
    echo "2. Stop All Servers"
    echo "3. Status"
    echo "4. View Backend Logs"
    echo "5. View Frontend Logs"
    echo "6. Restart All Servers"
    echo "7. Install Dependencies"
    echo "8. Setup Database (MySQL)"
    echo "9. Start Redis"
    echo "0. Exit"
    echo ""
}

check_mysql() {
    echo "🗄️  Checking MySQL..."
    if command -v mysql &>/dev/null; then
        if mysqladmin ping &>/dev/null 2>&1; then
            echo "✅ MySQL is running"
            return 0
        else
            echo "⚠️  MySQL is not running. Starting..."
            sudo systemctl start mysql 2>/dev/null || \
            sudo systemctl start mysqld 2>/dev/null || \
            echo "⚠️  Could not start MySQL. Please start it manually."
        fi
    else
        echo "⚠️  MySQL not found. Please install MySQL first."
    fi
}

start_redis() {
    echo "⚡ Starting Redis..."
    if command -v redis-server &>/dev/null; then
        if ! pgrep -x redis-server &>/dev/null; then
            if redis-server --daemonize yes --logfile /tmp/redis.log 2>/dev/null || \
               sudo systemctl start redis 2>/dev/null; then
                sleep 1
                echo "✅ Redis started"
            else
                echo "⚠️  Could not auto-start Redis. Please start it manually."
            fi
        else
            echo "✅ Redis is already running"
        fi
    else
        echo "⚠️  Redis not found. Please install Redis first."
    fi
}

setup_database() {
    echo "🗄️  Setting up MySQL database..."
    check_mysql
    if [ -f "$BACKEND_DIR/db/schema.sql" ]; then
        echo "📋 Running schema from $BACKEND_DIR/db/schema.sql..."
        echo "  Enter MySQL root password if prompted:"
        mysql -u root -p < "$BACKEND_DIR/db/schema.sql" 2>/dev/null || \
        echo "⚠️  Could not run schema. Check database credentials in .env"
    elif [ -f "db/schema.sql" ]; then
        echo "📋 Running schema from db/schema.sql..."
        echo "  Enter MySQL root password if prompted:"
        mysql -u root -p < "db/schema.sql" 2>/dev/null || \
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

    check_mysql
    start_redis

    # Start backend
    if [ -d "$BACKEND_DIR" ]; then
        echo "▶️  Starting backend (port $BACKEND_PORT)..."
        (cd "$BACKEND_DIR" && npm start > /tmp/quiz-platform-backend.log 2>&1) &
        BACKEND_PID=$!
        echo "BACKEND_PID=$BACKEND_PID" > "$PID_FILE"
    elif [ -f "server.js" ]; then
        echo "▶️  Starting backend (port $BACKEND_PORT)..."
        node server.js > /tmp/quiz-platform-backend.log 2>&1 &
        BACKEND_PID=$!
        echo "BACKEND_PID=$BACKEND_PID" > "$PID_FILE"
    fi

    # Start frontend
    if [ -d "$FRONTEND_DIR" ]; then
        echo "▶️  Starting frontend (port $FRONTEND_PORT)..."
        (cd "$FRONTEND_DIR" && npm start > /tmp/quiz-platform-frontend.log 2>&1) &
        FRONTEND_PID=$!
        echo "FRONTEND_PID=$FRONTEND_PID" >> "$PID_FILE"
    fi

    sleep 3
    echo ""
    echo "✅ Servers started!"
    echo ""
    echo "🌐 Access:"
    echo "  Frontend:   http://localhost:$FRONTEND_PORT"
    echo "  Backend:    http://localhost:$BACKEND_PORT"
    echo "  Leaderboard: http://localhost:$BACKEND_PORT/api/leaderboard"
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
        echo "  ✅ Backend  (port $BACKEND_PORT): RUNNING"
    else
        echo "  ❌ Backend  (port $BACKEND_PORT): STOPPED"
    fi

    # Check frontend
    if fuser ${FRONTEND_PORT}/tcp &>/dev/null; then
        echo "  ✅ Frontend (port $FRONTEND_PORT): RUNNING"
    else
        echo "  ❌ Frontend (port $FRONTEND_PORT): STOPPED"
    fi

    # Check MySQL
    if mysqladmin ping &>/dev/null 2>&1; then
        echo "  ✅ MySQL: RUNNING"
    else
        echo "  ❌ MySQL: STOPPED"
    fi

    # Check Redis
    if redis-cli ping &>/dev/null 2>&1; then
        echo "  ✅ Redis: RUNNING"
    else
        echo "  ❌ Redis: STOPPED"
    fi

    echo ""
    echo "🌐 Access:"
    echo "  Frontend:    http://localhost:$FRONTEND_PORT"
    echo "  Backend API: http://localhost:$BACKEND_PORT/api"
    echo ""
}

view_backend_logs() {
    echo "📝 Backend Logs (last 30 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "/tmp/quiz-platform-backend.log" ]; then
        tail -30 /tmp/quiz-platform-backend.log
    else
        echo "  No backend logs found."
    fi
    echo ""
}

view_frontend_logs() {
    echo "📝 Frontend Logs (last 30 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "/tmp/quiz-platform-frontend.log" ]; then
        tail -30 /tmp/quiz-platform-frontend.log
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
        9) start_redis ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
done
