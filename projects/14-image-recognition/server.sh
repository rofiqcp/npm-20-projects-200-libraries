#!/bin/bash

# Server Management Script - Project 14: AI Image Recognition App
# Tech Stack: Express.js + React | PostgreSQL | TensorFlow.js + MediaPipe + Multer

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=5000
FRONTEND_PORT=3000
POSTGRES_PORT=5432
BACKEND_PID_FILE="$PROJECT_DIR/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend.pid"

show_menu() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════╗"
    echo "║   Project 14: AI Image Recognition App                               ║"
    echo "║   Stack: Express + React | PostgreSQL | TensorFlow.js + MediaPipe    ║"
    echo "╚══════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "1.  Install Dependencies"
    echo "2.  Start All Servers"
    echo "3.  Stop All Servers"
    echo "4.  Restart All Servers"
    echo "5.  Status"
    echo "6.  Start PostgreSQL (Docker)"
    echo "7.  Stop PostgreSQL (Docker)"
    echo "8.  Run DB Migrations"
    echo "9.  View Backend Logs"
    echo "10. View Frontend Logs"
    echo "11. Run Tests"
    echo "12. Download Pre-trained Models"
    echo "13. View Recognition History"
    echo "0.  Exit"
    echo ""
}

install_deps() {
    echo "📦 Installing dependencies..."
    for dir in "$PROJECT_DIR" "$PROJECT_DIR/backend" "$PROJECT_DIR/frontend"; do
        [ -f "$dir/package.json" ] && echo "  → $dir" && cd "$dir" && npm install
    done
    if [ ! -f "$PROJECT_DIR/backend/package.json" ] && [ ! -f "$PROJECT_DIR/package.json" ]; then
        echo "⚠️  Initialize project:"
        echo "   Backend: npm install express pg multer sharp cors dotenv uuid"
        echo "   Frontend: npm install react @tensorflow/tfjs @tensorflow-models/coco-ssd"
        echo "             npm install @mediapipe/face_detection axios tailwindcss"
        echo "             npm install @tensorflow-models/hand-pose-detection"
    fi
    echo "✅ Done"
}

start_postgres() {
    echo "🗄️  Starting PostgreSQL (Docker)..."
    if command -v docker &>/dev/null; then
        docker run -d --name image-recognition-postgres \
            -e POSTGRES_DB=image_recognition \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=postgres \
            -p "$POSTGRES_PORT:5432" postgres:14 2>/dev/null || docker start image-recognition-postgres 2>/dev/null
        sleep 3
        echo "✅ PostgreSQL running on port $POSTGRES_PORT"
    else
        echo "⚠️  Docker not found. Start PostgreSQL manually."
    fi
}

stop_postgres() {
    echo "⏸  Stopping PostgreSQL..."
    command -v docker &>/dev/null && docker stop image-recognition-postgres 2>/dev/null
    echo "✅ PostgreSQL stopped"
}

start_backend() {
    local backend_dir="$PROJECT_DIR/backend"
    [ ! -d "$backend_dir" ] && backend_dir="$PROJECT_DIR"
    [ ! -f "$backend_dir/package.json" ] && echo "❌ Backend not found." && return
    # Check uploads directory
    mkdir -p "$PROJECT_DIR/backend/uploads" 2>/dev/null
    mkdir -p "$PROJECT_DIR/uploads" 2>/dev/null
    echo "🚀 Starting Express backend on port $BACKEND_PORT..."
    cd "$backend_dir"
    local cmd="node server.js"
    grep -q '"dev"' package.json && cmd="npm run dev"
    nohup $cmd > "$PROJECT_DIR/.backend.log" 2>&1 &
    echo $! > "$BACKEND_PID_FILE"
    echo "✅ Backend started (PID: $!) → http://localhost:$BACKEND_PORT"
}

start_frontend() {
    local frontend_dir="$PROJECT_DIR/frontend"
    [ ! -d "$frontend_dir" ] && echo "⚠️  Frontend not found." && return
    echo "🌐 Starting React frontend on port $FRONTEND_PORT..."
    cd "$frontend_dir"
    local cmd="npm run dev"
    grep -q '"start"' package.json 2>/dev/null && cmd="npm start"
    nohup $cmd > "$PROJECT_DIR/.frontend.log" 2>&1 &
    echo $! > "$FRONTEND_PID_FILE"
    echo "✅ Frontend started (PID: $!) → http://localhost:$FRONTEND_PORT"
}

start_servers() { start_backend; start_frontend; sleep 2; show_status; }

stop_servers() {
    echo "⏸  Stopping servers..."
    for f in "$BACKEND_PID_FILE" "$FRONTEND_PID_FILE"; do
        [ -f "$f" ] && kill "$(cat "$f")" 2>/dev/null && rm -f "$f"
    done
    pkill -f "node.*server" 2>/dev/null; pkill -f "vite\|react-scripts" 2>/dev/null
    echo "✅ All servers stopped"
}

show_status() {
    echo ""
    echo "📊 Server Status - AI Image Recognition"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "$BACKEND_PID_FILE" ] && kill -0 "$(cat "$BACKEND_PID_FILE")" 2>/dev/null; then
        echo "  Backend  : ✅ Running → http://localhost:$BACKEND_PORT"
    else
        echo "  Backend  : ❌ Not running"
    fi
    if [ -f "$FRONTEND_PID_FILE" ] && kill -0 "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null; then
        echo "  Frontend : ✅ Running → http://localhost:$FRONTEND_PORT"
    else
        echo "  Frontend : ❌ Not running"
    fi
    if command -v docker &>/dev/null; then
        local st
        st=$(docker inspect -f '{{.State.Status}}' image-recognition-postgres 2>/dev/null || echo "not found")
        echo "  PostgreSQL: $([ "$st" = "running" ] && echo "✅ Running (port $POSTGRES_PORT)" || echo "❌ $st")"
    fi
    # Check uploads dir
    local uploads_dir="$PROJECT_DIR/backend/uploads"
    [ ! -d "$uploads_dir" ] && uploads_dir="$PROJECT_DIR/uploads"
    if [ -d "$uploads_dir" ]; then
        local count
        count=$(find "$uploads_dir" -type f 2>/dev/null | wc -l)
        echo "  Uploads  : ✅ Directory exists ($count files)"
    else
        echo "  Uploads  : ⚠️  No uploads directory (created on start)"
    fi
    echo ""
    echo "🌐 Access:"
    echo "  App      : http://localhost:$FRONTEND_PORT"
    echo "  API      : http://localhost:$BACKEND_PORT/api"
    echo "  Upload   : POST http://localhost:$BACKEND_PORT/api/recognize"
    echo "  History  : GET  http://localhost:$BACKEND_PORT/api/history"
    echo ""
    echo "🤖 AI Models (TensorFlow.js - loaded in browser):"
    echo "  - COCO-SSD: Object detection (80+ objects)"
    echo "  - MediaPipe: Face detection + Hand pose"
    echo "  - Tesseract.js: OCR (text recognition)"
    echo ""
}

run_migrations() {
    echo "🗄️  Running PostgreSQL migrations..."
    if [ -f "$PROJECT_DIR/backend/package.json" ] && grep -q '"migrate"' "$PROJECT_DIR/backend/package.json"; then
        cd "$PROJECT_DIR/backend" && npm run migrate
    else
        echo "⚠️  No migration script found."
        echo ""
        echo "   Example schema:"
        echo "   CREATE TABLE images ("
        echo "     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),"
        echo "     filename VARCHAR(255) NOT NULL,"
        echo "     original_name VARCHAR(255),"
        echo "     size_bytes INT,"
        echo "     uploaded_at TIMESTAMP DEFAULT NOW()"
        echo "   );"
        echo "   CREATE TABLE recognitions ("
        echo "     id SERIAL PRIMARY KEY,"
        echo "     image_id UUID REFERENCES images(id),"
        echo "     model_type VARCHAR(50),"
        echo "     predictions JSON,"
        echo "     confidence FLOAT,"
        echo "     processed_at TIMESTAMP DEFAULT NOW()"
        echo "   );"
        echo "   CREATE INDEX idx_recognitions_image ON recognitions(image_id);"
    fi
}

view_backend_logs() {
    echo "📝 Backend Logs (last 30 lines):"
    [ -f "$PROJECT_DIR/.backend.log" ] && tail -30 "$PROJECT_DIR/.backend.log" || echo "No logs."
    echo ""
}

view_frontend_logs() {
    echo "🌐 Frontend Logs (last 30 lines):"
    [ -f "$PROJECT_DIR/.frontend.log" ] && tail -30 "$PROJECT_DIR/.frontend.log" || echo "No logs."
    echo ""
}

run_tests() {
    local test_dir="$PROJECT_DIR/backend"
    [ ! -d "$test_dir" ] && test_dir="$PROJECT_DIR"
    [ -f "$test_dir/package.json" ] && grep -q '"test"' "$test_dir/package.json" && cd "$test_dir" && npm test || echo "⚠️  No test script."
}

download_models() {
    echo "🤖 TensorFlow.js Model Information"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  Models are loaded automatically in the browser via CDN."
    echo "  No manual download needed for TensorFlow.js models!"
    echo ""
    echo "  Models used:"
    echo "  1. COCO-SSD (Object Detection)"
    echo "     CDN: https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd"
    echo "     Size: ~5MB | Detects: 80 object categories"
    echo ""
    echo "  2. MediaPipe Face Detection"
    echo "     CDN: https://cdn.jsdelivr.net/npm/@mediapipe/face_detection"
    echo "     Size: ~3MB | Detects: faces + 6 landmarks"
    echo ""
    echo "  3. Hand Pose Detection"
    echo "     CDN: https://cdn.jsdelivr.net/npm/@tensorflow-models/hand-pose-detection"
    echo "     Size: ~6MB | Detects: 21 hand keypoints"
    echo ""
    echo "  For offline use, install via npm:"
    echo "  npm install @tensorflow/tfjs @tensorflow-models/coco-ssd @mediapipe/face_detection"
    echo ""
}

view_recognition_history() {
    echo "🔍 Recent Recognition History:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if command -v curl &>/dev/null && [ -f "$BACKEND_PID_FILE" ] && kill -0 "$(cat "$BACKEND_PID_FILE")" 2>/dev/null; then
        local response
        response=$(curl -s "http://localhost:$BACKEND_PORT/api/history?limit=5" 2>/dev/null)
        if echo "$response" | grep -q '\['; then
            echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
        else
            echo "  No history yet or API not available."
        fi
    else
        echo "  Backend not running. Start backend to view history."
    fi
    echo ""
}

restart_servers() { stop_servers; sleep 1; start_servers; }

while true; do
    show_menu
    read -r -p "Choose an option: " choice
    case $choice in
        1)  install_deps ;;
        2)  start_servers ;;
        3)  stop_servers ;;
        4)  restart_servers ;;
        5)  show_status ;;
        6)  start_postgres ;;
        7)  stop_postgres ;;
        8)  run_migrations ;;
        9)  view_backend_logs ;;
        10) view_frontend_logs ;;
        11) run_tests ;;
        12) download_models ;;
        13) view_recognition_history ;;
        0)  echo "👋 Goodbye!"; exit 0 ;;
        *)  echo "❌ Invalid option. Please try again." ;;
    esac
done
