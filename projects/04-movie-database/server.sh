#!/bin/bash

# Server Management Script - Project 4: Movie Database Search
# Tech Stack: React + Axios | TMDB API + localStorage | No Backend
# External API: https://www.themoviedb.org/documentation/api (free)

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEV_PORT=3000
SERVER_PID_FILE="$PROJECT_DIR/.server.pid"

show_menu() {
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║   Project 4: Movie Database Search                     ║"
    echo "║   Stack: React + Axios | TMDB API + localStorage       ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    echo "1.  Install Dependencies"
    echo "2.  Start Dev Server"
    echo "3.  Stop Dev Server"
    echo "4.  Restart Dev Server"
    echo "5.  Status"
    echo "6.  View Logs"
    echo "7.  Build for Production"
    echo "8.  Preview Production Build"
    echo "9.  Test TMDB API Key"
    echo "10. Run Tests"
    echo "0.  Exit"
    echo ""
}

install_deps() {
    echo "📦 Installing dependencies..."
    if [ -f "$PROJECT_DIR/package.json" ]; then
        cd "$PROJECT_DIR" && npm install
        echo "✅ Dependencies installed"
    else
        echo "⚠️  package.json not found. Initialize project:"
        echo "   npm create vite@latest . -- --template react"
        echo "   npm install"
        echo "   npm install axios react-paginate react-router-dom"
        echo "   npm install -D tailwindcss postcss autoprefixer"
        echo ""
        echo "📋 Required API key:"
        echo "   Register at: https://www.themoviedb.org/documentation/api"
        echo "   Create .env: VITE_TMDB_API_KEY=your_api_key"
    fi
}

start_server() {
    if [ -f "$SERVER_PID_FILE" ] && kill -0 "$(cat "$SERVER_PID_FILE")" 2>/dev/null; then
        echo "⚠️  Dev server is already running (PID: $(cat "$SERVER_PID_FILE"))"
        return
    fi
    if [ ! -f "$PROJECT_DIR/package.json" ]; then
        echo "❌ package.json not found. Run 'Install Dependencies' first (option 1)."
        return
    fi
    if [ ! -f "$PROJECT_DIR/.env" ] && [ ! -f "$PROJECT_DIR/.env.local" ]; then
        echo "⚠️  No .env file found. You may need VITE_TMDB_API_KEY."
        echo "   Get a free key at: https://www.themoviedb.org/settings/api"
        echo ""
    fi
    echo "🚀 Starting React dev server on port $DEV_PORT..."
    cd "$PROJECT_DIR"
    local start_cmd="npm run dev"
    if grep -q '"start"' package.json; then
        start_cmd="npm start"
    fi
    nohup $start_cmd > "$PROJECT_DIR/.server.log" 2>&1 &
    echo $! > "$SERVER_PID_FILE"
    sleep 2
    echo "✅ Dev server started (PID: $!)"
    echo "🌐 Access: http://localhost:$DEV_PORT"
}

stop_server() {
    echo "⏸  Stopping dev server..."
    if [ -f "$SERVER_PID_FILE" ]; then
        kill "$(cat "$SERVER_PID_FILE")" 2>/dev/null
        rm -f "$SERVER_PID_FILE"
    fi
    pkill -f "vite.*movie" 2>/dev/null
    pkill -f "react-scripts start" 2>/dev/null
    echo "✅ Dev server stopped"
}

show_status() {
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
    if [ -f "$PROJECT_DIR/.env" ] && grep -q "TMDB\|MOVIE" "$PROJECT_DIR/.env"; then
        echo "  ✅ .env found with API key"
    elif [ -f "$PROJECT_DIR/.env.local" ] && grep -q "TMDB\|MOVIE" "$PROJECT_DIR/.env.local"; then
        echo "  ✅ .env.local found with API key"
    else
        echo "  ⚠️  No .env file — set VITE_TMDB_API_KEY"
        echo "     Get free key: https://www.themoviedb.org/settings/api"
    fi
    echo ""
    echo "💾 Favorites: Browser localStorage"
    echo "   Favorites list persists in browser storage"
    echo ""
}

view_logs() {
    echo "📝 Dev Server Logs (last 30 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "$PROJECT_DIR/.server.log" ]; then
        tail -30 "$PROJECT_DIR/.server.log"
    else
        echo "No logs found."
    fi
    echo ""
}

build_production() {
    echo "🏗️  Building for production..."
    if [ -f "$PROJECT_DIR/package.json" ]; then
        cd "$PROJECT_DIR" && npm run build
        echo "✅ Build complete"
    else
        echo "❌ package.json not found."
    fi
}

preview_build() {
    echo "👁️  Previewing production build..."
    if [ -f "$PROJECT_DIR/package.json" ] && grep -q '"preview"' "$PROJECT_DIR/package.json"; then
        cd "$PROJECT_DIR" && npm run preview
    elif [ -d "$PROJECT_DIR/dist" ]; then
        cd "$PROJECT_DIR/dist"
        nohup python3 -m http.server 4173 > "$PROJECT_DIR/.preview.log" 2>&1 &
        echo "✅ Preview at http://localhost:4173"
    else
        echo "❌ No build directory found. Run 'Build for Production' first."
    fi
}

test_tmdb_api() {
    echo "🎬 Testing TMDB API key..."
    local api_key=""
    for env_file in "$PROJECT_DIR/.env" "$PROJECT_DIR/.env.local"; do
        if [ -f "$env_file" ]; then
            api_key=$(grep -o 'VITE_TMDB_API_KEY=\S*\|REACT_APP_TMDB_API_KEY=\S*\|TMDB_API_KEY=\S*' "$env_file" | cut -d= -f2 | head -1)
            [ -n "$api_key" ] && break
        fi
    done
    if [ -z "$api_key" ]; then
        echo "⚠️  No TMDB API key found in .env or .env.local"
        echo "   Create .env and add: VITE_TMDB_API_KEY=your_key_here"
        echo "   Get free key: https://www.themoviedb.org/settings/api"
        return
    fi
    if command -v curl &>/dev/null; then
        local response
        response=$(curl -s "https://api.themoviedb.org/3/movie/popular?api_key=$api_key&page=1" 2>/dev/null)
        if echo "$response" | grep -q '"results"'; then
            echo "✅ TMDB API key is valid!"
            local count
            count=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('results', [])))" 2>/dev/null)
            echo "   Found $count popular movies in response"
        else
            echo "❌ TMDB API key test failed:"
            echo "   $(echo "$response" | head -c 200)"
        fi
    else
        echo "⚠️  curl not found. Cannot test API key."
    fi
}

run_tests() {
    echo "🧪 Running tests..."
    if [ -f "$PROJECT_DIR/package.json" ] && grep -q '"test"' "$PROJECT_DIR/package.json"; then
        cd "$PROJECT_DIR" && npm test -- --watchAll=false 2>/dev/null || npm test
    else
        echo "⚠️  No test script found in package.json."
    fi
}

restart_server() {
    stop_server
    sleep 1
    start_server
}

while true; do
    show_menu
    read -r -p "Choose an option: " choice

    case $choice in
        1)  install_deps ;;
        2)  start_server ;;
        3)  stop_server ;;
        4)  restart_server ;;
        5)  show_status ;;
        6)  view_logs ;;
        7)  build_production ;;
        8)  preview_build ;;
        9)  test_tmdb_api ;;
        10) run_tests ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
done
