const request = require('supertest');
const app = require('./db.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET = 'super_secret_key';

// Mock PostgreSQL pool for testing environment
jest.mock('pg', () => {
  const { Pool } = jest.requireActual('pg');
  
  // Create test-specific database connection
  const testPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'archeology_test_db',
    password: 'Mt190330!',
    port: 5432,
  });

  global.testPool = testPool;

  return {
    Pool: jest.fn(() => testPool), // Mock Pool constructor
  };
});

// Setup database schema before all tests
beforeAll(async () => {
  await testPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'researcher'
    );
    
    CREATE TABLE IF NOT EXISTS artifacts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      latitude FLOAT NOT NULL,
      longitude FLOAT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      artifact_id INTEGER REFERENCES artifacts(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id),
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
});

// Clean database state after each test
afterEach(async () => {
  await testPool.query('DELETE FROM messages');
  await testPool.query('DELETE FROM artifacts');
  await testPool.query('DELETE FROM users');
});

// Close database connection after all tests
afterAll(async () => {
  await global.testPool.end();
});

// Helper function to generate JWT tokens for testing
const generateToken = (user) => jwt.sign(user, SECRET);

describe('Authentication Endpoints', () => {
  test('POST /api/login - success', async () => {
    // Insert test user with hashed password
    const hashedPassword = await bcrypt.hash('parola123', 10);
    await testPool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      ['testuser', hashedPassword, 'researcher']
    );

    const res = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'parola123' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token'); // Verify token in response
  });

  test('POST /api/login - invalid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'nonexistent', password: 'wrong' });

    expect(res.statusCode).toEqual(400); // Verify error handling
  });
});

describe('Artifact Endpoints', () => {
  let adminToken;

  beforeEach(async () => {
    // Create admin user for privileged operations
    const hashedPassword = await bcrypt.hash('adminpass', 10);
    await testPool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      ['admin', hashedPassword, 'admin']
    );
    adminToken = generateToken({ id: 1, role: 'admin' });
  });

  test('POST /api/artifacts - admin adds artifact', async () => {
    const res = await request(app)
      .post('/api/artifacts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Artifact1',
        latitude: 45.0,
        longitude: 25.0,
        description: 'Desc'
      });

    expect(res.statusCode).toEqual(201); // Verify creation success
  });

  test('DELETE /api/artifacts/:id - admin deletes artifact', async () => {
    // Seed test artifact for deletion
    await testPool.query(
      'INSERT INTO artifacts (name, latitude, longitude) VALUES ($1, $2, $3)',
      ['Test Artifact', 0, 0]
    );

    const res = await request(app)
      .delete('/api/artifacts/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200); // Verify deletion success
  });
});

describe('Message Endpoints', () => {
  let userToken;

  beforeEach(async () => {
    // Create test user and artifact with fixed IDs for relationship testing
    await testPool.query(
      'INSERT INTO users (id, username, password) VALUES ($1, $2, $3)',
      [1, 'user1', await bcrypt.hash('pass1', 10)]
    );
    await testPool.query(
      'INSERT INTO artifacts (id, name, latitude, longitude) VALUES ($1, $2, $3, $4)',
      [1, 'Artifact1', 0, 0]
    );
    userToken = generateToken({ id: 1, role: 'researcher' });
  });

  test('POST /api/artifacts/:id/messages - authenticated user posts message', async () => {
    const res = await request(app)
      .post('/api/artifacts/1/messages')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'Hello' });

    expect(res.statusCode).toEqual(201); // Verify message creation
  });

  test('GET /api/artifacts/:id/messages - retrieve messages', async () => {
    // Seed test message with proper relationships
    await testPool.query(
      'INSERT INTO messages (artifact_id, user_id, content) VALUES ($1, $2, $3)',
      [1, 1, 'Test message']
    );

    const res = await request(app)
      .get('/api/artifacts/1/messages');

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1); // Verify message retrieval
  });
});