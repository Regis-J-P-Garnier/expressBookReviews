#!/bin/bash

# Base URL
BASE_URL="http://localhost:5000"

# Register
echo "Registering alice..."
curl -X POST "$BASE_URL/register" \
     -H "Content-Type: application/json" \
     -d '{"user": {"username": "alice", "password": "password123"}}'

# Register Again
echo "Registering alice again..."
curl -X POST "$BASE_URL/register" \
     -H "Content-Type: application/json" \
     -d '{"user": {"username": "alice", "password": "password123"}}'

# Login
echo -e "\nLogging in alice..."
curl -X POST "$BASE_URL/customer/login" \
     -H "Content-Type: application/json" \
     -d '{"user": {"username": "alice", "password": "password123"}}' \
     -c cookies.txt