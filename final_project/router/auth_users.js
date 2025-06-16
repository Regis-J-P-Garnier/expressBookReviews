const express = require('express');
const jwt = require('jsonwebtoken');

const regd_users = express.Router();

// Import middleware
const verifyToken = require('../middleware/authJwt');

// Utility functions
let users = [];

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

    if (!user || !user.username || !user.password) {
        return res.status(400).json({ message: "Username or password missing" });
    }

    if (!authenticatedUser(user.username, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign({ data: user.username }, 'access', { expiresIn: '24h' });
    req.session.authorization = { accessToken };

    return res.status(200).send("User successfully logged in");
});

// Middleware for protected routes
const authMiddleware = (req, res, next) => {
    const token = req.session?.authorization?.accessToken;

    if (!token) {
        return res.status(403).json({ message: "User not logged in" });
    }

    try {
        const decoded = jwt.verify(token, "access");
        req.user = decoded.data;
        next();
    } catch (err) {
        return res.status(403).json({ message: "User not authenticated" });
    }
};

// Protected route example: Add review
regd_users.put("/review/:isbn", authMiddleware, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user;

    return res.status(200).json({
        message: `Review submitted for ISBN ${isbn} by ${username}`
    });
});

// Export both the router and utility functions
module.exports = {
    regd_users,
    isValid,
    authenticatedUser,
    users
};