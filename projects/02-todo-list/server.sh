#!/bin/bash

# Server Management Script - Project 2: Todo List App
# Tech Stack: React + Hooks | Browser localStorage | No Backend
# Storage: Browser localStorage (no database needed)

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEV_PORT=3000
SERVER_PID_FILE="$PROJECT_DIR/.server.pid"

show_menu() {
    echo ""
    echo "╔══════════════════════════════════════════════════╗"
    echo "║   Project 2: Todo List App                       ║"
    echo "║   Stack: React + Hooks | localStorage (No DB)   ║"
    echo "╚══════════════════════════════════════════════════╝"
    echo ""
    echo "1. Install Dependencies"
    echo "2. Start Dev Server"
    echo "3. Stop Dev Server"
    echo "4. Restart Dev Server"
    echo "5. Status"
    echo "6. View Logs"
    echo "7. Build for Production"
    echo "8. Preview Production Build"
    echo "9. Run Tests"
    echo "0. Exit"
    echo ""
}

install_deps() {
    echo "📦 Installing dependencies..."
    if [ -f "$PROJECT_DIR/package.json" ]; then
        cd "$PROJECT_DIR" && npm install
        echo "✅ Dependencies installed"
    else
        echo "⚠️  package.json not found. Initialize project first:"
        echo "   cd $(basename "$PROJECT_DIR")"
        echo "   npm create vite@latest . -- --template react"
        echo "   npm install"
        echo "   npm install -D tailwindcss postcss autoprefixer"
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
    pkill -f "vite.*todo" 2>/dev/null
    pkill -f "react-scripts start" 2>/dev/null
    echo "✅ Dev server stopped"
}

show_status() {
    echo ""
    echo "📊 Server Status - Todo List App"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "$SERVER_PID_FILE" ] && kill -0 "$(cat "$SERVER_PID_FILE")" 2>/dev/null; then
        echo "  Status : ✅ Running (PID: $(cat "$SERVER_PID_FILE"))"
        echo "  Access : http://localhost:$DEV_PORT"
    else
        echo "  Status : ❌ Not running"
    fi
    echo ""
    echo "💾 Storage: Browser localStorage"
    echo "   Data persists in browser — no database needed!"
    echo ""
    if [ -f "$PROJECT_DIR/package.json" ]; then
        echo "  ✅ package.json found"
        local framework
        framework=$(grep -o '"react"\|"vue"\|"vite"' "$PROJECT_DIR/package.json" | head -1)
        echo "  📦 Framework: ${framework:-React}"
    else
        echo "  ❌ package.json not found — run option 1 first"
    fi
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
        echo "✅ Build complete — output in dist/ or build/"
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
    elif [ -d "$PROJECT_DIR/build" ]; then
        cd "$PROJECT_DIR/build"
        nohup python3 -m http.server 4173 > "$PROJECT_DIR/.preview.log" 2>&1 &
        echo "✅ Preview at http://localhost:4173"
    else
        echo "❌ No build directory found. Run 'Build for Production' first (option 7)."
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
        1) install_deps ;;
        2) start_server ;;
        3) stop_server ;;
        4) restart_server ;;
        5) show_status ;;
        6) view_logs ;;
        7) build_production ;;
        8) preview_build ;;
        9) run_tests ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
done
