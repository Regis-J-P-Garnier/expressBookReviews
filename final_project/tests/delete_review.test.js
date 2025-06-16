const request = require('supertest');
const express = require('express');
const session = require('express-session');

// Import routers
const generalRouter = require('../router/general.js').general;
const { regd_users } = require('../router/auth_users.js');
const { resetBooksReviews } = require('../router/booksdb.js');

// Import users array from auth_users.js
const { users } = require('../router/auth_users.js');

// Helper: Create clean Express app for each test
const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use(session({
        secret: 'fingerprint_customer',
        resave: false,
        saveUninitialized: false
    }));
    app.use('/', generalRouter);
    app.use('/customer', regd_users);

    return app;
};

describe('DELETE /customer/auth/review/:isbn - Authenticated review deletion', () => {
    let agent;
    const username = 'alice';
    const password = 'password123';

    beforeEach(() => {
        resetBooksReviews(); // Clean state
        users.length = 0; // Clear existing users
        agent = request.agent(createApp()); // Fresh app
    });

    test('Full review lifecycle - register, login, submit, delete', async () => {
        // 1. Register user
        const registerRes = await agent.post('/register').send({
            user: { username: 'alice', password: 'password123' }
        });
        expect([201, 409]).toContain(registerRes.status);

        // 2. Login
        const loginRes = await agent.post('/customer/login').send({
            user: { username: 'alice', password: 'password123' }
        });
        expect(loginRes.status).toBe(200);

        // 3. Submit review
        const putRes = await agent.put('/customer/auth/review/1').send({
            review: "A powerful story about tradition and change."
        });
        expect(putRes.status).toBe(200);
        expect(putRes.body.message).toBe("Review added/updated successfully");

        // 4. Delete review
        const delRes = await agent.delete('/customer/auth/review/1');
        expect(delRes.status).toBe(200);
        expect(delRes.body.message).toBe("Review deleted successfully");
    });
});