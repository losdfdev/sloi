#!/bin/bash
echo "Killing old quick tunnels..."
pkill -f cloudflared
sleep 2

cd frontend
rm -f frontend_cf.log backend_cf.log
echo "Starting Frontend Tunnel (5173)..."
nohup ./cloudflared tunnel --protocol http2 --url http://127.0.0.1:5173 > frontend_cf.log 2>&1 &

echo "Starting Backend Tunnel (5001)..."
nohup ./cloudflared tunnel --protocol http2 --url http://127.0.0.1:5001 > backend_cf.log 2>&1 &

echo "Waiting 10 seconds for URLs to generate..."
sleep 10

FRONTEND_URL=$(grep "trycloudflare.com" frontend_cf.log | grep "INF" | head -n 1 | awk '{print $5}' | tr -d '\n\r')
BACKEND_URL=$(grep "trycloudflare.com" backend_cf.log | grep "INF" | head -n 1 | awk '{print $5}' | tr -d '\n\r')

echo "FRONTEND_URL=$FRONTEND_URL"
echo "BACKEND_URL=$BACKEND_URL"
