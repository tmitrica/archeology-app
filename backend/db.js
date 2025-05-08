const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'archeology_db',
  password: 'Mt190330!',
  port: 5432,
});

const SECRET = 'super_secret_key';

// Initialize database tables with necessary relationships
const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      artifact_id INTEGER REFERENCES artifacts(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id),
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
};

createTables();

// Authentication middleware for JWT verification
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// User authentication endpoint with password validation
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ message: 'User not found' });
    
    // Compare hashed password with input using bcrypt
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Wrong password' });

    // Generate JWT token with user metadata
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// User registration with password hashing and duplicate handling
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Hash password with bcrypt before storage
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, hashedPassword, 'researcher']
    );
    
    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET,
      { expiresIn: '1h' }
    );
    
    res.status(201).json({ token, user });
  } catch (err) {
    // Handle unique constraint violation for username
    if (err.code === '23505') {
      res.status(400).json({ message: 'Username already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Artifact management endpoints with role-based access control
app.get('/api/artifacts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM artifacts');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/artifacts', authenticateToken, async (req, res) => {
  // Verify user has appropriate privileges
  if (req.user.role !== 'researcher' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { name, latitude, longitude, description } = req.body;
  try {
    await pool.query(
      'INSERT INTO artifacts (name, latitude, longitude, description) VALUES ($1, $2, $3, $4)',
      [name, latitude, longitude, description]
    );
    res.status(201).json({ message: 'Artifact added' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Artifact deletion with admin-only restriction
app.delete('/api/artifacts/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    await pool.query('DELETE FROM artifacts WHERE id = $1', [id]);
    res.json({ message: 'Artifact deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Artifact update endpoint with authorization check
app.put('/api/artifacts/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, latitude, longitude, description } = req.body;
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    await pool.query(
      'UPDATE artifacts SET name = $1, latitude = $2, longitude = $3, description = $4 WHERE id = $5',
      [name, latitude, longitude, description, id]
    );
    res.json({ message: 'Artifact updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Message handling with user context
app.get('/api/artifacts/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT m.*, u.username 
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE artifact_id = $1
       ORDER BY created_at ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Message creation with authenticated user association
app.post('/api/artifacts/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `INSERT INTO messages (artifact_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, userId, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = 3001;

// Conditional server start for test environment handling
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;