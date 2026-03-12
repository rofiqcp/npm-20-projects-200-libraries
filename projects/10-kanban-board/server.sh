#!/bin/bash

# Server Management Script - Kanban Board (Project 10)
# Stack: React + Express.js + MongoDB + Socket.IO

PROJECT_NAME="Kanban Board"
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
BACKEND_PORT=5000
FRONTEND_PORT=3000
PID_FILE="/tmp/kanban-board.pids"

show_menu() {
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║   Kanban Board - Server Management     ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    echo "1. Start All Servers"
    echo "2. Stop All Servers"
    echo "3. Status"
    echo "4. View Backend Logs"
    echo "5. View Frontend Logs"
    echo "6. Restart All Servers"
    echo "7. Install Dependencies"
    echo "8. Start MongoDB"
    echo "0. Exit"
    echo ""
}

start_mongodb() {
    echo "🗄️  Starting MongoDB..."
    if command -v mongod &>/dev/null; then
        if ! pgrep -x mongod &>/dev/null; then
            mongod --fork --logpath /tmp/mongod.log --dbpath /data/db 2>/dev/null || \
            sudo systemctl start mongod 2>/dev/null || \
            echo "⚠️  Could not auto-start MongoDB. Please start it manually."
        else
            echo "✅ MongoDB is already running"
        fi
    else
        echo "⚠️  MongoDB not found. Please install MongoDB first."
    fi
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

    start_mongodb

    # Start backend (includes Socket.IO)
    if [ -d "$BACKEND_DIR" ]; then
        echo "▶️  Starting backend with Socket.IO (port $BACKEND_PORT)..."
        (cd "$BACKEND_DIR" && npm start > /tmp/kanban-backend.log 2>&1) &
        BACKEND_PID=$!
        echo "BACKEND_PID=$BACKEND_PID" > "$PID_FILE"
    elif [ -f "server.js" ]; then
        echo "▶️  Starting backend with Socket.IO (port $BACKEND_PORT)..."
        node server.js > /tmp/kanban-backend.log 2>&1 &
        BACKEND_PID=$!
        echo "BACKEND_PID=$BACKEND_PID" > "$PID_FILE"
    fi

    # Start frontend
    if [ -d "$FRONTEND_DIR" ]; then
        echo "▶️  Starting frontend (port $FRONTEND_PORT)..."
        (cd "$FRONTEND_DIR" && npm start > /tmp/kanban-frontend.log 2>&1) &
        FRONTEND_PID=$!
        echo "FRONTEND_PID=$FRONTEND_PID" >> "$PID_FILE"
    fi

    sleep 3
    echo ""
    echo "✅ Servers started!"
    echo ""
    echo "🌐 Access:"
    echo "  Frontend:  http://localhost:$FRONTEND_PORT"
    echo "  Backend:   http://localhost:$BACKEND_PORT"
    echo "  Socket.IO: ws://localhost:$BACKEND_PORT"
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
        echo "  ✅ Backend/Socket.IO (port $BACKEND_PORT): RUNNING"
    else
        echo "  ❌ Backend/Socket.IO (port $BACKEND_PORT): STOPPED"
    fi

    # Check frontend
    if fuser ${FRONTEND_PORT}/tcp &>/dev/null; then
        echo "  ✅ Frontend (port $FRONTEND_PORT): RUNNING"
    else
        echo "  ❌ Frontend (port $FRONTEND_PORT): STOPPED"
    fi

    # Check MongoDB
    if pgrep -x mongod &>/dev/null; then
        echo "  ✅ MongoDB: RUNNING"
    else
        echo "  ❌ MongoDB: STOPPED"
    fi

    echo ""
    echo "🌐 Access:"
    echo "  Frontend:  http://localhost:$FRONTEND_PORT"
    echo "  Backend:   http://localhost:$BACKEND_PORT"
    echo "  Socket.IO: ws://localhost:$BACKEND_PORT"
    echo ""
}

view_backend_logs() {
    echo "📝 Backend Logs (last 30 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "/tmp/kanban-backend.log" ]; then
        tail -30 /tmp/kanban-backend.log
    else
        echo "  No backend logs found."
    fi
    echo ""
}

view_frontend_logs() {
    echo "📝 Frontend Logs (last 30 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "/tmp/kanban-frontend.log" ]; then
        tail -30 /tmp/kanban-frontend.log
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
        8) start_mongodb ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
done
