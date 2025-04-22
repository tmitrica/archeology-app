const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'archeology_db',
  password: 'Mt190330!',
  port: 5432,
});

app.use(cors());

app.get('/api/artifacts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM artifacts');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Serverul ruleaza pe portul ${PORT}`));
