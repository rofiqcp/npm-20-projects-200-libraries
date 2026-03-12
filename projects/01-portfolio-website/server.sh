#!/bin/bash

# Server Management Script - Project 1: Portfolio Website Statis
# Tech Stack: HTML5 + CSS3 + JavaScript | Static Site | No Database
# Served with Python http.server or Node.js serve

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$PROJECT_DIR/.env"

# Load .env if it exists
[ -f "$ENV_FILE" ] && source "$ENV_FILE"

# Port defaults (override via .env)
PORT="${PORT:-8080}"

SERVER_PID_FILE="$PROJECT_DIR/.server.pid"

show_menu() {
    echo ""
    echo "╔══════════════════════════════════════════════════╗"
    echo "║   Project 1: Portfolio Website Statis            ║"
    echo "║   Stack: HTML5 + CSS3 + JavaScript (Static)     ║"
    echo "╚══════════════════════════════════════════════════╝"
    echo ""
    echo "1. Start"
    echo "2. Stop"
    echo "3. Status"
    echo "4. Edit Ports (.env)"
    echo "5. Install, Build & Start"
    echo "0. Exit"
    echo ""
}

start_server() {
    # Reload env to pick up any port changes
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    PORT="${PORT:-8080}"

    if [ -f "$SERVER_PID_FILE" ] && kill -0 "$(cat "$SERVER_PID_FILE")" 2>/dev/null; then
        echo "⚠️  Server is already running (PID: $(cat "$SERVER_PID_FILE"))"
        return
    fi
    echo "🚀 Starting static file server on port $PORT..."
    if command -v python3 &>/dev/null; then
        cd "$PROJECT_DIR"
        nohup python3 -m http.server "$PORT" > "$PROJECT_DIR/.server.log" 2>&1 &
        echo $! > "$SERVER_PID_FILE"
        echo "✅ Server started with Python http.server (PID: $!)"
    elif command -v python &>/dev/null; then
        cd "$PROJECT_DIR"
        nohup python -m SimpleHTTPServer "$PORT" > "$PROJECT_DIR/.server.log" 2>&1 &
        echo $! > "$SERVER_PID_FILE"
        echo "✅ Server started with Python SimpleHTTPServer (PID: $!)"
    elif command -v npx &>/dev/null; then
        cd "$PROJECT_DIR"
        nohup npx serve -p "$PORT" . > "$PROJECT_DIR/.server.log" 2>&1 &
        echo $! > "$SERVER_PID_FILE"
        echo "✅ Server started with npx serve (PID: $!)"
    else
        echo "❌ No HTTP server found. Install Python 3 or Node.js."
        return
    fi
    sleep 1
    echo "🌐 Access: http://localhost:$PORT"
}

stop_server() {
    echo "⏸  Stopping server..."
    if [ -f "$SERVER_PID_FILE" ]; then
        kill "$(cat "$SERVER_PID_FILE")" 2>/dev/null
        rm -f "$SERVER_PID_FILE"
        echo "✅ Server stopped"
    else
        fuser -k "${PORT}/tcp" 2>/dev/null
        echo "✅ Server stopped"
    fi
}

show_status() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    PORT="${PORT:-8080}"
    echo ""
    echo "📊 Server Status - Portfolio Website"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "$SERVER_PID_FILE" ] && kill -0 "$(cat "$SERVER_PID_FILE")" 2>/dev/null; then
        echo "  Status : ✅ Running (PID: $(cat "$SERVER_PID_FILE"))"
        echo "  Access : http://localhost:$PORT"
    else
        echo "  Status : ❌ Not running"
    fi
    echo ""
    echo "📁 Project files:"
    for f in index.html style.css script.js; do
        if [ -f "$PROJECT_DIR/$f" ]; then
            echo "  ✅ $f"
        else
            echo "  ❌ $f (missing)"
        fi
    done
    echo ""
}

edit_ports() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    PORT="${PORT:-8080}"

    echo ""
    echo "⚙️  Edit Ports - Portfolio Website"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Press Enter to keep the current value shown in [brackets]."
    echo ""

    read -r -p "  Static Server PORT [$PORT]: " input_port
    PORT="${input_port:-$PORT}"

    # Write .env
    cat > "$ENV_FILE" <<EOF
# Portfolio Website - Port Configuration
PORT=$PORT
EOF
    echo ""
    echo "✅ Ports saved to .env"
    echo "   PORT=$PORT"
    echo ""
}

install_build_start() {
    echo "📦 Installing dependencies..."
    if [ -f "$PROJECT_DIR/package.json" ]; then
        cd "$PROJECT_DIR" && npm install
        echo "✅ Dependencies installed"
        echo "🏗️  Building..."
        npm run build 2>/dev/null || echo "ℹ️  No build step needed for static site."
    else
        echo "ℹ️  No package.json — static site, no dependencies needed."
    fi
    echo ""
    start_server
}

while true; do
    show_menu
    read -r -p "Choose an option: " choice

    case $choice in
        1) start_server ;;
        2) stop_server ;;
        3) show_status ;;
        4) edit_ports ;;
        5) install_build_start ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
done
