#!/bin/bash

# Server Management Script - Project 13: AI Chatbot with LLM Integration
# Tech Stack: Express.js + React | MongoDB + Redis | LangChain + OpenAI API

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=5000
FRONTEND_PORT=3000
MONGO_PORT=27017
REDIS_PORT=6379
BACKEND_PID_FILE="$PROJECT_DIR/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend.pid"

show_menu() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║   Project 13: AI Chatbot with LLM Integration                    ║"
    echo "║   Stack: Express + React | MongoDB + Redis | LangChain + OpenAI  ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "1.  Install Dependencies"
    echo "2.  Start All Servers"
    echo "3.  Stop All Servers"
    echo "4.  Restart All Servers"
    echo "5.  Status"
    echo "6.  Start Databases (Docker)"
    echo "7.  Stop Databases (Docker)"
    echo "8.  View Backend Logs"
    echo "9.  View Frontend Logs"
    echo "10. Run Tests"
    echo "11. Test OpenAI API Key"
    echo "12. View Chat History (MongoDB)"
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
        echo "   Backend: npm install express mongoose redis langchain @langchain/openai openai cors dotenv"
        echo "   Frontend: npm install react axios react-markdown tailwindcss react-router-dom"
        echo ""
        echo "📋 Required API key:"
        echo "   Get OpenAI API key at: https://platform.openai.com/api-keys"
        echo "   Create .env: OPENAI_API_KEY=sk-..."
    fi
    echo "✅ Done"
}

start_databases() {
    echo "🗄️  Starting databases (Docker)..."
    if command -v docker &>/dev/null; then
        docker run -d --name ai-chatbot-mongo \
            -p "$MONGO_PORT:27017" mongo:latest 2>/dev/null || docker start ai-chatbot-mongo 2>/dev/null
        docker run -d --name ai-chatbot-redis \
            -p "$REDIS_PORT:6379" redis:alpine 2>/dev/null || docker start ai-chatbot-redis 2>/dev/null
        sleep 3
        echo "✅ MongoDB running on port $MONGO_PORT"
        echo "✅ Redis running on port $REDIS_PORT"
    else
        echo "⚠️  Docker not found. Start MongoDB and Redis manually."
    fi
}

stop_databases() {
    echo "⏸  Stopping databases..."
    command -v docker &>/dev/null && docker stop ai-chatbot-mongo ai-chatbot-redis 2>/dev/null
    echo "✅ Databases stopped"
}

start_backend() {
    local backend_dir="$PROJECT_DIR/backend"
    [ ! -d "$backend_dir" ] && backend_dir="$PROJECT_DIR"
    [ ! -f "$backend_dir/package.json" ] && echo "❌ Backend not found." && return
    # Check API key
    if [ ! -f "$backend_dir/.env" ] && [ ! -f "$PROJECT_DIR/.env" ]; then
        echo "⚠️  No .env file found. You NEED an OpenAI API key."
        echo "   Create .env with: OPENAI_API_KEY=sk-..."
        echo ""
    fi
    echo "🤖 Starting AI Chatbot backend on port $BACKEND_PORT..."
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
    echo "📊 Server Status - AI Chatbot"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
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
        for db in ai-chatbot-mongo ai-chatbot-redis; do
            local st
            st=$(docker inspect -f '{{.State.Status}}' "$db" 2>/dev/null || echo "not found")
            echo "  $db: $([ "$st" = "running" ] && echo "✅ Running" || echo "❌ $st")"
        done
    fi
    # Check API key
    local has_key="❌ Not configured"
    for env_file in "$PROJECT_DIR/.env" "$PROJECT_DIR/backend/.env"; do
        [ -f "$env_file" ] && grep -q "OPENAI_API_KEY" "$env_file" && has_key="✅ Found in .env"
    done
    echo ""
    echo "  OpenAI Key: $has_key"
    echo ""
    echo "🌐 Access:"
    echo "  Chatbot  : http://localhost:$FRONTEND_PORT"
    echo "  API Chat : POST http://localhost:$BACKEND_PORT/api/chat"
    echo "  History  : GET  http://localhost:$BACKEND_PORT/api/conversations"
    echo ""
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

test_openai_key() {
    echo "🤖 Testing OpenAI API key..."
    local api_key=""
    for env_file in "$PROJECT_DIR/.env" "$PROJECT_DIR/backend/.env"; do
        [ -f "$env_file" ] && api_key=$(grep -o 'OPENAI_API_KEY=\S*' "$env_file" | cut -d= -f2 | head -1) && [ -n "$api_key" ] && break
    done
    if [ -z "$api_key" ]; then
        echo "⚠️  No OPENAI_API_KEY found in .env"
        echo "   Get key at: https://platform.openai.com/api-keys"
        return
    fi
    if command -v curl &>/dev/null; then
        local response
        response=$(curl -s -X POST "https://api.openai.com/v1/chat/completions" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $api_key" \
            -d '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"Say hi in one word"}],"max_tokens":10}' 2>/dev/null)
        if echo "$response" | grep -q '"content"'; then
            local reply
            reply=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['choices'][0]['message']['content'])" 2>/dev/null)
            echo "✅ OpenAI API key is valid!"
            echo "   Test response: $reply"
        else
            echo "❌ API test failed:"
            echo "   $(echo "$response" | head -c 300)"
        fi
    else
        echo "⚠️  curl not found. Cannot test API key."
    fi
}

view_chat_history() {
    echo "💬 Chat History (MongoDB):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if command -v mongosh &>/dev/null; then
        mongosh --quiet "mongodb://localhost:$MONGO_PORT/ai_chatbot" \
            --eval 'db.conversations.find({},{sessionId:1,createdAt:1,_id:0}).sort({createdAt:-1}).limit(5).forEach(d=>print(JSON.stringify(d)))' 2>/dev/null || echo "  (MongoDB not accessible)"
    elif command -v mongo &>/dev/null; then
        mongo --quiet "mongodb://localhost:$MONGO_PORT/ai_chatbot" \
            --eval 'db.conversations.find({},{sessionId:1,createdAt:1,_id:0}).sort({createdAt:-1}).limit(5).forEach(d=>print(JSON.stringify(d)))' 2>/dev/null || echo "  (MongoDB not accessible)"
    else
        echo "  Install mongosh to view chat history directly."
        echo "  Access via: http://localhost:$BACKEND_PORT/api/conversations"
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
        6)  start_databases ;;
        7)  stop_databases ;;
        8)  view_backend_logs ;;
        9)  view_frontend_logs ;;
        10) run_tests ;;
        11) test_openai_key ;;
        12) view_chat_history ;;
        0)  echo "👋 Goodbye!"; exit 0 ;;
        *)  echo "❌ Invalid option. Please try again." ;;
    esac
done
