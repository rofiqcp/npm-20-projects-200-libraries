#!/bin/bash

# Server Management Script - Project 11: Social Media Feed (Twitter-like)
# Tech Stack: Express.js + GraphQL + Apollo + React | PostgreSQL | Socket.IO

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=4000
FRONTEND_PORT=3000
BACKEND_PID_FILE="$PROJECT_DIR/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/.frontend.pid"

show_menu() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║   Project 11: Social Media Feed (Twitter-like)               ║"
    echo "║   Stack: Express + GraphQL + Apollo + React | PostgreSQL     ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "1.  Install Dependencies"
    echo "2.  Start All Servers"
    echo "3.  Stop All Servers"
    echo "4.  Restart All Servers"
    echo "5.  Status"
    echo "6.  Start PostgreSQL (Docker)"
    echo "7.  Stop PostgreSQL (Docker)"
    echo "8.  Run DB Migrations"
    echo "9.  Seed Database"
    echo "10. View Backend Logs"
    echo "11. View Frontend Logs"
    echo "12. Run Tests"
    echo "13. Open GraphQL Playground"
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
        echo "   Backend: npm install express apollo-server-express graphql pg bcrypt jsonwebtoken cors dotenv"
        echo "   Frontend: npm install react @apollo/client graphql tailwindcss react-router-dom"
    fi
    echo "✅ Done"
}

start_postgres() {
    echo "🗄️  Starting PostgreSQL (Docker)..."
    if command -v docker &>/dev/null; then
        docker run -d --name social-feed-postgres \
            -e POSTGRES_DB=social_feed \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=postgres \
            -p 5432:5432 postgres:14 2>/dev/null || docker start social-feed-postgres 2>/dev/null
        sleep 3
        echo "✅ PostgreSQL running on port 5432"
    else
        echo "⚠️  Docker not found. Start PostgreSQL manually."
    fi
}

stop_postgres() {
    echo "⏸  Stopping PostgreSQL..."
    command -v docker &>/dev/null && docker stop social-feed-postgres 2>/dev/null
    echo "✅ PostgreSQL stopped"
}

start_backend() {
    local backend_dir="$PROJECT_DIR/backend"
    [ ! -d "$backend_dir" ] && backend_dir="$PROJECT_DIR"
    [ ! -f "$backend_dir/package.json" ] && echo "❌ Backend not found." && return
    echo "🚀 Starting GraphQL server on port $BACKEND_PORT..."
    cd "$backend_dir"
    local cmd="node server.js"
    grep -q '"dev"' package.json && cmd="npm run dev"
    nohup $cmd > "$PROJECT_DIR/.backend.log" 2>&1 &
    echo $! > "$BACKEND_PID_FILE"
    echo "✅ Backend started (PID: $!) → http://localhost:$BACKEND_PORT"
    echo "   GraphQL Playground: http://localhost:$BACKEND_PORT/graphql"
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
    echo "📊 Server Status - Social Media Feed"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ -f "$BACKEND_PID_FILE" ] && kill -0 "$(cat "$BACKEND_PID_FILE")" 2>/dev/null; then
        echo "  Backend   : ✅ Running → http://localhost:$BACKEND_PORT"
        echo "  GraphQL   : ✅ http://localhost:$BACKEND_PORT/graphql"
    else
        echo "  Backend   : ❌ Not running"
    fi
    if [ -f "$FRONTEND_PID_FILE" ] && kill -0 "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null; then
        echo "  Frontend  : ✅ Running → http://localhost:$FRONTEND_PORT"
    else
        echo "  Frontend  : ❌ Not running"
    fi
    if command -v docker &>/dev/null; then
        local st
        st=$(docker inspect -f '{{.State.Status}}' social-feed-postgres 2>/dev/null || echo "not found")
        echo "  PostgreSQL: $([ "$st" = "running" ] && echo "✅ Running (port 5432)" || echo "❌ $st")"
    fi
    echo ""
    echo "🌐 Access:"
    echo "  Feed            : http://localhost:$FRONTEND_PORT"
    echo "  GraphQL API     : http://localhost:$BACKEND_PORT/graphql"
    echo "  GraphQL Playground (dev mode) →  http://localhost:$BACKEND_PORT/graphql"
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
        echo "   CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE, email VARCHAR(100) UNIQUE, bio TEXT);"
        echo "   CREATE TABLE posts (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id), content TEXT, created_at TIMESTAMP DEFAULT NOW());"
        echo "   CREATE TABLE likes (user_id INT, post_id INT, PRIMARY KEY(user_id, post_id));"
        echo "   CREATE TABLE follows (follower_id INT, following_id INT, PRIMARY KEY(follower_id, following_id));"
        echo "   CREATE INDEX idx_posts_feed ON posts(user_id, created_at DESC);"
    fi
}

seed_database() {
    echo "🌱 Seeding database..."
    if [ -f "$PROJECT_DIR/backend/seed.js" ]; then
        cd "$PROJECT_DIR/backend" && node seed.js
    elif [ -f "$PROJECT_DIR/backend/package.json" ] && grep -q '"seed"' "$PROJECT_DIR/backend/package.json"; then
        cd "$PROJECT_DIR/backend" && npm run seed
    else
        echo "⚠️  No seed script found."
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

open_graphql_playground() {
    echo "🔬 Opening GraphQL Playground..."
    local url="http://localhost:$BACKEND_PORT/graphql"
    if command -v xdg-open &>/dev/null; then
        xdg-open "$url"
    elif command -v open &>/dev/null; then
        open "$url"
    else
        echo "Visit: $url"
    fi
    echo ""
    echo "Example queries:"
    echo ""
    echo "  query { posts(limit: 10, offset: 0) { id content author { username } likes } }"
    echo "  mutation { createPost(content: \"Hello World!\") { id content } }"
    echo "  mutation { login(email: \"user@example.com\", password: \"pass\") { token } }"
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
        9)  seed_database ;;
        10) view_backend_logs ;;
        11) view_frontend_logs ;;
        12) run_tests ;;
        13) open_graphql_playground ;;
        0)  echo "👋 Goodbye!"; exit 0 ;;
        *)  echo "❌ Invalid option. Please try again." ;;
    esac
done
