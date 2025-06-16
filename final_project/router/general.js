const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
// Public router
const public_users = express.Router();

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
public_users.get('/', function (req, res) {
    // Guard clauses
    const hasNoBook = (!books || Object.keys(books).length === 0)
    if (hasNoBook) {
        return res.status(404).json({ message: "No books found" });
    }
    // return books
    return res.status(200).json(books);
});

// Get book details based on ISBN
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
  
// Get book details based on author
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
        const hasRequestedAuthor = books[isbn].author === requestedAuthor;
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

// Get all books based on title
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
