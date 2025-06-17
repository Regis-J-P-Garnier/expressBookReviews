const { createClient } = require('redis');

// Create Redis client
const redisClient = createClient({
  url: 'redis://localhost:6379' // Default Redis port
});

// Handle connection events
redisClient.on('connect', () => console.log('Connected to Redis'));
redisClient.on('error', (err) => console.error('Redis error:', err));

// Connect to Redis
(async () => {
  await redisClient.connect();
})();

// Export the connected client
module.exports = redisClient;