const { Pool } = require('pg');

const pool = new Pool({
  user: 'archeology_admin',
  host: 'localhost',
  database: 'archeology_db',
  password: 'Mt190330!',
  port: 5432,
});

module.exports = pool;