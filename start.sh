#!/bin/bash

# Скрипт для быстрого запуска frontend и backend одновременно

echo "🚀 Запуск Tinder TG Mini App"
echo "======================================"
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверяем Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js не установлен!${NC}"
    echo "Установите Node.js с https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✅ Node.js найден${NC} ($(node --version))"
echo ""

# Проверяем .env файлы
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  backend/.env не найден${NC}"
    echo "Копирую .env.example..."
    cp .env.example backend/.env
    echo "Отредактируйте backend/.env перед запуском"
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}⚠️  frontend/.env не найден${NC}"
    echo "Копирую .env.example..."
    cp .env.example frontend/.env
    echo "Отредактируйте frontend/.env перед запуском"
fi

echo ""
echo "📦 Установка зависимостей..."
echo ""

# Backend
echo -e "${YELLOW}📦 Backend...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    npm install > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backend зависимости установлены${NC}"
    else
        echo -e "${RED}❌ Ошибка при установке backend зависимостей${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Backend зависимости уже установлены${NC}"
fi
cd ..

# Frontend
echo -e "${YELLOW}📦 Frontend...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    npm install > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Frontend зависимости установлены${NC}"
    else
        echo -e "${RED}❌ Ошибка при установке frontend зависимостей${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Frontend зависимости уже установлены${NC}"
fi
cd ..

echo ""
echo "======================================"
echo -e "${GREEN}🎉 Всё готово!${NC}"
echo ""
echo "Запуск приложения в новых терминалах:"
echo ""
echo -e "${YELLOW}Terminal 1 (Backend):${NC}"
echo "  cd backend && npm run dev"
echo ""
echo -e "${YELLOW}Terminal 2 (Frontend):${NC}"
echo "  cd frontend && npm run dev"
echo ""
echo "======================================"
echo ""
echo "Frontend URL: http://localhost:5173"
echo "Backend URL: http://localhost:5001"
echo ""
echo "Документация: QUICKSTART.md"
