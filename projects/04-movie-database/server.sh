#!/bin/bash

# Server Management Script - Project 4: Movie Database Search
# Tech Stack: React + Axios | TMDB API + localStorage | No Backend
# External API: https://www.themoviedb.org/documentation/api (free)

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$PROJECT_DIR/.env"

# Load .env if it exists
[ -f "$ENV_FILE" ] && source "$ENV_FILE"

# Port defaults (override via .env)
DEV_PORT="${DEV_PORT:-3000}"

SERVER_PID_FILE="$PROJECT_DIR/.server.pid"

show_menu() {
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║   Project 4: Movie Database Search                     ║"
    echo "║   Stack: React + Axios | TMDB API + localStorage       ║"
    echo "╚════════════════════════════════════════════════════════╝"
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
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    DEV_PORT="${DEV_PORT:-3000}"

    if [ -f "$SERVER_PID_FILE" ] && kill -0 "$(cat "$SERVER_PID_FILE")" 2>/dev/null; then
        echo "⚠️  Dev server is already running (PID: $(cat "$SERVER_PID_FILE"))"
        return
    fi
    if [ ! -f "$PROJECT_DIR/package.json" ]; then
        echo "❌ package.json not found. Run option 5 (Install, Build & Start) first."
        return
    fi
    if [ ! -f "$ENV_FILE" ]; then
        echo "⚠️  No .env file found. You may need VITE_TMDB_API_KEY."
        echo "   Get a free key at: https://www.themoviedb.org/settings/api"
        echo ""
    fi
    echo "🚀 Starting React dev server on port $DEV_PORT..."
    cd "$PROJECT_DIR"
    nohup npx vite --port "$DEV_PORT" > "$PROJECT_DIR/.server.log" 2>&1 &
    echo $! > "$SERVER_PID_FILE"
    sleep 2
    echo "✅ Dev server started (PID: $!)"
    echo "🌐 Access: http://localhost:$DEV_PORT"
}

stop_server() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    DEV_PORT="${DEV_PORT:-3000}"
    echo "⏸  Stopping dev server..."
    if [ -f "$SERVER_PID_FILE" ]; then
        kill "$(cat "$SERVER_PID_FILE")" 2>/dev/null
        rm -f "$SERVER_PID_FILE"
    fi
    fuser -k "${DEV_PORT}/tcp" 2>/dev/null
    echo "✅ Dev server stopped"
}

show_status() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    DEV_PORT="${DEV_PORT:-3000}"
    echo ""
    echo "📊 Server Status - Movie Database Search"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "$SERVER_PID_FILE" ] && kill -0 "$(cat "$SERVER_PID_FILE")" 2>/dev/null; then
        echo "  Status : ✅ Running (PID: $(cat "$SERVER_PID_FILE"))"
        echo "  Access : http://localhost:$DEV_PORT"
    else
        echo "  Status : ❌ Not running"
    fi
    echo ""
    echo "🔑 TMDB API Key:"
    if [ -f "$ENV_FILE" ] && grep -q "TMDB\|MOVIE" "$ENV_FILE"; then
        echo "  ✅ .env found with API key"
    else
        echo "  ⚠️  Set VITE_TMDB_API_KEY in .env"
        echo "     Get free key: https://www.themoviedb.org/settings/api"
    fi
    echo ""
}

edit_ports() {
    [ -f "$ENV_FILE" ] && source "$ENV_FILE"
    DEV_PORT="${DEV_PORT:-3000}"
    local VITE_TMDB_API_KEY="${VITE_TMDB_API_KEY:-}"

    echo ""
    echo "⚙️  Edit Ports - Movie Database"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Press Enter to keep the current value shown in [brackets]."
    echo ""

    read -r -p "  Dev Server DEV_PORT [$DEV_PORT]: " input
    DEV_PORT="${input:-$DEV_PORT}"

    cat > "$ENV_FILE" <<EOF
# Movie Database - Port Configuration
DEV_PORT=$DEV_PORT

# API Keys (do not change here — set your actual key below)
VITE_TMDB_API_KEY=${VITE_TMDB_API_KEY}
EOF
    echo ""
    echo "✅ Ports saved to .env"
    echo "   DEV_PORT=$DEV_PORT"
    echo ""
}

install_build_start() {
    echo "📦 Installing dependencies..."
    cd "$PROJECT_DIR"
    npm install
    echo "✅ Dependencies installed"
    echo "🏗️  Building for production..."
    npm run build
    echo "✅ Build complete"
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
