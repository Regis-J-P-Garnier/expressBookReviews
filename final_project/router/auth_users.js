const express = require('express');
const jwt = require('jsonwebtoken');
// Import middleware
const verifyToken = require('../middleware/authJwt');

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

// Middleware for protected routes
const authMiddleware = (req, res, next) => {
    // try to retrieve Token
    const token = req.session?.authorization?.accessToken;
    // guard clauses
    const notHasToken = (!token)
    if (notHasToken) {
        return res.status(403).json({ message: "User not logged in" });
    }
    // decode an valid Token
    try {
        const decoded = jwt.verify(token, "access");
        req.user = decoded.data;
        next();
    } catch (err) {
        return res.status(403).json({ message: "User not authenticated" });
    }
};
// BEGIN for testing purpose only -------------------------------------------
// Protected route example: Add review
regd_users.put("/review/:isbn", authMiddleware, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user;

    return res.status(200).json({
        message: `Review submitted for ISBN ${isbn} by ${username}`
    });
});
// END for testing purpose only ---------------------------------------------
// Export both the router and utility functions
module.exports = {
    regd_users,
    isValid,
    authenticatedUser,
    users
};