#!/bin/bash

# Base URL
BASE_URL="http://localhost:5000"

echo "Testing GET / - List all books"
curl -s -X GET "$BASE_URL/"
echo -e "\n"

echo "Testing GET /isbn/1 - Book by ISBN"
curl -s -X GET "$BASE_URL/isbn/1"
echo -e "\n"

echo "Testing GET /isbn/999 - Invalid ISBN"
curl -s -X GET "$BASE_URL/isbn/999"
echo -e "\n"

echo "Testing GET /author/Unknown - Books by Unknown"
curl -s -X GET "$BASE_URL/author/Unknown"
echo -e "\n"

echo "Testing GET /author/NoSuchAuthor - No such author"
curl -s -X GET "$BASE_URL/author/NoSuchAuthor"
echo -e "\n"

echo "Testing GET /title/Fairy%20tales - Book by title"
curl -s -X GET "$BASE_URL/title/Fairy%20tales"
echo -e "\n"

echo "Testing GET /title/NoSuchTitle - Invalid title"
curl -s -X GET "$BASE_URL/title/NoSuchTitle"
echo -e "\n"

echo "Testing GET /review/1 - Reviews for ISBN 1"
curl -s -X GET "$BASE_URL/review/1"
echo -e "\n"

echo "Testing GET /review/999 - Book not found"
curl -s -X GET "$BASE_URL/review/999"
echo -e "\n"