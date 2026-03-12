#!/bin/bash

# Server Management Script - AI Chatbot (Project 13)
# Stack: React + Express.js + LangChain + MongoDB + Redis + Socket.IO

PROJECT_NAME="AI Chatbot"
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
BACKEND_PORT=5000
FRONTEND_PORT=3000
PID_FILE="/tmp/ai-chatbot.pids"

show_menu() {
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║    AI Chatbot - Server Management      ║"
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
    echo "9. Start Redis"
    echo "a. Check Environment (.env)"
    echo "0. Exit"
    echo ""
}

check_env() {
    echo "🔍 Checking environment variables..."
    ENV_FILE=""
    if [ -f "$BACKEND_DIR/.env" ]; then
        ENV_FILE="$BACKEND_DIR/.env"
    elif [ -f ".env" ]; then
        ENV_FILE=".env"
    fi

    if [ -n "$ENV_FILE" ]; then
        echo "  📄 Found: $ENV_FILE"
        if grep -q "OPENAI_API_KEY" "$ENV_FILE" 2>/dev/null; then
            KEY=$(grep "OPENAI_API_KEY" "$ENV_FILE" | cut -d'=' -f2)
            if [ -n "$KEY" ] && [ "$KEY" != "your_key" ] && [ "$KEY" != "your_openai_api_key_here" ]; then
                echo "  ✅ OPENAI_API_KEY: Set"
            else
                echo "  ⚠️  OPENAI_API_KEY: Not configured (set your key in $ENV_FILE)"
            fi
        else
            echo "  ⚠️  OPENAI_API_KEY: Missing from $ENV_FILE"
        fi
        if grep -q "MONGODB_URI" "$ENV_FILE" 2>/dev/null; then
            echo "  ✅ MONGODB_URI: Set"
        else
            echo "  ⚠️  MONGODB_URI: Missing (default: mongodb://localhost/chatbot)"
        fi
        if grep -q "REDIS_URL" "$ENV_FILE" 2>/dev/null; then
            echo "  ✅ REDIS_URL: Set"
        else
            echo "  ⚠️  REDIS_URL: Missing (default: redis://localhost:6379)"
        fi
    else
        echo "  ⚠️  No .env file found. Create one with:"
        echo ""
        echo "  OPENAI_API_KEY=your_openai_api_key_here"
        echo "  MONGODB_URI=mongodb://localhost/chatbot"
        echo "  REDIS_URL=redis://localhost:6379"
        echo "  JWT_SECRET=your_jwt_secret"
        echo "  PORT=5000"
    fi
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

    check_env

    start_mongodb
    start_redis

    # Start backend (Express + LangChain + Socket.IO)
    if [ -d "$BACKEND_DIR" ]; then
        echo "▶️  Starting backend with LangChain + Socket.IO (port $BACKEND_PORT)..."
        (cd "$BACKEND_DIR" && npm start > /tmp/ai-chatbot-backend.log 2>&1) &
        BACKEND_PID=$!
        echo "BACKEND_PID=$BACKEND_PID" > "$PID_FILE"
    elif [ -f "server.js" ]; then
        echo "▶️  Starting backend with LangChain + Socket.IO (port $BACKEND_PORT)..."
        node server.js > /tmp/ai-chatbot-backend.log 2>&1 &
        BACKEND_PID=$!
        echo "BACKEND_PID=$BACKEND_PID" > "$PID_FILE"
    fi

    # Start frontend
    if [ -d "$FRONTEND_DIR" ]; then
        echo "▶️  Starting frontend (port $FRONTEND_PORT)..."
        (cd "$FRONTEND_DIR" && npm start > /tmp/ai-chatbot-frontend.log 2>&1) &
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
    echo "  Chat API:  http://localhost:$BACKEND_PORT/api/chat"
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

    # Check Redis
    if redis-cli ping &>/dev/null 2>&1; then
        echo "  ✅ Redis: RUNNING"
    else
        echo "  ❌ Redis: STOPPED"
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
    if [ -f "/tmp/ai-chatbot-backend.log" ]; then
        tail -30 /tmp/ai-chatbot-backend.log
    else
        echo "  No backend logs found."
    fi
    echo ""
}

view_frontend_logs() {
    echo "📝 Frontend Logs (last 30 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "/tmp/ai-chatbot-frontend.log" ]; then
        tail -30 /tmp/ai-chatbot-frontend.log
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
        9) start_redis ;;
        a|A) check_env ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
done
