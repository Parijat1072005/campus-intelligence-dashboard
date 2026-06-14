#!/bin/bash
# CampusIQ — Start all MCP servers + frontend
# Usage: chmod +x start-dev.sh && ./start-dev.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       CampusIQ Dev Environment       ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# Check for .env.local
if [ ! -f "frontend/.env.local" ]; then
  echo -e "${YELLOW}⚠  frontend/.env.local not found. Copying from .env.example...${NC}"
  cp frontend/.env.example frontend/.env.local
  echo -e "${RED}   → Please add your ANTHROPIC_API_KEY to frontend/.env.local${NC}"
  echo ""
fi

# Kill any existing processes on our ports
for PORT in 3000 3001 3002 3003 3004; do
  PID=$(lsof -ti:$PORT 2>/dev/null || true)
  if [ -n "$PID" ]; then
    echo -e "${YELLOW}Killing existing process on port $PORT (PID $PID)${NC}"
    kill -9 $PID 2>/dev/null || true
  fi
done

echo -e "${GREEN}Starting MCP Servers...${NC}"
echo ""

# Start Library MCP
echo -e "${BLUE}📚 Library MCP Server → http://localhost:3001${NC}"
cd mcp-servers/library && npm run dev &> /tmp/mcp-library.log &
cd ../..

sleep 0.5

# Start Cafeteria MCP
echo -e "${BLUE}🍽️  Cafeteria MCP Server → http://localhost:3002${NC}"
cd mcp-servers/cafeteria && npm run dev &> /tmp/mcp-cafeteria.log &
cd ../..

sleep 0.5

# Start Events MCP
echo -e "${BLUE}📅 Events MCP Server → http://localhost:3003${NC}"
cd mcp-servers/events && npm run dev &> /tmp/mcp-events.log &
cd ../..

sleep 0.5

# Start Academics MCP
echo -e "${BLUE}🎓 Academics MCP Server → http://localhost:3004${NC}"
cd mcp-servers/academics && npm run dev &> /tmp/mcp-academics.log &
cd ../..

sleep 1

echo ""
echo -e "${GREEN}Starting Next.js Frontend...${NC}"
echo -e "${CYAN}🌐 Dashboard → http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Logs: /tmp/mcp-library.log | /tmp/mcp-cafeteria.log | /tmp/mcp-events.log | /tmp/mcp-academics.log${NC}"
echo ""
echo -e "${GREEN}Press Ctrl+C to stop all servers.${NC}"
echo ""

# Trap Ctrl+C to kill all background jobs
trap 'echo ""; echo "Stopping all servers..."; kill $(jobs -p) 2>/dev/null; exit 0' INT

# Start frontend in foreground
cd frontend && npm run dev
