const express = require('express');
let books = require("./booksdb.js").books;
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const redisClient = require('../middleware/redis'); // Import the Redis client
// Public router
const public_users = express.Router();

const MODE = "PROMISE"; // "NONE" || "ASYNC" || "PROMISE" 

// Public route: Register
public_users.post("/register", (req, res) => {
    const { username, password } = req.body.user || {};
    // Guard clauses
    const notHasUserAndPassword = (!username || !password)
    if (notHasUserAndPassword) {
        return res.status(400).json({ message: "Missing username or password" });
    }
    const hasValidUsername = (isValid(username))
    if (hasValidUsername) {
        return res.status(409).json({ message: "Username already taken" });
    }
    // register user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
if (MODE == "ASYNC") {
    const axios = require('axios');
    
    public_users.get('/', async (req, res) => {
        try {
            // WARN : add REDIS to have something to await... Flush the cache in PUT/DELETE
            const cacheKey = 'books:all';
            
            // 1. Check Redis cache
            const cachedBooks = await redisClient.get(cacheKey);
            if (cachedBooks) {
                return res.status(200).json(JSON.parse(cachedBooks));
            }

            // 2. Guard clause - Check if books exist
            if (!books || Object.keys(books).length === 0) {
                return res.status(404).json({ message: "No books found" });
            }

            // 3. Cache the books data with expiration
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(books));
            
            // 4. Return the books data
            return res.status(200).json(books);
            
        } catch (error) {
            console.error("Error in GET /:", error);
            return res.status(500).json({ 
                message: "Internal server error",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });
} else {
    public_users.get('/', function (req, res) {
        // Guard clauses
        const hasNoBook = (!books || Object.keys(books).length === 0)
        if (hasNoBook) {
            return res.status(404).json({ message: "No books found" });
        }
        // return books
        return res.status(200).json(books);
    });
}

// Get book details based on ISBN
if (MODE == "ASYNC") {
    const axios = require('axios');
    
    public_users.get('/isbn/:isbn', async (req, res) => {
        try {
            const isbn = req.params.isbn;
            const cacheKey = `book:isbn:${isbn}`;

            // 1. Check Redis cache first
            const cachedBook = await redisClient.get(cacheKey);
            if (cachedBook) {
                return res.status(200).json(JSON.parse(cachedBook));
            }

            // 2. Guard clause - Check if books exist
            if (!books || Object.keys(books).length === 0) {
                return res.status(404).json({ message: "No books found" });
            }

            // 3. Find requested book
            const requestedBook = books[isbn];
            if (!requestedBook) {
                return res.status(404).json({ message: "Book not found" });
            }

            // 4. Cache individual book with expiration (1 hour)
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(requestedBook));

            // 5. Return the book data
            return res.status(200).json(requestedBook);

        } catch (error) {
            console.error(`Error in GET /isbn/${req.params.isbn}:`, error);
            return res.status(500).json({ 
                message: "Internal server error",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }        
    });
} else {
        public_users.get('/isbn/:isbn', function (req, res) {
        // Extract ISBN from request URL
        const isbn = req.params.isbn;
        // Guard clause: Check if books exist
        const hasNoBooks = (!books || Object.keys(books).length === 0);
        if (hasNoBooks) {
            return res.status(404).json({ message: "No books found" });
        }
        // Find book by ISBN
        const requestedBook = books[isbn];
        // Guard clause: Check if book exists
        const hasNoRequesetBook = (!requestedBook)
        if (hasNoRequesetBook) {
            return res.status(404).json({ message: "Book not found" });
        }
        // Return book
        return res.status(200).json(requestedBook);
    });
}

  
// Get book details based on author
if (MODE == "PROMISE") {
    // WARN :  WORK with CURL/POSTMAN tests but not JS ones
    public_users.get('/author/:author', (req, res) => {
        const requestedAuthor = req.params.author;

        new Promise((resolve, reject) => {
            // Check if books exist
            const hasNoBooks = (!books || Object.keys(books).length === 0);
            if (hasNoBooks) {
                return reject({ status: 404, message: "No books found" });
            }

            // Filter books by author (case-insensitive)
            const filteredBooks = {};
            for (const isbn in books) {
                if (books[isbn].author.toLowerCase() === requestedAuthor.toLowerCase()) {
                    filteredBooks[isbn] = books[isbn];
                }
            }

            // If no matches
            if (Object.keys(filteredBooks).length === 0) {
                return reject({ status: 404, message: "Book not found" });
            }

            resolve(filteredBooks);
        })
        .then((booksData) => {
            res.status(200).json(booksData);
        })
        .catch((error) => {
            const statusCode = error.status || 500;
            const errorMessage = error.message || "Internal server error";

            res.status(statusCode).json({ message: errorMessage });
        });
    });

} else {
    public_users.get('/author/:author', function (req, res) {
        const requestedAuthor = req.params.author;

        // Guard clause: Check if books exist
        const hasNoBooks = (!books || Object.keys(books).length === 0);
        if (hasNoBooks) {
            return res.status(404).json({ message: "No books found" });
        }

        // Filter books by author
        const filteredBooks = {};
        for (const isbn in books) {
            const hasRequestedAuthor = books[isbn].author.toLowerCase() === requestedAuthor.toLowerCase();
            if (hasRequestedAuthor) {
                filteredBooks[isbn] = books[isbn];
            }
        }

        // Guard clause: Check if any match was found
        const hasNoMatchingBook = (Object.keys(filteredBooks).length === 0);
        if (hasNoMatchingBook) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Return filtered books
        return res.status(200).json(filteredBooks);
    });
}

// Get all books based on title
if (MODE == "PROMISE") {
    public_users.get('/title/:title', (req, res) => {
        const requestedTitle = req.params.title;

        new Promise((resolve, reject) => {
            // Check if books exist
            const hasNoBooks = (!books || Object.keys(books).length === 0);
            if (hasNoBooks) {
                return reject({ status: 404, message: "No books found" });
            }

            // Filter books by title (case-insensitive)
            const filteredBooks = {};
            for (const isbn in books) {
                if (books[isbn].title.toLowerCase() === requestedTitle.toLowerCase()) {
                    filteredBooks[isbn] = books[isbn];
                }
            }

            // If no matches
            if (Object.keys(filteredBooks).length === 0) {
                return reject({ status: 404, message: "Book not found" });
            }

            resolve(filteredBooks);
        })
        .then((booksData) => {
            res.status(200).json(booksData);
        })
        .catch((error) => {
            const statusCode = error.status || 500;
            const errorMessage = error.message || "Internal server error";
            res.status(statusCode).json({ message: errorMessage });
        });
    });
} else {
    public_users.get('/title/:title', function (req, res) {
        const requestedTitle = req.params.title;

        // Guard clause: Check if books exist
        const hasNoBooks = (!books || Object.keys(books).length === 0);
        if (hasNoBooks) {
            return res.status(404).json({ message: "No books found" });
        }

        // Filter books by title
        const filteredBooks = {};
        for (const isbn in books) {
            const hasRequestedTitle = books[isbn].title === requestedTitle;
            if (hasRequestedTitle) {
                filteredBooks[isbn] = books[isbn];
            }
        }

        // Guard clause: Check if any matching book was found
        const hasNoMatchingBook = (Object.keys(filteredBooks).length === 0);
        if (hasNoMatchingBook) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Return filtered books
        return res.status(200).json(filteredBooks);
    });
}
// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    // Guard clause: Check if books exist
    const hasNoBooks = (!books || Object.keys(books).length === 0);
    if (hasNoBooks) {
        return res.status(404).json({ message: "No books found" });
    }

    // Find book by ISBN
    const requestedBook = books[isbn];

    // Guard clause: Check if book exists
    const hasNoRequestedBook = (!requestedBook);
    if (hasNoRequestedBook) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Get reviews for the book
    const bookReviews = requestedBook.reviews;

    // Guard clause: If no reviews exist for the book
    const hasNoReviews = (!bookReviews || Object.keys(bookReviews).length === 0);
    if (hasNoReviews) {
        return res.status(404).json({ message: "No reviews found for this book" });
    }

    // Return reviews
    return res.status(200).json(bookReviews);
});

module.exports.general = public_users;
