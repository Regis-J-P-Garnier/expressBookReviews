const request = require('supertest');

// Use the full app as exported from index.js
const { app } = require('../index');

describe('GET Routes - Public API Tests', () => {
    // GET /
    test('GET / - should return 200 and all books', async () => {
        const response = await request(app).get('/').expect(200);
        expect(response.body).toHaveProperty('1');
        expect(response.body['1']).toHaveProperty('title', 'Things Fall Apart');
    });

    // GET /isbn/1
    test('GET /isbn/1 - should return 200 and book data', async () => {
        const response = await request(app).get('/isbn/1').expect(200);
        expect(response.body.title).toBe("Things Fall Apart");
        expect(response.body.author).toBe("Chinua Achebe");
    });

    // GET /isbn/999
    test('GET /isbn/999 - should return 404', async () => {
        const response = await request(app).get('/isbn/999').expect(404);
        expect(response.body.message).toBe("Book not found");
    });

    // GET /author/Unknown
    test('GET /author/Unknown - should return 200 and books by Unknown', async () => {
        const response = await request(app).get('/author/Unknown').expect(200);
        const books = response.body;

        const isAllUnknown = Object.values(books).every(book => book.author === "Unknown");

        expect(isAllUnknown).toBe(true);
        expect(Object.keys(books).length).toBe(4); // ISBNs: 4,5,6,7
    });

    // GET /author/NoSuchAuthor
    test('GET /author/NoSuchAuthor - should return 404', async () => {
        const response = await request(app)
            .get('/author/NoSuchAuthor')
            .expect(404);

        expect(response.body.message).toBe("Book not found");
    });

    // GET /title/Fairy%20tales
    test('GET /title/Fairy%20tales - should return 200 and book by title', async () => {
        const response = await request(app).get('/title/Fairy%20tales').expect(200);
        expect(response.body['2'].author).toBe("Hans Christian Andersen");
    });

    // GET /title/NoSuchTitle
    test('GET /title/NoSuchTitle - should return 404', async () => {
        const response = await request(app).get('/title/NoSuchTitle').expect(404);
        expect(response.body.message).toBe("Book not found");
    });

    // GET /review/1
    test('GET /review/1 - should return 200 and review object', async () => {
        const response = await request(app).get('/review/1').expect(200);
        expect(typeof response.body).toBe('object');
    });

    // GET /review/999
    test('GET /review/999 - should return 404', async () => {
        const response = await request(app).get('/review/999').expect(404);
        expect(response.body.message).toBe("Book not found");
    });
});