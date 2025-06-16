const express = require('express');
const jwt = require('jsonwebtoken');
const regd_users = express.Router();

let users = [];
// Function to check if username is known
const isValid = (username) => {
    return users.some(user => 
        user.username === username
    );
};

// Function to check if username/password match
const authenticatedUser = (username, password) => {
    return users.some(user => 
        user.username === username && user.password === password
    );
};

// Login route
regd_users.post("/login", (req, res) => {
    const user = req.body.user;
    if (!user || !user.username || !user.password) {
        return res.status(400).json({ message: "Username or password missing" });
    }

    if (!authenticatedUser(user.username, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT access token
    const accessToken = jwt.sign({
        data: user.username  // Store only necessary info
    }, 'access', { expiresIn: 24 * 60 * 60 }); // 24 hours

    // Store access token in session
    req.session.authorization = {
        accessToken
    };

    return res.status(200).send("User successfully logged in");
});

module.exports.authenticatedUser = authenticatedUser;
module.exports.regd_users = regd_users;
module.exports.users = users;