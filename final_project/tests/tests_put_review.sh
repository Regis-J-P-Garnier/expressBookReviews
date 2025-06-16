#!/bin/bash

BASE_URL="http://localhost:5000"

echo "Registering alice..."
curl -s -X POST "$BASE_URL/register" \
     -H "Content-Type: application/json" \
     -d '{"user": {"username": "alice", "password": "password123"}}'
echo -e "\n"

echo "Logging in as alice"
curl -s -X POST "$BASE_URL/customer/login" \
     -H "Content-Type: application/json" \
     -d '{"user": {"username": "alice", "password": "password123"}}' \
     -c cookies.txt
echo -e "\n"

echo "Submit review for ISBN 1"
curl -s -X PUT "$BASE_URL/customer/auth/review/1" \
     -H "Content-Type: application/json" \
     -d '{"review": "A powerful story about tradition and change."}' \
     -b cookies.txt
echo -e "\n"

echo "Fetch review for ISBN 1"
curl -s -X GET "$BASE_URL/review/1" -b cookies.txt
echo -e "\n"

echo "Submit review for ISBN 2"
curl -s -X PUT "$BASE_URL/customer/auth/review/2" \
     -H "Content-Type: application/json" \
     -d '{"review": "Beautiful storytelling from Hans Christian Andersen"}' \
     -b cookies.txt
echo -e "\n"

echo "Fetch review for ISBN 2"
curl -s -X GET "$BASE_URL/review/2" -b cookies.txt
echo -e "\n"

echo "Try submitting empty review"
curl -s -X PUT "$BASE_URL/customer/auth/review/1" \
     -H "Content-Type: application/json" \
     -d '{}' \
     -b cookies.txt
echo -e "\n"

echo "Try submitting review for non-existent book"
curl -s -X PUT "$BASE_URL/customer/auth/review/999" \
     -H "Content-Type: application/json" \
     -d '{"review": "This should fail"}' \
     -b cookies.txt
echo -e "\n"

echo "Try submitting without login"
curl -s -X PUT "$BASE_URL/customer/auth/review/1" \
     -H "Content-Type: application/json" \
     -d '{"review": "This should fail"}'
echo -e "\n"