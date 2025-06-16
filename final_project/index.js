const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const { regd_users } = require('./router/auth_users.js');
const genl_routes = require('./router/general.js').general;
const customer_routes = regd_users;

const app = express();
const PORT = 5000;

app.use(express.json());

// Session middleware
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
 }));

// Public general routes
app.use("/", genl_routes);

// Authenticated customer routes
app.use("/customer", customer_routes);

app.listen(PORT, () => console.log("Server is running"));