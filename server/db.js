const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // You can add more config options here if needed
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
