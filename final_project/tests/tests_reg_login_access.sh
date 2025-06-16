#!/bin/bash

# Register
echo "Registering alice..."
curl -X POST http://localhost:5000/register \
     -H "Content-Type: application/json" \
     -d '{"user": {"username": "alice", "password": "password123"}}'

# Login
echo -e "\nLogging in alice..."
curl -X POST http://localhost:5000/customer/login \
     -H "Content-Type: application/json" \
     -d '{"user": {"username": "alice", "password": "password123"}}' \
     -c cookies.txt

# Submit Review
echo -e "\nSubmitting review..."
curl -X PUT http://localhost:5000/customer/review/1234 \
     -b cookies.txt \
     -H "Content-Type: application/json" \
     -d '{"review": "Great book!"}'

# Unauthorized attempt
echo -e "\n\nTrying without login..."
curl -X PUT http://localhost:5000/customer/review/1234 \
     -H "Content-Type: application/json" \
     -d '{"review": "Should fail"}'