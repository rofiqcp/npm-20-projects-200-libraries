#!/bin/bash

# Server Management Script - Project 3: Weather App
# Tech Stack: React + Axios | OpenWeatherMap API | No Backend
# External API: https://openweathermap.org/api (free tier)

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEV_PORT=3000
SERVER_PID_FILE="$PROJECT_DIR/.server.pid"

show_menu() {
    echo ""
    echo "╔══════════════════════════════════════════════════════╗"
    echo "║   Project 3: Weather App                             ║"
    echo "║   Stack: React + Axios | OpenWeatherMap API (Free)  ║"
    echo "╚══════════════════════════════════════════════════════╝"
    echo ""
    echo "1. Install Dependencies"
    echo "2. Start Dev Server"
    echo "3. Stop Dev Server"
    echo "4. Restart Dev Server"
    echo "5. Status"
    echo "6. View Logs"
    echo "7. Build for Production"
    echo "8. Preview Production Build"
    echo "9. Test OpenWeatherMap API Key"
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
        echo "   npm install axios chart.js react-chartjs-2"
        echo "   npm install -D tailwindcss postcss autoprefixer"
        echo ""
        echo "📋 Required API key:"
        echo "   Get free API key at: https://openweathermap.org/api"
        echo "   Create .env file: VITE_WEATHER_API_KEY=your_api_key"
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
    # Check for .env file
    if [ ! -f "$PROJECT_DIR/.env" ] && [ ! -f "$PROJECT_DIR/.env.local" ]; then
        echo "⚠️  No .env file found. You may need VITE_WEATHER_API_KEY."
        echo "   Get a free key at: https://openweathermap.org/api"
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
    pkill -f "vite.*weather" 2>/dev/null
    pkill -f "react-scripts start" 2>/dev/null
    echo "✅ Dev server stopped"
}

show_status() {
    echo ""
    echo "📊 Server Status - Weather App"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "$SERVER_PID_FILE" ] && kill -0 "$(cat "$SERVER_PID_FILE")" 2>/dev/null; then
        echo "  Status : ✅ Running (PID: $(cat "$SERVER_PID_FILE"))"
        echo "  Access : http://localhost:$DEV_PORT"
    else
        echo "  Status : ❌ Not running"
    fi
    echo ""
    echo "🔑 API Key:"
    if [ -f "$PROJECT_DIR/.env" ] && grep -q "WEATHER_API_KEY\|OPENWEATHER" "$PROJECT_DIR/.env"; then
        echo "  ✅ .env found with API key"
    elif [ -f "$PROJECT_DIR/.env.local" ] && grep -q "WEATHER_API_KEY\|OPENWEATHER" "$PROJECT_DIR/.env.local"; then
        echo "  ✅ .env.local found with API key"
    else
        echo "  ⚠️  No .env file — set VITE_WEATHER_API_KEY"
        echo "     Get free key: https://openweathermap.org/api"
    fi
    echo ""
    echo "📦 Caching: Browser sessionStorage"
    echo "   API results cached per city to reduce API calls"
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
        echo "❌ No build directory found. Run 'Build for Production' first (option 7)."
    fi
}

test_api_key() {
    echo "🔑 Testing OpenWeatherMap API key..."
    local api_key=""
    if [ -f "$PROJECT_DIR/.env" ]; then
        api_key=$(grep -o 'VITE_WEATHER_API_KEY=\S*\|REACT_APP_WEATHER_API_KEY=\S*\|OPENWEATHER_API_KEY=\S*' "$PROJECT_DIR/.env" | cut -d= -f2)
    fi
    if [ -f "$PROJECT_DIR/.env.local" ] && [ -z "$api_key" ]; then
        api_key=$(grep -o 'VITE_WEATHER_API_KEY=\S*\|REACT_APP_WEATHER_API_KEY=\S*' "$PROJECT_DIR/.env.local" | cut -d= -f2)
    fi

    if [ -z "$api_key" ]; then
        echo "⚠️  No API key found in .env or .env.local"
        echo "   Create .env and add: VITE_WEATHER_API_KEY=your_key_here"
        return
    fi
    if command -v curl &>/dev/null; then
        local response
        response=$(curl -s "https://api.openweathermap.org/data/2.5/weather?q=London&appid=$api_key&units=metric" 2>/dev/null)
        if echo "$response" | grep -q '"main"'; then
            echo "✅ API key is valid!"
            echo "   Test result for London:"
            echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'   Temp: {d[\"main\"][\"temp\"]}°C, {d[\"weather\"][0][\"description\"]}')" 2>/dev/null || echo "   $response"
        else
            echo "❌ API key test failed:"
            echo "   $response"
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
        9)  test_api_key ;;
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
