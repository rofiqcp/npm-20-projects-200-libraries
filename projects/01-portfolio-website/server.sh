#!/bin/bash

# Server Management Script - Project 1: Portfolio Website Statis
# Tech Stack: HTML5 + CSS3 + JavaScript | Static Site | No Database
# Served with Python http.server or Node.js serve

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=8080
SERVER_PID_FILE="$PROJECT_DIR/.server.pid"

show_menu() {
    echo ""
    echo "╔══════════════════════════════════════════════════╗"
    echo "║   Project 1: Portfolio Website Statis            ║"
    echo "║   Stack: HTML5 + CSS3 + JavaScript (Static)     ║"
    echo "╚══════════════════════════════════════════════════╝"
    echo ""
    echo "1. Start Server"
    echo "2. Stop Server"
    echo "3. Status"
    echo "4. View Logs"
    echo "5. Restart Server"
    echo "6. Open in Browser"
    echo "7. Build / Validate HTML"
    echo "0. Exit"
    echo ""
}

start_server() {
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
        pkill -f "python.*http.server" 2>/dev/null
        pkill -f "python.*SimpleHTTPServer" 2>/dev/null
        pkill -f "npx serve" 2>/dev/null
        echo "✅ Server stopped"
    fi
}

show_status() {
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

view_logs() {
    echo "📝 Server Logs (last 30 lines):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "$PROJECT_DIR/.server.log" ]; then
        tail -30 "$PROJECT_DIR/.server.log"
    else
        echo "No logs found."
    fi
    echo ""
}

open_browser() {
    echo "🌐 Opening http://localhost:$PORT in browser..."
    if command -v xdg-open &>/dev/null; then
        xdg-open "http://localhost:$PORT"
    elif command -v open &>/dev/null; then
        open "http://localhost:$PORT"
    else
        echo "Please open http://localhost:$PORT manually in your browser."
    fi
}

validate_html() {
    echo "🔍 Validating project files..."
    local errors=0
    for f in index.html style.css script.js; do
        if [ -f "$PROJECT_DIR/$f" ]; then
            echo "  ✅ Found: $f ($(wc -l < "$PROJECT_DIR/$f") lines)"
        else
            echo "  ❌ Missing: $f"
            errors=$((errors + 1))
        fi
    done
    if [ $errors -eq 0 ]; then
        echo ""
        echo "✅ All required files present. Ready to serve!"
    else
        echo ""
        echo "⚠️  $errors file(s) missing. Create them before starting the server."
    fi
}

restart_server() {
    echo "🔄 Restarting server..."
    stop_server
    sleep 1
    start_server
}

while true; do
    show_menu
    read -r -p "Choose an option: " choice

    case $choice in
        1) start_server ;;
        2) stop_server ;;
        3) show_status ;;
        4) view_logs ;;
        5) restart_server ;;
        6) open_browser ;;
        7) validate_html ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
done
