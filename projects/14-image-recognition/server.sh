#!/bin/bash

# Server Management Script - AI Image Recognition (Project 14)
# Stack: React + Express.js + TensorFlow.js + MediaPipe + PostgreSQL + AWS S3

PROJECT_NAME="AI Image Recognition"
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
BACKEND_PORT=5000
FRONTEND_PORT=3000
PID_FILE="/tmp/image-recognition.pids"

show_menu() {
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║  Image Recognition - Server Management ║"
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
        for VAR in AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_S3_BUCKET DATABASE_URL JWT_SECRET; do
            if grep -q "^$VAR=" "$ENV_FILE" 2>/dev/null; then
                VAL=$(grep "^$VAR=" "$ENV_FILE" | cut -d'=' -f2)
                if [ -n "$VAL" ] && [[ "$VAL" != *"your_"* ]]; then
                    echo "  ✅ $VAR: Set"
                else
                    echo "  ⚠️  $VAR: Not configured"
                fi
            else
                echo "  ⚠️  $VAR: Missing from $ENV_FILE"
            fi
        done
    else
        echo "  ⚠️  No .env file found. Create one with:"
        echo ""
        echo "  DATABASE_URL=postgresql://user:password@localhost/image_recognition"
        echo "  AWS_ACCESS_KEY_ID=your_aws_access_key"
        echo "  AWS_SECRET_ACCESS_KEY=your_aws_secret"
        echo "  AWS_S3_BUCKET=your_s3_bucket_name"
        echo "  AWS_REGION=us-east-1"
        echo "  JWT_SECRET=your_jwt_secret"
        echo "  PORT=5000"
    fi
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
        echo "📦 Installing backend dependencies (TensorFlow.js may take a while)..."
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
    check_postgresql

    # Start backend (Express + TensorFlow.js + MediaPipe)
    if [ -d "$BACKEND_DIR" ]; then
        echo "▶️  Starting backend with TensorFlow.js + ML models (port $BACKEND_PORT)..."
        echo "  ℹ️  Note: First startup may take longer while loading ML models..."
        (cd "$BACKEND_DIR" && npm start > /tmp/image-recognition-backend.log 2>&1) &
        BACKEND_PID=$!
        echo "BACKEND_PID=$BACKEND_PID" > "$PID_FILE"
    elif [ -f "server.js" ]; then
        echo "▶️  Starting backend with TensorFlow.js + ML models (port $BACKEND_PORT)..."
        node server.js > /tmp/image-recognition-backend.log 2>&1 &
        BACKEND_PID=$!
        echo "BACKEND_PID=$BACKEND_PID" > "$PID_FILE"
    fi

    # Start frontend
    if [ -d "$FRONTEND_DIR" ]; then
        echo "▶️  Starting frontend (port $FRONTEND_PORT)..."
        (cd "$FRONTEND_DIR" && npm start > /tmp/image-recognition-frontend.log 2>&1) &
        FRONTEND_PID=$!
        echo "FRONTEND_PID=$FRONTEND_PID" >> "$PID_FILE"
    fi

    sleep 5
    echo ""
    echo "✅ Servers started!"
    echo ""
    echo "🌐 Access:"
    echo "  Frontend:        http://localhost:$FRONTEND_PORT"
    echo "  Backend:         http://localhost:$BACKEND_PORT"
    echo "  Image Upload:    http://localhost:$BACKEND_PORT/api/images"
    echo "  Object Detection: http://localhost:$BACKEND_PORT/api/detect"
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
        echo "  ✅ Backend/ML Engine (port $BACKEND_PORT): RUNNING"
    else
        echo "  ❌ Backend/ML Engine (port $BACKEND_PORT): STOPPED"
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
    echo "  Frontend:  http://localhost:$FRONTEND_PORT"
    echo "  Backend:   http://localhost:$BACKEND_PORT"
    echo ""
    echo "🤖 ML Models:"
    echo "  - TensorFlow.js (Object Detection)"
    echo "  - MediaPipe (Face/Pose Detection)"
    echo "  - Tesseract.js (OCR/Text Extraction)"
    echo ""
}

view_backend_logs() {
    echo "📝 Backend Logs (last 30 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "/tmp/image-recognition-backend.log" ]; then
        tail -30 /tmp/image-recognition-backend.log
    else
        echo "  No backend logs found."
    fi
    echo ""
}

view_frontend_logs() {
    echo "📝 Frontend Logs (last 30 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "/tmp/image-recognition-frontend.log" ]; then
        tail -30 /tmp/image-recognition-frontend.log
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
