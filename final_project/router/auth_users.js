const express = require('express');
const jwt = require('jsonwebtoken');

// Import middleware
// const verifyToken = require('../middleware/authJwt');
let books = require('./booksdb.js').books; // for the put function

// auth users only and "login" router
const regd_users = express.Router();

let users = []; // list of registred users

// Utility functions
const isValid = (username) => {
    return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(user => 
        user.username === username && user.password === password
    );
};

// Public route: Login
regd_users.post("/login", (req, res) => {
    const user = req.body.user;
    // guard clauses
    const hasUsernameAndPassword = (!user || !user.username || !user.password)
    if (hasUsernameAndPassword) {
        return res.status(400).json({ message: "Username or password missing" });
    }
    const isAuthicatedUser = (!authenticatedUser(user.username, user.password))
    if (isAuthicatedUser) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    // build token
    const accessToken = jwt.sign({ data: user.username }, 'access', { expiresIn: '24h' });
    // define session authorization
    req.session.authorization = { accessToken };
    return res.status(200).send("User successfully logged in");
});

// Add or modify a book review (protected route)
regd_users.put("/auth/review/:isbn", (req, res) => {
    // 1. Check if user is authenticated via session
    const token = req.session?.authorization?.accessToken;

    if (!token) {
        return res.status(403).json({ message: "User not logged in" });
    }

    try {
        const decoded = jwt.verify(token, "access");
        req.user = decoded.data;
    } catch (err) {
        return res.status(403).json({ message: "User not authenticated" });
    }

    // 2. Validate ISBN and review input
    const isbn = req.params.isbn;
    const review = req.body.review;

    const hasNoBooks = (!books || Object.keys(books).length === 0);
    if (hasNoBooks) {
        return res.status(404).json({ message: "No books found" });
    }

    const requestedBook = books[isbn];
    const notHasRequestedBook = (!requestedBook);
    if (notHasRequestedBook) {
        return res.status(404).json({ message: "Book not found" });
    }
    const NOTHasReview = (!review);
    if (NOTHasReview) {
        return res.status(400).json({ message: "Review content is required" });
    }

    const username = req.user;

    // 3. Save review
    requestedBook.reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully" });
});

// Delete own book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // 1. Check if user is authenticated via session
    const token = req.session?.authorization?.accessToken;
    const notHasToken = (!token);
    if (notHasToken) {
        return res.status(403).json({ message: "User not logged in" });
    }

    try {
        const decoded = jwt.verify(token, "access");
        req.user = decoded.data;
    } catch (err) {
        return res.status(403).json({ message: "User not authenticated" });
    }

    // 2. Validate book existence
    const hasNoBooks = (!books || Object.keys(books).length === 0);
    if (hasNoBooks) {
        return res.status(404).json({ message: "No books found" });
    }

    const requestedBook = books[isbn];
    const notHasRequestedBook = (!requestedBook);
    if (notHasRequestedBook) {
        return res.status(404).json({ message: "Book not found" });
    }

    // 3. Get current user
    const username = req.user;

    // 4. Check if user has a review for this book
    const userReviewExists = requestedBook.reviews.hasOwnProperty(username);
    const notIsUserReviewExists = (!userReviewExists)
    if (notIsUserReviewExists) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    // 5. Delete the review
    delete requestedBook.reviews[username];

    return res.status(200).json({ message: "Review deleted successfully" });
});

// Export both the router and utility functions
module.exports = {
    regd_users,
    isValid,
    authenticatedUser,
    users
};